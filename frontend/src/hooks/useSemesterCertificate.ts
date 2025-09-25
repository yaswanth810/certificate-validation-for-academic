import { useState, useCallback } from 'react';
import { useContract } from './useContract';
import { useWeb3 } from '../contexts/Web3Context';
import { getAvailableSerialNumber, getAvailableMemoNumber } from '../utils/serialGenerator';
import { ethers } from 'ethers';

interface Course {
  courseCode: string;
  courseTitle: string;
  gradeSecured: string;
  gradePoints: number;
  status: string;
  creditsObtained: number;
}

interface SemesterCertificateData {
  studentName: string;
  serialNo: string;
  memoNo: string;
  regdNo: string;
  branch: string;
  examination: string;
  monthYearExams: string;
  aadharNo: string;
  studentPhoto: string;
  courses: Course[];
  totalCredits: number;
  sgpa: number;
  mediumOfInstruction: string;
  issueDate: number;
  issuer: string;
  isRevoked: boolean;
}

export const useSemesterCertificate = () => {
  const { contracts, getSignedContracts } = useContract();
  const { account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintSemesterCertificate = useCallback(async (
    studentAddress: string,
    serialNo: string,
    memoNo: string,
    certData: Omit<SemesterCertificateData, 'issueDate' | 'issuer' | 'isRevoked' | 'sgpa'>
  ) => {
    const signedContracts = getSignedContracts();
    if (!contracts.certificateNFT || !signedContracts?.certificateNFT) {
      throw new Error('Contract not available or wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Debug: Starting semester certificate minting...');
      console.log('📍 Contract Address:', contracts.certificateNFT.target || contracts.certificateNFT.address);
      console.log('🌐 Environment Address:', import.meta.env.VITE_CERTIFICATE_NFT_ADDRESS);
      console.log('Student Address:', studentAddress);
      console.log('Serial No:', serialNo);
      console.log('Memo No:', memoNo);
      console.log('Cert Data:', certData);

      // Validate inputs
      if (!ethers.isAddress(studentAddress)) {
        throw new Error('Invalid student address format');
      }

      if (!serialNo || serialNo.trim().length === 0) {
        throw new Error('Serial number cannot be empty');
      }

      if (!memoNo || memoNo.trim().length === 0) {
        throw new Error('Memo number cannot be empty');
      }

      if (!certData.courses || certData.courses.length === 0) {
        throw new Error('At least one course is required');
      }

      // Check if contract has the required functions
      try {
        await contracts.certificateNFT.MINTER_ROLE();
        console.log('✅ Contract has MINTER_ROLE function');
      } catch (err) {
        throw new Error('Contract missing required functions. Please ensure the contract is properly deployed with semester certificate functionality.');
      }

      // Check if serial number or memo number already exists
      console.log('🔍 Checking serial and memo number availability...');
      const [serialExists, memoExists] = await Promise.all([
        contracts.certificateNFT.isSerialNumberUsed(serialNo),
        contracts.certificateNFT.isMemoNumberUsed(memoNo)
      ]);

      console.log('Serial exists:', serialExists);
      console.log('Memo exists:', memoExists);

      if (serialExists) {
        throw new Error('Serial number already exists');
      }

      if (memoExists) {
        throw new Error('Memo number already exists');
      }

      // Check user permissions
      console.log('🔍 Checking user permissions...');
      try {
        const minterRole = await contracts.certificateNFT.MINTER_ROLE();
        const hasRole = await contracts.certificateNFT.hasRole(minterRole, account);
        console.log('Has MINTER_ROLE:', hasRole);
        
        if (!hasRole) {
          throw new Error('Account does not have MINTER_ROLE. Please contact admin to grant minting permissions.');
        }
      } catch (err: any) {
        if (err.message.includes('MINTER_ROLE')) {
          throw err;
        }
        throw new Error('Unable to check permissions. Contract may not be properly deployed.');
      }

      // Prepare certificate data for contract
      console.log('🔍 Preparing contract data...');
      const contractCertData = {
        studentName: certData.studentName,
        serialNo: serialNo,
        memoNo: memoNo,
        regdNo: certData.regdNo,
        branch: certData.branch,
        examination: certData.examination,
        monthYearExams: certData.monthYearExams,
        aadharNo: certData.aadharNo,
        studentPhoto: certData.studentPhoto,
        courses: certData.courses
          .filter(course => course.creditsObtained > 0 && course.gradePoints > 0) // Filter out invalid courses
          .map(course => ({
            courseCode: course.courseCode,
            courseTitle: course.courseTitle,
            gradeSecured: course.gradeSecured,
            gradePoints: Math.round(course.gradePoints * 100), // Convert to integer
            status: course.status || 'P', // Default to 'P' if status is empty
            creditsObtained: course.creditsObtained
          })),
        totalCredits: certData.totalCredits,
        sgpa: 0, // Will be calculated by contract
        mediumOfInstruction: certData.mediumOfInstruction,
        issueDate: 0, // Will be set by contract
        issuer: ethers.ZeroAddress, // Will be set by contract
        isRevoked: false
      };

      console.log('Contract cert data:', contractCertData);
      console.log('📊 Courses after filtering:', contractCertData.courses);
      console.log('📊 Course count:', contractCertData.courses.length);
      
      // Log each course details with data types
      contractCertData.courses.forEach((course, index) => {
        console.log(`Course ${index}:`, {
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          gradeSecured: course.gradeSecured,
          gradePoints: course.gradePoints,
          status: course.status,
          creditsObtained: course.creditsObtained
        });
        console.log(`Course ${index} types:`, {
          courseCode: typeof course.courseCode,
          courseTitle: typeof course.courseTitle,
          gradeSecured: typeof course.gradeSecured,
          gradePoints: typeof course.gradePoints,
          status: typeof course.status,
          creditsObtained: typeof course.creditsObtained
        });
      });

      // Log the complete contract data structure
      console.log('🔍 Complete contract data structure:', JSON.stringify(contractCertData, null, 2));

      // Validate that we have valid courses after filtering
      if (contractCertData.courses.length === 0) {
        throw new Error('No valid courses found. All courses must have credits > 0 and grade points > 0.');
      }

      // Auto-generate unique serial and memo numbers if they're already used
      console.log('🔍 Checking if serial/memo numbers are already used...');
      let finalSerialNo = serialNo;
      let finalMemoNo = memoNo;
      
      const isSerialUsed = await contracts.certificateNFT.isSerialNumberUsed(serialNo);
      const isMemoUsed = await contracts.certificateNFT.isMemoNumberUsed(memoNo);
      
      if (isSerialUsed) {
        console.log(`⚠️ Serial number "${serialNo}" is already used. Generating new one...`);
        finalSerialNo = await getAvailableSerialNumber(
          (sn) => contracts.certificateNFT!.isSerialNumberUsed(sn)
        );
        console.log(`✅ Generated new serial number: ${finalSerialNo}`);
      }
      
      if (isMemoUsed) {
        console.log(`⚠️ Memo number "${memoNo}" is already used. Generating new one...`);
        finalMemoNo = await getAvailableMemoNumber(
          (mn) => contracts.certificateNFT!.isMemoNumberUsed(mn)
        );
        console.log(`✅ Generated new memo number: ${finalMemoNo}`);
      }

      // Test with static call first
      console.log('🔍 Testing with static call...');
      try {
        const staticResult = await contracts.certificateNFT.mintSemesterCertificate.staticCall(
          studentAddress,
          finalSerialNo,
          finalMemoNo,
          contractCertData
        );
        console.log('✅ Static call successful. Token ID would be:', staticResult.toString());
      } catch (staticErr: any) {
        console.error('❌ Static call failed:', staticErr);
        throw new Error(`Contract validation failed: ${staticErr.reason || staticErr.message}`);
      }

      // Estimate gas
      console.log('🔍 Estimating gas...');
      const gasEstimate = await signedContracts.certificateNFT.mintSemesterCertificate.estimateGas(
        studentAddress,
        finalSerialNo,
        finalMemoNo,
        contractCertData
      );

      console.log('Gas estimate:', gasEstimate.toString());

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      // Call contract function
      console.log('🔍 Executing transaction...');
      const tx = await signedContracts.certificateNFT.mintSemesterCertificate(
        studentAddress,
        finalSerialNo,
        finalMemoNo,
        contractCertData,
        { gasLimit }
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const events = receipt.logs.filter((log: any) => {
        try {
          return contracts.certificateNFT?.interface.parseLog(log)?.name === 'SemesterCertificateIssued';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (events.length > 0 && contracts.certificateNFT) {
        const parsedEvent = contracts.certificateNFT.interface.parseLog(events[0]);
        tokenId = parsedEvent?.args?.tokenId?.toString();
      }

      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash
      };

    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to mint semester certificate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contracts.certificateNFT, getSignedContracts]);

  const getSemesterCertificate = useCallback(async (tokenId: string): Promise<SemesterCertificateData | null> => {
    if (!contracts.certificateNFT) {
      throw new Error('Certificate contract not available');
    }

    setLoading(true);
    setError(null);

    try {
      const certData = await contracts.certificateNFT.getSemesterCertificate(tokenId);
      
      return {
        studentName: certData.studentName,
        serialNo: certData.serialNo,
        memoNo: certData.memoNo,
        regdNo: certData.regdNo,
        branch: certData.branch,
        examination: certData.examination,
        monthYearExams: certData.monthYearExams,
        aadharNo: certData.aadharNo,
        studentPhoto: certData.studentPhoto,
        courses: certData.courses.map((course: any) => ({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          gradeSecured: course.gradeSecured,
          gradePoints: Number(course.gradePoints) / 100, // Convert back from integer
          status: course.status,
          creditsObtained: Number(course.creditsObtained)
        })),
        totalCredits: Number(certData.totalCredits),
        sgpa: Number(certData.sgpa),
        mediumOfInstruction: certData.mediumOfInstruction,
        issueDate: Number(certData.issueDate),
        issuer: certData.issuer,
        isRevoked: certData.isRevoked
      };

    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to get semester certificate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contracts.certificateNFT]);

  const getStudentSemesterCertificates = useCallback(async (studentAddress: string): Promise<string[]> => {
    if (!contracts.certificateNFT) {
      throw new Error('Contract not available');
    }

    setLoading(true);
    setError(null);

    try {
      const tokenIds = await contracts.certificateNFT.getStudentSemesterCertificates(studentAddress);
      return tokenIds.map((id: any) => id.toString());

    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to get student semester certificates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contracts.certificateNFT]);

  const verifySemesterCertificate = useCallback(async (tokenId: string) => {
    if (!contracts.certificateNFT) {
      throw new Error('Contract not available');
    }

    setLoading(true);
    setError(null);

    try {
      const [certData, isValid] = await contracts.certificateNFT.verifySemesterCertificate(tokenId);
      
      return {
        isValid,
        certificate: isValid ? {
          studentName: certData.studentName,
          serialNo: certData.serialNo,
          memoNo: certData.memoNo,
          regdNo: certData.regdNo,
          branch: certData.branch,
          examination: certData.examination,
          monthYearExams: certData.monthYearExams,
          aadharNo: certData.aadharNo,
          studentPhoto: certData.studentPhoto,
          courses: certData.courses.map((course: any) => ({
            courseCode: course.courseCode,
            courseTitle: course.courseTitle,
            gradeSecured: course.gradeSecured,
            gradePoints: Number(course.gradePoints) / 100,
            status: course.status,
            creditsObtained: Number(course.creditsObtained)
          })),
          totalCredits: Number(certData.totalCredits),
          sgpa: Number(certData.sgpa),
          mediumOfInstruction: certData.mediumOfInstruction,
          issueDate: Number(certData.issueDate),
          issuer: certData.issuer,
          isRevoked: certData.isRevoked
        } : null
      };

    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to verify semester certificate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contracts.certificateNFT]);

  const revokeSemesterCertificate = useCallback(async (tokenId: string) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.certificateNFT || !account) {
      throw new Error('Contract not available or wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await signedContracts.certificateNFT.revokeSemesterCertificate(tokenId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };

    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to revoke semester certificate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contracts.certificateNFT, getSignedContracts, account]);

  return {
    mintSemesterCertificate,
    getSemesterCertificate,
    getStudentSemesterCertificates,
    verifySemesterCertificate,
    revokeSemesterCertificate,
    loading,
    error
  };
};
