const { ethers } = require('hardhat');

async function main() {
  console.log('🧪 Testing contract directly with exact frontend data...');

  const contractAddress = "0xBbaBAABb432e735278f8f36F625FE4a84bbcF773";
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const contract = CertificateNFT.attach(contractAddress);

  // Exact data from frontend logs
  const testCourse = {
    courseCode: "123775434",
    courseTitle: "Machine Learning", 
    gradeSecured: "A+",
    gradePoints: 900, // 9.0 * 100
    status: "P",
    creditsObtained: 5
  };

  const testCertData = {
    studentName: "Rayapureddy Yaswanth",
    serialNo: "1267543457",
    memoNo: "V 053433", 
    regdNo: "24L35A1223",
    branch: "INFORMATION TECHNOLOGY",
    examination: "II B.Tech II Semester (VR 23) Reg.",
    monthYearExams: "May 2025",
    aadharNo: "865365127651",
    studentPhoto: "Qmubs",
    courses: [testCourse],
    totalCredits: 5,
    sgpa: 0,
    mediumOfInstruction: "English",
    issueDate: 0,
    issuer: ethers.ZeroAddress,
    isRevoked: false
  };

  try {
    console.log('📋 Test data:', testCertData);
    
    // Test SGPA calculation first
    console.log("🧮 Testing SGPA calculation...");
    const sgpa = await contract.calculateSGPA([testCourse]);
    console.log("✅ SGPA calculated:", sgpa.toString());

    // Check if serial/memo already used
    console.log("🔍 Checking serial/memo availability...");
    const serialUsed = await contract.isSerialNumberUsed("1267543457");
    const memoUsed = await contract.isMemoNumberUsed("V 053433");
    console.log("Serial used:", serialUsed, "Memo used:", memoUsed);

    // Test the mint function with static call
    console.log("🎯 Testing mint function with static call...");
    const [signer] = await ethers.getSigners();
    
    const result = await contract.mintSemesterCertificate.staticCall(
      "0xcC7b99a2a9f201611D5a0D96B81dd3F456A93c22",
      "1267543457",
      "V 053433",
      testCertData
    );
    console.log("✅ Success! Token ID would be:", result.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    
    // Try to decode the error
    if (error.data && error.data.startsWith('0xe2517d3f')) {
      console.error("🔍 This is the same custom error from frontend");
      console.error("The issue is in the contract logic, not the frontend");
    }
  }
}

main().catch(console.error);
