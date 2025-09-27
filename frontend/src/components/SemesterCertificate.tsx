import React, { useMemo } from 'react';
import { Calendar, User, GraduationCap, Award, FileText, Shield, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface Course {
  courseCode: string;
  courseTitle: string;
  gradeSecured: string;
  gradePoints: number;
  status: string;
  creditsObtained: number;
}

interface SemesterCertificateData {
  studentName: string;
  serialNo: string;
  memoNo: string;
  regdNo: string;
  branch: string;
  examination: string;
  monthYearExams: string;
  aadharNo: string;
  studentPhoto: string;
  courses: Course[];
  totalCredits: number;
  sgpa: number;
  mediumOfInstruction: string;
  issueDate: number;
  issuer: string;
  isRevoked: boolean;
}

interface SemesterCertificateProps {
  certificate: SemesterCertificateData;
  tokenId: string;
  className?: string;
}

const SemesterCertificate: React.FC<SemesterCertificateProps> = ({ 
  certificate, 
  tokenId, 
  className = '' 
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatSGPA = (sgpa: number) => {
    return (sgpa / 100).toFixed(2);
  };

  const verificationUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({ tokenId, serial: certificate.serialNo });
    return `${base}/verify-semester?${params.toString()}`;
  }, [tokenId, certificate.serialNo]);

  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
  React.useEffect(() => {
    QRCode.toDataURL(verificationUrl, { width: 120, margin: 2 }).then(setQrDataUrl).catch(() => setQrDataUrl(''));
  }, [verificationUrl]);

  return (
    <div className={`bg-white border-2 border-gray-300 rounded-lg shadow-lg max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Vignan Logo */}
            <div className="w-16 h-16 bg-white rounded-full p-2 shadow-md">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="relative w-3/4 h-3/4">
                  {/* Simplified Vignan logo representation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-blue-600 rounded-sm"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-1 bg-blue-600 rounded-sm"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-white rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Institute Details */}
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                EduTrust
              </h1>
              <p className="text-sm text-gray-600">BLOCKCHAIN CERTIFICATE PLATFORM</p>
              <p className="text-sm text-gray-600">SECURE • VERIFIABLE • TAMPER-PROOF</p>
              <h2 className="text-base font-semibold text-gray-800 mt-2">
                MEMORANDUM OF GRADE / MARKS
              </h2>
            </div>
          </div>
          
          {/* Student Photo */}
          <div className="w-24 h-32 bg-gray-200 border-2 border-gray-400 rounded flex items-center justify-center">
            {certificate.studentPhoto ? (
              <img 
                src={certificate.studentPhoto} 
                alt="Student" 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="p-6">
        {/* Top Section with Memo and Serial Numbers */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm">
            <span className="font-semibold">Serial No. :</span> {certificate.serialNo}
          </div>
          <div className="text-sm">
            <span className="font-semibold">MEMO NO. </span>
            <span className="text-red-600 font-bold">{certificate.memoNo}</span>
          </div>
        </div>

        {/* Student Information Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm">
          <div className="flex">
            <span className="font-semibold w-32">Examination :</span>
            <span>{certificate.examination}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Regd. No. :</span>
            <span>{certificate.regdNo}</span>
          </div>
          
          <div className="flex">
            <span className="font-semibold w-32">Branch :</span>
            <span>{certificate.branch}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Month & Year of Exams :</span>
            <span>{certificate.monthYearExams}</span>
          </div>
          
          <div className="flex">
            <span className="font-semibold w-32">Name :</span>
            <span className="font-semibold">{certificate.studentName}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Aadhar No. :</span>
            <span>{certificate.aadharNo}</span>
          </div>
        </div>

        {/* Courses Table */}
        <div className="border-2 border-gray-400 mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="border-r border-gray-400 p-2 text-center w-12">S.No.</th>
                <th className="border-r border-gray-400 p-2 text-center w-24">Course Code</th>
                <th className="border-r border-gray-400 p-2 text-center">Course Title</th>
                <th className="border-r border-gray-400 p-2 text-center w-16">Grade Secured</th>
                <th className="border-r border-gray-400 p-2 text-center w-16">Grade Points, Gi</th>
                <th className="border-r border-gray-400 p-2 text-center w-16">Status</th>
                <th className="p-2 text-center w-16">Credit Obtained, Ci</th>
              </tr>
            </thead>
            <tbody>
              {certificate.courses.map((course, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border-r border-gray-400 p-2 text-center">{index + 1}</td>
                  <td className="border-r border-gray-400 p-2 text-center">{course.courseCode}</td>
                  <td className="border-r border-gray-400 p-2">{course.courseTitle}</td>
                  <td className="border-r border-gray-400 p-2 text-center font-semibold">{course.gradeSecured}</td>
                  <td className="border-r border-gray-400 p-2 text-center">{course.gradePoints / 100}</td>
                  <td className="border-r border-gray-400 p-2 text-center">{course.status}</td>
                  <td className="p-2 text-center">{course.creditsObtained}</td>
                </tr>
              ))}
              
              {/* Empty rows to match official format */}
              {Array.from({ length: Math.max(0, 10 - certificate.courses.length) }).map((_, index) => (
                <tr key={`empty-${index}`} className="border-b border-gray-300">
                  <td className="border-r border-gray-400 p-2 text-center h-8"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="p-2"></td>
                </tr>
              ))}
              
              {/* Summary Row */}
              <tr className="border-b border-gray-400 bg-gray-50">
                <td className="border-r border-gray-400 p-2 text-center font-semibold" colSpan={2}>
                  Courses Registered: {certificate.courses.length}
                </td>
                <td className="border-r border-gray-400 p-2 text-center font-semibold">
                  Appeared: {certificate.courses.filter(c => c.status !== 'A').length}
                </td>
                <td className="border-r border-gray-400 p-2 text-center font-semibold">
                  Passed: {certificate.courses.filter(c => c.status === 'P').length}
                </td>
                <td className="border-r border-gray-400 p-2 text-center font-semibold">Total</td>
                <td className="border-r border-gray-400 p-2 text-center">---</td>
                <td className="p-2 text-center font-semibold">{certificate.totalCredits}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          <div className="text-xs">
            <p className="mb-2">
              <span className="font-semibold">Medium of Instructions and Examinations in English</span>
            </p>
            <p className="mb-4">
              <span className="font-semibold">Semester Grade Point Average (SGPA): {formatSGPA(certificate.sgpa)}</span>
            </p>
            
            <div className="mt-8">
              <p className="mb-2">
                <span className="font-semibold">Date of Issue: {formatDate(certificate.issueDate)}</span>
              </p>
              <div className="flex space-x-8 text-xs">
                <span>P : Pass</span>
                <span>F : Fail</span>
                <span>AB : Absent</span>
                <span>WH : With Held</span>
                <span>MP : Mal Practice</span>
              </div>
              <p className="text-xs mt-2 text-gray-600">
                Note: Any discrepancy must be represented within 15 days from the date mentioned above.
              </p>
            </div>
          </div>
          
          {/* Verification Section */}
          <div className="text-right">
            <div className="mb-4">
              <div className="w-32 h-16 border border-gray-400 flex items-center justify-center text-xs">
                Verified by
              </div>
            </div>
            <div className="text-xs">
              <p className="font-semibold">CONTROLLER OF EXAMINATIONS</p>
            </div>
          </div>
        </div>

        {/* Blockchain Verification Footer */}
        <div className="mt-6 pt-4 border-t border-gray-300 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-semibold">Blockchain Verified</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR" className="w-16 h-16 border border-gray-300 rounded bg-white" />
              )}
              <div className="text-right">
                <div>Token ID: {tokenId}</div>
                <div>Issuer: {certificate.issuer.slice(0, 6)}...{certificate.issuer.slice(-4)}</div>
                <a href={verificationUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Verify</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterCertificate;
