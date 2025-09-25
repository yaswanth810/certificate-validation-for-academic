import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';
import { 
  GraduationCap, 
  User, 
  BookOpen, 
  Award, 
  Upload,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  Palette
} from 'lucide-react';
import QRCode from 'qrcode';
import Logo from '../components/Logo';
import CertificatePreview from '../components/CertificatePreview';
import { generateCertificatePDF, CertificateData, certificateTemplates } from '../utils/certificateGenerator';

interface CertificateForm {
  studentAddress: string;
  courseName: string;
  grade: string;
  studentName: string;
  department: string;
  ipfsHash: string;
  templateType: 'completion' | 'honor' | 'achievement';
  issuerName: string;
  issuerTitle: string;
}

const IssueCertificate: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { getSignedContracts } = useContract();
  const [formData, setFormData] = useState<CertificateForm>({
    studentAddress: '',
    courseName: '',
    grade: '',
    studentName: '',
    department: '',
    ipfsHash: '',
    templateType: 'completion',
    issuerName: 'Dr. John Smith',
    issuerTitle: 'Head of Department'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateIPFSHash = () => {
    // In a real app, this would upload to IPFS and return the hash
    const mockHash = `Qm${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`;
    setFormData(prev => ({
      ...prev,
      ipfsHash: mockHash
    }));
  };

  const generateQRCode = async (tokenId: string) => {
    try {
      const qrData = `${window.location.origin}/verify?tokenId=${tokenId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contracts = getSignedContracts();
      if (!contracts?.certificateNFT) {
        throw new Error('Contract not available');
      }

      // Mint certificate
      const tx = await contracts.certificateNFT.mintCertificate(
        formData.studentAddress,
        formData.courseName,
        formData.grade,
        formData.ipfsHash
      );

      const receipt = await tx.wait();
      
      // Extract token ID from the transaction receipt events
      let tokenId: string;
      try {
        // Look for CertificateIssued event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contracts.certificateNFT.interface.parseLog(log);
            return parsed?.name === 'CertificateIssued';
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsedEvent = contracts.certificateNFT.interface.parseLog(event);
          tokenId = parsedEvent.args.tokenId.toString();
        } else {
          // Fallback: get the latest token ID from the contract
          const balance = await contracts.certificateNFT.balanceOf(formData.studentAddress);
          const tokens = await contracts.certificateNFT.getStudentCertificates(formData.studentAddress);
          tokenId = tokens[tokens.length - 1].toString();
        }
      } catch (error) {
        console.warn('Could not extract token ID from receipt, using fallback method');
        // Fallback: get the latest token ID from the contract
        const tokens = await contracts.certificateNFT.getStudentCertificates(formData.studentAddress);
        tokenId = tokens[tokens.length - 1].toString();
      }
      
      setMintedTokenId(tokenId);

      // Update certificate details
      await contracts.certificateNFT.updateCertificateDetails(
        tokenId,
        formData.studentName,
        formData.department
      );

      // Generate QR code
      await generateQRCode(tokenId);

      setSuccess(`Certificate minted successfully! Token ID: ${tokenId}`);
      setPreviewMode(true);
    } catch (err: any) {
      console.error('Error minting certificate:', err);
      setError(err.message || 'Failed to mint certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!mintedTokenId) return;

    try {
      const certificateData: CertificateData = {
        studentName: formData.studentName,
        courseName: formData.courseName,
        grade: formData.grade,
        department: formData.department,
        issueDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        certificateId: mintedTokenId,
        verificationUrl: `${window.location.origin}/public-verify`,
        issuerName: formData.issuerName,
        issuerTitle: formData.issuerTitle,
        templateType: formData.templateType
      };

      const pdfBlob = await generateCertificatePDF(certificateData);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${mintedTokenId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF certificate');
    }
  };

  const getCertificateData = (): CertificateData => {
    return {
      studentName: formData.studentName || 'Student Name',
      courseName: formData.courseName || 'Course Name',
      grade: formData.grade || 'A+',
      department: formData.department || 'Department',
      issueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      certificateId: mintedTokenId || 'CERT-001',
      verificationUrl: `${window.location.origin}/public-verify`,
      issuerName: formData.issuerName,
      issuerTitle: formData.issuerTitle,
      templateType: formData.templateType
    };
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <Logo size="xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Wallet Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to issue certificates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Issue Certificate
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create and mint a new blockchain certificate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Certificate Details
            </h2>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-outline text-sm flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
          </div>

          {previewMode ? (
            <div className="space-y-6">
              {/* Certificate Preview */}
              <CertificatePreview
                data={getCertificateData()}
                onDownload={mintedTokenId ? downloadCertificate : undefined}
                onPreview={() => window.open(`/public-verify?certificateId=${mintedTokenId || 'CERT-001'}`, '_blank')}
              />

              {mintedTokenId && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        Certificate minted successfully!
                      </span>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      Token ID: {mintedTokenId}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={downloadCertificate}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => window.open(`/public-verify?certificateId=${mintedTokenId}`, '_blank')}
                      className="flex-1 btn-outline flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Verify</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Address */}
              <div>
                <label className="label">
                  <User className="w-4 h-4 inline mr-2" />
                  Student Wallet Address
                </label>
                <input
                  type="text"
                  name="studentAddress"
                  value={formData.studentAddress}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="0x..."
                  required
                />
              </div>

              {/* Course Name */}
              <div>
                <label className="label">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Course Name
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Computer Science Fundamentals"
                  required
                />
              </div>

              {/* Grade */}
              <div>
                <label className="label">
                  <Award className="w-4 h-4 inline mr-2" />
                  Grade
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>

              {/* Student Name */}
              <div>
                <label className="label">
                  <User className="w-4 h-4 inline mr-2" />
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Department */}
              <div>
                <label className="label">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Computer Science"
                  required
                />
              </div>

              {/* Certificate Template */}
              <div>
                <label className="label">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Certificate Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {certificateTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.templateType === template.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, templateType: template.id as any }))}
                    >
                      <div className="text-center">
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: template.borderColor }}
                        ></div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issuer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <User className="w-4 h-4 inline mr-2" />
                    Issuer Name
                  </label>
                  <input
                    type="text"
                    name="issuerName"
                    value={formData.issuerName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <Award className="w-4 h-4 inline mr-2" />
                    Issuer Title
                  </label>
                  <input
                    type="text"
                    name="issuerTitle"
                    value={formData.issuerTitle}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Head of Department"
                    required
                  />
                </div>
              </div>

              {/* IPFS Hash */}
              <div>
                <label className="label">
                  <Upload className="w-4 h-4 inline mr-2" />
                  IPFS Hash
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="ipfsHash"
                    value={formData.ipfsHash}
                    onChange={handleInputChange}
                    className="input flex-1"
                    placeholder="Qm..."
                    required
                  />
                  <button
                    type="button"
                    onClick={generateIPFSHash}
                    className="btn-secondary"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-red-800 dark:text-red-200">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-green-800 dark:text-green-200">{success}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Minting Certificate...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Mint Certificate</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How to Issue a Certificate
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Enter Student Details</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Provide the student's wallet address, course name, and grade.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Generate IPFS Hash</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create a unique hash for the certificate metadata.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Mint Certificate</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create the NFT certificate on the blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Download & Share</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Download the certificate and share the verification link.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Certificate Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Blockchain verification
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  QR code for instant verification
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Tamper-proof storage
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Global accessibility
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCertificate;
