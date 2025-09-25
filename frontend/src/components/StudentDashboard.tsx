import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useStudentData, useCertificates, useScholarships } from '../hooks/useContract';
import { useSemesterCertificate } from '../hooks/useSemesterCertificate';
import { formatAddress, formatDate, formatEther } from '../utils/web3';
import QRGenerator from './QRGenerator';
import SemesterCertificate from './SemesterCertificate';

const StudentDashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { studentData, loading: studentLoading, error: studentError } = useStudentData(account || '');
  const { certificates, loading: certLoading, error: certError } = useCertificates(account || '');
  const { scholarships, loading: scholarshipLoading, error: scholarshipError } = useScholarships(account || '');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view your certificates and student information.</p>
        </div>
      </div>
    );
  }

  if (studentLoading || certLoading || scholarshipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (studentError || certError || scholarshipError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">There was an error loading your student information. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Registered</h2>
          <p className="text-gray-600">Your wallet address is not registered as a student. Please contact the administration.</p>
        </div>
      </div>
    );
  }

  const handleGenerateQR = (certificate: any) => {
    setSelectedCertificate(certificate);
    setShowQR(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {studentData.name}!</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="text-lg font-semibold text-gray-900">{studentData.studentNumber}</p>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{studentData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{studentData.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="text-lg font-semibold text-gray-900">{studentData.program}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollment Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(studentData.enrollmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`status-badge ${studentData.isGraduated ? 'status-valid' : 'status-pending'}`}>
                    {studentData.isGraduated ? 'Graduated' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Certificates</span>
                <span className="text-2xl font-bold text-blue-600">{certificates.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Scholarships</span>
                <span className="text-2xl font-bold text-green-600">{scholarships.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Disbursed</span>
                <span className="text-2xl font-bold text-purple-600">
                  {scholarships.reduce((sum, s) => sum + parseFloat(formatEther(s.disbursedAmount)), 0).toFixed(4)} ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Certificates</h2>
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600">No certificates found. Complete courses to earn certificates.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div key={certificate.tokenId} className="certificate-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{certificate.courseName}</h3>
                      <p className="text-sm text-gray-600">{certificate.certificateType}</p>
                    </div>
                    <span className={`status-badge ${certificate.isValid ? 'status-valid' : 'status-invalid'}`}>
                      {certificate.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Grade:</span>
                      <span className="text-sm font-semibold text-gray-900">{certificate.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Issue Date:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatDate(certificate.issueDate)}</span>
                    </div>
                    {certificate.expiryDate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Expiry Date:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatDate(certificate.expiryDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateQR(certificate)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Generate QR
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(certificate.verificationHash)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Copy Hash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scholarships Section */}
        {scholarships.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Scholarships</h2>
            <div className="space-y-4">
              {scholarships.map((scholarship, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{scholarship.description}</h3>
                    <span className={`status-badge ${scholarship.isActive ? 'status-valid' : 'status-invalid'}`}>
                      {scholarship.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="ml-2 font-semibold">{formatEther(scholarship.totalAmount)} ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Disbursed:</span>
                      <span className="ml-2 font-semibold">{formatEther(scholarship.disbursedAmount)} ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining:</span>
                      <span className="ml-2 font-semibold">{formatEther(scholarship.remainingAmount)} ETH</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQR && selectedCertificate && (
          <QRGenerator
            certificate={selectedCertificate}
            onClose={() => setShowQR(false)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
