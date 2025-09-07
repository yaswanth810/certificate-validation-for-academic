// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CertificateNFT.sol";

/**
 * @title ScholarshipEscrow
 * @dev Smart contract for managing scholarship funds and disbursements
 * @author Vignan Institute
 */
contract ScholarshipEscrow is AccessControl, Pausable, ReentrancyGuard {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SCHOLARSHIP_MANAGER_ROLE = keccak256("SCHOLARSHIP_MANAGER_ROLE");
    
    // State variables
    uint256 private _scholarshipIdCounter;
    mapping(uint256 => Scholarship) public scholarships;
    mapping(address => uint256[]) public studentScholarships;
    mapping(address => uint256) public totalClaimed;
    mapping(address => bool) public eligibleStudents;
    
    // Certificate NFT contract
    CertificateNFT public certificateNFT;
    
    // Events
    event ScholarshipDeposited(
        uint256 indexed scholarshipId,
        uint256 amount,
        address[] eligibleStudents,
        uint256 timestamp
    );
    
    event ScholarshipClaimed(
        uint256 indexed scholarshipId,
        address indexed student,
        uint256 amount,
        uint256 timestamp
    );
    
    event ScholarshipRevoked(uint256 indexed scholarshipId, address indexed admin, uint256 timestamp);
    
    event FundsDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed admin, uint256 amount, uint256 timestamp);
    
    // Structs
    struct Scholarship {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 remainingAmount;
        address[] eligibleStudents;
        uint256 createdAt;
        uint256 releaseTime;
        bool isActive;
        address createdBy;
    }
    
    constructor(address _certificateNFT) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(SCHOLARSHIP_MANAGER_ROLE, msg.sender);
        
        certificateNFT = CertificateNFT(_certificateNFT);
    }
    
    /**
     * @dev Deposit scholarship funds for eligible students
     * @param amount Total scholarship amount
     * @param _eligibleStudents Array of eligible student addresses
     */
    function depositScholarship(
        uint256 amount,
        address[] memory _eligibleStudents
    ) external payable onlyRole(SCHOLARSHIP_MANAGER_ROLE) whenNotPaused returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(_eligibleStudents.length > 0, "No eligible students provided");
        require(msg.value >= amount, "Insufficient ETH sent");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        _scholarshipIdCounter++;
        uint256 scholarshipId = _scholarshipIdCounter;
        
        // Mark students as eligible
        for (uint256 i = 0; i < _eligibleStudents.length; i++) {
            require(_eligibleStudents[i] != address(0), "Invalid student address");
            eligibleStudents[_eligibleStudents[i]] = true;
        }
        
        scholarships[scholarshipId] = Scholarship({
            totalAmount: amount,
            claimedAmount: 0,
            remainingAmount: amount,
            eligibleStudents: _eligibleStudents,
            createdAt: block.timestamp,
            releaseTime: block.timestamp + 30 days, // 30-day time lock
            isActive: true,
            createdBy: msg.sender
        });
        
        // Track scholarships for each student
        for (uint256 i = 0; i < _eligibleStudents.length; i++) {
            studentScholarships[_eligibleStudents[i]].push(scholarshipId);
        }
        
        emit ScholarshipDeposited(scholarshipId, amount, _eligibleStudents, block.timestamp);
        
        return scholarshipId;
    }
    
    /**
     * @dev Claim scholarship funds (students only)
     * @param scholarshipId ID of the scholarship to claim
     */
    function claimScholarship(uint256 scholarshipId) external whenNotPaused nonReentrant {
        Scholarship storage scholarship = scholarships[scholarshipId];
        
        require(scholarship.isActive, "Scholarship is not active");
        require(block.timestamp >= scholarship.releaseTime, "Scholarship not yet released");
        require(eligibleStudents[msg.sender], "Student not eligible for this scholarship");
        require(scholarship.remainingAmount > 0, "No funds remaining");
        
        // Check if student has required certificates
        require(hasRequiredCertificates(msg.sender), "Student does not have required certificates");
        
        // Calculate claim amount (equal share for all eligible students)
        uint256 claimAmount = scholarship.totalAmount / scholarship.eligibleStudents.length;
        require(claimAmount <= scholarship.remainingAmount, "Insufficient funds for claim");
        require(address(this).balance >= claimAmount, "Insufficient contract balance");
        
        // Update scholarship data
        scholarship.claimedAmount += claimAmount;
        scholarship.remainingAmount -= claimAmount;
        
        // Mark as inactive if fully claimed
        if (scholarship.remainingAmount == 0) {
            scholarship.isActive = false;
        }
        
        // Transfer funds to student
        (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
        require(success, "Transfer failed");
        
        totalClaimed[msg.sender] += claimAmount;
        
        emit ScholarshipClaimed(scholarshipId, msg.sender, claimAmount, block.timestamp);
    }
    
    /**
     * @dev Check if student has required certificates
     * @param student Address of the student
     * @return True if student has certificates
     */
    function hasRequiredCertificates(address student) public view returns (bool) {
        uint256[] memory studentCerts = certificateNFT.getStudentCertificates(student);
        return studentCerts.length > 0;
    }
    
    /**
     * @dev Revoke a scholarship
     * @param scholarshipId ID of the scholarship to revoke
     */
    function revokeScholarship(uint256 scholarshipId) external onlyRole(ADMIN_ROLE) {
        Scholarship storage scholarship = scholarships[scholarshipId];
        
        require(scholarship.isActive, "Scholarship is not active");
        
        scholarship.isActive = false;
        
        emit ScholarshipRevoked(scholarshipId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Deposit funds to the escrow
     */
    function depositFunds() external payable whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Withdraw funds from the escrow (admin only)
     * @param amount Amount to withdraw
     */
    function withdrawFunds(uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get scholarship details
     * @param scholarshipId ID of the scholarship
     * @return Scholarship struct
     */
    function getScholarship(uint256 scholarshipId) external view returns (Scholarship memory) {
        return scholarships[scholarshipId];
    }
    
    /**
     * @dev Get all scholarships for a student
     * @param student Address of the student
     * @return Array of scholarship IDs
     */
    function getStudentScholarships(address student) external view returns (uint256[] memory) {
        return studentScholarships[student];
    }
    
    /**
     * @dev Get total claimed amount for a student
     * @param student Address of the student
     * @return Total amount claimed
     */
    function getTotalClaimed(address student) external view returns (uint256) {
        return totalClaimed[student];
    }
    
    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
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
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }
}
