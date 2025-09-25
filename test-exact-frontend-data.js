const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractAddress = "0xC235cFECAC5AdAa0f6fd9685BbbA568Bd7c026bE";
  
  console.log("Testing with exact frontend data...");
  console.log("Contract:", contractAddress);
  console.log("Wallet:", wallet.address);
  
  // Exact ABI from frontend
  const abi = [
    "function mintSemesterCertificate(address student, string memory serialNo, string memory memoNo, tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked)) external returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signedContract = contract.connect(wallet);
  
  // Exact data from frontend logs
  const studentAddress = "0xcC7b99a2a9f201611D5a0D96B81dd3F456A93c22";
  const serialNo = "1267543459";
  const memoNo = "V 053437";
  
  const certData = {
    studentName: "Rayapureddy Yaswanth",
    serialNo: "1267543459",
    memoNo: "V 053437",
    regdNo: "24L35A1223",
    branch: "INFORMATION TECHNOLOGY",
    examination: "II B.Tech II Semester (VR 23) Reg.",
    monthYearExams: "May 2025",
    aadharNo: "865365127651",
    studentPhoto: "Qm245643",
    courses: [{
      courseCode: "123243456",
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
  
  console.log("\nData to send:");
  console.log("Student:", studentAddress);
  console.log("Serial:", serialNo);
  console.log("Memo:", memoNo);
  console.log("Cert Data:", JSON.stringify(certData, null, 2));
  
  try {
    console.log("\n=== Testing Static Call ===");
    const result = await contract.mintSemesterCertificate.staticCall(
      studentAddress,
      serialNo,
      memoNo,
      certData
    );
    
    console.log("✅ Static call successful! Token ID:", result.toString());
    
    console.log("\n=== Executing Transaction ===");
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
    
    if (error.data) {
      console.log("Error data:", error.data);
      
      // Decode the error if it's a revert with reason
      if (error.data.startsWith('0x08c379a0')) {
        try {
          const reason = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + error.data.slice(10));
          console.log("Revert reason:", reason[0]);
        } catch (e) {
          console.log("Could not decode revert reason");
        }
      }
      
      // Check if it's the specific error we're seeing
      if (error.data.startsWith('0xe2517d3f')) {
        console.log("This is the 0xe2517d3f error we've been seeing");
        
        // Let's try to understand what this error means by checking contract source
        console.log("This error suggests a specific contract revert condition");
        
        // Try individual validations to isolate the issue
        console.log("\n=== Testing Individual Validations ===");
        
        // Test each require condition
        if (studentAddress === "0x0000000000000000000000000000000000000000") {
          console.log("❌ Student address is zero");
        } else {
          console.log("✅ Student address is valid");
        }
        
        if (serialNo.length === 0) {
          console.log("❌ Serial number is empty");
        } else {
          console.log("✅ Serial number is not empty");
        }
        
        if (memoNo.length === 0) {
          console.log("❌ Memo number is empty");
        } else {
          console.log("✅ Memo number is not empty");
        }
        
        if (certData.studentName.length === 0) {
          console.log("❌ Student name is empty");
        } else {
          console.log("✅ Student name is not empty");
        }
        
        if (certData.regdNo.length === 0) {
          console.log("❌ Registration number is empty");
        } else {
          console.log("✅ Registration number is not empty");
        }
        
        if (certData.courses.length === 0) {
          console.log("❌ No courses provided");
        } else {
          console.log("✅ Courses provided:", certData.courses.length);
        }
        
        console.log("\nThe error might be in the SGPA calculation or contract storage logic");
      }
    }
  }
}

main().catch(console.error);
