import React, { useState } from 'react';
import { Plus, Minus, User, GraduationCap, FileText, Calendar } from 'lucide-react';
import { useSemesterCertificate } from '../hooks/useSemesterCertificate';
import { downloadSemesterCertificatePDF } from '../utils/certificateGenerator';

interface Course {
  courseCode: string;
  courseTitle: string;
  gradeSecured: string;
  gradePoints: number;
  status: string;
  creditsObtained: number;
}

interface SemesterCertificateFormProps {
  onSuccess?: (tokenId: string) => void;
  onCancel?: () => void;
}

const SemesterCertificateForm: React.FC<SemesterCertificateFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { mintSemesterCertificate, loading } = useSemesterCertificate();
  
  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    serialNo: '',
    memoNo: '',
    regdNo: '',
    branch: '',
    examination: '',
    monthYearExams: '',
    aadharNo: '',
    studentPhoto: '',
    mediumOfInstruction: 'English',
    totalCredits: 0
  });

  const [courses, setCourses] = useState<Course[]>([
    {
      courseCode: '',
      courseTitle: '',
      gradeSecured: '',
      gradePoints: 0,
      status: 'P',
      creditsObtained: 0
    }
  ]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Grade to points mapping (Vignan Institute grading system)
  const gradeToPoints: { [key: string]: number } = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'F': 0
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string | number) => {
    setCourses(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };

      // Auto-calculate grade points when grade is selected
      if (field === 'gradeSecured' && typeof value === 'string') {
        updated[index].gradePoints = gradeToPoints[value] || 0;
      }

      return updated;
    });
  };

  const addCourse = () => {
    setCourses(prev => [...prev, {
      courseCode: '',
      courseTitle: '',
      gradeSecured: '',
      gradePoints: 0,
      status: 'P',
      creditsObtained: 0
    }]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      setCourses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotalCredits = () => {
    return courses.reduce((total, course) => {
      return course.status === 'P' ? total + course.creditsObtained : total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.studentAddress || !formData.studentName || !formData.serialNo || !formData.memoNo) {
        throw new Error('Please fill in all required fields');
      }

      if (courses.some(course => !course.courseCode || !course.courseTitle || !course.gradeSecured)) {
        throw new Error('Please complete all course information');
      }

      const totalCredits = calculateTotalCredits();

      const certData = {
        studentName: formData.studentName,
        serialNo: formData.serialNo,
        memoNo: formData.memoNo,
        regdNo: formData.regdNo,
        branch: formData.branch,
        examination: formData.examination,
        monthYearExams: formData.monthYearExams,
        aadharNo: formData.aadharNo,
        studentPhoto: formData.studentPhoto,
        courses: courses,
        totalCredits: totalCredits,
        mediumOfInstruction: formData.mediumOfInstruction
      };

      const result = await mintSemesterCertificate(
        formData.studentAddress,
        formData.serialNo,
        formData.memoNo,
        certData
      );

      setSuccess(`Semester certificate minted successfully! Token ID: ${result.tokenId}`);
      
      if (onSuccess && result.tokenId) {
        onSuccess(result.tokenId);
      }

      // Auto-download PDF after successful mint
      if (result.tokenId) {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        await downloadSemesterCertificatePDF({
          tokenId: String(result.tokenId),
          studentName: formData.studentName,
          serialNo: formData.serialNo,
          memoNo: formData.memoNo,
          regdNo: formData.regdNo,
          branch: formData.branch,
          examination: formData.examination,
          monthYearExams: formData.monthYearExams,
          aadharNo: formData.aadharNo,
          studentPhoto: formData.studentPhoto,
          courses: courses.map(c => ({
            courseCode: c.courseCode,
            courseTitle: c.courseTitle,
            gradeSecured: c.gradeSecured,
            gradePoints: Math.round((c.gradePoints || 0) * 100),
            status: c.status,
            creditsObtained: c.creditsObtained
          })),
          totalCredits: calculateTotalCredits(),
          sgpa: 0,
          mediumOfInstruction: formData.mediumOfInstruction,
          issueDate: Math.floor(Date.now() / 1000),
          issuer: '',
          verificationUrl: `${base}/semester-verify?tokenId=${result.tokenId}`
        });
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <GraduationCap className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Issue Semester Certificate</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Student Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Wallet Address *
              </label>
              <input
                type="text"
                name="studentAddress"
                value={formData.studentAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                name="regdNo"
                value={formData.regdNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="19L31A1957"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhar Number
              </label>
              <input
                type="text"
                name="aadharNo"
                value={formData.aadharNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234 5678 9012"
              />
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Certificate Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="119719044"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memo Number *
              </label>
              <input
                type="text"
                name="memoNo"
                value={formData.memoNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="V 011419"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Electronics and Computer Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Examination
              </label>
              <input
                type="text"
                name="examination"
                value={formData.examination}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="IV B.Tech I Semester (VR19) Reg."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month & Year of Exams
              </label>
              <input
                type="text"
                name="monthYearExams"
                value={formData.monthYearExams}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="October 2022"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Photo (IPFS Hash)
              </label>
              <input
                type="text"
                name="studentPhoto"
                value={formData.studentPhoto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="QmXXXXXX..."
              />
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Courses
            </h3>
            <button
              type="button"
              onClick={addCourse}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Course {index + 1}</h4>
                  {courses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCourse(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={course.courseCode}
                      onChange={(e) => handleCourseChange(index, 'courseCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1005194120"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={course.courseTitle}
                      onChange={(e) => handleCourseChange(index, 'courseTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Machine Learning"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <select
                      value={course.gradeSecured}
                      onChange={(e) => handleCourseChange(index, 'gradeSecured', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Grade</option>
                      <option value="O">O (10)</option>
                      <option value="A+">A+ (9)</option>
                      <option value="A">A (8)</option>
                      <option value="B+">B+ (7)</option>
                      <option value="B">B (6)</option>
                      <option value="C">C (5)</option>
                      <option value="F">F (0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={course.status}
                      onChange={(e) => handleCourseChange(index, 'status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="P">Pass</option>
                      <option value="F">Fail</option>
                      <option value="A">Absent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={course.creditsObtained}
                      onChange={(e) => handleCourseChange(index, 'creditsObtained', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.5"
                      placeholder="4.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total Credits:</strong> {calculateTotalCredits()}
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Minting...' : 'Issue Certificate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SemesterCertificateForm;
