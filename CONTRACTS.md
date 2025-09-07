# Vignan Institute Smart Contracts Documentation

## Overview

This document provides comprehensive documentation for the Vignan Institute blockchain certificate platform smart contracts. The platform consists of two main contracts: `CertificateNFT` and `ScholarshipEscrow`.

## Contract Architecture

### CertificateNFT.sol

**Purpose**: ERC721 NFT contract for issuing and managing digital certificates.

**Key Features**:
- ERC721 standard with URI storage
- Access control for minting and administration
- Certificate verification system
- IPFS hash integration for metadata
- Revocation capabilities

#### Functions

##### `mintCertificate(address student, string courseName, string grade, string ipfsHash)`
- **Access**: MINTER_ROLE only
- **Purpose**: Mint a new certificate NFT
- **Parameters**:
  - `student`: Address of the student receiving the certificate
  - `courseName`: Name of the completed course
  - `grade`: Grade achieved by the student
  - `ipfsHash`: IPFS hash for certificate metadata
- **Returns**: `uint256` - Token ID of the minted certificate
- **Events**: `CertificateIssued`

##### `verifyCertificate(uint256 tokenId)`
- **Access**: Public view
- **Purpose**: Verify certificate validity and return data
- **Parameters**:
  - `tokenId`: ID of the certificate to verify
- **Returns**: `(CertificateData, bool)` - Certificate data and validity status
- **Events**: `CertificateVerified`

##### `updateCertificateDetails(uint256 tokenId, string studentName, string department)`
- **Access**: ADMIN_ROLE only
- **Purpose**: Update certificate details after minting
- **Parameters**:
  - `tokenId`: ID of the certificate to update
  - `studentName`: Full name of the student
  - `department`: Department name

##### `revokeCertificate(uint256 tokenId)`
- **Access**: ADMIN_ROLE only
- **Purpose**: Revoke a certificate (mark as invalid)
- **Parameters**:
  - `tokenId`: ID of the certificate to revoke
- **Events**: `CertificateRevoked`

#### Data Structures

```solidity
struct CertificateData {
    string studentName;      // Full name of the student
    string courseName;       // Name of the course
    string grade;           // Grade achieved
    string ipfsHash;        // IPFS hash for metadata
    string department;      // Department name
    uint256 issueDate;      // Timestamp of issuance
    bool isRevoked;         // Revocation status
    address issuer;         // Address of the issuer
}
```

#### Events

- `CertificateIssued(uint256 indexed tokenId, address indexed student, string indexed courseName, string studentName, string grade, string ipfsHash, uint256 timestamp)`
- `CertificateRevoked(uint256 indexed tokenId, address indexed student, address indexed admin)`
- `CertificateVerified(uint256 indexed tokenId, bool isValid)`

### ScholarshipEscrow.sol

**Purpose**: Smart contract for managing scholarship funds with certificate-based eligibility.

**Key Features**:
- Time-locked scholarship releases
- Certificate-based eligibility verification
- Multi-student scholarship support
- Secure fund management
- Integration with CertificateNFT

#### Functions

##### `depositScholarship(uint256 amount, address[] eligibleStudents)`
- **Access**: SCHOLARSHIP_MANAGER_ROLE only
- **Purpose**: Deposit scholarship funds for eligible students
- **Parameters**:
  - `amount`: Total scholarship amount in wei
  - `eligibleStudents`: Array of student addresses eligible for the scholarship
- **Returns**: `uint256` - Scholarship ID
- **Events**: `ScholarshipDeposited`
- **Payable**: Yes (must send ETH with transaction)

##### `claimScholarship(uint256 scholarshipId)`
- **Access**: Public (students only)
- **Purpose**: Claim scholarship funds
- **Parameters**:
  - `scholarshipId`: ID of the scholarship to claim
- **Requirements**:
  - Student must be eligible for the scholarship
  - Student must have required certificates
  - Time lock must have passed
  - Scholarship must be active
- **Events**: `ScholarshipClaimed`

##### `hasRequiredCertificates(address student)`
- **Access**: Public view
- **Purpose**: Check if student has required certificates
- **Parameters**:
  - `student`: Address of the student to check
- **Returns**: `bool` - True if student has certificates

#### Data Structures

```solidity
struct Scholarship {
    uint256 totalAmount;           // Total scholarship amount
    uint256 claimedAmount;         // Amount already claimed
    uint256 remainingAmount;       // Amount remaining to be claimed
    address[] eligibleStudents;    // List of eligible students
    uint256 createdAt;            // Creation timestamp
    uint256 releaseTime;          // Time when funds can be claimed
    bool isActive;                // Active status
    address createdBy;            // Address of the creator
}
```

