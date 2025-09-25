import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

// Contract ABIs
const CERTIFICATE_NFT_ABI = [
  // Original certificate functions
  "function mintCertificate(address student, string memory courseName, string memory grade, string memory ipfsHash) external returns (uint256)",
  "function verifyCertificate(uint256 tokenId) external view returns (tuple(string studentName, string courseName, string grade, string ipfsHash, string department, uint256 issueDate, bool isRevoked, address issuer) certificateData, bool isValid)",
  "function getCertificateData(uint256 tokenId) external view returns (tuple(string studentName, string courseName, string grade, string ipfsHash, string department, uint256 issueDate, bool isRevoked, address issuer))",
  "function getStudentCertificates(address student) external view returns (uint256[])",
  "function updateCertificateDetails(uint256 tokenId, string memory studentName, string memory department) external",
  "function revokeCertificate(uint256 tokenId) external",
  
  // Semester certificate functions
  "function mintSemesterCertificate(address student, string memory serialNo, string memory memoNo, tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked)) external returns (uint256)",
  "function getSemesterCertificate(uint256 tokenId) external view returns (tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked))",
  "function getStudentSemesterCertificates(address student) external view returns (uint256[])",
  "function verifySemesterCertificate(uint256 tokenId) external view returns (tuple(string studentName, string serialNo, string memoNo, string regdNo, string branch, string examination, string monthYearExams, string aadharNo, string studentPhoto, tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses, uint256 totalCredits, uint256 sgpa, string mediumOfInstruction, uint256 issueDate, address issuer, bool isRevoked) certificateData, bool isValid)",
  "function revokeSemesterCertificate(uint256 tokenId) external",
  "function updateSemesterCertificatePhoto(uint256 tokenId, string memory studentPhoto) external",
  "function isSerialNumberUsed(string memory serialNo) external view returns (bool)",
  "function isMemoNumberUsed(string memory memoNo) external view returns (bool)",
  "function calculateSGPA(tuple(string courseCode, string courseTitle, string gradeSecured, uint256 gradePoints, string status, uint256 creditsObtained)[] courses) external pure returns (uint256)",
  
  // Common functions
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function setBaseURI(string memory baseURI) external",
  "function pause() external",
  "function unpause() external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
  "function MINTER_ROLE() external view returns (bytes32)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  
  // Events
  "event CertificateIssued(uint256 indexed tokenId, address indexed student, string indexed courseName, string studentName, string grade, string ipfsHash, uint256 timestamp)",
  "event CertificateRevoked(uint256 indexed tokenId, address indexed student, address indexed admin)",
  "event CertificateVerified(uint256 indexed tokenId, bool isValid)",
  "event SemesterCertificateIssued(uint256 indexed tokenId, address indexed student, string indexed serialNo, string memoNo, string regdNo, string branch, string examination, uint256 sgpa, uint256 timestamp)",
  "event SemesterCertificateRevoked(uint256 indexed tokenId, address indexed student, address indexed admin)"
];

const SCHOLARSHIP_ESCROW_ABI = [
  "function createScholarship(string memory name, string memory description, uint256 totalAmount, uint256 maxRecipients, uint256 deadline, address tokenAddress, string memory tokenSymbol, tuple(uint256 minGPA, string[] requiredCourses, string[] allowedDepartments, uint256 minCertificates, uint256 enrollmentAfter, uint256 enrollmentBefore, bool requiresAllCourses) criteria) external payable returns (uint256)",
  "function claimScholarship(uint256 scholarshipId) external",
  "function revokeScholarship(uint256 scholarshipId) external",
  "function isEligibleForScholarship(uint256 scholarshipId, address student) external view returns (bool)",
  "function getStudentScholarships(address student) external view returns (uint256[])",
  "function getScholarship(uint256 scholarshipId) external view returns (tuple(string name, string description, uint256 totalAmount, uint256 claimedAmount, uint256 remainingAmount, uint256 maxRecipients, uint256 amountPerRecipient, uint256 createdAt, uint256 deadline, bool isActive, address createdBy, address tokenAddress, string tokenSymbol))",
  "function getTotalClaimed(address student) external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function depositFunds() external payable",
  "function withdrawFunds(uint256 amount) external",
  "function pause() external",
  "function unpause() external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
  "function SCHOLARSHIP_MANAGER_ROLE() external view returns (bytes32)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "event ScholarshipCreated(uint256 indexed scholarshipId, string name, uint256 totalAmount, uint256 maxRecipients, uint256 deadline, uint256 timestamp)",
  "event ScholarshipClaimed(uint256 indexed scholarshipId, address indexed student, uint256 amount, uint256 timestamp)",
  "event ScholarshipRevoked(uint256 indexed scholarshipId, address indexed admin, uint256 timestamp)",
  "event FundsDeposited(address indexed depositor, uint256 amount, uint256 timestamp)",
  "event FundsWithdrawn(address indexed admin, uint256 amount, uint256 timestamp)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)"
];

