const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // New contract address
  const contractAddress = "0xC235cFECAC5AdAa0f6fd9685BbbA568Bd7c026bE";
  
  console.log("Testing new contract at:", contractAddress);
  console.log("Wallet address:", wallet.address);
  
  // Contract ABI for semester certificate functions
  const abi = [
    "function mintSemesterCertificate(address student, string memory serialNo, string memory memoNo, tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked)) external returns (uint256)",
    "function isSerialNumberUsed(string memory serialNo) external view returns (bool)",
    "function isMemoNumberUsed(string memory memoNo) external view returns (bool)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function MINTER_ROLE() external view returns (bytes32)",
    "function name() external view returns (string memory)",
    "function symbol() external view returns (string memory)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signedContract = contract.connect(wallet);
  
  try {
    // Test basic functions
    console.log("\n=== Testing Basic Functions ===");
    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    
    // Check roles
    console.log("\n=== Checking Roles ===");
    const minterRole = await contract.MINTER_ROLE();
    const hasMinterRole = await contract.hasRole(minterRole, wallet.address);
    console.log("MINTER_ROLE:", minterRole);
    console.log("Wallet has MINTER_ROLE:", hasMinterRole);
    
    // Test semester certificate functions
    console.log("\n=== Testing Semester Certificate Functions ===");
    const testSerial = "TEST" + Date.now();
    const testMemo = "VB TEST" + Date.now();
    
    const isSerialUsed = await contract.isSerialNumberUsed(testSerial);
    const isMemoUsed = await contract.isMemoNumberUsed(testMemo);
    
    console.log(`Serial "${testSerial}" used:`, isSerialUsed);
    console.log(`Memo "${testMemo}" used:`, isMemoUsed);
    
    // Test minting with sample data
    console.log("\n=== Testing Semester Certificate Minting ===");
    
    const studentAddress = wallet.address; // Use deployer as student for test
    const certData = {
      studentName: "Test Student",
      serialNo: testSerial,
      memoNo: testMemo,
      regdNo: "TEST123",
      branch: "Computer Science",
      examination: "Test Examination",
      monthYearExams: "December 2024",
      aadharNo: "123456789012",
      studentPhoto: "QmTestHash",
      courses: [{
        courseCode: "CS101",
        courseTitle: "Computer Programming",
        gradeSecured: "A+",
        gradePoints: 1000, // 10.0 * 100
        status: "P",
        creditsObtained: 4
      }],
      totalCredits: 4,
      sgpa: 1000, // Will be calculated by contract
      mediumOfInstruction: "English",
      issueDate: 0, // Will be set by contract
      issuer: "0x0000000000000000000000000000000000000000", // Will be set by contract
      isRevoked: false
    };
    
    // Test static call first
    console.log("Testing static call...");
    const tokenId = await contract.mintSemesterCertificate.staticCall(
      studentAddress,
      testSerial,
      testMemo,
      certData
    );
    console.log("✅ Static call successful! Token ID would be:", tokenId.toString());
    
    // Execute actual transaction
    console.log("Executing actual transaction...");
    const tx = await signedContract.mintSemesterCertificate(
      studentAddress,
      testSerial,
      testMemo,
      certData
    );
    
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Transaction successful! Gas used:", receipt.gasUsed.toString());
    
    console.log("\n🎉 New contract is working perfectly!");
    console.log("Contract address:", contractAddress);
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
}

main().catch(console.error);
