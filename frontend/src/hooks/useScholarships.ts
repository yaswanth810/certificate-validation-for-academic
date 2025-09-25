import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';

export interface Scholarship {
  id: number;
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
  releaseTime: number;
  eligibleStudents: string[];
}

export interface EligibilityCriteria {
  minGPA: number;
  requiredCourses: string[];
  allowedDepartments: string[];
  minCertificates: number;
  enrollmentAfter: number;
  enrollmentBefore: number;
  requiresAllCourses: boolean;
}

export const useScholarships = () => {
  const { account } = useWeb3();
  const { contracts } = useContract();
  const scholarshipContract = contracts.scholarshipEscrow;
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all scholarships with error handling and timeout
  const fetchScholarships = useCallback(async () => {
    if (!scholarshipContract) {
      console.log('Scholarship contract not available');
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
      ]);
      
      console.log(`Found ${events.length} scholarship events`);

      if (events.length === 0) {
        setScholarships([]);
        return;
      }

      const scholarshipPromises = events.map(async (event: any, index: number) => {
        try {
          const scholarshipId = event.args?.scholarshipId;
          if (!scholarshipId) return null;

          const scholarship = await Promise.race([
            scholarshipContract.getScholarship(scholarshipId),
            timeoutPromise
          ]);

          return {
            id: scholarshipId.toNumber(),
            name: scholarship.name || `Scholarship ${index + 1}`,
            description: scholarship.description || 'No description available',
            totalAmount: scholarship.totalAmount.toString(),
            claimedAmount: scholarship.claimedAmount.toString(), 
            remainingAmount: scholarship.remainingAmount.toString(),
            maxRecipients: scholarship.maxRecipients.toNumber(),
            amountPerRecipient: scholarship.amountPerRecipient.toString(),
            createdAt: scholarship.createdAt.toNumber(),
            deadline: scholarship.deadline.toNumber(),
            isActive: scholarship.isActive,
            createdBy: scholarship.createdBy,
            tokenAddress: scholarship.tokenAddress,
            tokenSymbol: scholarship.tokenSymbol || 'ETH',
            // Add missing fields that UI expects
            releaseTime: scholarship.deadline.toNumber(), // Use deadline as release time
            eligibleStudents: [], // Will be populated separately if needed
            // Add default eligibility criteria to prevent undefined errors
            eligibilityCriteria: {
              minGPA: 0,
              requiredCertificates: [],
              departments: [],
              minEnrollmentDate: 0,
              maxEnrollmentDate: 0,
              courseCompletionRequired: false,
              customCriteria: ''
            }
          };
        } catch (err) {
          console.error(`Error fetching scholarship ${index}:`, err);
          return null;
        }
      });

      const results = await Promise.allSettled(scholarshipPromises);
      const validScholarships = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
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
  }, [scholarshipContract]);

  // Get scholarships for a specific student
  const getStudentScholarships = useCallback(async (studentAddress?: string) => {
    if (!scholarshipContract || !studentAddress) return [];

    try {
      const scholarshipIds = await scholarshipContract.getStudentScholarships(studentAddress);
      
      const scholarshipPromises = scholarshipIds.map(async (id: ethers.BigNumberish) => {
        try {
          const scholarship = await scholarshipContract.getScholarship(id);
          return {
            id: Number(id),
            name: scholarship.name,
            description: scholarship.description,
            totalAmount: ethers.formatEther(scholarship.totalAmount),
            claimedAmount: ethers.formatEther(scholarship.claimedAmount),
            remainingAmount: ethers.formatEther(scholarship.remainingAmount),
            maxRecipients: scholarship.maxRecipients.toNumber(),
            amountPerRecipient: ethers.formatEther(scholarship.amountPerRecipient),
            createdAt: scholarship.createdAt.toNumber(),
            deadline: scholarship.deadline.toNumber(),
            isActive: scholarship.isActive,
            createdBy: scholarship.createdBy,
            tokenAddress: scholarship.tokenAddress,
            tokenSymbol: scholarship.tokenSymbol,
          };
        } catch (err) {
          console.error(`Error fetching student scholarship ${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(scholarshipPromises);
      return results.filter((s: any): s is Scholarship => s !== null);
    } catch (err) {
      console.error('Error fetching student scholarships:', err);
      return [];
    }
  }, [scholarshipContract]);

  // Get active scholarships (not expired, still accepting claims)
  const getActiveScholarships = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return scholarships.filter(s => 
      s.isActive && 
      s.deadline > now && 
      parseFloat(s.remainingAmount) > 0
    );
  }, [scholarships]);

  // Get scholarship by ID
  const getScholarshipById = useCallback(async (scholarshipId: number) => {
    if (!scholarshipContract) return null;

    try {
      const scholarship = await scholarshipContract.getScholarship(scholarshipId);
      return {
        id: scholarshipId,
        name: scholarship.name,
        description: scholarship.description,
        totalAmount: ethers.formatEther(scholarship.totalAmount),
        claimedAmount: ethers.formatEther(scholarship.claimedAmount),
        remainingAmount: ethers.formatEther(scholarship.remainingAmount),
        maxRecipients: scholarship.maxRecipients.toNumber(),
        amountPerRecipient: ethers.formatEther(scholarship.amountPerRecipient),
        createdAt: scholarship.createdAt.toNumber(),
        deadline: scholarship.deadline.toNumber(),
        isActive: scholarship.isActive,
        createdBy: scholarship.createdBy,
        tokenAddress: scholarship.tokenAddress,
        tokenSymbol: scholarship.tokenSymbol,
      };
    } catch (err) {
      console.error(`Error fetching scholarship ${scholarshipId}:`, err);
      return null;
    }
  }, [scholarshipContract]);

  // Get total claimed amount for current user
  const getTotalClaimed = useCallback(async () => {
    if (!scholarshipContract || !account) return '0';

    try {
      const totalClaimed = await scholarshipContract.getTotalClaimed(account);
      return ethers.formatEther(totalClaimed);
    } catch (err) {
      console.error('Error fetching total claimed:', err);
      return '0';
    }
  }, [scholarshipContract, account]);

  // Setup event listeners for real-time updates
  useEffect(() => {
    if (!scholarshipContract) return;

    const handleScholarshipCreated = (scholarshipId: ethers.BigNumberish) => {
      console.log('New scholarship created:', scholarshipId.toString());
      fetchScholarships(); // Refresh the list
    };

    const handleScholarshipClaimed = (scholarshipId: ethers.BigNumberish, student: string, amount: ethers.BigNumberish) => {
      console.log('Scholarship claimed:', {
        scholarshipId: scholarshipId.toString(),
        student,
        amount: ethers.formatEther(amount)
      });
      fetchScholarships(); // Refresh the list
    };

    // Listen for events
    scholarshipContract.on('ScholarshipCreated', handleScholarshipCreated);
    scholarshipContract.on('ScholarshipClaimed', handleScholarshipClaimed);

    return () => {
      scholarshipContract.off('ScholarshipCreated', handleScholarshipCreated);
      scholarshipContract.off('ScholarshipClaimed', handleScholarshipClaimed);
    };
  }, [scholarshipContract, fetchScholarships]);

  // Initial fetch
  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  return {
    scholarships,
    loading,
    error,
    fetchScholarships,
    getStudentScholarships,
    getActiveScholarships,
    getScholarshipById,
    getTotalClaimed,
    refetch: fetchScholarships,
  };
};
