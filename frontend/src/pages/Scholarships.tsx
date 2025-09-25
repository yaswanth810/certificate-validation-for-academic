import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useScholarships } from '../hooks/useScholarships';
import { useContract } from '../hooks/useContract';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Users,
  Calendar,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import Logo from '../components/Logo';

const Scholarships: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { scholarships, loading, error } = useScholarships();
  const { getSignedContracts } = useContract();
  const [claimingScholarship, setClaimingScholarship] = useState<number | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const formatEther = (wei: string) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClaimScholarship = async (scholarshipId: number) => {
    if (!isConnected || !account) {
      setClaimError('Please connect your wallet first');
      return;
    }

    setClaimingScholarship(scholarshipId);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const contracts = getSignedContracts();
      if (!contracts?.scholarshipEscrow) {
        throw new Error('Contract not available');
      }

      const tx = await contracts.scholarshipEscrow.claimScholarship(scholarshipId);
      await tx.wait();

      setClaimSuccess('Scholarship claimed successfully!');
      
      // Refresh scholarships data
      window.location.reload();
    } catch (err: any) {
      console.error('Error claiming scholarship:', err);
      setClaimError(err.message || 'Failed to claim scholarship');
    } finally {
      setClaimingScholarship(null);
    }
  };

  const canClaimScholarship = (scholarship: any) => {
    const now = Math.floor(Date.now() / 1000);
    return scholarship.isActive && 
           scholarship.releaseTime <= now &&
           parseFloat(scholarship.remainingAmount) > 0;
  };

  const getTimeUntilRelease = (releaseTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = releaseTime - now;
    
    if (timeLeft <= 0) return 'Available now';
    
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <Logo size="xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Wallet Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to view and manage scholarships.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Scholarships
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your scholarship opportunities and claims
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Scholarships</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : scholarships.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Available to Claim</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : scholarships.filter(canClaimScholarship).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : `${scholarships.reduce((sum, s) => sum + parseFloat(formatEther(s.totalAmount)), 0).toFixed(2)} ETH`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {claimError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{claimError}</span>
          </div>
        </div>
      )}

      {claimSuccess && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200">{claimSuccess}</span>
          </div>
        </div>
      )}

      {/* Scholarships List */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          My Scholarships
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading scholarships...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No scholarships found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You don't have any scholarships at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {scholarships.map((scholarship) => {
              const canClaim = canClaimScholarship(scholarship);
              const timeUntilRelease = getTimeUntilRelease(scholarship.releaseTime);
              const isClaiming = claimingScholarship === scholarship.id;

              return (
                <div key={scholarship.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Scholarship #{scholarship.id}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(scholarship.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{scholarship.eligibleStudents.length} eligible</span>
                        </div>
                      </div>
                    </div>
                    <span className={`status-badge ${
                      canClaim ? 'status-valid' : 
                      scholarship.isActive ? 'status-pending' : 'status-invalid'
                    }`}>
                      {canClaim ? 'Available' : 
                       scholarship.isActive ? 'Pending' : 'Inactive'}
                    </span>
                  </div>

                  {/* Amount Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatEther(scholarship.totalAmount)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Claimed</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatEther(scholarship.claimedAmount)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Remaining</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatEther(scholarship.remainingAmount)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Your Share</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatEther((parseFloat(scholarship.totalAmount) / scholarship.eligibleStudents.length).toString())} ETH
                      </p>
                    </div>
                  </div>

                  {/* Release Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Release Date: {formatDate(scholarship.releaseTime)}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        canClaim ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {timeUntilRelease}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Check */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Certificate Requirement: 
                      </span>
                      <span className={`text-sm font-medium ${
                        scholarship.eligibleStudents.includes(account || '') 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {scholarship.eligibleStudents.includes(account || '') ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {canClaim && scholarship.eligibleStudents.includes(account || '') && (
                    <button
                      onClick={() => handleClaimScholarship(scholarship.id)}
                      disabled={isClaiming}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      {isClaiming ? (
                        <>
                          <div className="loading-spinner" />
                          <span>Claiming...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Claim Scholarship</span>
                        </>
                      )}
                    </button>
                  )}

                  {!canClaim && scholarship.isActive && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Scholarship will be available on {formatDate(scholarship.releaseTime)}
                      </p>
                    </div>
                  )}

                  {!scholarship.isActive && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        This scholarship is no longer active
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How Scholarships Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Eligibility Requirements</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Must have valid certificates</li>
              <li>• Must be in eligible students list</li>
              <li>• Must wait for release date</li>
              <li>• Must have active wallet connection</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Claiming Process</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Connect your wallet</li>
              <li>• Wait for release date</li>
              <li>• Click "Claim Scholarship"</li>
              <li>• Funds are transferred to your wallet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
