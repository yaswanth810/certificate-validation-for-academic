const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying upgraded CertificateNFT with semester certificate functionality...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy CertificateNFT
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.waitForDeployment();

  const contractAddress = await certificateNFT.getAddress();
  console.log("✅ CertificateNFT deployed to:", contractAddress);

  // Grant roles to deployer
  console.log("🔐 Setting up roles...");
  
  const MINTER_ROLE = await certificateNFT.MINTER_ROLE();
  const ADMIN_ROLE = await certificateNFT.ADMIN_ROLE();
  
  // Grant MINTER_ROLE to deployer
  const grantMinterTx = await certificateNFT.grantRole(MINTER_ROLE, deployer.address);
  await grantMinterTx.wait();
  console.log("✅ MINTER_ROLE granted to:", deployer.address);
  
  // Grant ADMIN_ROLE to deployer
  const grantAdminTx = await certificateNFT.grantRole(ADMIN_ROLE, deployer.address);
  await grantAdminTx.wait();
  console.log("✅ ADMIN_ROLE granted to:", deployer.address);

  // Verify semester certificate functions exist
  console.log("🔍 Verifying semester certificate functions...");
  try {
    const hasFunction = await certificateNFT.mintSemesterCertificate.staticCall;
    console.log("✅ mintSemesterCertificate function exists");
  } catch (error) {
    console.error("❌ mintSemesterCertificate function missing");
  }

  // Test basic functionality
  console.log("🧪 Testing basic functionality...");
  try {
    const testSerialUsed = await certificateNFT.isSerialNumberUsed("TEST123");
    console.log("✅ isSerialNumberUsed function works:", testSerialUsed);
    
    const testMemoUsed = await certificateNFT.isMemoNumberUsed("MEMO123");
    console.log("✅ isMemoNumberUsed function works:", testMemoUsed);
  } catch (error) {
    console.error("❌ Function test failed:", error.message);
  }

  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update your .env file with:");
  console.log(`   VITE_CERTIFICATE_NFT_ADDRESS=${contractAddress}`);
  console.log("2. Update frontend contract address");
  console.log("3. Test semester certificate minting");
  
  return {
    certificateNFT: contractAddress,
    deployer: deployer.address
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
