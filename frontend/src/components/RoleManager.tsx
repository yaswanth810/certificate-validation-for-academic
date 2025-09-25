import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useRoles } from '../hooks/useRoles';
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const RoleManager: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { 
    isAdmin, 
    isScholarshipManager, 
    isMinter, 
    loading,
    grantAdminRole,
    grantScholarshipManagerRole,
    grantMinterRole
  } = useRoles();
  
  const [granting, setGranting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGrantRole = async (roleType: 'admin' | 'scholarship' | 'minter') => {
    if (!account) return;
    
    setGranting(roleType);
    setError(null);
    setSuccess(null);

    try {
      let txHash: string;
      
      switch (roleType) {
        case 'admin':
          txHash = await grantAdminRole(account);
          break;
        case 'scholarship':
          txHash = await grantScholarshipManagerRole(account);
          break;
        case 'minter':
          txHash = await grantMinterRole(account);
          break;
        default:
          throw new Error('Invalid role type');
      }
      
      setSuccess(`${roleType} role granted successfully! TX: ${txHash.slice(0, 10)}...`);
    } catch (err: any) {
      console.error(`Error granting ${roleType} role:`, err);
      setError(err.message || `Failed to grant ${roleType} role`);
    } finally {
      setGranting(null);
    }
  };

  const handleGrantAllRoles = async () => {
    if (!account) return;
    
    setGranting('all');
    setError(null);
    setSuccess(null);

    try {
      const promises = [];
      
      if (!isAdmin) {
        promises.push(grantAdminRole(account));
      }
      if (!isScholarshipManager) {
        promises.push(grantScholarshipManagerRole(account));
      }
      if (!isMinter) {
        promises.push(grantMinterRole(account));
      }

      if (promises.length === 0) {
        setSuccess('All roles already granted!');
        return;
      }

      await Promise.all(promises);
      setSuccess('All roles granted successfully!');
    } catch (err: any) {
      console.error('Error granting roles:', err);
      setError(err.message || 'Failed to grant roles');
    } finally {
      setGranting(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Connect Wallet Required
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to manage roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Role Management
        </h2>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Current Roles Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Admin Role</span>
            <div className="flex items-center">
              {loading ? (
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              ) : isAdmin ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? 'Checking...' : isAdmin ? 'Granted' : 'Not Granted'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Scholarship Manager</span>
            <div className="flex items-center">
              {loading ? (
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              ) : isScholarshipManager ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${isScholarshipManager ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? 'Checking...' : isScholarshipManager ? 'Granted' : 'Not Granted'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Minter Role</span>
            <div className="flex items-center">
              {loading ? (
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              ) : isMinter ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${isMinter ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? 'Checking...' : isMinter ? 'Granted' : 'Not Granted'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Grant Roles Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleGrantAllRoles}
          disabled={granting !== null || loading || (isAdmin && isScholarshipManager && isMinter)}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {granting === 'all' ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Granting All Roles...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Grant All Required Roles</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleGrantRole('admin')}
            disabled={granting !== null || loading || isAdmin}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            {granting === 'admin' ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <span>Admin Role</span>
            )}
          </button>

          <button
            onClick={() => handleGrantRole('scholarship')}
            disabled={granting !== null || loading || isScholarshipManager}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            {granting === 'scholarship' ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <span>Scholarship Manager</span>
            )}
          </button>

          <button
            onClick={() => handleGrantRole('minter')}
            disabled={granting !== null || loading || isMinter}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            {granting === 'minter' ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <span>Minter Role</span>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Instructions:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Admin Role: Required for managing contracts and other roles</li>
          <li>• Scholarship Manager: Required for creating and managing scholarships</li>
          <li>• Minter Role: Required for issuing certificates</li>
          <li>• Click "Grant All Required Roles" to get all permissions at once</li>
          <li>• Each role grant requires a MetaMask transaction confirmation</li>
        </ul>
      </div>
    </div>
  );
};

export default RoleManager;
