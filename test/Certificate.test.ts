import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";

describe("Vignan Institute Blockchain Certificate Platform", function () {
  let certificateNFT: Contract;
  let scholarshipEscrow: Contract;
  let owner: Signer;
  let student1: Signer;
  let student2: Signer;
  let admin: Signer;
  let ownerAddress: string;
  let student1Address: string;
  let student2Address: string;
  let adminAddress: string;

  beforeEach(async function () {
    [owner, student1, student2, admin] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    student1Address = await student1.getAddress();
    student2Address = await student2.getAddress();
    adminAddress = await admin.getAddress();

    // Deploy CertificateNFT first
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    certificateNFT = await CertificateNFT.deploy();
    await certificateNFT.deployed();

    // Deploy ScholarshipEscrow with CertificateNFT address
    const ScholarshipEscrow = await ethers.getContractFactory("ScholarshipEscrow");
    scholarshipEscrow = await ScholarshipEscrow.deploy(certificateNFT.address);
    await scholarshipEscrow.deployed();

    // Set up roles
    const MINTER_ROLE = await certificateNFT.MINTER_ROLE();
    const ADMIN_ROLE = await certificateNFT.ADMIN_ROLE();
    const SCHOLARSHIP_MANAGER_ROLE = await scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE();
    
    await certificateNFT.grantRole(MINTER_ROLE, ownerAddress);
    await certificateNFT.grantRole(ADMIN_ROLE, adminAddress);
    await scholarshipEscrow.grantRole(SCHOLARSHIP_MANAGER_ROLE, ownerAddress);
  });

  describe("CertificateNFT", function () {
    it("Should mint a certificate NFT", async function () {
      const tx = await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      await expect(tx)
        .to.emit(certificateNFT, "CertificateIssued")
        .withArgs(1, student1Address, "Computer Science Fundamentals", "", "A+", "QmSampleHash1", await tx.then(t => t.timestamp));

      expect(await certificateNFT.ownerOf(1)).to.equal(student1Address);
      expect(await certificateNFT.balanceOf(student1Address)).to.equal(1);
    });

    it("Should update certificate details", async function () {
      // Mint certificate first
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      // Update details as admin
      await certificateNFT.connect(admin).updateCertificateDetails(
        1,
        "Alice Johnson",
        "Computer Science"
      );

      const certData = await certificateNFT.getCertificateData(1);
      expect(certData.studentName).to.equal("Alice Johnson");
      expect(certData.department).to.equal("Computer Science");
    });

    it("Should verify a valid certificate", async function () {
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      const [certData, isValid] = await certificateNFT.verifyCertificate(1);
      expect(isValid).to.be.true;
      expect(certData.courseName).to.equal("Computer Science Fundamentals");
      expect(certData.grade).to.equal("A+");
    });

    it("Should revoke a certificate", async function () {
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      const tx = await certificateNFT.connect(admin).revokeCertificate(1);
      await expect(tx)
        .to.emit(certificateNFT, "CertificateRevoked")
        .withArgs(1, student1Address, adminAddress);

      const [certData, isValid] = await certificateNFT.verifyCertificate(1);
      expect(isValid).to.be.false;
      expect(certData.isRevoked).to.be.true;
    });

    it("Should prevent unauthorized minting", async function () {
      await expect(
        certificateNFT.connect(student1).mintCertificate(
          student1Address,
          "Computer Science Fundamentals",
          "A+",
          "QmSampleHash1"
        )
      ).to.be.revertedWith("AccessControl: account " + student1Address.toLowerCase() + " is missing role " + await certificateNFT.MINTER_ROLE());
    });

    it("Should prevent unauthorized revocation", async function () {
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      await expect(
        certificateNFT.connect(student1).revokeCertificate(1)
      ).to.be.revertedWith("AccessControl: account " + student1Address.toLowerCase() + " is missing role " + await certificateNFT.ADMIN_ROLE());
    });

    it("Should prevent duplicate IPFS hashes", async function () {
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      await expect(
        certificateNFT.mintCertificate(
          student2Address,
          "Data Structures",
          "A",
          "QmSampleHash1"
        )
      ).to.be.revertedWith("IPFS hash already used");
    });
  });

  describe("ScholarshipEscrow", function () {
    it("Should deposit scholarship funds", async function () {
      const eligibleStudents = [student1Address, student2Address];
      const amount = ethers.utils.parseEther("10");

      const tx = await scholarshipEscrow.depositScholarship(
        amount,
        eligibleStudents,
        { value: amount }
      );

      await expect(tx)
        .to.emit(scholarshipEscrow, "ScholarshipDeposited")
        .withArgs(1, amount, eligibleStudents, await tx.then(t => t.timestamp));

      const scholarship = await scholarshipEscrow.scholarships(1);
      expect(scholarship.totalAmount).to.equal(amount);
      expect(scholarship.eligibleStudents.length).to.equal(2);
      expect(scholarship.isActive).to.be.true;
    });

    it("Should check certificate eligibility", async function () {
      // Student without certificate should not be eligible
      expect(await scholarshipEscrow.hasRequiredCertificates(student1Address)).to.be.false;

      // Mint certificate for student
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      // Now student should be eligible
      expect(await scholarshipEscrow.hasRequiredCertificates(student1Address)).to.be.true;
    });

    it("Should allow eligible students to claim scholarship", async function () {
      // Mint certificate for student
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      // Deposit scholarship
      const amount = ethers.utils.parseEther("10");
      const eligibleStudents = [student1Address];
      await scholarshipEscrow.depositScholarship(
        amount,
        eligibleStudents,
        { value: amount }
      );

      // Fast forward time to pass the 30-day time lock
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // Student should be able to claim
      const initialBalance = await ethers.provider.getBalance(student1Address);
      
      const tx = await scholarshipEscrow.connect(student1).claimScholarship(1);
      await expect(tx)
        .to.emit(scholarshipEscrow, "ScholarshipClaimed")
        .withArgs(1, student1Address, amount, await tx.then(t => t.timestamp));

      const finalBalance = await ethers.provider.getBalance(student1Address);
      expect(finalBalance.sub(initialBalance)).to.equal(amount);
    });

    it("Should prevent claiming before time lock", async function () {
      // Mint certificate for student
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      // Deposit scholarship
      const amount = ethers.utils.parseEther("10");
      const eligibleStudents = [student1Address];
      await scholarshipEscrow.depositScholarship(
        amount,
        eligibleStudents,
        { value: amount }
      );

      // Try to claim before time lock
      await expect(
        scholarshipEscrow.connect(student1).claimScholarship(1)
      ).to.be.revertedWith("Scholarship not yet released");
    });

    it("Should prevent ineligible students from claiming", async function () {
      // Deposit scholarship without minting certificate
      const amount = ethers.utils.parseEther("10");
      const eligibleStudents = [student1Address];
      await scholarshipEscrow.depositScholarship(
        amount,
        eligibleStudents,
        { value: amount }
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // Student without certificate should not be able to claim
      await expect(
        scholarshipEscrow.connect(student1).claimScholarship(1)
      ).to.be.revertedWith("Student does not have required certificates");
    });

    it("Should prevent unauthorized scholarship creation", async function () {
      const amount = ethers.utils.parseEther("10");
      const eligibleStudents = [student1Address];

      await expect(
        scholarshipEscrow.connect(student1).depositScholarship(
          amount,
          eligibleStudents,
          { value: amount }
        )
      ).to.be.revertedWith("AccessControl: account " + student1Address.toLowerCase() + " is missing role " + await scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE());
    });

    it("Should handle multiple eligible students", async function () {
      // Mint certificates for both students
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );
      await certificateNFT.mintCertificate(
        student2Address,
        "Data Structures",
        "A",
        "QmSampleHash2"
      );

      // Deposit scholarship for both students
      const amount = ethers.utils.parseEther("20");
      const eligibleStudents = [student1Address, student2Address];
      await scholarshipEscrow.depositScholarship(
        amount,
        eligibleStudents,
        { value: amount }
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // Both students should be able to claim equal shares
      const shareAmount = amount.div(2);
      
      const initialBalance1 = await ethers.provider.getBalance(student1Address);
      await scholarshipEscrow.connect(student1).claimScholarship(1);
      const finalBalance1 = await ethers.provider.getBalance(student1Address);
      expect(finalBalance1.sub(initialBalance1)).to.equal(shareAmount);

      const initialBalance2 = await ethers.provider.getBalance(student2Address);
      await scholarshipEscrow.connect(student2).claimScholarship(1);
      const finalBalance2 = await ethers.provider.getBalance(student2Address);
      expect(finalBalance2.sub(initialBalance2)).to.equal(shareAmount);
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full certificate and scholarship lifecycle", async function () {
      // 1. Mint certificate for student
      await certificateNFT.mintCertificate(
        student1Address,
        "Computer Science Fundamentals",
        "A+",
        "QmSampleHash1"
      );

      // 2. Update certificate details
      await certificateNFT.connect(admin).updateCertificateDetails(
        1,
        "Alice Johnson",
        "Computer Science"
      );

      // 3. Verify certificate
      const [certData, isValid] = await certificateNFT.verifyCertificate(1);
      expect(isValid).to.be.true;
      expect(certData.studentName).to.equal("Alice Johnson");

      // 4. Create scholarship
      const amount = ethers.utils.parseEther("10");
      const eligibleStudents = [student1Address];
      await scholarshipEscrow.depositScholarship(
        amount,
        eligibleStudents,
        { value: amount }
      );

      // 5. Fast forward time to pass time lock
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // 6. Student claims scholarship
      const initialBalance = await ethers.provider.getBalance(student1Address);
      await scholarshipEscrow.connect(student1).claimScholarship(1);
      const finalBalance = await ethers.provider.getBalance(student1Address);
      
      expect(finalBalance.sub(initialBalance)).to.equal(amount);

      // 7. Verify scholarship is fully claimed
      const scholarship = await scholarshipEscrow.scholarships(1);
      expect(scholarship.remainingAmount).to.equal(0);
      expect(scholarship.isActive).to.be.false;
    });

    it("Should handle gas optimization", async function () {
      // Test gas usage for minting multiple certificates
      const gasUsed = [];
      
      for (let i = 0; i < 5; i++) {
        const tx = await certificateNFT.mintCertificate(
          student1Address,
          `Course ${i}`,
          "A",
          `QmHash${i}`
        );
        const receipt = await tx.wait();
        gasUsed.push(receipt.gasUsed.toNumber());
      }

      // Gas usage should be consistent and reasonable
      const avgGas = gasUsed.reduce((a, b) => a + b, 0) / gasUsed.length;
      expect(avgGas).to.be.lessThan(200000); // Should be under 200k gas
    });
  });
});
