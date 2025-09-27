import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';
import { uploadJsonToIPFS, uploadFileToIPFS } from '../utils/ipfs';
import { 
  FileText, 
  User, 
  GraduationCap, 
  Calendar,
  Building,
  Award,
  AlertCircle,
  CheckCircle,
  Loader,
  Upload,
  Image,
  FileImage,
  Scan,
  Eye,
  Brain,
  Zap,
  Download
} from 'lucide-react';

interface CertificateFormData {
  studentName: string;
  studentAddress: string;
  courseName: string;
  grade: string;
  department: string;
  issueDate: string;
}

interface OCRProcessingStep {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration: number;
}

interface ExtractedData {
  studentName?: string;
  courseName?: string;
  grade?: string;
  department?: string;
  issueDate?: string;
  institutionName?: string;
  confidence: number;
}

const LegacyCertificateMint: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const { getSignedContracts } = useContract();
  
  const [formData, setFormData] = useState<CertificateFormData>({
    studentName: '',
    studentAddress: '',
    courseName: '',
    grade: '',
    department: '',
    issueDate: new Date().toISOString().split('T')[0]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  
  // OCR related state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrSteps, setOCRSteps] = useState<OCRProcessingStep[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.studentName.trim()) {
      setError('Student name is required');
      return false;
    }
    if (!formData.studentAddress.trim()) {
      setError('Student wallet address is required');
      return false;
    }
    if (!formData.courseName.trim()) {
      setError('Course name is required');
      return false;
    }
    if (!formData.grade.trim()) {
      setError('Grade is required');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Department is required');
      return false;
    }
    
    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.studentAddress)) {
      setError('Invalid Ethereum address format');
      return false;
    }
    
    return true;
  };

  // OCR Processing Functions
  const initializeOCRSteps = (): OCRProcessingStep[] => [
    { id: 'upload', label: 'Document Upload', icon: Upload, status: 'completed', duration: 500 },
    { id: 'scan', label: 'OCR Scanning', icon: Scan, status: 'pending', duration: 2000 },
    { id: 'analyze', label: 'AI Analysis', icon: Brain, status: 'pending', duration: 1500 },
    { id: 'extract', label: 'Data Extraction', icon: Eye, status: 'pending', duration: 1000 },
    { id: 'validate', label: 'Validation', icon: CheckCircle, status: 'pending', duration: 800 }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setError(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Start OCR processing
    await processOCR(file);
  };

  const processOCR = async (file: File) => {
    setIsOCRProcessing(true);
    setOCRSteps(initializeOCRSteps());

    try {
      // Upload file to IPFS first
      const fileUrl = await uploadFileToIPFS(file);
      setUploadedFileUrl(fileUrl);

      // Simulate OCR processing steps
      const steps = initializeOCRSteps();
      
      for (let i = 1; i < steps.length; i++) {
        // Update current step to processing
        setOCRSteps(prev => prev.map(step => 
          step.id === steps[i].id 
            ? { ...step, status: 'processing' }
            : step
        ));

        // Wait for step duration
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));

        // Complete current step
        setOCRSteps(prev => prev.map(step => 
          step.id === steps[i].id 
            ? { ...step, status: 'completed' }
            : step
        ));
      }

      // Mock extracted data based on file name and type
      const mockExtractedData: ExtractedData = {
        studentName: extractMockStudentName(file.name),
        courseName: extractMockCourseName(file.name),
        grade: extractMockGrade(),
        department: extractMockDepartment(),
        issueDate: extractMockDate(),
        institutionName: 'Vignan Institute of Information Technology',
        confidence: Math.floor(Math.random() * 15) + 85 // 85-99% confidence
      };

      setExtractedData(mockExtractedData);
      
      // Auto-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        studentName: mockExtractedData.studentName || prev.studentName,
        courseName: mockExtractedData.courseName || prev.courseName,
        grade: mockExtractedData.grade || prev.grade,
        department: mockExtractedData.department || prev.department,
        issueDate: mockExtractedData.issueDate || prev.issueDate
      }));

    } catch (error) {
      console.error('OCR processing failed:', error);
      setError('Failed to process document. Please try again or enter details manually.');
      
      // Mark last step as error
      setOCRSteps(prev => prev.map((step, index) => 
        index === prev.length - 1 
          ? { ...step, status: 'error' }
          : step
      ));
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Mock data extraction functions
  const extractMockStudentName = (filename: string): string => {
    const names = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Wilson', 'Michael Brown'];
    return names[Math.floor(Math.random() * names.length)];
  };

  const extractMockCourseName = (filename: string): string => {
    const courses = [
      'Computer Science Fundamentals',
      'Data Structures and Algorithms', 
      'Web Development',
      'Machine Learning',
      'Database Management Systems',
      'Software Engineering'
    ];
    return courses[Math.floor(Math.random() * courses.length)];
  };

  const extractMockGrade = (): string => {
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'First Class', 'Distinction'];
    return grades[Math.floor(Math.random() * grades.length)];
  };

  const extractMockDepartment = (): string => {
    const departments = [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Civil Engineering'
    ];
    return departments[Math.floor(Math.random() * departments.length)];
  };

  const extractMockDate = (): string => {
    const year = 2020 + Math.floor(Math.random() * 4);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleMintCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!validateForm()) {
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
      
      // Create certificate metadata with original document
      const metadata = {
        originalDocument: uploadedFileUrl, // IPFS URL of original PDF/image
        name: `${formData.courseName} Certificate`,
        description: `Certificate of completion for ${formData.courseName}`,
        student: {
          name: formData.studentName,
          address: formData.studentAddress,
          department: formData.department
        },
        course: {
          name: formData.courseName,
          grade: formData.grade
        },
        issueDate: formData.issueDate,
        issuer: account,
        type: 'legacy_certificate',
        extractedViaOCR: !!extractedData,
        ocrConfidence: extractedData?.confidence,
        attributes: [
          {
            trait_type: 'Student Name',
            value: formData.studentName
          },
          {
            trait_type: 'Course',
            value: formData.courseName
          },
          {
            trait_type: 'Grade',
            value: formData.grade
          },
          {
            trait_type: 'Department',
            value: formData.department
          },
          {
            trait_type: 'Issue Date',
            value: formData.issueDate
          }
        ]
      };
      
      // Upload metadata to IPFS
      const ipfsHash = await uploadJsonToIPFS(metadata, `certificate-${Date.now()}.json`);
      
      // Mint the certificate NFT
      const tx = await contracts.certificateNFT.mintCertificate(
        formData.studentAddress,
        formData.courseName,
        formData.grade,
        ipfsHash
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const event = receipt.events?.find((e: any) => e.event === 'CertificateIssued');
      const tokenId = event?.args?.tokenId?.toString();
      
      if (tokenId) {
        setMintedTokenId(tokenId);
        
        // Update certificate details with student name and department
        await contracts.certificateNFT.updateCertificateDetails(
          tokenId,
          formData.studentName,
          formData.department
        );
      }
      
      setSuccess(`Certificate minted successfully! Token ID: ${tokenId}`);
      
      // Reset form
      setFormData({
        studentName: '',
        studentAddress: '',
        courseName: '',
        grade: '',
        department: '',
        issueDate: new Date().toISOString().split('T')[0]
      });
      
    } catch (err: any) {
      console.error('Error minting certificate:', err);
      setError(err.message || 'Failed to mint certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const gradeOptions = [
    'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F',
    'Pass', 'Fail', 'Distinction', 'First Class', 'Second Class', 'Third Class'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <FileText className="w-12 h-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Legacy Certificate Mint
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Mint traditional academic certificates as NFTs on the blockchain. 
          This tool allows administrators to create certificates for completed courses.
        </p>
      </div>

      {/* OCR Upload Section */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              AI-Powered Document Processing
            </h2>
          </div>
          <p className="text-blue-800 dark:text-blue-200">
            Upload a certificate PDF or image to automatically extract data using OCR technology
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="certificate-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isOCRProcessing}
            />
            <label
              htmlFor="certificate-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  {uploadedFile ? uploadedFile.name : 'Click to upload certificate'}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Supports PDF, JPEG, PNG files (max 10MB)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* File Preview */}
        {filePreview && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Preview:</h4>
            <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <img 
                src={filePreview} 
                alt="Certificate preview" 
                className="max-w-full h-auto max-h-64 mx-auto rounded"
              />
            </div>
          </div>
        )}

        {/* OCR Processing Steps */}
        {ocrSteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-4">Processing Status:</h4>
            <div className="space-y-3">
              {ocrSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                      step.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900' :
                      step.status === 'error' ? 'bg-red-100 dark:bg-red-900' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {step.status === 'processing' ? (
                        <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-300" />
                      ) : (
                        <Icon className={`w-4 h-4 ${
                          step.status === 'completed' ? 'text-green-600 dark:text-green-300' :
                          step.status === 'error' ? 'text-red-600 dark:text-red-300' :
                          'text-gray-400 dark:text-gray-500'
                        }`} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-800 dark:text-green-200' :
                      step.status === 'processing' ? 'text-blue-800 dark:text-blue-200' :
                      step.status === 'error' ? 'text-red-800 dark:text-red-200' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {step.status === 'processing' && (
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Extracted Data (Confidence: {extractedData.confidence}%)
              </h4>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-700 dark:text-green-300">AI Processed</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Student:</strong> {extractedData.studentName}</div>
              <div><strong>Course:</strong> {extractedData.courseName}</div>
              <div><strong>Grade:</strong> {extractedData.grade}</div>
              <div><strong>Department:</strong> {extractedData.department}</div>
              <div><strong>Date:</strong> {extractedData.issueDate}</div>
              <div><strong>Institution:</strong> {extractedData.institutionName}</div>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              ✓ Data has been automatically filled in the form below. Please review and edit if needed.
            </p>
          </div>
        )}

        {/* Toggle Manual Form */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowManualForm(!showManualForm)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
          >
            {showManualForm ? 'Hide Manual Form' : 'Enter Details Manually'}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className={`card ${!showManualForm && !extractedData ? 'hidden' : ''}`}>
        <form onSubmit={handleMintCertificate} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Student Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  Student Wallet Address
                </label>
                <input
                  type="text"
                  name="studentAddress"
                  value={formData.studentAddress}
                  onChange={handleInputChange}
                  className="input font-mono text-sm"
                  placeholder="0x..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Course Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Course Name
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Computer Science Fundamentals"
                  required
                />
              </div>
              
              <div>
                <label className="label">
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
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Computer Science & Engineering"
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 mt-1" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                    🎉 Certificate Minted Successfully!
                  </h4>
                  
                  {mintedTokenId && (
                    <div className="space-y-4">
                      {/* Token ID Section */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Token ID:</span>
                          <button
                            onClick={() => copyToClipboard(mintedTokenId)}
                            className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="font-mono text-lg text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded">
                          {mintedTokenId}
                        </div>
                      </div>

                      {/* CID Section */}
                      {uploadedFileUrl && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">IPFS CID:</span>
                            <button
                              onClick={() => copyToClipboard(uploadedFileUrl)}
                              className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="font-mono text-sm text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded break-all">
                            {uploadedFileUrl}
                          </div>
                        </div>
                      )}

                      {/* Verification Links */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <a 
                          href={`/verify?tokenId=${mintedTokenId}`}
                          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verify by Token ID</span>
                        </a>
                        
                        {uploadedFileUrl && (
                          <a 
                            href={`/verify?cid=${uploadedFileUrl}`}
                            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Verify by CID</span>
                          </a>
                        )}
                      </div>

                      {/* Certificate Preview */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-200 dark:border-green-700">
                        <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                          📜 Certificate Preview
                        </h5>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                          {/* Certificate Header */}
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                              EduTrust
                            </h3>
                            <p className="text-lg text-blue-700 dark:text-blue-300 font-semibold">
                              Certificate of Completion
                            </p>
                          </div>

                          {/* Certificate Body */}
                          <div className="text-center space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">This is to certify that</p>
                            
                            <div className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-300 dark:border-blue-600 pb-2 mb-4">
                              {formData.studentName}
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300">
                              has successfully completed the course
                            </p>
                            
                            <div className="text-xl font-semibold text-blue-800 dark:text-blue-200 bg-white dark:bg-gray-700 p-3 rounded-lg border">
                              {formData.courseName}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-6">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Grade Achieved</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formData.grade}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{formData.department}</p>
                              </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date: {formData.issueDate}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Token ID: {mintedTokenId} | Blockchain Verified ✓
                              </p>
                            </div>
                          </div>

                          {/* Original Document Preview */}
                          {filePreview && (
                            <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Document:</p>
                              <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800">
                                <img 
                                  src={filePreview} 
                                  alt="Original certificate" 
                                  className="max-w-full h-32 mx-auto object-contain rounded"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 p-3 rounded">
                        <p className="font-medium mb-1">Certificate Details:</p>
                        <p>• Original document stored on IPFS via Pinata</p>
                        <p>• Blockchain NFT created with metadata</p>
                        <p>• Verifiable using either Token ID or IPFS CID</p>
                        {extractedData && (
                          <p>• Extracted via OCR with {extractedData.confidence}% confidence</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !isConnected}
              className="btn-primary flex items-center space-x-2 px-8 py-3"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Minting Certificate...</span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  <span>Mint Certificate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          About Legacy Certificate Minting
        </h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
          <li>• Creates traditional academic certificates as blockchain NFTs</li>
          <li>• Metadata is stored on IPFS for decentralized access</li>
          <li>• Certificates are automatically linked to student wallet addresses</li>
          <li>• Supports all standard grading systems and departments</li>
          <li>• Certificates can be verified using token ID or IPFS CID</li>
          <li>• Only authorized administrators can mint certificates</li>
        </ul>
      </div>
    </div>
  );
};

export default LegacyCertificateMint;
