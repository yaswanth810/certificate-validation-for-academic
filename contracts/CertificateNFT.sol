// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CertificateNFT
 * @dev ERC721 NFT contract for Vignan Institute certificates
 * @author Vignan Institute
 */
contract CertificateNFT is ERC721, ERC721URIStorage, AccessControl, Pausable {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // State variables
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(string => bool) public usedHashes;
    
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
            _toString(tokenId)
        ));
        _setTokenURI(tokenId, _tokenURI);
        
        emit CertificateIssued(tokenId, student, courseName, "", grade, ipfsHash, block.timestamp);
        
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
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
