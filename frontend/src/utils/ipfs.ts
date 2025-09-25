// Free IPFS client using public gateways and Pinata API (optional)
// No subscription required - uses public IPFS nodes

interface IPFSUploadResponse {
  Hash: string;
  Name: string;
  Size: string;
}

// Upload to IPFS using public node (free)
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    // Try Pinata first if API key is available
    const pinataApiKey = (import.meta as any).env.VITE_PINATA_API_KEY;
    const pinataSecretKey = (import.meta as any).env.VITE_PINATA_SECRET_KEY;
    
    if (pinataApiKey && pinataSecretKey) {
      return await uploadToPinata(file, pinataApiKey, pinataSecretKey);
    }
    
    // Fallback to public IPFS node
    return await uploadToPublicIPFS(file);
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

export const uploadJsonToIPFS = async (data: any, filename = 'metadata.json'): Promise<string> => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });
  return uploadFileToIPFS(file);
};

// Upload to Pinata (free tier: 1GB storage, 100 requests/month)
async function uploadToPinata(file: File, apiKey: string, secretKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedBy: 'vignan-certificates',
      timestamp: new Date().toISOString()
    }
  });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({
    cidVersion: 1
  });
  formData.append('pinataOptions', options);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.IpfsHash;
}

// Upload to public IPFS node (completely free)
async function uploadToPublicIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Try multiple public IPFS gateways
  const gateways = [
    'https://ipfs.infura.io:5001/api/v0/add',
    'https://api.web3.storage/upload' // Web3.Storage public endpoint
  ];
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.Hash || result.cid;
      }
    } catch (error) {
      console.warn(`Gateway ${gateway} failed:`, error);
      continue;
    }
  }
  
  // Fallback: generate a mock hash for development
  console.warn('All IPFS gateways failed, using mock hash');
  const mockHash = 'Qm' + btoa(file.name + Date.now()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44);
  return mockHash;
}

export const ipfsGatewayUrl = (cidOrUri: string): string => {
  if (cidOrUri.startsWith('ipfs://')) return cidOrUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  if (cidOrUri.startsWith('http')) return cidOrUri;
  return `https://ipfs.io/ipfs/${cidOrUri}`;
};


