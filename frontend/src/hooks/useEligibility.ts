import { useState, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  certificateCount: number;
  hasRequiredCourses: boolean;
  hasValidDepartment: boolean;
  hasValidEnrollment: boolean;
  alreadyClaimed: boolean;
}

export const useEligibility = () => {
  const { account } = useWeb3();
  const { scholarshipContract } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check eligibility for a specific scholarship
  const checkEligibility = useCallback(async (scholarshipId: number): Promise<EligibilityResult> => {
    if (!scholarshipContract || !account) {
      return {
        isEligible: false,
        reasons: ['Wallet not connected'],
        certificateCount: 0,
        hasRequiredCourses: false,
        hasValidDepartment: false,
        hasValidEnrollment: false,
        alreadyClaimed: false,
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Check if already claimed
      const alreadyClaimed = await scholarshipContract.scholarshipClaims(scholarshipId, account);
      
      // Check overall eligibility
      const isEligible = await scholarshipContract.isEligibleForScholarship(scholarshipId, account);
      
      // Get detailed eligibility information
      const reasons: string[] = [];
      let certificateCount = 0;
      let hasRequiredCourses = true;
      let hasValidDepartment = true;
      let hasValidEnrollment = true;

      try {
        // Get student certificates count
        const studentCerts = await scholarshipContract.certificateNFT().then((nft: any) => 
          nft.getStudentCertificates(account)
        );
        certificateCount = studentCerts.length;

        // Get scholarship criteria
        const criteria = await scholarshipContract.scholarshipCriteria(scholarshipId);
        
        // Check minimum certificates
        if (certificateCount < criteria.minCertificates) {
          reasons.push(`Need at least ${criteria.minCertificates} certificates (you have ${certificateCount})`);
        }

        // Check course requirements
        if (criteria.requiredCourses.length > 0) {
          hasRequiredCourses = await scholarshipContract.checkCourseRequirements(
            account, 
            criteria.requiredCourses, 
            criteria.requiresAllCourses
          );
          if (!hasRequiredCourses) {
            const courseType = criteria.requiresAllCourses ? 'all' : 'any';
            reasons.push(`Must have ${courseType} of these courses: ${criteria.requiredCourses.join(', ')}`);
          }
        }

        // Check department requirements
        if (criteria.allowedDepartments.length > 0) {
          hasValidDepartment = await scholarshipContract.checkDepartmentRequirement(
            account, 
            criteria.allowedDepartments
          );
          if (!hasValidDepartment) {
            reasons.push(`Must be from one of these departments: ${criteria.allowedDepartments.join(', ')}`);
          }
        }

        // Check enrollment requirements
        if (criteria.enrollmentAfter > 0 || criteria.enrollmentBefore > 0) {
          hasValidEnrollment = await scholarshipContract.checkEnrollmentRequirement(
            account, 
            criteria.enrollmentAfter, 
            criteria.enrollmentBefore
          );
          if (!hasValidEnrollment) {
            const afterDate = criteria.enrollmentAfter > 0 ? new Date(criteria.enrollmentAfter * 1000).toLocaleDateString() : null;
            const beforeDate = criteria.enrollmentBefore > 0 ? new Date(criteria.enrollmentBefore * 1000).toLocaleDateString() : null;
            
            if (afterDate && beforeDate) {
              reasons.push(`Must be enrolled between ${afterDate} and ${beforeDate}`);
            } else if (afterDate) {
              reasons.push(`Must be enrolled after ${afterDate}`);
            } else if (beforeDate) {
              reasons.push(`Must be enrolled before ${beforeDate}`);
            }
          }
        }

        // Check if already claimed
        if (alreadyClaimed) {
          reasons.push('You have already claimed this scholarship');
        }

        // Check scholarship status
        const scholarship = await scholarshipContract.getScholarship(scholarshipId);
        if (!scholarship.isActive) {
          reasons.push('Scholarship is no longer active');
        }

        const now = Math.floor(Date.now() / 1000);
        if (scholarship.deadline <= now) {
          reasons.push('Scholarship deadline has passed');
        }

        if (scholarship.remainingAmount <= 0) {
          reasons.push('No funds remaining in scholarship');
        }

      } catch (detailError) {
        console.error('Error getting eligibility details:', detailError);
        reasons.push('Unable to verify all eligibility criteria');
      }

      return {
        isEligible: isEligible && !alreadyClaimed,
        reasons,
        certificateCount,
        hasRequiredCourses,
        hasValidDepartment,
        hasValidEnrollment,
        alreadyClaimed,
      };

    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to check eligibility');
      
      return {
        isEligible: false,
        reasons: ['Error checking eligibility'],
        certificateCount: 0,
        hasRequiredCourses: false,
        hasValidDepartment: false,
        hasValidEnrollment: false,
        alreadyClaimed: false,
      };
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, account]);

  // Check eligibility for multiple scholarships
  const checkMultipleEligibility = useCallback(async (scholarshipIds: number[]) => {
    const results = await Promise.all(
      scholarshipIds.map(id => checkEligibility(id))
    );
    
    return scholarshipIds.reduce((acc, id, index) => {
      acc[id] = results[index];
      return acc;
    }, {} as Record<number, EligibilityResult>);
  }, [checkEligibility]);

  // Get eligible scholarships for current user
  const getEligibleScholarships = useCallback(async (allScholarshipIds: number[]) => {
    if (!account || allScholarshipIds.length === 0) return [];

    try {
      const eligibilityResults = await checkMultipleEligibility(allScholarshipIds);
      
      return allScholarshipIds.filter(id => 
        eligibilityResults[id]?.isEligible === true
      );
    } catch (err) {
      console.error('Error getting eligible scholarships:', err);
      return [];
    }
  }, [account, checkMultipleEligibility]);

  // Quick eligibility check (just true/false)
  const isEligibleForScholarship = useCallback(async (scholarshipId: number): Promise<boolean> => {
    if (!scholarshipContract || !account) return false;

    try {
      const isEligible = await scholarshipContract.isEligibleForScholarship(scholarshipId, account);
      const alreadyClaimed = await scholarshipContract.scholarshipClaims(scholarshipId, account);
      return isEligible && !alreadyClaimed;
    } catch (err) {
      console.error('Error checking quick eligibility:', err);
      return false;
    }
  }, [scholarshipContract, account]);

  return {
    checkEligibility,
    checkMultipleEligibility,
    getEligibleScholarships,
    isEligibleForScholarship,
    loading,
    error,
  };
};
