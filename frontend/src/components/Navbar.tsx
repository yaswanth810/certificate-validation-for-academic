import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Home, User, Settings, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatAddress } from '../utils/web3';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnected, isLoading } = useWeb3();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-200/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo Section */}
          <Link to="/" className="flex items-center space-x-4 group py-2" onClick={closeMobileMenu}>
            <Logo variant="vignan" size="md" showText={false} />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  EduTrust
                </span>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <span className="hidden sm:block text-lg font-semibold text-red-600">
                  VIGNAN
                </span>
              </div>
              <span className="text-xs text-blue-600 font-medium -mt-0.5">
                Blockchain Certificate Platform
              </span>
            </div>
          </Link>

          {/* Enhanced Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/student"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/student') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student</span>
            </Link>
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/admin') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>
            <Link
              to="/verify"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/verify') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verify</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    {formatAddress(account!)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </div>
                )}
              </button>
            )}
            
            {/* Mobile Wallet Status */}
            {isConnected && (
              <div className="sm:hidden flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/student"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive('/student') 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Student Portal</span>
              </Link>
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive('/admin') 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Admin Portal</span>
              </Link>
              <Link
                to="/verify"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive('/verify') 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Verify Certificate</span>
              </Link>
              
              {/* Mobile Wallet Section */}
              {isConnected ? (
                <div className="pt-4 border-t border-gray-200/50">
                  <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">
                        {formatAddress(account!)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        closeMobileMenu();
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200/50">
                  <button
                    onClick={() => {
                      connectWallet();
                      closeMobileMenu();
                    }}
                    disabled={isLoading}
                    className="w-full px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="loading-spinner w-4 h-4"></div>
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Connect Wallet</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
