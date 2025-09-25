import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Award,
  Settings,
  DollarSign
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useTheme } from '../hooks/useTheme';
import Logo from './Logo';

const Header: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnected, isLoading, network } = useWeb3();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkStatus = () => {
    if (!network) return null;
    
    const isSepolia = network.chainId === 11155111n;
    return {
      isCorrect: isSepolia,
      name: isSepolia ? 'Sepolia' : `Chain ${network.chainId}`,
      color: isSepolia ? 'text-green-600' : 'text-red-600'
    };
  };

  const networkStatus = getNetworkStatus();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: GraduationCap },
    { path: '/issue', label: 'Issue Certificate', icon: CheckCircle },
    { path: '/verify', label: 'Verify', icon: AlertCircle },
    { path: '/scholarship-dashboard', label: 'Scholarships', icon: Award },
    { path: '/claim-scholarship', label: 'Claim', icon: DollarSign },
    { path: '/admin-dashboard', label: 'Admin', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" className="hidden sm:flex" />
          <Logo size="sm" className="sm:hidden" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Network Status */}
            {isConnected && networkStatus && (
              <div className={`hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                networkStatus.isCorrect 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  networkStatus.isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{networkStatus.name}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatAddress(account!)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-outline text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile wallet info */}
            {isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatAddress(account!)}
                    </span>
                  </div>
                  {networkStatus && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      networkStatus.isCorrect 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {networkStatus.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="w-full mt-2 btn-outline text-sm"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
