const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CLEAN CertificateNFT contract...");
  
  // Get the contract factory
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  
  // Deploy the contract
  console.log("📦 Deploying contract...");
  const certificateNFT = await CertificateNFT.deploy();
  
  // Wait for deployment
  console.log("⏳ Waiting for deployment confirmation...");
  await certificateNFT.waitForDeployment();
  
  const contractAddress = await certificateNFT.getAddress();
  console.log("✅ CertificateNFT deployed to:", contractAddress);
  
  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployed by:", deployer.address);
  
  // Grant MINTER_ROLE to deployer
  console.log("🔑 Granting MINTER_ROLE...");
  const MINTER_ROLE = await certificateNFT.MINTER_ROLE();
  const grantTx = await certificateNFT.grantRole(MINTER_ROLE, deployer.address);
  await grantTx.wait();
  console.log("✅ MINTER_ROLE granted to deployer");
  
  // Verify role was granted
  const hasRole = await certificateNFT.hasRole(MINTER_ROLE, deployer.address);
  console.log("🔍 Deployer has MINTER_ROLE:", hasRole);
  
  // Test basic contract functions
  console.log("\n🧪 Testing contract functions...");
  
  try {
    const name = await certificateNFT.name();
    const symbol = await certificateNFT.symbol();
    console.log("✅ Name:", name);
    console.log("✅ Symbol:", symbol);
  } catch (error) {
    console.log("❌ Error testing basic functions:", error.message);
  }
  
  // Test semester certificate function exists
  try {
    // Just check if the function exists by getting its fragment
    const fragment = certificateNFT.interface.getFunction("mintSemesterCertificate");
    console.log("✅ mintSemesterCertificate function exists");
    console.log("📝 Function signature:", fragment.format());
  } catch (error) {
    console.log("❌ mintSemesterCertificate function missing:", error.message);
  }
  
  // Test serial number checking
  try {
    const isUsed = await certificateNFT.isSerialNumberUsed("TEST123");
    console.log("✅ Serial number check works:", !isUsed);
  } catch (error) {
    console.log("❌ Serial number check failed:", error.message);
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Block Number:", await ethers.provider.getBlockNumber());
  
  // Format address properly
  const formattedAddress = ethers.getAddress(contractAddress);
  console.log("Formatted Address:", formattedAddress);
  
  return formattedAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📋 Update your .env file with:");
    console.log(`VITE_CERTIFICATE_NFT_ADDRESS=${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
