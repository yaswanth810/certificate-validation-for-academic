import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  RefreshCw,
  Users,
  DollarSign,
  Award,
  TrendingUp,
  Calendar,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useScholarship } from '../hooks/useScholarship';
import { useWeb3 } from '../contexts/Web3Context';
import ScholarshipCard from '../components/ScholarshipCard';
import { ScholarshipFilter } from '../types/scholarship';

const ScholarshipDashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { 
    scholarships, 
    userEligibility, 
    loading, 
    error, 
    claimScholarship, 
    filterScholarships,
    fetchScholarships,
    getScholarshipStats
  } = useScholarship();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<ScholarshipFilter>({
    eligibilityStatus: 'all',
    sortBy: 'deadline',
    sortOrder: 'asc'
  });
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Filter and search scholarships
  const filteredScholarships = useMemo(() => {
    let filtered = filterScholarships(filter);

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(scholarship => 
        scholarship.name.toLowerCase().includes(term) ||
        scholarship.description.toLowerCase().includes(term) ||
        scholarship.eligibilityCriteria.departments.some(dept => 
          dept.toLowerCase().includes(term)
        ) ||
        scholarship.eligibilityCriteria.requiredCertificates.some(cert => 
          cert.toLowerCase().includes(term)
        )
      );
    }

    return filtered;
  }, [scholarships, filter, searchTerm, filterScholarships]);

  // Get unique departments for filter dropdown
  const availableDepartments = useMemo(() => {
    const departments = new Set<string>();
    scholarships.forEach(s => {
      if (s.eligibilityCriteria?.departments?.length > 0) {
        s.eligibilityCriteria.departments.forEach(dept => departments.add(dept));
      }
    });
    return Array.from(departments).sort();
  }, [scholarships]);

  // Get unique token types
  const availableTokens = useMemo(() => {
    const tokens = new Set<string>();
    scholarships.forEach(s => tokens.add(s.tokenSymbol));
    return Array.from(tokens).sort();
  }, [scholarships]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchScholarships();
    } finally {
      setRefreshing(false);
    }
  };

  const handleClaimScholarship = async (scholarshipId: string) => {
    try {
      await claimScholarship(scholarshipId);
    } catch (error) {
      console.error('Error claiming scholarship:', error);
      // Handle error (show toast, etc.)
    }
  };

  const getEligibilityStats = () => {
    if (!userEligibility.length) return { eligible: 0, claimed: 0, total: 0 };

    const eligible = userEligibility.filter(e => e.isEligible && !e.hasClaimed).length;
    const claimed = userEligibility.filter(e => e.hasClaimed).length;
    const total = userEligibility.length;

    return { eligible, claimed, total };
  };

  const eligibilityStats = getEligibilityStats();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view available scholarships
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Scholarship Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover and claim scholarships you're eligible for
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">You're Eligible</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {eligibilityStats.eligible}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">You've Claimed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {eligibilityStats.claimed}
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
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={filter.department || ''}
                    onChange={(e) => setFilter({ ...filter, department: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {availableDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Token Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Token Type
                  </label>
                  <select
                    value={filter.tokenType || ''}
                    onChange={(e) => setFilter({ ...filter, tokenType: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Tokens</option>
                    {availableTokens.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                </div>

                {/* Eligibility Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Eligibility Status
                  </label>
                  <select
                    value={filter.eligibilityStatus || 'all'}
                    onChange={(e) => setFilter({ ...filter, eligibilityStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Scholarships</option>
                    <option value="eligible">Eligible</option>
                    <option value="not-eligible">Not Eligible</option>
                    <option value="claimed">Already Claimed</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={filter.sortBy || 'deadline'}
                      onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="deadline">Deadline</option>
                      <option value="amount">Amount</option>
                      <option value="created">Created</option>
                      <option value="name">Name</option>
                    </select>
                    <button
                      onClick={() => setFilter({ 
                        ...filter, 
                        sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' 
                      })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {filter.sortOrder === 'asc' ? 
                        <SortAsc className="w-4 h-4" /> : 
                        <SortDesc className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Amount Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={filter.minAmount || ''}
                    onChange={(e) => setFilter({ ...filter, minAmount: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10.0"
                    value={filter.maxAmount || ''}
                    onChange={(e) => setFilter({ ...filter, maxAmount: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading scholarships...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Scholarships Grid */}
        {!loading && !error && (
          <>
            {filteredScholarships.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No scholarships found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || Object.values(filter).some(v => v && v !== 'all') 
                    ? 'Try adjusting your search or filters'
                    : 'No scholarships are currently available'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Available Scholarships ({filteredScholarships.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredScholarships.map((scholarship) => {
                    const eligibility = userEligibility.find(e => e.scholarshipId === scholarship.id);
                    return (
                      <ScholarshipCard
                        key={scholarship.id}
                        scholarship={scholarship}
                        eligibility={eligibility}
                        onClaim={handleClaimScholarship}
                        className="h-full"
                      />
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScholarshipDashboard;
