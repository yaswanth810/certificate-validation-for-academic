import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useCertificateVerification } from '../hooks/useContract';
import { 
  Search, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Copy,
  Download,
  ExternalLink,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import Logo from '../components/Logo';

const VerifyCertificate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isConnected } = useWeb3();
  const { verificationResult, verifyCertificate } = useCertificateVerification();
  const [tokenId, setTokenId] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'tokenId' | 'qr'>('tokenId');
  const [qrData, setQrData] = useState('');

  // Check for tokenId in URL params
  useEffect(() => {
    const urlTokenId = searchParams.get('tokenId');
    if (urlTokenId) {
      setTokenId(urlTokenId);
      verifyCertificate(urlTokenId);
    }
  }, [searchParams, verifyCertificate]);

  const handleTokenIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenId.trim()) {
      verifyCertificate(tokenId.trim());
    }
  };

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrData.trim()) {
      // Extract tokenId from QR data
      try {
        const url = new URL(qrData);
        const tokenIdFromQR = url.searchParams.get('tokenId');
        if (tokenIdFromQR) {
          setTokenId(tokenIdFromQR);
          verifyCertificate(tokenIdFromQR);
        } else {
          throw new Error('Invalid QR code data');
        }
      } catch {
        // Try to parse as direct tokenId
        if (qrData.match(/^\d+$/)) {
          setTokenId(qrData);
          verifyCertificate(qrData);
        } else {
          alert('Invalid QR code data. Please scan a valid certificate QR code.');
        }
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCertificate = () => {
    if (!verificationResult.certificateData) return;

    const certificateData = {
      tokenId,
      ...verificationResult.certificateData,
      verificationUrl: `${window.location.origin}/verify?tokenId=${tokenId}`,
      verifiedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-verification-${tokenId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: number | bigint) => {
    const numTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(numTimestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Verify Certificate
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Verify the authenticity of blockchain certificates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Form */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Certificate Verification
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setVerificationMethod('tokenId')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  verificationMethod === 'tokenId'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Token ID
              </button>
              <button
                onClick={() => setVerificationMethod('qr')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  verificationMethod === 'qr'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                QR Code
              </button>
            </div>
          </div>

          {verificationMethod === 'tokenId' ? (
            <form onSubmit={handleTokenIdSubmit} className="space-y-4">
              <div>
                <label className="label">
                  <Search className="w-4 h-4 inline mr-2" />
                  Certificate Token ID
                </label>
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className="input"
                  placeholder="Enter certificate token ID"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={verificationResult.loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {verificationResult.loading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify Certificate</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleQRSubmit} className="space-y-4">
              <div>
                <label className="label">
                  <QrCode className="w-4 h-4 inline mr-2" />
                  QR Code Data
                </label>
                <textarea
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Paste QR code data or scan with camera"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={verificationResult.loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {verificationResult.loading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Verify from QR Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error Message */}
          {verificationResult.error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{verificationResult.error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Result */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Verification Result
          </h2>

          {!verificationResult.certificateData && !verificationResult.loading && !verificationResult.error && (
            <div className="text-center py-12">
              <div className="mb-4">
                <Logo size="lg" showText={false} />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Enter a certificate token ID or QR code to verify
              </p>
            </div>
          )}

          {verificationResult.loading && (
            <div className="text-center py-12">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Verifying certificate...</p>
            </div>
          )}

          {verificationResult.certificateData && (
            <div className="space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-lg ${
                verificationResult.isValid 
                  ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
              }`}>
                <div className="flex items-center">
                  {verificationResult.isValid ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      verificationResult.isValid 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {verificationResult.isValid ? 'Certificate is Valid' : 'Certificate is Invalid'}
                    </h3>
                    <p className={`text-sm ${
                      verificationResult.isValid 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {verificationResult.isValid 
                        ? 'This certificate has been verified on the blockchain' 
                        : 'This certificate is invalid or has been revoked'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Certificate Details</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Token ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {tokenId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tokenId)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Student Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {verificationResult.certificateData.studentName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Course Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {verificationResult.certificateData.courseName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Grade:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {verificationResult.certificateData.grade}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Department:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {verificationResult.certificateData.department}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Issue Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(verificationResult.certificateData.issueDate)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className={`status-badge ${
                      verificationResult.certificateData.isRevoked ? 'status-invalid' : 'status-valid'
                    }`}>
                      {verificationResult.certificateData.isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Issuer:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {verificationResult.certificateData.issuer.slice(0, 6)}...{verificationResult.certificateData.issuer.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(verificationResult.certificateData!.issuer)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={downloadCertificate}
                  className="flex-1 btn-outline flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => window.open(`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CERTIFICATE_NFT_ADDRESS}?a=${tokenId}`, '_blank')}
                  className="flex-1 btn-outline flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Etherscan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Verify Certificates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Using Token ID</h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>1. Enter the certificate token ID</li>
              <li>2. Click "Verify Certificate"</li>
              <li>3. View the verification results</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Using QR Code</h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>1. Scan the QR code with your camera</li>
              <li>2. Paste the QR data in the text area</li>
              <li>3. Click "Verify from QR Code"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
