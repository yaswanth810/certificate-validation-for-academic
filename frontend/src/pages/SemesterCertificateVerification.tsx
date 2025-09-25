import React, { useState } from 'react';
import { Search, Shield, AlertCircle, CheckCircle, FileText, User } from 'lucide-react';
import { useSemesterCertificate } from '../hooks/useSemesterCertificate';
import SemesterCertificate from '../components/SemesterCertificate';

const SemesterCertificateVerification: React.FC = () => {
  const { verifySemesterCertificate, loading } = useSemesterCertificate();
  const [tokenId, setTokenId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim()) return;

    setError(null);
    setVerificationResult(null);

    try {
      const result = await verifySemesterCertificate(tokenId.trim());
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetVerification = () => {
    setTokenId('');
    setVerificationResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Semester Certificate Verification
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Verify the authenticity of Vignan Institute semester certificates using blockchain technology
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Certificate Verification
            </h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate Token ID
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    id="tokenId"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter certificate token ID (e.g., 1, 2, 3...)"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !tokenId.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}
            </form>

            {/* Verification Instructions */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                How to verify a certificate:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Enter the certificate token ID provided with your certificate</li>
                <li>• Click "Verify" to check the certificate on the blockchain</li>
                <li>• View the complete certificate details if verification is successful</li>
                <li>• All data is retrieved directly from the blockchain for maximum security</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Verification Results */}
        {verificationResult && (
          <div className="space-y-6">
            {/* Verification Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {verificationResult.isValid ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {verificationResult.isValid ? 'Certificate Verified' : 'Certificate Invalid'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {verificationResult.isValid 
                          ? 'This certificate is authentic and valid'
                          : 'This certificate could not be verified or has been revoked'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={resetVerification}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Verify Another
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Display */}
            {verificationResult.isValid && verificationResult.certificate && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <User className="w-6 h-6 mr-2" />
                    Certificate Details
                  </h3>
                </div>
                
                <div className="p-6">
                  <SemesterCertificate 
                    certificate={verificationResult.certificate}
                    tokenId={tokenId}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Blockchain Security
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              All certificates are stored on the blockchain, ensuring immutable and tamper-proof verification.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instant Verification
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Verify certificates instantly without contacting the institution or waiting for manual verification.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Complete Details
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              View complete certificate information including grades, SGPA, and course details directly from the blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterCertificateVerification;
