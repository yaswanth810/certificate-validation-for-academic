const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log("Deploying CertificateNFT contract with semester certificate functionality...");

  // Get the contract factory
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const certificateNFT = await CertificateNFT.deploy();
  
  // Wait for deployment to complete
  await certificateNFT.waitForDeployment();
  
  const contractAddress = await certificateNFT.getAddress();
  console.log("✅ CertificateNFT deployed to:", contractAddress);
  
  // Validate address format
  if (!ethers.isAddress(contractAddress)) {
    throw new Error(`Invalid contract address format: ${contractAddress}`);
  }
  
  // Ensure it's a proper 42-character address
  const formattedAddress = ethers.getAddress(contractAddress);
  console.log("Formatted address:", formattedAddress);
  
  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  
  // Verify the contract has semester certificate functions
  console.log("\n=== Verifying Semester Certificate Functions ===");
  
  try {
    // Test basic functions
    const name = await certificateNFT.name();
    const symbol = await certificateNFT.symbol();
    console.log("Contract name:", name);
    console.log("Contract symbol:", symbol);
    
    // Test semester certificate specific functions
    const minterRole = await certificateNFT.MINTER_ROLE();
    console.log("MINTER_ROLE:", minterRole);
    
    // Test serial number checking
    const testSerial = "TEST123456";
    const isUsed = await certificateNFT.isSerialNumberUsed(testSerial);
    console.log(`Test serial "${testSerial}" is used:`, isUsed);
    
    const testMemo = "VB TEST123";
    const isMemoUsed = await certificateNFT.isMemoNumberUsed(testMemo);
    console.log(`Test memo "${testMemo}" is used:`, isMemoUsed);
    
    console.log("✅ All semester certificate functions are working!");
    
  } catch (error) {
    console.error("❌ Error verifying functions:", error.message);
  }
  
  // Update environment files
  console.log("\n=== Environment Variable Updates ===");
  console.log("Update your .env files with the new contract address:");
  console.log(`VITE_CERTIFICATE_NFT_ADDRESS=${contractAddress}`);
  console.log(`CERTIFICATE_NFT_ADDRESS=${contractAddress}`);
  
  // Gas usage info
  const deployTx = certificateNFT.deploymentTransaction();
  if (deployTx) {
    const receipt = await deployTx.wait();
    console.log("\n=== Deployment Info ===");
    console.log("Transaction hash:", deployTx.hash);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Gas price:", deployTx.gasPrice.toString());
  }
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
