import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useContract } from '../hooks/useContract';

const LegacyPublicVerify: React.FC = () => {
  const [params] = useSearchParams();
  const tokenIdParam = params.get('tokenId') || '';
  const cidParam = params.get('cid') || '';
  const { contracts } = useContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [metadataUrl, setMetadataUrl] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!tokenIdParam) return;
      setLoading(true);
      setError(null);
      setIsValid(null);
      setOwner(null);
      setMetadata(null);
      setMetadataUrl(null);

      try {
        // Basic on-chain validation
        let valid = false;
        try {
          const [certData, verified] = await contracts.certificateNFT!.verifyCertificate(tokenIdParam);
          valid = Boolean(verified);
        } catch {}
        setIsValid(valid);

        try {
          const o = await contracts.certificateNFT!.ownerOf(tokenIdParam);
          setOwner(o);
        } catch {}

        // Resolve metadata source: prefer cid param for now
        const cid = cidParam && cidParam.startsWith('Qm') ? cidParam : '';
        if (cid) {
          const url = `https://ipfs.io/ipfs/${cid}`;
          setMetadataUrl(url);
          try {
            const res = await fetch(url);
            const json = await res.json().catch(() => null);
            if (json) setMetadata(json);
          } catch {}
        }
      } catch (e: any) {
        setError(e.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    if (contracts.certificateNFT) run();
  }, [contracts.certificateNFT, tokenIdParam, cidParam]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legacy Certificate Verification</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span>Verifying on-chain and loading metadata...</span>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {isValid !== null && (
                <div className={`flex items-center space-x-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{isValid ? 'Certificate is valid on-chain' : 'Certificate invalid or revoked'}</span>
                </div>
              )}

              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div>Token ID: {tokenIdParam || '-'}</div>
                <div>Owner: {owner || '-'}</div>
              </div>

              {metadata && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" /> Extracted Metadata
                  </h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Student Name:</span> {metadata.extracted?.studentName || '-'}</div>
                    <div><span className="font-medium">Regd No:</span> {metadata.extracted?.regdNo || '-'}</div>
                    <div><span className="font-medium">Branch:</span> {metadata.extracted?.branch || '-'}</div>
                    <div><span className="font-medium">Examination:</span> {metadata.extracted?.examination || '-'}</div>
                    <div><span className="font-medium">Month & Year:</span> {metadata.extracted?.monthYearExams || '-'}</div>
                    <div><span className="font-medium">Aadhar No:</span> {metadata.extracted?.aadharNo || '-'}</div>
                    <div><span className="font-medium">Serial No:</span> {metadata.extracted?.serialNo || '-'}</div>
                    <div><span className="font-medium">Memo No:</span> {metadata.extracted?.memoNo || '-'}</div>
                  </div>
                  {metadataUrl && (
                    <div className="mt-2 text-sm">
                      <a className="text-blue-600" href={metadataUrl} target="_blank" rel="noreferrer">View raw JSON</a>
                    </div>
                  )}
                </div>
              )}

              {!cidParam && (
                <div className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
                  No CID provided in URL. After contract support is added, this page will fetch the CID by tokenId.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegacyPublicVerify;


