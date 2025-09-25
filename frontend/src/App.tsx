import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import IssueCertificate from './pages/IssueCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import AdminDashboard from './pages/AdminDashboard';
import PublicVerify from './pages/PublicVerify';
import StudentDashboard from './pages/StudentDashboard';
import Scholarships from './pages/Scholarships';
import ScholarshipDashboard from './pages/ScholarshipDashboard';
import ClaimScholarship from './pages/ClaimScholarship';
import SemesterCertificateVerification from './pages/SemesterCertificateVerification';
import NotFound from './pages/NotFound';
import LegacyPublicVerify from './pages/LegacyPublicVerify';
import LegacyCertificateMint from './pages/LegacyCertificateMint';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/issue" element={<IssueCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/verify-legacy" element={<LegacyPublicVerify />} />
            <Route path="/legacy-mint" element={<LegacyCertificateMint />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/scholarship-dashboard" element={<ScholarshipDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/claim-scholarship" element={<ClaimScholarship />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/public-verify" element={<PublicVerify />} />
            <Route path="/verify-semester" element={<SemesterCertificateVerification />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;