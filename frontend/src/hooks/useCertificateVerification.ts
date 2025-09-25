import { useState } from 'react';
import { useContract } from './useContract';

export interface CertificateVerificationResult {
  tokenId: string;
  certificateData: {
    studentName: string;
    courseName: string;
    grade: string;
    ipfsHash: string;
    department: string;
    issueDate: number;
    isRevoked: boolean;
    issuer: string;
    metadataUrl?: string;
    metadata?: any;
  };
  isValid: boolean;
  verificationMethod: 'tokenId' | 'qr';
  owner?: string;
}

export const useCertificateVerification = () => {
  const { contracts } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyByTokenId = async (tokenId: string): Promise<CertificateVerificationResult> => {
    if (!contracts.certificateNFT) {
      throw new Error('Certificate contract not available');
    }

    setLoading(true);
    setError(null);

    try {
      // Get certificate data and verification status
      const [certificateData, verificationResult] = await Promise.all([
        contracts.certificateNFT.getCertificateData(tokenId),
        contracts.certificateNFT.verifyCertificate(tokenId)
      ]);

      // Get owner address
      let owner: string | undefined;
      try {
        owner = await contracts.certificateNFT.ownerOf(tokenId);
      } catch (err) {
        console.warn('Could not get owner for token:', tokenId);
      }

      // Convert BigInt values to numbers
      const processedData: any = {
        studentName: certificateData.studentName || '',
        courseName: certificateData.courseName || '',
        grade: certificateData.grade || '',
        ipfsHash: certificateData.ipfsHash || '',
        department: certificateData.department || '',
        issueDate: typeof certificateData.issueDate === 'bigint' 
          ? Number(certificateData.issueDate) 
          : certificateData.issueDate,
        isRevoked: certificateData.isRevoked || false,
        issuer: certificateData.issuer || ''
      };

      // If ipfsHash present, attempt to fetch metadata JSON
      if (processedData.ipfsHash && processedData.ipfsHash.startsWith('Qm')) {
        const url = `https://ipfs.io/ipfs/${processedData.ipfsHash}`;
        processedData.metadataUrl = url;
        try {
          const res = await fetch(url);
          const json = await res.json().catch(() => null);
          if (json) processedData.metadata = json;
        } catch {}
      }

      return {
        tokenId,
        certificateData: processedData,
        isValid: verificationResult[1], // Second element is the boolean
        verificationMethod: 'tokenId',
        owner
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify certificate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyByQRCode = async (qrData: string): Promise<CertificateVerificationResult> => {
    // Parse QR data to extract token ID
    let tokenId: string;
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(qrData);
      tokenId = parsed.tokenId || parsed.id;
    } catch {
      // If not JSON, try to extract token ID from URL or plain text
      const match = qrData.match(/tokenId[=:](\d+)/i) || qrData.match(/id[=:](\d+)/i) || qrData.match(/(\d+)/);
      if (match) {
        tokenId = match[1];
      } else {
        throw new Error('Could not extract token ID from QR data');
      }
    }

    if (!tokenId) {
      throw new Error('Invalid QR code: no token ID found');
    }

    const result = await verifyByTokenId(tokenId);
    return {
      ...result,
      verificationMethod: 'qr'
    };
  };

  const clearError = () => setError(null);

  return {
    verifyByTokenId,
    verifyByQRCode,
    loading,
    error,
    clearError
  };
};
