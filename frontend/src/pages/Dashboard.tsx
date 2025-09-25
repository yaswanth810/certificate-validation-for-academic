import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Plus,
  Search,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
// import { useCertificates, useScholarships } from '../hooks/useContract'; // Disabled for demo
import Logo from '../components/Logo';
import { mockCertificates, mockStats } from '../data/mockCertificates';

const Dashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();
  // Use mock data for demo instead of fetching from contracts
  const certificates = mockCertificates;
  const certLoading = false;
  const certError = null;
  const scholarships: any[] = [];
  const scholarshipLoading = false;
  const scholarshipError = null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatEther = (wei: string) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <Logo size="xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Vignan Certificates
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Connect your wallet to view your certificates and manage your academic achievements on the blockchain.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>Secure blockchain verification</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <Award className="w-4 h-4" />
              <span>NFT-based certificates</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Instant verification</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your certificates and scholarships
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/issue" className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Issue Certificate</span>
          </Link>
          <Link to="/verify" className="btn-outline flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Verify Certificate</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">My Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockStats.totalCertificates}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockStats.averageGrade}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockStats.verificationRate}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Students Served</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockStats.totalStudentsServed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Certificates</h2>
          <Link to="/issue" className="btn-outline text-sm">
            Issue New Certificate
          </Link>
        </div>

        {certLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading certificates...</span>
          </div>
        ) : certError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">{certError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCertificates.map((certificate) => (
              <div key={certificate.tokenId} className="certificate-card bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Logo variant="vignan" size="sm" showText={false} />
                      <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                        Vignan Institute
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {certificate.courseName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {certificate.studentName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {certificate.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2">
                      Grade: {certificate.grade}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Token #{certificate.tokenId}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Issued: {formatDate(certificate.issueDate)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open(`/verify?tokenId=${certificate.tokenId}`, '_blank')}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(certificate.verificationUrl)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Share
                    </button>
                    <button 
                      onClick={() => window.open(`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CERTIFICATE_NFT_ADDRESS}?a=${certificate.tokenId}`, '_blank')}
                      className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scholarships Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Scholarships</h2>
          <Link to="/scholarships" className="btn-outline text-sm">
            View All
          </Link>
        </div>

        {scholarshipLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading scholarships...</span>
          </div>
        ) : scholarshipError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">{scholarshipError}</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No scholarships available
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You don't have any available scholarships at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scholarships.map((scholarship) => {
              const canClaim = scholarship.isActive && 
                new Date(scholarship.releaseTime * 1000) <= new Date() &&
                parseFloat(scholarship.remainingAmount) > 0;
              
              return (
                <div key={scholarship.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Scholarship #{scholarship.id}
                    </h3>
                    <span className={`status-badge ${
                      canClaim ? 'status-valid' : 'status-pending'
                    }`}>
                      {canClaim ? 'Available' : 'Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatEther(scholarship.totalAmount)} ETH
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatEther(scholarship.remainingAmount)} ETH
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Release Date:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(scholarship.releaseTime)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Eligible Students:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {scholarship.eligibleStudents?.length || 0}
                      </p>
                    </div>
                  </div>

                  {canClaim && (
                    <div className="mt-4">
                      <button className="btn-primary w-full">
                        Claim Scholarship
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
