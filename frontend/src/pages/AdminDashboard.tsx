import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Award, 
  TrendingUp,
  Download,
  AlertCircle,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useScholarship } from '../hooks/useScholarship';
import { useSemesterCertificate } from '../hooks/useSemesterCertificate';
import { useWeb3 } from '../contexts/Web3Context';
// import { useTokens } from '../hooks/useTokens';
import { CreateScholarshipForm, ScholarshipStats } from '../types/scholarship';
import ScholarshipCard from '../components/ScholarshipCard';
// import TokenSelector from '../components/TokenSelector';
// import RoleManager from '../components/RoleManager';
import SemesterCertificateForm from '../components/SemesterCertificateForm';
import LegacyCertificateUploader from '../components/LegacyCertificateUploader';
// import SemesterCertificate from '../components/SemesterCertificate';

const AdminDashboard: React.FC = () => {
  const { isConnected } = useWeb3();
  const { 
    scholarships, 
    createScholarship, 
    getScholarshipStats
  } = useScholarship();
  // const { getSemesterCertificate } = useSemesterCertificate();

  // Available options for form dropdowns
  const availableCertificates = [
    'Computer Science Fundamentals',
    'Data Structures and Algorithms',
    'Web Development',
    'Machine Learning',
    'Database Management',
    'Software Engineering',
    'Cybersecurity',
    'Mobile App Development',
    'Cloud Computing',
    'Artificial Intelligence'
  ];

  const availableDepartments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Mathematics',
    'Physics'
  ];

  const [activeTab, setActiveTab] = useState<'overview' | 'certificates'>('overview');
  const [stats, setStats] = useState<ScholarshipStats | null>(null);
  const [creating, setCreating] = useState(false);
  // const [selectedToken, setSelectedToken] = useState<TokenInfo | undefined>(undefined);
  const [formData, setFormData] = useState<CreateScholarshipForm>({
    name: '',
    description: '',
    amount: '',
    tokenAddress: '',
    tokenSymbol: 'ETH',
    maxRecipients: 10,
    deadline: '',
    minGPA: 0,
    requiredCertificates: [],
    departments: [],
    minEnrollmentDate: '',
    maxEnrollmentDate: '',
    courseCompletionRequired: false,
    customCriteria: ''
  });

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const scholarshipStats = await getScholarshipStats();
        setStats(scholarshipStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (scholarships.length > 0) {
      fetchStats();
    }
  }, [scholarships, getScholarshipStats]);

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.deadline) return;

    try {
      setCreating(true);
      await createScholarship(formData);
      setActiveTab('overview');
      setFormData({
        name: '',
        description: '',
        amount: '',
        tokenAddress: '',
        tokenSymbol: 'ETH',
        maxRecipients: 10,
        deadline: '',
        minGPA: 0,
        requiredCertificates: [],
        departments: [],
        minEnrollmentDate: '',
        maxEnrollmentDate: '',
        courseCompletionRequired: false,
        customCriteria: ''
      });
    } catch (error) {
      console.error('Error creating scholarship:', error);
    } finally {
      setCreating(false);
    }
  };


  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your admin wallet to access the dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage certificates and monitor platform activity
            </p>
          </div>
          <Link
            to="/verify-semester"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Verify Semester
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'certificates', label: 'Semester Certificates', icon: GraduationCap }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Scholarships</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalScholarships || scholarships.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Recipients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalRecipients || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Funds Distributed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats ? `${parseFloat(ethers.formatEther(stats.totalFundsClaimed)).toFixed(2)} ETH` : '0 ETH'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Programs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.activeScholarships || scholarships.filter(s => s.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Scholarships */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Scholarships
                </h3>
              </div>
              <div className="p-6">
                {scholarships.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No scholarships created yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {scholarships.slice(0, 4).map((scholarship) => (
                      <ScholarshipCard
                        key={scholarship.id}
                        scholarship={scholarship}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Scholarship Tab - removed */}
        {false && (activeTab as any) === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create New Scholarship
              </h2>

              <form onSubmit={handleCreateScholarship} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Scholarship Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Excellence in Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (ETH) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the scholarship purpose and criteria..."
                  />
                </div>

                {/* Eligibility Criteria */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Eligibility Criteria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum GPA
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={formData.minGPA}
                        onChange={(e) => setFormData({ ...formData, minGPA: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="3.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Recipients
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxRecipients}
                        onChange={(e) => setFormData({ ...formData, maxRecipients: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Required Certificates
                      </label>
                      <select
                        multiple
                        value={formData.requiredCertificates}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, requiredCertificates: selected });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-32"
                      >
                        {availableCertificates.map(cert => (
                          <option key={cert} value={cert}>{cert}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Allowed Departments
                      </label>
                      <select
                        multiple
                        value={formData.departments}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, departments: selected });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-32"
                      >
                        {availableDepartments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Enrollment Date
                      </label>
                      <input
                        type="date"
                        value={formData.minEnrollmentDate}
                        onChange={(e) => setFormData({ ...formData, minEnrollmentDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Enrollment Date
                      </label>
                      <input
                        type="date"
                        value={formData.maxEnrollmentDate}
                        onChange={(e) => setFormData({ ...formData, maxEnrollmentDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.courseCompletionRequired}
                        onChange={(e) => setFormData({ ...formData, courseCompletionRequired: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Require completion of all specified certificates
                      </span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                      <span>Create Scholarship</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Role Management Tab - removed */}
        {false && (activeTab as any) === 'roles' && (
          <div className="max-w-4xl mx-auto">Roles</div>
        )}

        {/* Manage Scholarships Tab - removed */}
        {false && (activeTab as any) === 'manage' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Manage Scholarships
                  </h2>
                  <button className="btn-outline flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {scholarships.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      No scholarships created yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create your first scholarship to get started
                    </p>
                    <button onClick={() => setActiveTab('overview')} className="btn-primary mx-auto">
                      Go to Overview
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scholarships.map((scholarship) => (
                      <ScholarshipCard
                        key={scholarship.id}
                        scholarship={scholarship}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Semester Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Semester Certificate Management
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Issue and manage official Vignan Institute semester certificates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SemesterCertificateForm 
                    onSuccess={(tokenId) => {
                      console.log('Certificate issued with token ID:', tokenId);
                    }}
                  />
                </div>
                <div>
                  <LegacyCertificateUploader />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