// Contract addresses
const CONTRACT_ADDRESSES = {
  CertificateNFT: import.meta.env.VITE_CERTIFICATE_NFT_ADDRESS || '',
  ScholarshipEscrow: import.meta.env.VITE_SCHOLARSHIP_ESCROW_ADDRESS || '',
  VignanRegistry: import.meta.env.VITE_VIGNAN_REGISTRY_ADDRESS || ''
};

export interface CertificateData {
  studentName: string;
  courseName: string;
  grade: string;
  ipfsHash: string;
  department: string;
  issueDate: number;
  isRevoked: boolean;
  issuer: string;
}

export interface ScholarshipData {
  name: string;
  description: string;
  totalAmount: string;
  claimedAmount: string;
  remainingAmount: string;
  maxRecipients: number;
  amountPerRecipient: string;
  createdAt: number;
  deadline: number;
  isActive: boolean;
  createdBy: string;
  tokenAddress: string;
  tokenSymbol: string;
}

export const useContract = () => {
  const { provider, signer, isConnected } = useWeb3();
  const [contracts, setContracts] = useState<{
    certificateNFT: ethers.Contract | null;
    scholarshipEscrow: ethers.Contract | null;
  }>({
    certificateNFT: null,
    scholarshipEscrow: null
  });

  useEffect(() => {
    if (provider && isConnected) {
      const certificateNFT = new ethers.Contract(
        CONTRACT_ADDRESSES.CertificateNFT,
        CERTIFICATE_NFT_ABI,
        provider
      );

      const scholarshipEscrow = new ethers.Contract(
        CONTRACT_ADDRESSES.ScholarshipEscrow,
        SCHOLARSHIP_ESCROW_ABI,
        provider
      );

      setContracts({
        certificateNFT,
        scholarshipEscrow
      });
    }
  }, [provider, isConnected]);

  const getSignedContracts = () => {
    if (!signer) return null;

    return {
      certificateNFT: contracts.certificateNFT?.connect(signer) as ethers.Contract,
      scholarshipEscrow: contracts.scholarshipEscrow?.connect(signer) as ethers.Contract
    };
  };

  return {
    contracts,
    getSignedContracts,
    isConnected
  };
};

export const useCertificates = (studentAddress: string) => {
  const { contracts } = useContract();
  const [certificates, setCertificates] = useState<Array<CertificateData & { tokenId: string; isValid: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!contracts.certificateNFT || !studentAddress) return;

      try {
        setLoading(true);
        setError(null);

        const tokenIds = await contracts.certificateNFT.getStudentCertificates(studentAddress);
        const certificateData = await Promise.all(
          tokenIds.map(async (tokenId: bigint) => {
            const [data, isValid] = await contracts.certificateNFT!.verifyCertificate(tokenId);
            return {
              tokenId: tokenId.toString(),
              ...data,
              isValid
            };
          })
        );

        setCertificates(certificateData);
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
        setError('Failed to fetch certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [contracts.certificateNFT, studentAddress]);

  return { certificates, loading, error };
};

export const useScholarships = (studentAddress: string) => {
  const { contracts } = useContract();
  const [scholarships, setScholarships] = useState<Array<ScholarshipData & { id: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarships = async () => {
      if (!contracts.scholarshipEscrow || !studentAddress) return;

      try {
        setLoading(true);
        setError(null);

        const scholarshipIds = await contracts.scholarshipEscrow.getStudentScholarships(studentAddress);
        const scholarshipData = await Promise.all(
          scholarshipIds.map(async (scholarshipId: bigint) => {
            const data = await contracts.scholarshipEscrow!.getScholarship(scholarshipId);
            return {
              id: scholarshipId.toString(),
              ...data
            };
          })
        );

        setScholarships(scholarshipData);
      } catch (err: any) {
        console.error('Error fetching scholarships:', err);
        setError('Failed to fetch scholarships');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [contracts.scholarshipEscrow, studentAddress]);

  return { scholarships, loading, error };
};

export const useCertificateVerification = () => {
  const { contracts } = useContract();
  const [verificationResult, setVerificationResult] = useState<{
    certificateData: CertificateData | null;
    isValid: boolean;
    loading: boolean;
    error: string | null;
  }>({
    certificateData: null,
    isValid: false,
    loading: false,
    error: null
  });

  const verifyCertificate = async (tokenId: string) => {
    if (!contracts.certificateNFT) return;

    try {
      setVerificationResult(prev => ({ ...prev, loading: true, error: null }));
      
      const [certificateData, isValid] = await contracts.certificateNFT.verifyCertificate(tokenId);
      
      setVerificationResult({
        certificateData,
        isValid,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error('Error verifying certificate:', err);
      setVerificationResult(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to verify certificate'
      }));
    }
  };

  return { verificationResult, verifyCertificate };
};