import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';
import { useRoles } from './useRoles';
import { 
  Scholarship, 
  ScholarshipClaim, 
  StudentEligibility, 
  ScholarshipFilter,
  CreateScholarshipForm,
  TokenInfo,
  ScholarshipStats
} from '../types/scholarship';

export const useScholarship = () => {
  const { account, provider } = useWeb3();
  const { contracts, getSignedContracts } = useContract();
  const { isScholarshipManager, grantScholarshipManagerRole } = useRoles();
  const scholarshipContract = contracts.scholarshipEscrow;
  const certificateContract = contracts.certificateNFT;
  
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [userEligibility, setUserEligibility] = useState<StudentEligibility[]>([]);
  const [claims, setClaims] = useState<ScholarshipClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all scholarships with error handling and timeout
  const fetchScholarships = useCallback(async () => {
    if (!scholarshipContract || !provider) {
      console.log('Contract or provider not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );

      // Get scholarship events with timeout
      const filter = scholarshipContract.filters.ScholarshipCreated();
      const events = await Promise.race([
        scholarshipContract.queryFilter(filter),
        timeoutPromise
      ]) as ethers.EventLog[];
      
      console.log(`Found ${events.length} scholarship events`);

      if (events.length === 0) {
        setScholarships([]);
        return;
      }

      // Fetch scholarship data with individual timeouts
      const scholarshipPromises = events.map(async (event, index) => {
        try {
          const scholarshipId = event.args?.scholarshipId;
          if (!scholarshipId) return null;

          const data = await Promise.race([
            scholarshipContract.getScholarship(scholarshipId),
            timeoutPromise
          ]);

          return {
            id: scholarshipId.toString(),
            name: data.name || `Scholarship ${index + 1}`,
            description: data.description || 'No description available',
            amount: data.totalAmount?.toString() || '0',
            tokenAddress: data.tokenAddress === ethers.ZeroAddress ? undefined : data.tokenAddress,
            tokenSymbol: data.tokenSymbol || 'ETH',
            totalFunds: data.totalAmount?.toString() || '0',
            claimedFunds: data.claimedAmount?.toString() || '0',
            maxRecipients: typeof data.maxRecipients === 'bigint' ? Number(data.maxRecipients) : (data.maxRecipients || 0),
            currentRecipients: typeof data.currentRecipients === 'bigint' ? Number(data.currentRecipients) : 0,
            deadline: typeof data.deadline === 'bigint' ? Number(data.deadline) : (data.deadline || 0),
            isActive: data.isActive || false,
            creator: data.createdBy || '',
            eligibilityCriteria: {
              minGPA: 0,
              requiredCertificates: [],
              minEnrollmentDate: 0,
              maxEnrollmentDate: 0,
              courseCompletionRequired: false,
              customCriteria: ''
            },
            createdAt: typeof data.createdAt === 'bigint' ? Number(data.createdAt) : (data.createdAt || 0)
          };
        } catch (error) {
          console.error(`Error fetching scholarship ${index}:`, error);
          return null;
        }
      });

      const scholarshipResults = await Promise.allSettled(scholarshipPromises);
      const validScholarships = scholarshipResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value as Scholarship);

      console.log(`Successfully loaded ${validScholarships.length} scholarships`);
      setScholarships(validScholarships);
      
    } catch (err: any) {
      console.error('Error fetching scholarships:', err);
      const errorMessage = err?.message || 'Failed to fetch scholarships';
      
      // Handle specific MetaMask errors
      if (errorMessage.includes('circuit breaker')) {
        setError('Network connection temporarily unavailable. Please try again later.');
      } else if (errorMessage.includes('missing revert data')) {
        setError('Contract method not found. Please check contract deployment.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, provider]);

  // Check student eligibility for all scholarships
  const checkEligibility = useCallback(async () => {
    if (!account || !scholarshipContract || !certificateContract) return;

    try {
      const eligibilityPromises = scholarships.map(async (scholarship) => {
        const isEligible = await scholarshipContract.isEligibleForScholarship(scholarship.id, account);
        const hasClaimed = false; // Will implement claim checking later
        
        // Get student's certificates
        const ownedCertificates = [];
        
        // Get student certificates
        const studentCerts = await certificateContract.getStudentCertificates(account);
        for (const tokenId of studentCerts) {
          try {
            const certificate = await certificateContract.getCertificateData(tokenId);
            ownedCertificates.push(certificate.courseName);
          } catch (err) {
            console.warn(`Could not fetch certificate ${tokenId}:`, err);
          }
        }

        // Mock student info since registry contract is not available
        const studentInfo = {
          gpa: 350, // 3.5 GPA in basis points
          department: 'Computer Science',
          enrollmentDate: Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60) // 1 year ago
        };
        
        const eligibilityReasons = [];
        const missingRequirements = [];

        // Check GPA
        if (scholarship.eligibilityCriteria.minGPA && studentInfo.gpa < scholarship.eligibilityCriteria.minGPA * 100) {
          missingRequirements.push(`Minimum GPA of ${scholarship.eligibilityCriteria.minGPA} required`);
        } else if (scholarship.eligibilityCriteria.minGPA) {
          eligibilityReasons.push(`GPA requirement met (${studentInfo.gpa / 100})`);
        }

        // Check certificates
        const requiredCerts = scholarship.eligibilityCriteria.requiredCertificates || [];
        const hasRequiredCerts = requiredCerts.every(cert => ownedCertificates.includes(cert));
        
        if (requiredCerts.length > 0 && !hasRequiredCerts) {
          const missing = requiredCerts.filter(cert => !ownedCertificates.includes(cert));
          missingRequirements.push(`Missing certificates: ${missing.join(', ')}`);
        } else if (requiredCerts.length > 0) {
          eligibilityReasons.push('Certificate requirements met');
        }

        // Check department
        if (scholarship.eligibilityCriteria?.departments?.length > 0 && 
            !scholarship.eligibilityCriteria.departments.includes(studentInfo.department)) {
          missingRequirements.push(`Must be in department: ${scholarship.eligibilityCriteria.departments.join(' or ')}`);
        } else if (scholarship.eligibilityCriteria?.departments?.length > 0) {
          eligibilityReasons.push('Department requirement met');
        }

        return {
          scholarshipId: scholarship.id,
          isEligible,
          hasClaimed,
          eligibilityReasons,
          missingRequirements,
          gpaScore: studentInfo.gpa / 100,
          ownedCertificates,
          department: studentInfo.department,
          enrollmentDate: studentInfo.enrollmentDate
        };
      });

      const eligibilityResults = await Promise.all(eligibilityPromises);
      setUserEligibility(eligibilityResults);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError('Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  }, [account, scholarships, scholarshipContract, certificateContract]);

  // Create new scholarship
  const createScholarship = useCallback(async (formData: CreateScholarshipForm) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.scholarshipEscrow) throw new Error('Contract not available');

    // Check if user has scholarship manager role, if not try to grant it
    if (!isScholarshipManager && account) {
      try {
        console.log('User does not have SCHOLARSHIP_MANAGER_ROLE, attempting to grant...');
        await grantScholarshipManagerRole(account);
        // Wait a moment for the role to be granted
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error('Failed to grant SCHOLARSHIP_MANAGER_ROLE:', err);
        throw new Error('You need SCHOLARSHIP_MANAGER_ROLE to create scholarships. Please contact an administrator.');
      }
    }

    try {
      setLoading(true);
      
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
      const minEnrollmentDate = formData.minEnrollmentDate ? 
        Math.floor(new Date(formData.minEnrollmentDate).getTime() / 1000) : 0;
      const maxEnrollmentDate = formData.maxEnrollmentDate ? 
        Math.floor(new Date(formData.maxEnrollmentDate).getTime() / 1000) : 0;

      // Create eligibility criteria matching contract ABI
      const criteria = {
        minGPA: ethers.parseUnits(formData.minGPA.toString(), 18), // Convert to wei for contract
        requiredCourses: formData.requiredCertificates || [], // Map requiredCertificates to requiredCourses
        allowedDepartments: formData.departments || [],
        minCertificates: formData.requiredCertificates?.length || 0,
        enrollmentAfter: minEnrollmentDate,
        enrollmentBefore: maxEnrollmentDate,
        requiresAllCourses: formData.courseCompletionRequired || false
      };
      
      const tx = await signedContracts.scholarshipEscrow.createScholarship(
        formData.name,
        formData.description,
        ethers.parseEther(formData.amount),
        formData.maxRecipients,
        deadline,
        formData.tokenAddress || ethers.ZeroAddress,
        formData.tokenSymbol || 'ETH',
        criteria,
        {
          value: formData.tokenAddress ? 0 : ethers.parseEther(formData.amount)
        }
      );

      await tx.wait();
      await fetchScholarships();
      return tx.hash;
    } catch (err) {
      console.error('Error creating scholarship:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSignedContracts, fetchScholarships, isScholarshipManager, grantScholarshipManagerRole, account]);

  // Claim scholarship
  const claimScholarship = useCallback(async (scholarshipId: string) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.scholarshipEscrow) throw new Error('Contract not available');

    try {
      setLoading(true);
      const tx = await signedContracts.scholarshipEscrow.claimScholarship(scholarshipId);
      await tx.wait();
      
      // Refresh data
      await fetchScholarships();
      await checkEligibility();
      
      return tx.hash;
    } catch (err) {
      console.error('Error claiming scholarship:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSignedContracts, fetchScholarships, checkEligibility]);

  // Deposit additional funds to scholarship
  const depositFunds = useCallback(async (amount: string) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.scholarshipEscrow) throw new Error('Contract not available');

    try {
      setLoading(true);
      const tx = await signedContracts.scholarshipEscrow.depositFunds({
        value: ethers.parseEther(amount)
      });
      
      await tx.wait();
      await fetchScholarships();
      return tx.hash;
    } catch (err) {
      console.error('Error depositing funds:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSignedContracts, fetchScholarships]);

  // Get scholarship statistics
  const getScholarshipStats = useCallback(async (): Promise<ScholarshipStats> => {
    if (!scholarshipContract) throw new Error('Contract not available');

    try {
      const totalScholarships = scholarships.length;
      const activeScholarships = scholarships.filter(s => s.isActive && s.deadline > Date.now() / 1000).length;
      
      const totalFundsDeposited = scholarships.reduce((sum, s) => sum + BigInt(s.totalFunds), BigInt(0));
      const totalFundsClaimed = scholarships.reduce((sum, s) => sum + BigInt(s.claimedFunds), BigInt(0));
      const totalRecipients = scholarships.reduce((sum, s) => {
        const recipients = typeof s.currentRecipients === 'bigint' ? Number(s.currentRecipients) : s.currentRecipients;
        return sum + recipients;
      }, 0);
      
      const averageAmount = totalScholarships > 0 ? 
        (totalFundsDeposited / BigInt(totalScholarships)).toString() : '0';

      // Calculate top departments
      const departmentCounts: { [key: string]: number } = {};
      scholarships.forEach(s => {
        if (s.eligibilityCriteria?.departments?.length > 0) {
          s.eligibilityCriteria.departments.forEach(dept => {
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
          });
        }
      });

      const topDepartments = Object.entries(departmentCounts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalScholarships,
        activeScholarships,
        totalFundsDeposited: totalFundsDeposited.toString(),
        totalFundsClaimed: totalFundsClaimed.toString(),
        totalRecipients,
        averageAmount,
        topDepartments
      };
    } catch (err) {
      console.error('Error getting scholarship stats:', err);
      throw err;
    }
  }, [scholarshipContract, scholarships]);

  // Filter scholarships
  const filterScholarships = useCallback((filter: ScholarshipFilter) => {
    let filtered = [...scholarships];

    if (filter.department) {
      filtered = filtered.filter(s => 
        s.eligibilityCriteria?.departments?.includes(filter.department!) || false
      );
    }

    if (filter.minAmount) {
      filtered = filtered.filter(s => 
        BigInt(s.amount) >= BigInt(ethers.parseEther(filter.minAmount!))
      );
    }

    if (filter.maxAmount) {
      filtered = filtered.filter(s => 
        BigInt(s.amount) <= BigInt(ethers.parseEther(filter.maxAmount!))
      );
    }

    if (filter.tokenType) {
      filtered = filtered.filter(s => s.tokenSymbol === filter.tokenType);
    }

    if (filter.eligibilityStatus && filter.eligibilityStatus !== 'all') {
      const eligibilityMap = new Map(userEligibility.map(e => [e.scholarshipId, e]));
      
      filtered = filtered.filter(s => {
        const eligibility = eligibilityMap.get(s.id);
        if (!eligibility) return false;

        switch (filter.eligibilityStatus) {
          case 'eligible':
            return eligibility.isEligible && !eligibility.hasClaimed;
          case 'not-eligible':
            return !eligibility.isEligible;
          case 'claimed':
            return eligibility.hasClaimed;
          default:
            return true;
        }
      });
    }

    // Sort
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filter.sortBy) {
          case 'amount':
            aValue = BigInt(a.amount);
            bValue = BigInt(b.amount);
            break;
          case 'deadline':
            aValue = a.deadline;
            bValue = b.deadline;
            break;
          case 'created':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          default:
            return 0;
        }

        if (filter.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [scholarships, userEligibility]);

  // Setup event listeners
  useEffect(() => {
    if (!scholarshipContract) return;

    const handleScholarshipCreated = (scholarshipId: string, creator: string) => {
      console.log('Scholarship created:', scholarshipId);
      fetchScholarships();
    };

    const handleScholarshipClaimed = (scholarshipId: string, student: string, amount: string) => {
      console.log('Scholarship claimed:', scholarshipId, student, amount);
      fetchScholarships();
      checkEligibility();
    };

    scholarshipContract.on('ScholarshipCreated', handleScholarshipCreated);
    scholarshipContract.on('ScholarshipClaimed', handleScholarshipClaimed);

    return () => {
      scholarshipContract.off('ScholarshipCreated', handleScholarshipCreated);
      scholarshipContract.off('ScholarshipClaimed', handleScholarshipClaimed);
    };
  }, [scholarshipContract, fetchScholarships, checkEligibility]);

  // Initial data fetch
  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  useEffect(() => {
    if (scholarships.length > 0 && account) {
      checkEligibility();
    }
  }, [scholarships, account, checkEligibility]);

  return {
    scholarships,
    userEligibility,
    claims,
    loading,
    error,
    createScholarship,
    claimScholarship,
    depositFunds,
    getScholarshipStats,
    filterScholarships,
    fetchScholarships,
    checkEligibility
  };
};
