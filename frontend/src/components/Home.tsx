import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

const Home: React.FC = () => {
  const { isConnected } = useWeb3();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Blockchain-Powered
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Certificate Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Secure, verifiable, and tamper-proof digital certificates for Vignan Institute. 
            Built on Ethereum blockchain with NFT technology and QR code verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student"
              className="btn-primary px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Student Portal
            </Link>
            <Link
              to="/verify"
              className="px-8 py-3 text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leveraging cutting-edge blockchain technology to ensure the highest level of security and authenticity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tamper-Proof Security</h3>
              <p className="text-gray-600">
                Certificates are stored as NFTs on the Ethereum blockchain, making them impossible to forge or modify.
              </p>
            </div>

            <div className="card-hover p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Verification</h3>
              <p className="text-gray-600">
                Verify any certificate instantly using QR codes or blockchain verification tools.
              </p>
            </div>

            <div className="card-hover p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast & Efficient</h3>
              <p className="text-gray-600">
                Issue and manage certificates with lightning speed using smart contract automation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to issue, manage, and verify certificates on the blockchain.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Registration</h3>
              <p className="text-gray-600">
                Students register on the platform and get their unique blockchain identity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Course Completion</h3>
              <p className="text-gray-600">
                Upon course completion, students become eligible for certificate issuance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate Minting</h3>
              <p className="text-gray-600">
                Certificates are minted as NFTs with unique verification hashes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verification</h3>
              <p className="text-gray-600">
                Anyone can verify certificates using QR codes or blockchain explorers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of digital certificates with Vignan Institute's blockchain platform.
          </p>
          {isConnected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student"
                className="px-8 py-3 text-blue-600 font-semibold bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                View My Certificates
              </Link>
              <Link
                to="/admin"
                className="px-8 py-3 text-white font-semibold border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          ) : (
            <p className="text-blue-100">
              Connect your wallet to access the platform
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Vignan Institute</h3>
              <p className="text-gray-400">
                Leading the way in blockchain-based educational certification.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/student" className="hover:text-white transition-colors">Student Portal</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
                <li><Link to="/verify" className="hover:text-white transition-colors">Verify Certificate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Ethereum Blockchain</li>
                <li>NFT Technology</li>
                <li>Smart Contracts</li>
                <li>QR Code Verification</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@vignan.edu</li>
                <li>+91 123 456 7890</li>
                <li>Vignan Institute, Guntur</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vignan Institute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
