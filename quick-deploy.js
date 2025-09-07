const hre = require("hardhat");

async function main() {
  console.log("Quick deployment of ScholarshipEscrow...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Use existing CertificateNFT address
  const certificateAddress = "0x882d62F53217Bc62a8630BbDB2686C1fF8Dcee3f";
  
  // Deploy new ScholarshipEscrow
  const ScholarshipEscrow = await hre.ethers.getContractFactory("ScholarshipEscrow");
  const scholarshipEscrow = await ScholarshipEscrow.deploy(certificateAddress);
  await scholarshipEscrow.waitForDeployment();
  
  const newAddress = await scholarshipEscrow.getAddress();
  console.log("New ScholarshipEscrow deployed to:", newAddress);
  
  // Grant roles to deployer
  const SCHOLARSHIP_MANAGER_ROLE = await scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE();
  await scholarshipEscrow.grantRole(SCHOLARSHIP_MANAGER_ROLE, deployer.address);
  console.log("Granted SCHOLARSHIP_MANAGER_ROLE to deployer");
  
  console.log("\n=== UPDATE YOUR .ENV FILE ===");
  console.log(`VITE_SCHOLARSHIP_ESCROW_ADDRESS=${newAddress}`);
  console.log("===============================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
