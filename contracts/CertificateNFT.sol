// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CertificateNFT
 * @dev ERC721 NFT contract for Vignan Institute certificates
 * @author Vignan Institute
 */
contract CertificateNFT is ERC721, ERC721URIStorage, AccessControl, Pausable {
    using Strings for uint256;
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // State variables
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(string => bool) public usedHashes;
    
    // CID mapping for certificate metadata
    mapping(uint256 => string) public tokenIdToCID;
    mapping(string => uint256) public cidToTokenId;
    
    // Semester Certificate mappings
    mapping(uint256 => SemesterCertificate) public semesterCertificates;
    mapping(address => uint256[]) public studentSemesterCerts;
    mapping(string => bool) public usedMemoNumbers;
    mapping(string => bool) public usedSerialNumbers;
    
    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        string indexed courseName,
        string studentName,
        string grade,
        string ipfsHash,
        uint256 timestamp
    );
    
    event CertificateRevoked(uint256 indexed tokenId, address indexed student, address indexed admin);
    event CertificateVerified(uint256 indexed tokenId, bool isValid);
    event CertificateMetadataStored(uint256 indexed tokenId, string indexed cid, address indexed student);
    
    // Semester Certificate Events
    event SemesterCertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        string indexed serialNo,
        string memoNo,
        string regdNo,
        string branch,
        string examination,
        uint256 sgpa,
        uint256 timestamp
    );
    
    event SemesterCertificateRevoked(uint256 indexed tokenId, address indexed student, address indexed admin);
    
    // Structs
    struct CertificateData {
        string studentName;
        string courseName;
        string grade;
        string ipfsHash;
        string department;
        uint256 issueDate;
        bool isRevoked;
        address issuer;
    }
    
    struct Course {
        string courseCode;
        string courseTitle;
        string gradeSecured;
        uint256 gradePoints; // Grade points * 100 to avoid decimals
        string status; // "P" for Pass, "F" for Fail, "A" for Absent
        uint256 creditsObtained;
    }
    
    struct SemesterCertificate {
        string studentName;
        string serialNo;
        string memoNo;
        string regdNo;
        string branch;
        string examination; // "IV B.Tech I Semester (VR19) Reg."
        string monthYearExams; // "October 2022"
        string aadharNo;
        string studentPhoto; // IPFS hash
        Course[] courses;
        uint256 totalCredits;
        uint256 sgpa; // Semester Grade Point Average * 100 (to avoid decimals)
        string mediumOfInstruction;
        uint256 issueDate;
        address issuer;
        bool isRevoked;
    }
    
    constructor() ERC721("Vignan Certificate", "VIGNAN") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new certificate NFT
     * @param student Address of the student
     * @param courseName Name of the course
     * @param grade Grade achieved
     * @param ipfsHash IPFS hash for certificate metadata
     */
    function mintCertificate(
        address student,
        string memory courseName,
        string memory grade,
        string memory ipfsHash
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(courseName).length > 0, "Course name cannot be empty");
        require(bytes(grade).length > 0, "Grade cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!usedHashes[ipfsHash], "IPFS hash already used");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Store certificate data
        certificates[tokenId] = CertificateData({
            studentName: "", // Will be set by admin
            courseName: courseName,
            grade: grade,
            ipfsHash: ipfsHash,
            department: "", // Will be set by admin
            issueDate: block.timestamp,
            isRevoked: false,
            issuer: msg.sender
        });
        
        // Track student certificates
        studentCertificates[student].push(tokenId);
        usedHashes[ipfsHash] = true;
        
        // Mint NFT
        _safeMint(student, tokenId);
        
        // Set token URI
        string memory _tokenURI = string(abi.encodePacked(
            _baseTokenURI,
            "/",
            tokenId.toString()
        ));
        _setTokenURI(tokenId, _tokenURI);
        
        // Store CID mapping
        tokenIdToCID[tokenId] = ipfsHash;
        cidToTokenId[ipfsHash] = tokenId;
        
        emit CertificateIssued(tokenId, student, courseName, "", grade, ipfsHash, block.timestamp);
        emit CertificateMetadataStored(tokenId, ipfsHash, student);
        
        return tokenId;
    }
    
    /**
     * @dev Update certificate details (admin only)
     * @param tokenId ID of the certificate
     * @param studentName Name of the student
     * @param department Department name
     */
    function updateCertificateDetails(
        uint256 tokenId,
        string memory studentName,
        string memory department
    ) external onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        
        certificates[tokenId].studentName = studentName;
        certificates[tokenId].department = department;
    }
    
    /**
     * @dev Revoke a certificate (admin only)
     * @param tokenId ID of the token to revoke
     */
    function revokeCertificate(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(!certificates[tokenId].isRevoked, "Certificate already revoked");
        
        certificates[tokenId].isRevoked = true;
        
        address student = ownerOf(tokenId);
        emit CertificateRevoked(tokenId, student, msg.sender);
    }
    
    /**
     * @dev Verify a certificate and return certificate data
     * @param tokenId ID of the token to verify
     * @return certificateData Certificate data struct
     * @return isValid Whether the certificate is valid
     */
    function verifyCertificate(uint256 tokenId) external view returns (CertificateData memory certificateData, bool isValid) {
        if (_ownerOf(tokenId) == address(0)) {
            return (certificateData, false);
        }
        
        certificateData = certificates[tokenId];
        
        // Check if certificate is revoked
        if (certificateData.isRevoked) {
            return (certificateData, false);
        }
        
        return (certificateData, true);
    }
    
    /**
     * @dev Get certificate data
     * @param tokenId ID of the token
     * @return Certificate data struct
     */
    function getCertificateData(uint256 tokenId) external view returns (CertificateData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return certificates[tokenId];
    }
    
    /**
     * @dev Get all certificates for a student
     * @param student Address of the student
     * @return Array of token IDs
     */
    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        return studentCertificates[student];
    }
    
    /**
     * @dev Get CID for a token ID
     * @param tokenId ID of the token
     * @return IPFS CID string
     */
    function getCIDByTokenId(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenIdToCID[tokenId];
    }
    
    /**
     * @dev Get token ID for a CID
     * @param cid IPFS CID string
     * @return Token ID
     */
    function getTokenIdByCID(string memory cid) external view returns (uint256) {
        uint256 tokenId = cidToTokenId[cid];
        require(tokenId != 0, "CID not found");
        return tokenId;
    }
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyRole(ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // Override required functions
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    
    /**
     * @dev Mint a new semester certificate NFT
     * @param student Address of the student
     * @param serialNo Serial number of the certificate
     * @param memoNo Memo number of the certificate
     * @param certData Semester certificate data
     */
    function mintSemesterCertificate(
        address student,
        string memory serialNo,
        string memory memoNo,
        SemesterCertificate memory certData
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(serialNo).length > 0, "Serial number cannot be empty");
        require(bytes(memoNo).length > 0, "Memo number cannot be empty");
        require(!usedSerialNumbers[serialNo], "Serial number already used");
        require(!usedMemoNumbers[memoNo], "Memo number already used");
        require(bytes(certData.studentName).length > 0, "Student name cannot be empty");
        require(bytes(certData.regdNo).length > 0, "Registration number cannot be empty");
        require(certData.courses.length > 0, "At least one course required");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Calculate SGPA from courses
        uint256 calculatedSGPA = calculateSGPA(certData.courses);
        
        // Store semester certificate data
        SemesterCertificate storage newCert = semesterCertificates[tokenId];
        newCert.studentName = certData.studentName;
        newCert.serialNo = serialNo;
        newCert.memoNo = memoNo;
        newCert.regdNo = certData.regdNo;
        newCert.branch = certData.branch;
        newCert.examination = certData.examination;
        newCert.monthYearExams = certData.monthYearExams;
        newCert.aadharNo = certData.aadharNo;
        newCert.studentPhoto = certData.studentPhoto;
        newCert.totalCredits = certData.totalCredits;
        newCert.sgpa = calculatedSGPA;
        newCert.mediumOfInstruction = certData.mediumOfInstruction;
        newCert.issueDate = block.timestamp;
        newCert.issuer = msg.sender;
        newCert.isRevoked = false;
        
        // Copy courses
        for (uint i = 0; i < certData.courses.length; i++) {
            newCert.courses.push(certData.courses[i]);
        }
        
        // Track student semester certificates
        studentSemesterCerts[student].push(tokenId);
        usedSerialNumbers[serialNo] = true;
        usedMemoNumbers[memoNo] = true;
        
        // Mint NFT
        _safeMint(student, tokenId);
        
        // Set token URI
        string memory _tokenURI = string(abi.encodePacked(
            _baseTokenURI,
            "/semester/",
            tokenId.toString()
        ));
        _setTokenURI(tokenId, _tokenURI);
        
        emit SemesterCertificateIssued(
            tokenId,
            student,
            serialNo,
            memoNo,
            certData.regdNo,
            certData.branch,
            certData.examination,
            calculatedSGPA,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Calculate SGPA from courses
     * @param courses Array of courses
     * @return SGPA multiplied by 100
     */
    function calculateSGPA(Course[] memory courses) public pure returns (uint256) {
        if (courses.length == 0) return 0;
        
        uint256 totalGradePoints = 0;
        uint256 totalCredits = 0;
        
        for (uint i = 0; i < courses.length; i++) {
            if (keccak256(bytes(courses[i].status)) == keccak256(bytes("P"))) {
                totalGradePoints += courses[i].gradePoints * courses[i].creditsObtained;
                totalCredits += courses[i].creditsObtained;
            }
        }
        
        if (totalCredits == 0) return 0;
        
        return totalGradePoints / totalCredits;
    }
    
    /**
     * @dev Get semester certificate data
     * @param tokenId ID of the token
     * @return Semester certificate data struct
     */
    function getSemesterCertificate(uint256 tokenId) external view returns (SemesterCertificate memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return semesterCertificates[tokenId];
    }
    
    /**
     * @dev Get all semester certificates for a student
     * @param student Address of the student
     * @return Array of token IDs
     */
    function getStudentSemesterCertificates(address student) external view returns (uint256[] memory) {
        return studentSemesterCerts[student];
    }
    
    /**
     * @dev Verify a semester certificate and return certificate data
     * @param tokenId ID of the token to verify
     * @return certificateData Semester certificate data struct
     * @return isValid Whether the certificate is valid
     */
    function verifySemesterCertificate(uint256 tokenId) external view returns (SemesterCertificate memory certificateData, bool isValid) {
        if (_ownerOf(tokenId) == address(0)) {
            return (certificateData, false);
        }
        
        certificateData = semesterCertificates[tokenId];
        
        // Check if certificate is revoked
        if (certificateData.isRevoked) {
            return (certificateData, false);
        }
        
        return (certificateData, true);
    }
    
    /**
     * @dev Revoke a semester certificate (admin only)
     * @param tokenId ID of the token to revoke
     */
    function revokeSemesterCertificate(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(!semesterCertificates[tokenId].isRevoked, "Certificate already revoked");
        
        semesterCertificates[tokenId].isRevoked = true;
        
        address student = ownerOf(tokenId);
        emit SemesterCertificateRevoked(tokenId, student, msg.sender);
    }
    
    /**
     * @dev Update semester certificate details (admin only)
     * @param tokenId ID of the certificate
     * @param studentPhoto New student photo IPFS hash
     */
    function updateSemesterCertificatePhoto(
        uint256 tokenId,
        string memory studentPhoto
    ) external onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        
        semesterCertificates[tokenId].studentPhoto = studentPhoto;
    }
    
    /**
     * @dev Check if serial number is used
     * @param serialNo Serial number to check
     * @return Whether the serial number is used
     */
    function isSerialNumberUsed(string memory serialNo) external view returns (bool) {
        return usedSerialNumbers[serialNo];
    }
    
    /**
     * @dev Check if memo number is used
     * @param memoNo Memo number to check
     * @return Whether the memo number is used
     */
    function isMemoNumberUsed(string memory memoNo) external view returns (bool) {
        return usedMemoNumbers[memoNo];
    }
}
