const { ethers } = require('hardhat');

async function main() {
  // Connect to the deployed contract
  const contractAddress = "0xAFf82efAa0FB6814CBa82FA41cFd3434befCD80a";
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const contract = CertificateNFT.attach(contractAddress);

  // Test data similar to what frontend is sending
  const testCourse = {
    courseCode: "CS101",
    courseTitle: "Machine Learning", 
    gradeSecured: "O",
    gradePoints: 1000, // 10.0 * 100
    status: "P",
    creditsObtained: 5
  };

  const testCertData = {
    studentName: "Test Student",
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
    // Test SGPA calculation first
    console.log("Testing SGPA calculation...");
    const sgpa = await contract.calculateSGPA([testCourse]);
    console.log("SGPA:", sgpa.toString());

    // Test the mint function
    console.log("Testing mint function...");
    const [signer] = await ethers.getSigners();
    const result = await contract.mintSemesterCertificate.staticCall(
      signer.address,
      "1267543457",
      "V 053433",
      testCertData
    );
    console.log("Success! Token ID would be:", result.toString());
  } catch (error) {
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main().catch(console.error);
