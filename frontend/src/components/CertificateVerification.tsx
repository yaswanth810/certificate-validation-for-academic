import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useCertificateVerification, CertificateVerificationResult } from '../hooks/useCertificateVerification';
import { formatDate } from '../utils/web3';

const CertificateVerification: React.FC = () => {
  const { isConnected } = useWeb3();
  const { verifyByTokenId, verifyByQRCode, loading, error, clearError } = useCertificateVerification();
  const [verificationMethod, setVerificationMethod] = useState<'tokenId' | 'qr'>('tokenId');
  const [tokenId, setTokenId] = useState('');
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);

  const handleTokenIdVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId) return;

    clearError();
    setVerificationResult(null);

    try {
      const result = await verifyByTokenId(tokenId);
      setVerificationResult(result);
    } catch (err: any) {
      // Error is already handled by the hook
    }
  };

  const handleQRVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrData) return;

    clearError();
    setVerificationResult(null);

    try {
      const result = await verifyByQRCode(qrData);
      setVerificationResult(result);
    } catch (err: any) {
      // Error is already handled by the hook
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    clearError();
    setTokenId('');
    setQrData('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Certificate Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of Vignan Institute certificates using token ID or QR code
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Verification Method Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Verification Method</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setVerificationMethod('tokenId')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  verificationMethod === 'tokenId'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Token ID
              </button>
              <button
                onClick={() => setVerificationMethod('qr')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  verificationMethod === 'qr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                QR Code
              </button>
            </div>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {verificationMethod === 'tokenId' ? 'Verify by Token ID' : 'Verify by QR Code'}
            </h2>
            
            {verificationMethod === 'tokenId' ? (
              <form onSubmit={handleTokenIdVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Token ID
                  </label>
                  <input
                    type="text"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter certificate token ID"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !tokenId}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleQRVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code Data
                  </label>
                  <textarea
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Paste QR code data or URL here"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !qrData}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify from QR Code'}
                </button>
              </form>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Verification Result</h2>
                <button
                  onClick={resetVerification}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Verify Another
                </button>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
                  verificationResult.isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <svg className={`w-5 h-5 mr-2 ${
                    verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {verificationResult.isValid ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <span className="font-semibold">
                    {verificationResult.isValid ? 'Certificate is Valid' : 'Certificate is Invalid'}
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Token ID:</span>
                      <p className="font-medium text-gray-900">{verificationResult.tokenId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Student Name:</span>
                      <p className="font-medium text-gray-900">{verificationResult.certificateData.studentName || 'Not updated by admin'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Department:</span>
                      <p className="font-medium text-gray-900">{verificationResult.certificateData.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Course Name:</span>
                      <p className="font-medium text-gray-900">{verificationResult.certificateData.courseName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">IPFS Hash:</span>
                      <p className="font-mono text-xs text-gray-600 break-all">{verificationResult.certificateData.ipfsHash}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Grade:</span>
                      <p className="font-medium text-gray-900">{verificationResult.certificateData.grade}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline & Status</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Issue Date:</span>
                      <p className="font-medium text-gray-900">{formatDate(verificationResult.certificateData.issueDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Revoked:</span>
                      <p className={`font-medium ${verificationResult.certificateData.isRevoked ? 'text-red-600' : 'text-green-600'}`}>
                        {verificationResult.certificateData.isRevoked ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Issuer Address:</span>
                      <p className="font-mono text-xs text-gray-600 break-all">{verificationResult.certificateData.issuer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    This certificate is stored on the Ethereum blockchain as an NFT (Non-Fungible Token).
                  </p>
                  <p className="text-sm text-gray-600">
                    The verification hash ensures the certificate's authenticity and prevents tampering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Verify Certificates</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <p>Use the Token ID method if you have the certificate's unique token ID</p>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <p>Use the QR Code method if you have a QR code or URL from the certificate</p>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <p>Valid certificates will show all details and verification status</p>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <p>Invalid certificates may be expired, revoked, or non-existent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