#### Events

- `ScholarshipDeposited(uint256 indexed scholarshipId, uint256 amount, address[] eligibleStudents, uint256 timestamp)`
- `ScholarshipClaimed(uint256 indexed scholarshipId, address indexed student, uint256 amount, uint256 timestamp)`
- `FundsDeposited(address indexed depositor, uint256 amount, uint256 timestamp)`
- `FundsWithdrawn(address indexed admin, uint256 amount, uint256 timestamp)`

## Security Features

### Access Control
- **OpenZeppelin AccessControl**: Role-based permissions
- **MINTER_ROLE**: Can mint certificates
- **ADMIN_ROLE**: Can revoke certificates and update details
- **SCHOLARSHIP_MANAGER_ROLE**: Can create and manage scholarships

### Security Measures
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter validation
- **Time Locks**: 30-day time lock on scholarship claims
- **Certificate Verification**: Automatic eligibility checking

## Gas Optimization

### Optimizations Applied
- **Solidity Optimizer**: Enabled with 1000 runs
- **viaIR**: Intermediate representation for better optimization
- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Optimized for multiple operations
- **Event Indexing**: Efficient event emission

### Gas Usage Estimates
- **Mint Certificate**: ~150,000 gas
- **Verify Certificate**: View function (no gas)
- **Deposit Scholarship**: ~200,000 gas
- **Claim Scholarship**: ~100,000 gas

## Deployment Process

### Prerequisites
1. Node.js v16+
2. Hardhat development environment
3. Sepolia testnet ETH for gas fees
4. Infura/Alchemy RPC endpoint

### Steps
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Compile Contracts**:
   ```bash
   npm run compile
   ```

4. **Run Tests**:
   ```bash
   npm test
   ```

5. **Deploy to Sepolia**:
   ```bash
   npm run deploy:sepolia
   ```

6. **Verify Contracts**:
   ```bash
   npm run verify:sepolia
   ```

## Testing

### Test Coverage
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflow testing
- **Security Tests**: Access control and validation testing
- **Gas Tests**: Gas usage optimization testing

### Running Tests
```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/Certificate.test.ts
```

## Usage Examples

### Minting a Certificate
```solidity
// Connect to contract
CertificateNFT certificateNFT = CertificateNFT(contractAddress);

// Mint certificate (requires MINTER_ROLE)
uint256 tokenId = await certificateNFT.mintCertificate(
    studentAddress,
    "Computer Science Fundamentals",
    "A+",
    "QmSampleHash1"
);

// Update details (requires ADMIN_ROLE)
await certificateNFT.updateCertificateDetails(
    tokenId,
    "Alice Johnson",
    "Computer Science"
);
```

### Verifying a Certificate
```solidity
// Verify certificate
(CertificateData memory data, bool isValid) = await certificateNFT.verifyCertificate(tokenId);

if (isValid) {
    console.log("Certificate is valid");
    console.log("Student:", data.studentName);
    console.log("Course:", data.courseName);
    console.log("Grade:", data.grade);
} else {
    console.log("Certificate is invalid or revoked");
}
```

### Creating a Scholarship
```solidity
// Connect to contract
ScholarshipEscrow scholarshipEscrow = ScholarshipEscrow(contractAddress);

// Create scholarship (requires SCHOLARSHIP_MANAGER_ROLE)
uint256 scholarshipId = await scholarshipEscrow.depositScholarship(
    ethers.utils.parseEther("10"), // 10 ETH
    [student1Address, student2Address], // Eligible students
    { value: ethers.utils.parseEther("10") } // Send ETH
);
```

### Claiming a Scholarship
```solidity
// Student claims scholarship (after 30-day time lock)
await scholarshipEscrow.claimScholarship(scholarshipId);
```

## Integration with Frontend

### Contract Addresses
After deployment, update your frontend environment variables:
```env
REACT_APP_CERTIFICATE_NFT_ADDRESS=0x...
REACT_APP_SCHOLARSHIP_ESCROW_ADDRESS=0x...
REACT_APP_NETWORK_ID=11155111
```

### Web3 Integration
The contracts are designed to work seamlessly with:
- **ethers.js**: For Web3 interactions
- **Web3Modal**: For wallet connection
- **React**: For frontend components

## Maintenance and Updates

### Contract Upgrades
- Contracts are not upgradeable (immutable)
- New features require new contract deployment
- Migration scripts available for data transfer

### Monitoring
- Monitor contract events for activity
- Track gas usage and costs
- Monitor for security issues

### Support
For technical support:
- Email: support@vignan.edu
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

**Built with ❤️ for Vignan Institute using OpenZeppelin v5.0.0**
