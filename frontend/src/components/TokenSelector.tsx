import React, { useState, useEffect } from 'react';
import { ChevronDown, Coins, AlertCircle } from 'lucide-react';
import { useTokens } from '../hooks/useTokens';
import { TokenInfo } from '../types/scholarship';

interface TokenSelectorProps {
  selectedToken?: TokenInfo;
  onTokenSelect: (token: TokenInfo) => void;
  showBalance?: boolean;
  className?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  showBalance = true,
  className = ''
}) => {
  const { tokens, loading, formatTokenAmount } = useTokens();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Auto-select ETH if no token is selected
    if (!selectedToken && tokens.length > 0) {
      const ethToken = tokens.find(t => t.symbol === 'ETH');
      if (ethToken) {
        onTokenSelect(ethToken);
      }
    }
  }, [tokens, selectedToken, onTokenSelect]);

  const handleTokenSelect = (token: TokenInfo) => {
    onTokenSelect(token);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <div className="loading-spinner w-4 h-4" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedToken ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedToken.symbol}
                </div>
                {showBalance && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Balance: {formatTokenAmount(selectedToken.balance, selectedToken.decimals)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-gray-500 dark:text-gray-400">Select token</span>
            </div>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {tokens.length === 0 ? (
            <div className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No tokens available</p>
            </div>
          ) : (
            tokens.map((token) => (
              <button
                key={token.address}
                onClick={() => handleTokenSelect(token)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {token.name}
                  </div>
                </div>
                {showBalance && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTokenAmount(token.balance, token.decimals)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {token.symbol}
                    </div>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TokenSelector;
