import hre from "hardhat";
import fs from "fs";
// @ts-ignore - Hardhat runtime environment ethers access
const ethers = hre.ethers;

async function main() {
  console.log("Starting deployment of Vignan Institute Blockchain Certificate Platform...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy VignanRegistry first
  console.log("\n1. Deploying VignanRegistry...");
  const VignanRegistry = await hre.ethers.getContractFactory("VignanRegistry");
  const vignanRegistry = await VignanRegistry.deploy();
  await vignanRegistry.waitForDeployment();
  console.log("VignanRegistry deployed to:", await vignanRegistry.getAddress());

  // Deploy CertificateNFT
  console.log("\n2. Deploying CertificateNFT...");
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.waitForDeployment();
  console.log("CertificateNFT deployed to:", await certificateNFT.getAddress());

  // Deploy ScholarshipEscrow with CertificateNFT address
  console.log("\n3. Deploying ScholarshipEscrow...");
  const ScholarshipEscrow = await hre.ethers.getContractFactory("ScholarshipEscrow");
  const scholarshipEscrow = await ScholarshipEscrow.deploy(await certificateNFT.getAddress());
  await scholarshipEscrow.waitForDeployment();
  console.log("ScholarshipEscrow deployed to:", await scholarshipEscrow.getAddress());

  // Set up roles and permissions
  console.log("\n4. Setting up roles and permissions...");
  
  // Grant MINTER_ROLE to deployer for CertificateNFT
  const MINTER_ROLE = await certificateNFT.MINTER_ROLE();
  await certificateNFT.grantRole(MINTER_ROLE, deployer.address);
  console.log("Granted MINTER_ROLE to deployer");

  // Grant SCHOLARSHIP_MANAGER_ROLE to deployer for ScholarshipEscrow
  const SCHOLARSHIP_MANAGER_ROLE = await scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE();
  await scholarshipEscrow.grantRole(SCHOLARSHIP_MANAGER_ROLE, deployer.address);
  console.log("Granted SCHOLARSHIP_MANAGER_ROLE to deployer");

  // Set base URI for CertificateNFT
  const baseURI = "https://api.vignan.edu/certificates/metadata/";
  await certificateNFT.setBaseURI(baseURI);
  console.log("Set base URI for CertificateNFT:", baseURI);

  // Use deployer as test student (real address that can claim scholarships)
  console.log("\n5. Setting up test student...");
  const testStudent = deployer.address;
  console.log("Test student address:", testStudent);

  // Mint 3 sample certificates
  console.log("\n6. Minting sample certificates...");
  
  try {
    const certificate1 = await certificateNFT.mintCertificate(
      testStudent,
      "Computer Science Fundamentals",
      "A+",
      "QmSampleHash1"
    );
    await certificate1.wait();
    console.log("Minted certificate 1, Token ID: 1");
    
    // Update certificate details
    await certificateNFT.updateCertificateDetails(
      1,
      "Test Student",
      "Computer Science"
    );
    console.log("Updated certificate 1 details");

    const certificate2 = await certificateNFT.mintCertificate(
      testStudent,
      "Data Structures and Algorithms",
      "A",
      "QmSampleHash2"
    );
    await certificate2.wait();
    console.log("Minted certificate 2, Token ID: 2");
    
    await certificateNFT.updateCertificateDetails(
      2,
      "Test Student",
      "Computer Science"
    );
    console.log("Updated certificate 2 details");

    const certificate3 = await certificateNFT.mintCertificate(
      testStudent,
      "Electrical Engineering Basics",
      "B+",
      "QmSampleHash3"
    );
    await certificate3.wait();
    console.log("Minted certificate 3, Token ID: 3");
    
    await certificateNFT.updateCertificateDetails(
      3,
      "Test Student",
      "Electrical Engineering"
    );
    console.log("Updated certificate 3 details");
  } catch (error) {
    console.error("Error minting certificates:", error);
    throw error;
  }

  // Create 2 test scholarships with smaller amounts
  console.log("\n7. Creating test scholarships...");
  
  try {
    // Scholarship 1: Merit Scholarship
    const txS1 = await scholarshipEscrow.depositScholarship(
      hre.ethers.parseEther("0.1"), // 0.1 ETH for testing
      [testStudent], // Test student
      { value: hre.ethers.parseEther("0.1") }
    );
    await txS1.wait();
    console.log("Created scholarship 1, ID: 1");
    console.log("Amount: 0.1 ETH, Eligible student:", testStudent);

    // Scholarship 2: Engineering Excellence
    const txS2 = await scholarshipEscrow.depositScholarship(
      hre.ethers.parseEther("0.05"), // 0.05 ETH for testing
      [testStudent], // Test student
      { value: hre.ethers.parseEther("0.05") }
    );
    await txS2.wait();
    console.log("Created scholarship 2, ID: 2");
    console.log("Amount: 0.05 ETH, Eligible student:", testStudent);
  } catch (error) {
    console.error("Error creating scholarships:", error);
    throw error;
  }

  // Verify certificates
  console.log("\n8. Verifying certificates...");
  
  const [cert1Data, cert1Valid] = await certificateNFT.verifyCertificate(1);
  console.log("Certificate 1 valid:", cert1Valid);
  console.log("Certificate 1 data:", {
    studentName: cert1Data.studentName,
    courseName: cert1Data.courseName,
    grade: cert1Data.grade
  });

  const [cert2Data, cert2Valid] = await certificateNFT.verifyCertificate(2);
  console.log("Certificate 2 valid:", cert2Valid);

  const [cert3Data, cert3Valid] = await certificateNFT.verifyCertificate(3);
  console.log("Certificate 3 valid:", cert3Valid);

  // Check scholarship eligibility
  console.log("\n9. Checking scholarship eligibility...");
  
  try {
    const studentEligible = await scholarshipEscrow.hasRequiredCertificates(testStudent);
    console.log("Test student eligible for scholarships:", studentEligible);
  } catch (error) {
    console.error("Error checking eligibility:", error);
  }

  // Display deployment summary
  console.log("\n" + "=".repeat(80));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(80));
  const deploymentNetwork = await hre.ethers.provider.getNetwork();
  console.log("Network:", deploymentNetwork.name);
  console.log("Chain ID:", deploymentNetwork.chainId);
  console.log("Deployer:", deployer.address);
  console.log("VignanRegistry:", await vignanRegistry.getAddress());
  console.log("CertificateNFT:", await certificateNFT.getAddress());
  console.log("ScholarshipEscrow:", await scholarshipEscrow.getAddress());
  console.log("\nSample Certificates:");
  console.log("- Token 1: Test Student - Computer Science Fundamentals (A+)");
  console.log("- Token 2: Test Student - Data Structures and Algorithms (A)");
  console.log("- Token 3: Test Student - Electrical Engineering Basics (B+)");
  console.log("\nSample Scholarships:");
  console.log("- Scholarship 1: Merit Scholarship (0.1 ETH) - Test Student");
  console.log("- Scholarship 2: Engineering Excellence (0.05 ETH) - Test Student");
  console.log("=".repeat(80));

  // Save contract addresses to a file for frontend
  const contractAddresses = {
    network: deploymentNetwork.name,
    chainId: deploymentNetwork.chainId,
    contracts: {
      VignanRegistry: await vignanRegistry.getAddress(),
      CertificateNFT: await certificateNFT.getAddress(),
      ScholarshipEscrow: await scholarshipEscrow.getAddress()
    },
    deployer: deployer.address,
    testStudent: testStudent,
    sampleCertificates: [
      { tokenId: "1", student: "Test Student", course: "Computer Science Fundamentals" },
      { tokenId: "2", student: "Test Student", course: "Data Structures and Algorithms" },
      { tokenId: "3", student: "Test Student", course: "Electrical Engineering Basics" }
    ],
    sampleScholarships: [
      { id: "1", amount: "0.1 ETH", students: ["Test Student"] },
      { id: "2", amount: "0.05 ETH", students: ["Test Student"] }
    ],
    timestamp: new Date().toISOString()
  };

  // fs is now imported at the top
  fs.writeFileSync(
    'deployment-addresses.json',
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("\nContract addresses saved to deployment-addresses.json");

  // Verification instructions
  console.log("\n" + "=".repeat(80));
  console.log("VERIFICATION INSTRUCTIONS");
  console.log("=".repeat(80));
  console.log("To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${await vignanRegistry.getAddress()}`);
  console.log(`npx hardhat verify --network sepolia ${await certificateNFT.getAddress()}`);
  console.log(`npx hardhat verify --network sepolia ${await scholarshipEscrow.getAddress()} "${await certificateNFT.getAddress()}"`);
  console.log("=".repeat(80));

  console.log("\nDeployment completed successfully! 🎉");
  console.log("\nNext steps:");
  console.log("1. Update frontend environment variables with contract addresses");
  console.log("2. Test certificate verification functionality");
  console.log("3. Test scholarship claiming (after 30-day time lock)");
  console.log("4. Deploy frontend to production");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
