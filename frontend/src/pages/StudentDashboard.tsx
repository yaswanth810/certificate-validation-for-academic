import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useCertificates, useScholarships } from '../hooks/useContract';
import { useSemesterCertificate } from '../hooks/useSemesterCertificate';
import { formatDate, formatEther } from '../utils/web3';
import { FileText, Award, GraduationCap, User, Calendar, BookOpen } from 'lucide-react';
import SemesterCertificate from '../components/SemesterCertificate';

const StudentDashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { certificates, loading: certLoading, error: certError } = useCertificates(account || '');
  const { scholarships, loading: scholarshipLoading, error: scholarshipError } = useScholarships(account || '');
  const { getStudentSemesterCertificates, getSemesterCertificate } = useSemesterCertificate();
  
  const [activeTab, setActiveTab] = useState<'regular' | 'semester'>('regular');
  const [semesterCertificates, setSemesterCertificates] = useState<any[]>([]);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [selectedSemesterCert, setSelectedSemesterCert] = useState<any>(null);

  // Fetch semester certificates
  useEffect(() => {
    const fetchSemesterCertificates = async () => {
      if (!account || !isConnected) return;

      setSemesterLoading(true);
      try {
        const tokenIds = await getStudentSemesterCertificates(account);
        const certificates = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const cert = await getSemesterCertificate(tokenId);
            return { ...cert, tokenId };
          })
        );
        setSemesterCertificates(certificates.filter(cert => cert !== null));
      } catch (error) {
        console.error('Error fetching semester certificates:', error);
      } finally {
        setSemesterLoading(false);
      }
    };

    fetchSemesterCertificates();
  }, [account, isConnected, getStudentSemesterCertificates, getSemesterCertificate]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to view your certificates and student information.</p>
        </div>
      </div>
    );
  }

  const isLoading = certLoading || scholarshipLoading || semesterLoading;
  const hasError = certError || scholarshipError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">There was an error loading your student information. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Student Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back! View your certificates and academic records.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Address</p>
              <p className="text-lg font-mono text-gray-900 dark:text-white">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Regular Certificates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{certificates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Semester Certificates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{semesterCertificates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Scholarships</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{scholarships.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('regular')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'regular'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Regular Certificates</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('semester')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'semester'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Semester Certificates</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'regular' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Regular Certificates</h2>
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No regular certificates found.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <div key={certificate.tokenId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{certificate.courseName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Token ID: {certificate.tokenId}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            certificate.isValid 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {certificate.isValid ? 'Valid' : 'Invalid'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Grade:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{certificate.grade}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Department:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{certificate.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Issue Date:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(certificate.issueDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'semester' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Semester Certificates</h2>
                {semesterCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No semester certificates found.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {semesterCertificates.map((certificate) => (
                      <div key={certificate.tokenId} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {certificate.studentName} - {certificate.examination}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="flex items-center">
                                  <BookOpen className="w-4 h-4 mr-1" />
                                  {certificate.branch}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {certificate.monthYearExams}
                                </span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  SGPA: {(certificate.sgpa / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Token ID</p>
                              <p className="text-lg font-mono text-gray-900 dark:text-white">{certificate.tokenId}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-white">Certificate Details</h4>
                            <button
                              onClick={() => setSelectedSemesterCert(certificate)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Full Certificate
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Serial No:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{certificate.serialNo}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Memo No:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{certificate.memoNo}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Reg No:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{certificate.regdNo}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Total Credits:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{certificate.totalCredits}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scholarships Section */}
        {scholarships.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Scholarships</h2>
            <div className="space-y-4">
              {scholarships.map((scholarship, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{scholarship.description}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scholarship.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {scholarship.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">{formatEther(scholarship.totalAmount)} ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Claimed:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">{formatEther(scholarship.claimedAmount)} ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">{formatEther(scholarship.remainingAmount)} ETH</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Semester Certificate Modal */}
        {selectedSemesterCert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Semester Certificate</h3>
                  <button
                    onClick={() => setSelectedSemesterCert(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <SemesterCertificate 
                  certificate={selectedSemesterCert}
                  tokenId={selectedSemesterCert.tokenId}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
