import { Web3Storage, File as Web3File } from 'web3.storage';

export const getWeb3StorageClient = () => {
  const token = (import.meta as any).env.VITE_WEB3_STORAGE_TOKEN as string | undefined;
  if (!token) throw new Error('Missing VITE_WEB3_STORAGE_TOKEN');
  return new Web3Storage({ token });
};

export const uploadFileToIPFS = async (file: File): Promise<string> => {
  const client = getWeb3StorageClient();
  const cid = await client.put([file as unknown as Web3File], { wrapWithDirectory: false });
  return cid;
};

export const uploadJsonToIPFS = async (data: any, filename = 'metadata.json'): Promise<string> => {
  const client = getWeb3StorageClient();
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });
  const cid = await client.put([file as unknown as Web3File], { wrapWithDirectory: false });
  return cid;
};

export const ipfsGatewayUrl = (cidOrUri: string): string => {
  if (cidOrUri.startsWith('ipfs://')) return cidOrUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  if (cidOrUri.startsWith('http')) return cidOrUri;
  return `https://ipfs.io/ipfs/${cidOrUri}`;
};


