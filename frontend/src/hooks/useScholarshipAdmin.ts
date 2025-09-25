import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';

export interface CreateScholarshipParams {
  name: string;
  description: string;
  totalAmount: string;
  maxRecipients: number;
  deadline: number;
  tokenAddress: string;
  tokenSymbol: string;
  criteria: {
    minGPA: number;
    requiredCourses: string[];
    allowedDepartments: string[];
    minCertificates: number;
    enrollmentAfter: number;
    enrollmentBefore: number;
    requiresAllCourses: boolean;
  };
}

export interface AdminTransaction {
  hash: string;
  type: 'create' | 'revoke' | 'deposit' | 'withdraw';
  status: 'pending' | 'confirmed' | 'failed';
  scholarshipId?: number;
  amount?: string;
  timestamp: number;
}

export const useScholarshipAdmin = () => {
  const { signer, account } = useWeb3();
  const { scholarshipContract } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);

  // Create a new scholarship
  const createScholarship = useCallback(async (params: CreateScholarshipParams): Promise<number | null> => {
    if (!scholarshipContract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const {
        name,
        description,
        totalAmount,
        maxRecipients,
        deadline,
        tokenAddress,
        tokenSymbol,
        criteria
      } = params;

      // Convert amount to wei
      const amountWei = ethers.parseEther(totalAmount);

      // Prepare transaction options
      const txOptions: any = {};
      
      // For ETH scholarships, include value
      if (tokenAddress === ethers.ZeroAddress || tokenAddress === '0x0') {
        txOptions.value = amountWei;
      }

      // Estimate gas
      const gasEstimate = await scholarshipContract.createScholarship.estimateGas(
        name,
        description,
        amountWei,
        maxRecipients,
        deadline,
        tokenAddress,
        tokenSymbol,
        criteria,
        txOptions
      );

      txOptions.gasLimit = gasEstimate * 120n / 100n; // Add 20% buffer

      // Submit transaction
      const tx = await scholarshipContract.createScholarship(
        name,
        description,
        amountWei,
        maxRecipients,
        deadline,
        tokenAddress,
        tokenSymbol,
        criteria,
        txOptions
      );

      const adminTx: AdminTransaction = {
        hash: tx.hash,
        type: 'create',
        status: 'pending',
        amount: totalAmount,
        timestamp: Date.now(),
      };

      setTransactions(prev => [adminTx, ...prev]);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Extract scholarship ID from events
        const scholarshipCreatedEvent = receipt.logs.find(log => {
          try {
            const parsed = scholarshipContract.interface.parseLog(log);
            return parsed?.name === 'ScholarshipCreated';
          } catch {
            return false;
          }
        });

        let scholarshipId: number | null = null;
        if (scholarshipCreatedEvent) {
          const parsed = scholarshipContract.interface.parseLog(scholarshipCreatedEvent);
          scholarshipId = parsed?.args?.scholarshipId?.toNumber() || null;
        }

        const confirmedTx: AdminTransaction = {
          ...adminTx,
          status: 'confirmed',
          scholarshipId: scholarshipId || undefined,
        };

        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? confirmedTx : t)
        );

        return scholarshipId;
      } else {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'failed' as const } : t)
        );
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error creating scholarship:', err);
      
      let errorMessage = 'Failed to create scholarship';
      
      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, signer]);

  // Revoke a scholarship
  const revokeScholarship = useCallback(async (scholarshipId: number): Promise<boolean> => {
    if (!scholarshipContract || !signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await scholarshipContract.revokeScholarship(scholarshipId);

      const adminTx: AdminTransaction = {
        hash: tx.hash,
        type: 'revoke',
        status: 'pending',
        scholarshipId,
        timestamp: Date.now(),
      };

      setTransactions(prev => [adminTx, ...prev]);

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'confirmed' as const } : t)
        );
        return true;
      } else {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'failed' as const } : t)
        );
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error revoking scholarship:', err);
      setError(err.message || 'Failed to revoke scholarship');
      return false;
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, signer]);

  // Deposit funds to contract
  const depositFunds = useCallback(async (amount: string): Promise<boolean> => {
    if (!scholarshipContract || !signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const amountWei = ethers.parseEther(amount);
      const tx = await scholarshipContract.depositFunds({ value: amountWei });

      const adminTx: AdminTransaction = {
        hash: tx.hash,
        type: 'deposit',
        status: 'pending',
        amount,
        timestamp: Date.now(),
      };

      setTransactions(prev => [adminTx, ...prev]);

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'confirmed' as const } : t)
        );
        return true;
      } else {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'failed' as const } : t)
        );
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error depositing funds:', err);
      setError(err.message || 'Failed to deposit funds');
      return false;
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, signer]);

  // Withdraw funds from contract
  const withdrawFunds = useCallback(async (amount: string): Promise<boolean> => {
    if (!scholarshipContract || !signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const amountWei = ethers.parseEther(amount);
      const tx = await scholarshipContract.withdrawFunds(amountWei);

      const adminTx: AdminTransaction = {
        hash: tx.hash,
        type: 'withdraw',
        status: 'pending',
        amount,
        timestamp: Date.now(),
      };

      setTransactions(prev => [adminTx, ...prev]);

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'confirmed' as const } : t)
        );
        return true;
      } else {
        setTransactions(prev => 
          prev.map(t => t.hash === tx.hash ? { ...t, status: 'failed' as const } : t)
        );
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error withdrawing funds:', err);
      setError(err.message || 'Failed to withdraw funds');
      return false;
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, signer]);

  // Get contract balance
  const getContractBalance = useCallback(async (): Promise<string> => {
    if (!scholarshipContract) return '0';

    try {
      const balance = await scholarshipContract.getContractBalance();
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('Error getting contract balance:', err);
      return '0';
    }
  }, [scholarshipContract]);

  // Check if current user has admin role
  const isAdmin = useCallback(async (): Promise<boolean> => {
    if (!scholarshipContract || !account) return false;

    try {
      const ADMIN_ROLE = await scholarshipContract.ADMIN_ROLE();
      return await scholarshipContract.hasRole(ADMIN_ROLE, account);
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    }
  }, [scholarshipContract, account]);

  // Check if current user has scholarship manager role
  const isScholarshipManager = useCallback(async (): Promise<boolean> => {
    if (!scholarshipContract || !account) return false;

    try {
      const MANAGER_ROLE = await scholarshipContract.SCHOLARSHIP_MANAGER_ROLE();
      return await scholarshipContract.hasRole(MANAGER_ROLE, account);
    } catch (err) {
      console.error('Error checking manager role:', err);
      return false;
    }
  }, [scholarshipContract, account]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createScholarship,
    revokeScholarship,
    depositFunds,
    withdrawFunds,
    getContractBalance,
    isAdmin,
    isScholarshipManager,
    loading,
    error,
    transactions,
    clearError,
  };
};
