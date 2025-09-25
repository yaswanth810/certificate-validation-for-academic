import React from 'react';
import { X, ExternalLink, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';

export interface TransactionStatus {
  hash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'rejected';
  type: 'claim' | 'create' | 'revoke' | 'deposit' | 'withdraw';
  amount?: string;
  scholarshipId?: number;
  scholarshipName?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
  timestamp: number;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionStatus;
  explorerUrl?: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  explorerUrl = 'https://sepolia.etherscan.io'
}) => {
  if (!isOpen) return null;

  const getStatusConfig = () => {
    switch (transaction.status) {
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Transaction Pending',
          description: 'Your transaction is being processed on the blockchain...'
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'Transaction Confirmed',
          description: 'Your transaction has been successfully confirmed!'
        };
      case 'failed':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Transaction Failed',
          description: 'Your transaction failed to complete.'
        };
      case 'rejected':
        return {
          icon: AlertTriangle,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          title: 'Transaction Rejected',
          description: 'You rejected the transaction in your wallet.'
        };
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'claim':
        return 'Scholarship Claim';
      case 'create':
        return 'Create Scholarship';
      case 'revoke':
        return 'Revoke Scholarship';
      case 'deposit':
        return 'Deposit Funds';
      case 'withdraw':
        return 'Withdraw Funds';
      default:
        return 'Transaction';
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Status
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Indicator */}
            <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {transaction.status === 'pending' ? (
                    <Loader2 className={`w-6 h-6 ${config.iconColor} animate-spin`} />
                  ) : (
                    <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {config.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {getTypeLabel()}
                  </p>
                </div>
                
                {transaction.amount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {transaction.amount} ETH
                    </p>
                  </div>
                )}
              </div>

              {transaction.scholarshipName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scholarship
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {transaction.scholarshipName}
                  </p>
                </div>
              )}

              {transaction.hash && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Transaction Hash
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-sm text-gray-900 dark:text-white font-mono truncate">
                      {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                    </p>
                    <a
                      href={`${explorerUrl}/tx/${transaction.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {transaction.blockNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Block Number
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {transaction.blockNumber.toLocaleString()}
                    </p>
                  </div>
                  
                  {transaction.gasUsed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gas Used
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {parseInt(transaction.gasUsed).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {transaction.error && (
                <div>
                  <label className="block text-sm font-medium text-red-700 dark:text-red-300">
                    Error Details
                  </label>
                  <p className="mt-1 text-sm text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                    {transaction.error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timestamp
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(transaction.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {transaction.hash && (
              <a
                href={`${explorerUrl}/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
