const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FINAL CertificateNFT contract...");
  
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.waitForDeployment();
  
  const contractAddress = await certificateNFT.getAddress();
  const [deployer] = await ethers.getSigners();
  
  // Grant MINTER_ROLE
  const MINTER_ROLE = await certificateNFT.MINTER_ROLE();
  await certificateNFT.grantRole(MINTER_ROLE, deployer.address);
  
  console.log("CONTRACT_ADDRESS=" + contractAddress);
  console.log("DEPLOYER=" + deployer.address);
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("FINAL_ADDRESS=" + address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("ERROR:", error.message);
    process.exit(1);
  });
