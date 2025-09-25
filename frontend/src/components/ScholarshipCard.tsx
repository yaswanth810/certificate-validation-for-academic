import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  GraduationCap, 
  Building,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ethers } from 'ethers';
import { Scholarship, StudentEligibility } from '../types/scholarship';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  eligibility?: StudentEligibility;
  onClaim?: (scholarshipId: string) => Promise<void>;
  isAdmin?: boolean;
  className?: string;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  eligibility,
  onClaim,
  isAdmin = false,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [claiming, setClaiming] = useState(false);
  const [usdValue, setUsdValue] = useState<number | null>(null);

  // Calculate time left until deadline
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = scholarship.deadline;
      
      if (deadline <= now) {
        setTimeLeft('Expired');
        return;
      }

      const diff = deadline - now;
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [scholarship.deadline]);

  // Mock USD conversion (in production, use a price API)
  useEffect(() => {
    const fetchUSDValue = async () => {
      try {
        // Mock ETH price - in production, use CoinGecko or similar API
        const ethPrice = 2500; // USD per ETH
        const amountInEth = parseFloat(ethers.formatEther(scholarship.amount));
        setUsdValue(amountInEth * ethPrice);
      } catch (error) {
        console.error('Error fetching USD value:', error);
      }
    };

    if (scholarship.tokenSymbol === 'ETH') {
      fetchUSDValue();
    }
  }, [scholarship.amount, scholarship.tokenSymbol]);

  const handleClaim = async () => {
    if (!onClaim || !eligibility?.isEligible || eligibility.hasClaimed) return;

    try {
      setClaiming(true);
      await onClaim(scholarship.id);
    } catch (error) {
      console.error('Error claiming scholarship:', error);
    } finally {
      setClaiming(false);
    }
  };

  const getEligibilityStatus = () => {
    if (!eligibility) return null;

    if (eligibility.hasClaimed) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: 'Claimed',
        color: 'text-green-600 bg-green-50 border-green-200'
      };
    }

    if (eligibility.isEligible) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: 'Eligible',
        color: 'text-green-600 bg-green-50 border-green-200'
      };
    }

    return {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      text: 'Not Eligible',
      color: 'text-red-600 bg-red-50 border-red-200'
    };
  };

  const getProgressPercentage = () => {
    if (scholarship.maxRecipients === 0) return 0;
    // Convert BigInt values to numbers for calculation
    const current = typeof scholarship.currentRecipients === 'bigint' 
      ? Number(scholarship.currentRecipients) 
      : scholarship.currentRecipients;
    const max = typeof scholarship.maxRecipients === 'bigint' 
      ? Number(scholarship.maxRecipients) 
      : scholarship.maxRecipients;
    return (current / max) * 100;
  };

  const isExpired = scholarship.deadline <= Math.floor(Date.now() / 1000);
  const isFull = (typeof scholarship.currentRecipients === 'bigint' 
    ? Number(scholarship.currentRecipients) 
    : scholarship.currentRecipients) >= (typeof scholarship.maxRecipients === 'bigint' 
    ? Number(scholarship.maxRecipients) 
    : scholarship.maxRecipients);
  const eligibilityStatus = getEligibilityStatus();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {scholarship.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {scholarship.description}
            </p>
          </div>
          
          {eligibilityStatus && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${eligibilityStatus.color}`}>
              {eligibilityStatus.icon}
              <span>{eligibilityStatus.text}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-6 h-6 text-green-500" />
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {parseFloat(ethers.formatEther(scholarship.amount)).toFixed(4)} {scholarship.tokenSymbol}
            </span>
            {usdValue && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                (~${usdValue.toFixed(2)})
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Recipients</span>
            <span>{scholarship.currentRecipients} / {scholarship.maxRecipients}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        {/* Deadline */}
        <div className="flex items-center space-x-3">
          <Clock className={`w-5 h-5 ${isExpired ? 'text-red-500' : 'text-blue-500'}`} />
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Deadline: </span>
            <span className={`font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {timeLeft === 'Expired' ? 'Expired' : timeLeft + ' left'}
            </span>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Eligibility Criteria
          </h4>
          
          <div className="space-y-1 text-sm">
            {scholarship.eligibilityCriteria?.minGPA && scholarship.eligibilityCriteria.minGPA > 0 && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Minimum GPA: {scholarship.eligibilityCriteria.minGPA}
                </span>
              </div>
            )}
            
            {scholarship.eligibilityCriteria?.departments?.length > 0 && (
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Departments: {scholarship.eligibilityCriteria.departments.join(', ')}
                </span>
              </div>
            )}
            
            {scholarship.eligibilityCriteria?.requiredCertificates?.length > 0 && (
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Required Certificates: {scholarship.eligibilityCriteria.requiredCertificates.join(', ')}
                </span>
              </div>
            )}
            
            {(!scholarship.eligibilityCriteria?.minGPA || scholarship.eligibilityCriteria.minGPA === 0) &&
             (!scholarship.eligibilityCriteria?.departments?.length) &&
             (!scholarship.eligibilityCriteria?.requiredCertificates?.length) && (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Open to all students
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Details for Students */}
        {eligibility && !isAdmin && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Your Status</h5>
            
            {eligibility.eligibilityReasons.length > 0 && (
              <div className="space-y-1 mb-2">
                {eligibility.eligibilityReasons.map((reason: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}
            
            {eligibility.missingRequirements.length > 0 && (
              <div className="space-y-1">
                {eligibility.missingRequirements.map((requirement: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!isAdmin && eligibility && (
          <div className="pt-4">
            {eligibility.hasClaimed ? (
              <div className="flex items-center justify-center space-x-2 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Successfully Claimed</span>
              </div>
            ) : eligibility.isEligible && !isExpired && !isFull ? (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Claiming...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Claim Scholarship</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-2 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  {isExpired ? 'Expired' : isFull ? 'Fully Claimed' : 'Not Eligible'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Admin Info */}
        {isAdmin && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Funds:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(ethers.formatEther(scholarship.totalFunds)).toFixed(4)} {scholarship.tokenSymbol}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Claimed:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(ethers.formatEther(scholarship.claimedFunds)).toFixed(4)} {scholarship.tokenSymbol}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipCard;
