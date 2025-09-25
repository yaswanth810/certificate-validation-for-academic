import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';

export const useRoles = () => {
  const { account } = useWeb3();
  const { contracts, getSignedContracts } = useContract();
  const [roles, setRoles] = useState<{
    isAdmin: boolean;
    isScholarshipManager: boolean;
    isMinter: boolean;
    loading: boolean;
  }>({
    isAdmin: false,
    isScholarshipManager: false,
    isMinter: false,
    loading: true
  });

  // Check user roles with timeout and error handling
  const checkRoles = useCallback(async () => {
    if (!account || !contracts.scholarshipEscrow || !contracts.certificateNFT) {
      setRoles(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setRoles(prev => ({ ...prev, loading: true }));

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Role check timeout')), 5000)
      );

      // Get role constants with timeout
      const [adminRole, scholarshipManagerRole, minterRole] = await Promise.race([
        Promise.all([
          contracts.scholarshipEscrow.ADMIN_ROLE(),
          contracts.scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE(),
          contracts.certificateNFT.MINTER_ROLE()
        ]),
        timeoutPromise
      ]);

      // Check if user has roles with timeout
      const [isAdmin, isScholarshipManager, isMinter] = await Promise.race([
        Promise.all([
          contracts.scholarshipEscrow.hasRole(adminRole, account),
          contracts.scholarshipEscrow.hasRole(scholarshipManagerRole, account),
          contracts.certificateNFT.hasRole(minterRole, account)
        ]),
        timeoutPromise
      ]);

      setRoles({
        isAdmin,
        isScholarshipManager,
        isMinter,
        loading: false
      });

      console.log('Roles checked successfully:', { isAdmin, isScholarshipManager, isMinter });
    } catch (err: any) {
      console.error('Error checking roles:', err);
      
      // Handle specific contract address errors
      if (err.message?.includes('UNCONFIGURED_NAME') || err.message?.includes('unconfigured name')) {
        console.error('Contract address is invalid. Please check environment variables.');
        setRoles({
          isAdmin: false,
          isScholarshipManager: false,
          isMinter: false,
          loading: false
        });
        return;
      }
      
      // For demo purposes, assume user has all roles if contract calls fail
      if (err.message?.includes('circuit breaker') || err.message?.includes('timeout')) {
        console.log('Contract calls failed, assuming demo mode with all roles granted');
        setRoles({
          isAdmin: true,
          isScholarshipManager: true,
          isMinter: true,
          loading: false
        });
      } else {
        setRoles({
          isAdmin: false,
          isScholarshipManager: false,
          isMinter: false,
          loading: false
        });
      }
    }
  }, [account, contracts.scholarshipEscrow, contracts.certificateNFT]);

  // Grant scholarship manager role
  const grantScholarshipManagerRole = useCallback(async (userAddress: string) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.scholarshipEscrow) throw new Error('Contract not available');

    try {
      const scholarshipManagerRole = await signedContracts.scholarshipEscrow.SCHOLARSHIP_MANAGER_ROLE();
      const tx = await signedContracts.scholarshipEscrow.grantRole(scholarshipManagerRole, userAddress);
      await tx.wait();
      
      // Refresh roles if granting to current user
      if (userAddress.toLowerCase() === account?.toLowerCase()) {
        await checkRoles();
      }
      
      return tx.hash;
    } catch (err) {
      console.error('Error granting scholarship manager role:', err);
      throw err;
    }
  }, [getSignedContracts, account, checkRoles]);

  // Grant minter role
  const grantMinterRole = useCallback(async (userAddress: string) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.certificateNFT) throw new Error('Contract not available');

    try {
      const minterRole = await signedContracts.certificateNFT.MINTER_ROLE();
      const tx = await signedContracts.certificateNFT.grantRole(minterRole, userAddress);
      await tx.wait();
      
      // Refresh roles if granting to current user
      if (userAddress.toLowerCase() === account?.toLowerCase()) {
        await checkRoles();
      }
      
      return tx.hash;
    } catch (err) {
      console.error('Error granting minter role:', err);
      throw err;
    }
  }, [getSignedContracts, account, checkRoles]);

  // Grant admin role
  const grantAdminRole = useCallback(async (userAddress: string) => {
    const signedContracts = getSignedContracts();
    if (!signedContracts?.scholarshipEscrow) throw new Error('Contract not available');

    try {
      const adminRole = await signedContracts.scholarshipEscrow.ADMIN_ROLE();
      const tx = await signedContracts.scholarshipEscrow.grantRole(adminRole, userAddress);
      await tx.wait();
      
      // Refresh roles if granting to current user
      if (userAddress.toLowerCase() === account?.toLowerCase()) {
        await checkRoles();
      }
      
      return tx.hash;
    } catch (err) {
      console.error('Error granting admin role:', err);
      throw err;
    }
  }, [getSignedContracts, account, checkRoles]);

  // Track if we've already attempted auto-granting to prevent loops
  const [autoGrantAttempted, setAutoGrantAttempted] = useState(false);

  // Auto-grant roles for development (only if user has no roles)
  const autoGrantRoles = useCallback(async () => {
    if (!account || roles.loading || autoGrantAttempted) return;

    // If user has no roles, try to grant them (assuming they're the deployer/admin)
    if (!roles.isAdmin && !roles.isScholarshipManager && !roles.isMinter) {
      try {
        console.log('Auto-granting roles for development...');
        setAutoGrantAttempted(true);
        
        await Promise.all([
          grantScholarshipManagerRole(account).catch(() => {}),
          grantMinterRole(account).catch(() => {}),
          grantAdminRole(account).catch(() => {})
        ]);
      } catch (err) {
        console.warn('Could not auto-grant roles:', err);
      }
    }
  }, [account, roles, autoGrantAttempted, grantScholarshipManagerRole, grantMinterRole, grantAdminRole]);

  useEffect(() => {
    checkRoles();
  }, [checkRoles]);

  useEffect(() => {
    // Auto-grant roles after checking current roles, but only once
    if (!roles.loading && !autoGrantAttempted) {
      autoGrantRoles();
    }
  }, [roles.loading, autoGrantAttempted, autoGrantRoles]);

  // Reset auto-grant attempt when account changes
  useEffect(() => {
    setAutoGrantAttempted(false);
  }, [account]);

  return {
    ...roles,
    checkRoles,
    grantScholarshipManagerRole,
    grantMinterRole,
    grantAdminRole,
    autoGrantRoles
  };
};
