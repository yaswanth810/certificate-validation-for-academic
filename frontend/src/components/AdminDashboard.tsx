import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';
import { formatAddress, formatEther } from '../utils/web3';

const AdminDashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { getSignedContracts } = useContract();
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    studentAddress: '',
    studentNumber: '',
    name: '',
    email: '',
    department: '',
    program: ''
  });

  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    credits: '',
    department: ''
  });

  const [certificateForm, setCertificateForm] = useState({
    studentAddress: '',
    studentId: '',
    studentName: '',
    courseName: '',
    certificateType: '',
    grade: '',
    expiryDate: ''
  });

  const [scholarshipForm, setScholarshipForm] = useState({
    studentAddress: '',
    amount: '',
    description: '',
    disbursementSchedule: ''
  });

  const handleStudentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contracts = getSignedContracts();
      if (!contracts?.vignanRegistry) throw new Error('Contract not available');

      const tx = await contracts.vignanRegistry.registerStudent(
        studentForm.studentAddress,
        studentForm.studentNumber,
        studentForm.name,
        studentForm.email,
        studentForm.department,
        studentForm.program
      );

      await tx.wait();
      setSuccess('Student registered successfully!');
      setStudentForm({
        studentAddress: '',
        studentNumber: '',
        name: '',
        email: '',
        department: '',
        program: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contracts = getSignedContracts();
      if (!contracts?.vignanRegistry) throw new Error('Contract not available');

      const tx = await contracts.vignanRegistry.createCourse(
        courseForm.courseCode,
        courseForm.courseName,
        courseForm.description,
        parseInt(courseForm.credits),
        courseForm.department
      );

      await tx.wait();
      setSuccess('Course created successfully!');
      setCourseForm({
        courseCode: '',
        courseName: '',
        description: '',
        credits: '',
        department: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateMinting = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contracts = getSignedContracts();
      if (!contracts?.certificateNFT) throw new Error('Contract not available');

      const verificationHash = `0x${Math.random().toString(16).substr(2, 8)}${Date.now().toString(16)}`;
      const expiryDate = certificateForm.expiryDate ? Math.floor(new Date(certificateForm.expiryDate).getTime() / 1000) : 0;

      const tx = await contracts.certificateNFT.mintCertificate(
        certificateForm.studentAddress,
        certificateForm.studentId,
        certificateForm.studentName,
        certificateForm.courseName,
        certificateForm.certificateType,
        certificateForm.grade,
        expiryDate,
        verificationHash
      );

      await tx.wait();
      setSuccess('Certificate minted successfully!');
      setCertificateForm({
        studentAddress: '',
        studentId: '',
        studentName: '',
        courseName: '',
        certificateType: '',
        grade: '',
        expiryDate: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to mint certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleScholarshipCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contracts = getSignedContracts();
      if (!contracts?.scholarshipEscrow) throw new Error('Contract not available');

      const amount = formatEther(parseFloat(scholarshipForm.amount).toString());
      const disbursementSchedule = parseInt(scholarshipForm.disbursementSchedule) * 24 * 60 * 60; // Convert days to seconds

      const tx = await contracts.scholarshipEscrow.createScholarship(
        scholarshipForm.studentAddress,
        amount,
        scholarshipForm.description,
        disbursementSchedule
      );

      await tx.wait();
      setSuccess('Scholarship created successfully!');
      setScholarshipForm({
        studentAddress: '',
        amount: '',
        description: '',
        disbursementSchedule: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create scholarship');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600">Please connect your wallet to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage students, courses, certificates, and scholarships</p>
          <p className="text-sm text-gray-500 mt-2">Connected as: {formatAddress(account!)}</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'students', label: 'Student Management' },
                { id: 'courses', label: 'Course Management' },
                { id: 'certificates', label: 'Certificate Management' },
                { id: 'scholarships', label: 'Scholarship Management' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Student Management */}
            {activeTab === 'students' && (
              <form onSubmit={handleStudentRegistration} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Student</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Address
                    </label>
                    <input
                      type="text"
                      value={studentForm.studentAddress}
                      onChange={(e) => setStudentForm({ ...studentForm, studentAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Number
                    </label>
                    <input
                      type="text"
                      value={studentForm.studentNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, studentNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="V2023001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john.doe@vignan.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program
                    </label>
                    <input
                      type="text"
                      value={studentForm.program}
                      onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="B.Tech CSE"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register Student'}
                </button>
              </form>
            )}

            {/* Course Management */}
            {activeTab === 'courses' && (
              <form onSubmit={handleCourseCreation} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Course</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={courseForm.courseCode}
                      onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CS101"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={courseForm.courseName}
                      onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Introduction to Computer Science"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Course description..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={courseForm.credits}
                      onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={courseForm.department}
                      onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </form>
            )}

            {/* Certificate Management */}
            {activeTab === 'certificates' && (
              <form onSubmit={handleCertificateMinting} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mint Certificate</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Address
                    </label>
                    <input
                      type="text"
                      value={certificateForm.studentAddress}
                      onChange={(e) => setCertificateForm({ ...certificateForm, studentAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={certificateForm.studentId}
                      onChange={(e) => setCertificateForm({ ...certificateForm, studentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="V2023001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={certificateForm.studentName}
                      onChange={(e) => setCertificateForm({ ...certificateForm, studentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={certificateForm.courseName}
                      onChange={(e) => setCertificateForm({ ...certificateForm, courseName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="B.Tech Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Type
                    </label>
                    <select
                      value={certificateForm.certificateType}
                      onChange={(e) => setCertificateForm({ ...certificateForm, certificateType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Degree">Degree</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Achievement">Achievement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={certificateForm.grade}
                      onChange={(e) => setCertificateForm({ ...certificateForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="A+"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={certificateForm.expiryDate}
                      onChange={(e) => setCertificateForm({ ...certificateForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Minting...' : 'Mint Certificate'}
                </button>
              </form>
            )}

            {/* Scholarship Management */}
            {activeTab === 'scholarships' && (
              <form onSubmit={handleScholarshipCreation} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Scholarship</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Address
                    </label>
                    <input
                      type="text"
                      value={scholarshipForm.studentAddress}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, studentAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={scholarshipForm.amount}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5.0"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={scholarshipForm.description}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Merit Scholarship"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disbursement Schedule (Days)
                    </label>
                    <input
                      type="number"
                      value={scholarshipForm.disbursementSchedule}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, disbursementSchedule: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Scholarship'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
