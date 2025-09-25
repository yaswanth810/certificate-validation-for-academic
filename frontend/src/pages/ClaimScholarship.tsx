import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { ethers } from 'ethers';
import { useScholarship } from '../hooks/useScholarship';
import { useWeb3 } from '../contexts/Web3Context';

interface ClaimStatus {
  scholarshipId: string;
  status: 'idle' | 'claiming' | 'success' | 'error';
  txHash?: string;
  error?: string;
}

const ClaimScholarship: React.FC = () => {
  const { isConnected } = useWeb3();
  const { 
    scholarships, 
    userEligibility, 
    loading, 
    error, 
    claimScholarship,
    fetchScholarships,
    checkEligibility
  } = useScholarship();

  const [claimStatuses, setClaimStatuses] = useState<Map<string, ClaimStatus>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  // Filter eligible scholarships
  const eligibleScholarships = scholarships.filter(scholarship => {
    const eligibility = userEligibility.find(e => e.scholarshipId === scholarship.id);
    return eligibility?.isEligible && !eligibility.hasClaimed && 
           scholarship.isActive && 
           scholarship.deadline > Math.floor(Date.now() / 1000) &&
           scholarship.currentRecipients < scholarship.maxRecipients;
  });

  const handleClaim = async (scholarshipId: string) => {
    try {
      setClaimStatuses(prev => new Map(prev.set(scholarshipId, {
        scholarshipId,
        status: 'claiming'
      })));

      const txHash = await claimScholarship(scholarshipId);
      
      setClaimStatuses(prev => new Map(prev.set(scholarshipId, {
        scholarshipId,
        status: 'success',
        txHash
      })));

      // Auto-refresh after successful claim
      setTimeout(() => {
        handleRefresh();
      }, 2000);

    } catch (error: any) {
      console.error('Error claiming scholarship:', error);
      setClaimStatuses(prev => new Map(prev.set(scholarshipId, {
        scholarshipId,
        status: 'error',
        error: error.message || 'Failed to claim scholarship'
      })));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchScholarships();
      await checkEligibility();
    } finally {
      setRefreshing(false);
    }
  };

  const getClaimStatus = (scholarshipId: string): ClaimStatus => {
    return claimStatuses.get(scholarshipId) || {
      scholarshipId,
      status: 'idle'
    };
  };

  const formatTimeLeft = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view and claim scholarships
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Claim Scholarships
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Scholarships you're eligible to claim
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading scholarships...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Eligible Scholarships */}
        {!loading && !error && (
          <>
            {eligibleScholarships.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No eligible scholarships
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any scholarships available to claim at the moment.
                  Check back later or improve your qualifications.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Available to Claim ({eligibleScholarships.length})
                  </h2>
                </div>

                {eligibleScholarships.map((scholarship) => {
                  const eligibility = userEligibility.find(e => e.scholarshipId === scholarship.id);
                  const claimStatus = getClaimStatus(scholarship.id);
                  
                  return (
                    <div
                      key={scholarship.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {scholarship.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {scholarship.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>Eligible</span>
                          </div>
                        </div>

                        {/* Amount and Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {parseFloat(ethers.formatEther(scholarship.amount)).toFixed(4)} {scholarship.tokenSymbol}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Deadline</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatTimeLeft(scholarship.deadline)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Award className="w-5 h-5 text-purple-500" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Recipients</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {scholarship.currentRecipients} / {scholarship.maxRecipients}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Eligibility Details */}
                        {eligibility && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                              Why you're eligible:
                            </h4>
                            <ul className="space-y-1">
                              {eligibility.eligibilityReasons.map((reason, index) => (
                                <li key={index} className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Claim Button and Status */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          {claimStatus.status === 'idle' && (
                            <button
                              onClick={() => handleClaim(scholarship.id)}
                              className="w-full btn-primary flex items-center justify-center space-x-2"
                            >
                              <DollarSign className="w-5 h-5" />
                              <span>Claim Scholarship</span>
                            </button>
                          )}

                          {claimStatus.status === 'claiming' && (
                            <div className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing claim...</span>
                            </div>
                          )}

                          {claimStatus.status === 'success' && (
                            <div className="space-y-3">
                              <div className="w-full flex items-center justify-center space-x-2 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span>Successfully claimed!</span>
                              </div>
                              {claimStatus.txHash && (
                                <div className="flex items-center justify-center">
                                  <a
                                    href={`https://sepolia.etherscan.io/tx/${claimStatus.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    <span>View transaction</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {claimStatus.status === 'error' && (
                            <div className="space-y-3">
                              <div className="w-full flex items-center justify-center space-x-2 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                                <XCircle className="w-5 h-5" />
                                <span>Claim failed</span>
                              </div>
                              {claimStatus.error && (
                                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                                  {claimStatus.error}
                                </p>
                              )}
                              <button
                                onClick={() => handleClaim(scholarship.id)}
                                className="w-full btn-outline text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Important Information
              </h3>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>• Make sure you have enough ETH for gas fees before claiming</li>
                <li>• Scholarships are distributed on a first-come, first-served basis</li>
                <li>• You can only claim each scholarship once</li>
                <li>• Funds will be transferred directly to your wallet upon successful claim</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimScholarship;
