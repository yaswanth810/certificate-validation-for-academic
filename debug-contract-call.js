const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Wallet address:", wallet.address);
  
  // Contract address
  const contractAddress = "0xBbaBAABb432e735278f8f36F625FE4a84bbcF773";
  
  // Contract ABI for semester certificate functions
  const abi = [
    "function mintSemesterCertificate(address student, string memory serialNo, string memory memoNo, tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked)) external returns (uint256)",
    "function isSerialNumberUsed(string memory serialNo) external view returns (bool)",
    "function isMemoNumberUsed(string memory memoNo) external view returns (bool)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signedContract = contract.connect(wallet);
  
  // Test data from the frontend error
  const studentAddress = "0xcc7b99a2a9f201611d5a0d96b81dd3f456a93c22";
  const serialNo = "1267543457";
  const memoNo = "VB 053433";
  
  const certData = {
    studentName: "Rayapureddy Yaswanth",
    serialNo: "1267543457",
    memoNo: "VB 053433", 
    regdNo: "24L35A1223",
    branch: "INFORMATION TECHNOLOGY",
    examination: "II B.Tech II Semester (VR 23) Reg.",
    monthYearExams: "May 2025",
    aadharNo: "865365127651",
    studentPhoto: "Qmubs",
    courses: [{
      courseCode: "13243546",
      courseTitle: "Machine Learning",
      gradeSecured: "O",
      gradePoints: 1000, // 10.0 * 100
      status: "P",
      creditsObtained: 4
    }],
    totalCredits: 0,
    sgpa: 0,
    mediumOfInstruction: "English",
    issueDate: 0,
    issuer: "0x0000000000000000000000000000000000000000",
    isRevoked: false
  };
  
  console.log("Testing contract call with data:");
  console.log("Student:", studentAddress);
  console.log("Serial No:", serialNo);
  console.log("Memo No:", memoNo);
  console.log("Cert Data:", JSON.stringify(certData, null, 2));
  
  try {
    // First check if serial/memo numbers are already used
    console.log("\nChecking if serial/memo numbers are used...");
    const serialUsed = await contract.isSerialNumberUsed(serialNo);
    const memoUsed = await contract.isMemoNumberUsed(memoNo);
    
    console.log("Serial number used:", serialUsed);
    console.log("Memo number used:", memoUsed);
    
    if (serialUsed) {
      console.log("❌ Serial number already used!");
      return;
    }
    
    if (memoUsed) {
      console.log("❌ Memo number already used!");
      return;
    }
    
    // Test static call
    console.log("\nTesting static call...");
    const result = await contract.mintSemesterCertificate.staticCall(
      studentAddress,
      serialNo,
      memoNo,
      certData
    );
    
    console.log("✅ Static call successful! Token ID would be:", result.toString());
    
    // If static call works, try the actual transaction
    console.log("\nExecuting actual transaction...");
    const tx = await signedContract.mintSemesterCertificate(
      studentAddress,
      serialNo,
      memoNo,
      certData
    );
    
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Transaction successful! Gas used:", receipt.gasUsed.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("Error data:", error.data);
      
      // Check if it's a revert with reason
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + error.data.slice(10));
        console.log("Revert reason:", decoded[0]);
      } catch (decodeError) {
        console.log("Could not decode error reason");
      }
    }
    
    // Check specific error conditions
    if (error.message.includes("Serial number already used")) {
      console.log("❌ Serial number is already used");
    } else if (error.message.includes("Memo number already used")) {
      console.log("❌ Memo number is already used");
    } else if (error.message.includes("Student name cannot be empty")) {
      console.log("❌ Student name is empty");
    } else if (error.message.includes("At least one course required")) {
      console.log("❌ No courses provided");
    }
  }
}

main().catch(console.error);
