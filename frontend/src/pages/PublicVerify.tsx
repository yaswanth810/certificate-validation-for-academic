import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Copy,
  Download,
  ExternalLink,
  AlertCircle,
  Shield,
  Calendar,
  User,
  BookOpen,
  Award
} from 'lucide-react';
import Logo from '../components/Logo';

interface VerificationResult {
  isValid: boolean;
  certificateData?: {
    studentName: string;
    courseName: string;
    grade: string;
    department: string;
    issueDate: string;
    issuer: string;
    certificateId: string;
  };
  error?: string;
}

const PublicVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState('');
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'certificateId' | 'qr'>('certificateId');

  // Check for certificateId in URL params
  useEffect(() => {
    const urlCertificateId = searchParams.get('certificateId');
    if (urlCertificateId) {
      setCertificateId(urlCertificateId);
      verifyCertificate(urlCertificateId);
    }
  }, [searchParams]);

  const verifyCertificate = async (id: string) => {
    setLoading(true);
    setVerificationResult(null);

    try {
      // Simulate API call to verify certificate
      // In a real app, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock verification result
      const mockResult: VerificationResult = {
        isValid: true,
        certificateData: {
          studentName: 'John Doe',
          courseName: 'Computer Science Fundamentals',
          grade: 'A+',
          department: 'Computer Science',
          issueDate: '2024-01-15',
          issuer: '0x1234567890123456789012345678901234567890',
          certificateId: id
        }
      };

      setVerificationResult(mockResult);
    } catch (error: any) {
      setVerificationResult({
        isValid: false,
        error: 'Failed to verify certificate. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateId.trim()) {
      verifyCertificate(certificateId.trim());
    }
  };

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrData.trim()) {
      // Extract certificate ID from QR data
      try {
        const url = new URL(qrData);
        const certificateIdFromQR = url.searchParams.get('certificateId');
        if (certificateIdFromQR) {
          setCertificateId(certificateIdFromQR);
          verifyCertificate(certificateIdFromQR);
        } else {
          throw new Error('Invalid QR code data');
        }
      } catch {
        // Try to parse as direct certificate ID
        if (qrData.match(/^[a-zA-Z0-9-_]+$/)) {
          setCertificateId(qrData);
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
    if (!verificationResult?.certificateData) return;

    const certificateData = {
      ...verificationResult.certificateData,
      verificationUrl: `${window.location.origin}/verify?certificateId=${verificationResult.certificateData.certificateId}`,
      verifiedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-verification-${verificationResult.certificateData.certificateId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <Logo size="lg" />
          </div>
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Certificate Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Verify the authenticity of blockchain certificates
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Verification Form */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Verify Certificate
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setVerificationMethod('certificateId')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      verificationMethod === 'certificateId'
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    Certificate ID
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

              {verificationMethod === 'certificateId' ? (
                <form onSubmit={handleCertificateIdSubmit} className="space-y-4">
                  <div>
                    <label className="label">
                      <Search className="w-4 h-4 inline mr-2" />
                      Certificate ID
                    </label>
                    <input
                      type="text"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      className="input"
                      placeholder="Enter certificate ID"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {loading ? (
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
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {loading ? (
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
              {verificationResult?.error && (
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

              {!verificationResult && !loading && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Logo size="lg" showText={false} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter a certificate ID or QR code to verify
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Verifying certificate...</p>
                </div>
              )}

              {verificationResult && (
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
                  {verificationResult.certificateData && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Certificate Details</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Student:</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">
                              {verificationResult.certificateData.studentName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Course:</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">
                              {verificationResult.certificateData.courseName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Grade:</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">
                              {verificationResult.certificateData.grade}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Department:</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">
                              {verificationResult.certificateData.department}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Issue Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">
                              {formatDate(verificationResult.certificateData.issueDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 text-gray-500 dark:text-gray-400">
                            <div className="w-4 h-4 border border-gray-400 rounded"></div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Certificate ID:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-gray-900 dark:text-white">
                                {verificationResult.certificateData.certificateId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(verificationResult.certificateData!.certificateId)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {verificationResult.isValid && verificationResult.certificateData && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={downloadCertificate}
                        className="flex-1 btn-outline flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => window.open(`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CERTIFICATE_NFT_ADDRESS}?a=${verificationResult.certificateData!.certificateId}`, '_blank')}
                        className="flex-1 btn-outline flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View on Etherscan</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Blockchain Secured</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Certificates are stored on the Ethereum blockchain for maximum security
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Verify certificates instantly using QR codes or certificate IDs
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tamper Proof</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Certificates cannot be forged or modified once issued
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicVerify;



