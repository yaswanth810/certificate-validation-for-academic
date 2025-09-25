const { ethers } = require("hardhat");

async function debugSemesterCertificate() {
  console.log("🔍 Debugging Semester Certificate Minting...");
  
  try {
    // Get contract
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const contractAddress = process.env.CERTIFICATE_NFT_ADDRESS || "YOUR_CONTRACT_ADDRESS";
    
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("Wallet address:", wallet.address);
    
    const contract = CertificateNFT.attach(contractAddress);
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Contract Address:", contractAddress);
    console.log("👤 Signer Address:", deployer.address);
    
    // Check if contract has semester certificate functions
    try {
      const hasFunction = await contract.mintSemesterCertificate.staticCall;
      console.log("✅ Contract has mintSemesterCertificate function");
    } catch (error) {
      console.error("❌ Contract missing mintSemesterCertificate function");
      console.error("This suggests the contract needs to be redeployed with semester certificate functionality");
      return;
    }
    
    // Check roles
    const MINTER_ROLE = await contract.MINTER_ROLE();
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    
    console.log("\n🔐 Role Check:");
    console.log("MINTER_ROLE:", MINTER_ROLE);
    console.log("ADMIN_ROLE:", ADMIN_ROLE);
    console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
    
    const hasMinterRole = await contract.hasRole(MINTER_ROLE, deployer.address);
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, deployer.address);
    const hasDefaultAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    
    console.log("Has MINTER_ROLE:", hasMinterRole);
    console.log("Has ADMIN_ROLE:", hasAdminRole);
    console.log("Has DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole);
    
    if (!hasMinterRole && !hasAdminRole && !hasDefaultAdminRole) {
      console.error("❌ Account has no required roles for minting");
      console.log("💡 Grant MINTER_ROLE to this account:");
      console.log(`contract.grantRole("${MINTER_ROLE}", "${deployer.address}")`);
      return;
    }
    
    // Check if contract is paused
    try {
      const isPaused = await contract.paused();
      console.log("Contract paused:", isPaused);
      if (isPaused) {
        console.error("❌ Contract is paused. Unpause it first.");
        return;
      }
    } catch (error) {
      console.log("ℹ️ Contract doesn't have pause functionality");
    }
    
    // Test data preparation
    const testStudentAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual address
    const testSerialNo = "TEST001";
    const testMemoNo = "MEMO001";
    
    // Check if serial/memo numbers are already used
    try {
      const serialUsed = await contract.isSerialNumberUsed(testSerialNo);
      const memoUsed = await contract.isMemoNumberUsed(testMemoNo);
      
      console.log("\n📝 Serial/Memo Check:");
      console.log("Serial number used:", serialUsed);
      console.log("Memo number used:", memoUsed);
      
      if (serialUsed || memoUsed) {
        console.error("❌ Serial or memo number already used. Try different numbers.");
        return;
      }
    } catch (error) {
      console.error("❌ Error checking serial/memo numbers:", error.message);
      return;
    }
    
    // Prepare test certificate data
    const testCertData = {
      studentName: "Test Student",
      serialNo: testSerialNo,
      memoNo: testMemoNo,
      regdNo: "REG123",
      branch: "Computer Science",
      examination: "B.Tech I Year I Semester",
      monthYearExams: "November 2023",
      aadharNo: "123456789012",
      studentPhoto: "ipfs://test-photo-hash",
      courses: [
        {
          courseCode: "CS101",
          courseTitle: "Programming Fundamentals",
          gradeSecured: "A",
          gradePoints: 900, // 9.0 * 100
          status: "Pass",
          creditsObtained: 4
        }
      ],
      totalCredits: 4,
      sgpa: 0, // Will be calculated by contract
      mediumOfInstruction: "English",
      issueDate: 0, // Will be set by contract
      issuer: ethers.ZeroAddress, // Will be set by contract
      isRevoked: false
    };
    
    console.log("\n🧪 Test Certificate Data:");
    console.log(JSON.stringify(testCertData, null, 2));
    
    // Estimate gas
    try {
      console.log("\n⛽ Estimating gas...");
      const gasEstimate = await contract.mintSemesterCertificate.estimateGas(
        testStudentAddress,
        testSerialNo,
        testMemoNo,
        testCertData
      );
      console.log("Gas estimate:", gasEstimate.toString());
      
      // Try the actual call with static call first
      console.log("\n🔄 Testing with static call...");
      const result = await contract.mintSemesterCertificate.staticCall(
        testStudentAddress,
        testSerialNo,
        testMemoNo,
        testCertData
      );
      console.log("✅ Static call successful. Token ID would be:", result.toString());
      
    } catch (error) {
      console.error("❌ Gas estimation or static call failed:");
      console.error("Error message:", error.message);
      console.error("Error reason:", error.reason);
      console.error("Error code:", error.code);
      
      // Common error analysis
      if (error.message.includes("AccessControl")) {
        console.log("💡 This is likely a role permission issue");
      } else if (error.message.includes("Serial number already used")) {
        console.log("💡 Try different serial number");
      } else if (error.message.includes("Memo number already used")) {
        console.log("💡 Try different memo number");
      } else if (error.message.includes("Student name cannot be empty")) {
        console.log("💡 Check student name field");
      } else if (error.message.includes("At least one course required")) {
        console.log("💡 Check courses array");
      } else {
        console.log("💡 Check contract deployment and ABI compatibility");
      }
    }
    
  } catch (error) {
    console.error("❌ Debug script failed:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  debugSemesterCertificate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { debugSemesterCertificate };
