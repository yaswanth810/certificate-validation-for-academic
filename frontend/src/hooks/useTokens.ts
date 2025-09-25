import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { TokenInfo } from '../types/scholarship';

// ERC20 ABI for basic token operations
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Common testnet tokens on Sepolia
const TESTNET_TOKENS = {
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  DAI: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6',  // Sepolia DAI
  USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT
};

export const useTokens = () => {
  const { provider, account, signer } = useWeb3();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get token information
  const getTokenInfo = useCallback(async (tokenAddress: string): Promise<TokenInfo | null> => {
    if (!provider) return null;

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        account ? contract.balanceOf(account) : ethers.parseUnits('0', 18)
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        balance: balance.toString()
      };
    } catch (error) {
      console.error(`Error fetching token info for ${tokenAddress}:`, error);
      return null;
    }
  }, [provider, account]);

  // Load supported tokens
  const loadTokens = useCallback(async () => {
    if (!provider) return;

    try {
      setLoading(true);
      setError(null);

      // Add ETH as native token
      const ethBalance = account ? await provider.getBalance(account) : ethers.parseEther('0');
      
      const ethToken: TokenInfo = {
        address: ethers.ZeroAddress,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        balance: ethBalance.toString()
      };

      // Load testnet tokens
      const tokenPromises = Object.entries(TESTNET_TOKENS).map(([, address]) => 
        getTokenInfo(address)
      );

      const tokenResults = await Promise.all(tokenPromises);
      const validTokens = tokenResults.filter((token): token is TokenInfo => token !== null);

      setTokens([ethToken, ...validTokens]);
    } catch (err) {
      console.error('Error loading tokens:', err);
      setError('Failed to load token information');
    } finally {
      setLoading(false);
    }
  }, [provider, account, getTokenInfo]);

  // Check token allowance
  const checkAllowance = useCallback(async (
    tokenAddress: string, 
    spenderAddress: string
  ): Promise<string> => {
    if (!provider || !account || tokenAddress === ethers.ZeroAddress) {
      return '0';
    }

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await contract.allowance(account, spenderAddress);
      return allowance.toString();
    } catch (error) {
      console.error('Error checking allowance:', error);
      return '0';
    }
  }, [provider, account]);

  // Approve token spending
  const approveToken = useCallback(async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<string> => {
    if (!signer || tokenAddress === ethers.ZeroAddress) {
      throw new Error('Cannot approve ETH or signer not available');
    }

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await contract.approve(spenderAddress, amount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  }, [signer]);

  // Transfer tokens
  const transferToken = useCallback(async (
    tokenAddress: string,
    toAddress: string,
    amount: string
  ): Promise<string> => {
    if (!signer) {
      throw new Error('Signer not available');
    }

    try {
      let tx;
      
      if (tokenAddress === ethers.ZeroAddress) {
        // ETH transfer
        tx = await signer.sendTransaction({
          to: toAddress,
          value: amount
        });
      } else {
        // ERC20 transfer
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        tx = await contract.transfer(toAddress, amount);
      }
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  }, [signer]);

  // Get token balance
  const getTokenBalance = useCallback(async (
    tokenAddress: string,
    userAddress?: string
  ): Promise<string> => {
    if (!provider) return '0';

    const address = userAddress || account;
    if (!address) return '0';

    try {
      if (tokenAddress === ethers.ZeroAddress) {
        const balance = await provider.getBalance(address);
        return balance.toString();
      } else {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await contract.balanceOf(address);
        return balance.toString();
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }, [provider, account]);

  // Format token amount for display
  const formatTokenAmount = useCallback((
    amount: string,
    decimals: number,
    maxDecimals: number = 4
  ): string => {
    try {
      const formatted = ethers.formatUnits(amount, decimals);
      const num = parseFloat(formatted);
      
      if (num === 0) return '0';
      if (num < 0.0001) return '< 0.0001';
      
      return num.toFixed(Math.min(maxDecimals, decimals));
    } catch (error) {
      return '0';
    }
  }, []);

  // Parse token amount from user input
  const parseTokenAmount = useCallback((
    amount: string,
    decimals: number
  ): string => {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch (error) {
      throw new Error('Invalid amount format');
    }
  }, []);

  // Get USD price (mock implementation - in production use price API)
  const getTokenPrice = useCallback(async (tokenSymbol: string): Promise<number> => {
    // Mock prices for demonstration
    const mockPrices: { [key: string]: number } = {
      ETH: 2500,
      USDC: 1,
      DAI: 1,
      USDT: 1
    };

    return mockPrices[tokenSymbol] || 0;
  }, []);

  // Load tokens on mount and account change
  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return {
    tokens,
    loading,
    error,
    getTokenInfo,
    loadTokens,
    checkAllowance,
    approveToken,
    transferToken,
    getTokenBalance,
    formatTokenAmount,
    parseTokenAmount,
    getTokenPrice,
    TESTNET_TOKENS
  };
};
