const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying new contracts...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  
  // Deploy ScholarshipEscrow
  const ScholarshipEscrow = await ethers.getContractFactory('ScholarshipEscrow');
  const certificateAddress = '0x882d62F53217Bc62a8630BbDB2686C1fF8Dcee3f'; // existing
  
  const scholarshipEscrow = await ScholarshipEscrow.deploy(certificateAddress);
  await scholarshipEscrow.waitForDeployment();
  
  const newAddress = await scholarshipEscrow.getAddress();
  console.log('New ScholarshipEscrow deployed to:', newAddress);
  
  // Grant roles
  const SCHOLARSHIP_MANAGER_ROLE = await scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE();
  await scholarshipEscrow.grantRole(SCHOLARSHIP_MANAGER_ROLE, deployer.address);
  console.log('Granted SCHOLARSHIP_MANAGER_ROLE to deployer');
  
  console.log('\nUpdate your .env file:');
  console.log(`VITE_SCHOLARSHIP_ESCROW_ADDRESS=${newAddress}`);
}

main().catch(console.error);
