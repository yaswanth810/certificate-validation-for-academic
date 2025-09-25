const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractAddress = "0x661f32b71e7912A1A3DA274E716a112CD02B5Da9";
  
  console.log("Testing NEW CLEAN contract...");
  console.log("Contract:", contractAddress);
  console.log("Wallet:", wallet.address);
  
  // Exact ABI from frontend
  const abi = [
    "function mintSemesterCertificate(address student, string memory serialNo, string memory memoNo, tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked)) external returns (uint256)",
    "function isSerialNumberUsed(string memory serialNo) external view returns (bool)",
    "function isMemoNumberUsed(string memory memoNo) external view returns (bool)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function MINTER_ROLE() external view returns (bytes32)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signedContract = contract.connect(wallet);
  
  // Test data
  const studentAddress = "0xcC7b99a2a9f201611D5a0D96B81dd3F456A93c22";
  const serialNo = "CLEAN123";
  const memoNo = "V CLEAN456";
  
  const certData = {
    studentName: "Test Student",
    serialNo: "CLEAN123",
    memoNo: "V CLEAN456", 
    regdNo: "24L35A1223",
    branch: "INFORMATION TECHNOLOGY",
    examination: "II B.Tech II Semester (VR 23) Reg.",
    monthYearExams: "May 2025",
    aadharNo: "865365127651",
    studentPhoto: "Qm245643",
    courses: [{
      courseCode: "CS101",
      courseTitle: "Computer Networks",
      gradeSecured: "O",
      gradePoints: 1000,
      status: "P",
      creditsObtained: 5
    }],
    totalCredits: 5,
    sgpa: 0,
    mediumOfInstruction: "English",
    issueDate: 0,
    issuer: "0x0000000000000000000000000000000000000000",
    isRevoked: false
  };
  
  try {
    console.log("\n=== Checking Role ===");
    const minterRole = await contract.MINTER_ROLE();
    const hasRole = await contract.hasRole(minterRole, wallet.address);
    console.log("Has MINTER_ROLE:", hasRole);
    
    console.log("\n=== Checking Serial Numbers ===");
    const serialUsed = await contract.isSerialNumberUsed(serialNo);
    const memoUsed = await contract.isMemoNumberUsed(memoNo);
    console.log("Serial used:", serialUsed);
    console.log("Memo used:", memoUsed);
    
    console.log("\n=== Testing Mint Function ===");
    const result = await signedContract.mintSemesterCertificate(
      studentAddress,
      serialNo,
      memoNo,
      certData
    );
    
    console.log("✅ SUCCESS! Transaction hash:", result.hash);
    const receipt = await result.wait();
    console.log("✅ Mined! Gas used:", receipt.gasUsed.toString());
    
    // Check if serial numbers are now used
    const serialUsedAfter = await contract.isSerialNumberUsed(serialNo);
    const memoUsedAfter = await contract.isMemoNumberUsed(memoNo);
    console.log("Serial used after mint:", serialUsedAfter);
    console.log("Memo used after mint:", memoUsedAfter);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
}

main().catch(console.error);
