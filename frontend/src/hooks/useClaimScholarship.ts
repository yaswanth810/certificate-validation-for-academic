import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';

export interface ClaimTransaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  scholarshipId: number;
  amount: string;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
}

export const useClaimScholarship = () => {
  const { signer, account } = useWeb3();
  const { scholarshipContract } = useContract();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ClaimTransaction[]>([]);

  // Claim a scholarship
  const claimScholarship = useCallback(async (scholarshipId: number): Promise<ClaimTransaction | null> => {
    if (!scholarshipContract || !signer || !account) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setClaiming(true);
      setError(null);

      // Get scholarship details first
      const scholarship = await scholarshipContract.getScholarship(scholarshipId);
      
      // Validate scholarship status
      if (!scholarship.isActive) {
        throw new Error('Scholarship is no longer active');
      }

      const now = Math.floor(Date.now() / 1000);
      if (scholarship.deadline <= now) {
        throw new Error('Scholarship deadline has passed');
      }

      if (scholarship.remainingAmount <= 0) {
        throw new Error('No funds remaining in scholarship');
      }

      // Check if already claimed
      const alreadyClaimed = await scholarshipContract.scholarshipClaims(scholarshipId, account);
      if (alreadyClaimed) {
        throw new Error('You have already claimed this scholarship');
      }

      // Check eligibility
      const isEligible = await scholarshipContract.isEligibleForScholarship(scholarshipId, account);
      if (!isEligible) {
        throw new Error('You are not eligible for this scholarship');
      }

      // Estimate gas
      const gasEstimate = await scholarshipContract.claimScholarship.estimateGas(scholarshipId);
      const gasLimit = gasEstimate * 120n / 100n; // Add 20% buffer

      // Submit transaction
      const tx = await scholarshipContract.claimScholarship(scholarshipId, {
        gasLimit
      });

      const claimTx: ClaimTransaction = {
        hash: tx.hash,
        status: 'pending',
        scholarshipId,
        amount: ethers.formatEther(scholarship.amountPerRecipient),
        timestamp: Date.now(),
      };

      setTransactions(prev => [claimTx, ...prev]);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        const confirmedTx: ClaimTransaction = {
          ...claimTx,
          status: 'confirmed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        };

        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? confirmedTx : t)
        );

        return confirmedTx;
      } else {
        const failedTx: ClaimTransaction = {
          ...claimTx,
          status: 'failed',
        };

        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? failedTx : t)
        );

        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error claiming scholarship:', err);
      
      let errorMessage = 'Failed to claim scholarship';
      
      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      return null;
    } finally {
      setClaiming(false);
    }
  }, [scholarshipContract, signer, account]);

  // Claim multiple scholarships in batch
  const claimMultipleScholarships = useCallback(async (scholarshipIds: number[]) => {
    const results: (ClaimTransaction | null)[] = [];
    
    for (const id of scholarshipIds) {
      try {
        const result = await claimScholarship(id);
        results.push(result);
        
        // Add delay between transactions to avoid nonce issues
        if (results.length < scholarshipIds.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (err) {
        console.error(`Error claiming scholarship ${id}:`, err);
        results.push(null);
      }
    }
    
    return results;
  }, [claimScholarship]);

  // Get transaction by hash
  const getTransaction = useCallback((hash: string) => {
    return transactions.find(tx => tx.hash === hash);
  }, [transactions]);

  // Get transactions for a specific scholarship
  const getScholarshipTransactions = useCallback((scholarshipId: number) => {
    return transactions.filter(tx => tx.scholarshipId === scholarshipId);
  }, [transactions]);

  // Get pending transactions
  const getPendingTransactions = useCallback(() => {
    return transactions.filter(tx => tx.status === 'pending');
  }, [transactions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear transactions history
  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  return {
    claimScholarship,
    claimMultipleScholarships,
    claiming,
    error,
    transactions,
    getTransaction,
    getScholarshipTransactions,
    getPendingTransactions,
    clearError,
    clearTransactions,
  };
};
