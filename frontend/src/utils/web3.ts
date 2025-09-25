import { ethers } from 'ethers';

// Utility functions for Web3 operations

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string | number): string => {
  if (!balance) return '0.00';
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(4);
};

export const formatEther = (wei: string | number): string => {
  if (!wei) return '0.00';
  return ethers.utils.formatEther(wei);
};

export const parseEther = (ether: string): string => {
  return ethers.utils.parseEther(ether).toString();
};

export const formatDate = (timestamp: string | number | bigint): string => {
  if (!timestamp) return 'N/A';
  const numTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
  const date = new Date(numTimestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (timestamp: string | number | bigint): string => {
  if (!timestamp) return 'N/A';
  const numTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
  const date = new Date(numTimestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateVerificationHash = (studentId: string, courseName: string, issueDate: number): string => {
  const data = `${studentId}-${courseName}-${issueDate}`;
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
};

export const validateAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

export const getNetworkName = (chainId: number): string => {
  const networks: { [key: number]: string } = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    1337: 'Local Hardhat',
    31337: 'Local Hardhat'
  };
  return networks[chainId] || `Unknown Network (${chainId})`;
};

export const isCorrectNetwork = (chainId: number): boolean => {
  // For this demo, we support Sepolia testnet and local development
  return chainId === 11155111 || chainId === 1337 || chainId === 31337;
};

export const switchToSepolia = async (provider: ethers.providers.Web3Provider): Promise<void> => {
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId: '0xaa36a7' }]); // Sepolia chainId
  } catch (error: any) {
    // If the chain doesn't exist, add it
    if (error.code === 4902) {
      await provider.send('wallet_addEthereumChain', [{
        chainId: '0xaa36a7',
        chainName: 'Sepolia Test Network',
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
        nativeCurrency: {
          name: 'SepoliaETH',
          symbol: 'SepoliaETH',
          decimals: 18
        },
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      }]);
    } else {
      throw error;
    }
  }
};

export const getContractAddresses = () => {
  return {
    VignanRegistry: process.env.REACT_APP_VIGNAN_REGISTRY_ADDRESS || '',
    CertificateNFT: process.env.REACT_APP_CERTIFICATE_NFT_ADDRESS || '',
    ScholarshipEscrow: process.env.REACT_APP_SCHOLARSHIP_ESCROW_ADDRESS || ''
  };
};

export const getExplorerUrl = (chainId: number, txHash: string): string => {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io/tx/',
    11155111: 'https://sepolia.etherscan.io/tx/',
    1337: 'http://localhost:8545',
    31337: 'http://localhost:8545'
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
};

export const getContractExplorerUrl = (chainId: number, contractAddress: string): string => {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io/address/',
    11155111: 'https://sepolia.etherscan.io/address/',
    1337: 'http://localhost:8545',
    31337: 'http://localhost:8545'
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io/address/';
  return `${baseUrl}${contractAddress}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const downloadJSON = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateQRData = (tokenId: string, contractAddress: string, networkId: number): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/verify?tokenId=${tokenId}&contract=${contractAddress}&network=${networkId}`;
};

export const parseQRData = (qrData: string): { tokenId?: string; contract?: string; network?: number } => {
  try {
    const url = new URL(qrData);
    const params = new URLSearchParams(url.search);
    return {
      tokenId: params.get('tokenId') || undefined,
      contract: params.get('contract') || undefined,
      network: params.get('network') ? parseInt(params.get('network')!) : undefined
    };
  } catch {
    return {};
  }
};
