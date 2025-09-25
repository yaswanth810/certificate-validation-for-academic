import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { Scholarship } from '../../hooks/useScholarships';
import { EligibilityResult } from '../../hooks/useEligibility';
import ScholarshipCard from '../ScholarshipCard';
import EligibilityIndicator from '../ui/EligibilityIndicator';
import { ScholarshipGridSkeleton, FilterBarSkeleton } from '../ui/LoadingSkeleton';

export interface ScholarshipFilters {
  search: string;
  department: string;
  tokenType: string;
  eligibilityStatus: 'all' | 'eligible' | 'not-eligible' | 'claimed';
  amountRange: {
    min: number;
    max: number;
  };
  sortBy: 'deadline' | 'amount' | 'created' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface ScholarshipGridProps {
  scholarships: Scholarship[];
  eligibilityResults?: Record<number, EligibilityResult>;
  loading?: boolean;
  onClaimScholarship?: (scholarshipId: number) => void;
  showEligibilityFilter?: boolean;
  viewMode?: 'grid' | 'list';
}

const ScholarshipGrid: React.FC<ScholarshipGridProps> = ({
  scholarships,
  eligibilityResults = {},
  loading = false,
  onClaimScholarship,
  showEligibilityFilter = true,
  viewMode: initialViewMode = 'grid'
}) => {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    search: '',
    department: '',
    tokenType: '',
    eligibilityStatus: 'all',
    amountRange: { min: 0, max: 1000 },
    sortBy: 'deadline',
    sortOrder: 'asc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique departments and token types for filter options
  const filterOptions = useMemo(() => {
    const departments = [...new Set(scholarships.map(s => 
      eligibilityResults[s.id]?.reasons?.find(r => r.includes('department'))?.split(': ')[1] || ''
    ).filter(Boolean))];
    
    const tokenTypes = [...new Set(scholarships.map(s => s.tokenSymbol))];
    
    return { departments, tokenTypes };
  }, [scholarships, eligibilityResults]);

  // Filter and sort scholarships
  const filteredScholarships = useMemo(() => {
    let filtered = scholarships.filter(scholarship => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!scholarship.name.toLowerCase().includes(searchLower) &&
            !scholarship.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Department filter
      if (filters.department) {
        const eligibility = eligibilityResults[scholarship.id];
        const hasDepartment = eligibility?.reasons?.some(r => 
          r.includes('department') && r.includes(filters.department)
        );
        if (!hasDepartment) return false;
      }

      // Token type filter
      if (filters.tokenType && scholarship.tokenSymbol !== filters.tokenType) {
        return false;
      }

      // Eligibility status filter
      if (showEligibilityFilter && filters.eligibilityStatus !== 'all') {
        const eligibility = eligibilityResults[scholarship.id];
        switch (filters.eligibilityStatus) {
          case 'eligible':
            if (!eligibility?.isEligible) return false;
            break;
          case 'not-eligible':
            if (eligibility?.isEligible !== false) return false;
            break;
          case 'claimed':
            if (!eligibility?.alreadyClaimed) return false;
            break;
        }
      }

      // Amount range filter
      const amount = parseFloat(scholarship.amountPerRecipient);
      if (amount < filters.amountRange.min || amount > filters.amountRange.max) {
        return false;
      }

      return true;
    });

    // Sort scholarships
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'deadline':
          aValue = a.deadline;
          bValue = b.deadline;
          break;
        case 'amount':
          aValue = parseFloat(a.amountPerRecipient);
          bValue = parseFloat(b.amountPerRecipient);
          break;
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [scholarships, filters, eligibilityResults, showEligibilityFilter]);

  const handleFilterChange = (key: keyof ScholarshipFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      tokenType: '',
      eligibilityStatus: 'all',
      amountRange: { min: 0, max: 1000 },
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <FilterBarSkeleton />
        <ScholarshipGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          {/* Top Row - Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* View Mode and Filter Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Department Filter */}
                {filterOptions.departments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">All Departments</option>
                      {filterOptions.departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Token Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Token Type
                  </label>
                  <select
                    value={filters.tokenType}
                    onChange={(e) => handleFilterChange('tokenType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">All Tokens</option>
                    {filterOptions.tokenTypes.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                </div>

                {/* Eligibility Filter */}
                {showEligibilityFilter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Eligibility
                    </label>
                    <select
                      value={filters.eligibilityStatus}
                      onChange={(e) => handleFilterChange('eligibilityStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Scholarships</option>
                      <option value="eligible">Eligible</option>
                      <option value="not-eligible">Not Eligible</option>
                      <option value="claimed">Already Claimed</option>
                    </select>
                  </div>
                )}

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="deadline">Deadline</option>
                      <option value="amount">Amount</option>
                      <option value="created">Created</option>
                      <option value="name">Name</option>
                    </select>
                    <button
                      onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredScholarships.length} of {scholarships.length} scholarships
        </p>
      </div>

      {/* Scholarship Grid/List */}
      {filteredScholarships.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No scholarships found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredScholarships.map(scholarship => {
            const eligibility = eligibilityResults[scholarship.id];
            
            return (
              <div key={scholarship.id} className={viewMode === 'list' ? 'flex' : ''}>
                <ScholarshipCard
                  scholarship={scholarship}
                  eligibilityStatus={eligibility ? {
                    isEligible: eligibility.isEligible,
                    status: eligibility.alreadyClaimed ? 'claimed' : 
                           eligibility.isEligible ? 'eligible' : 'not-eligible',
                    reasons: eligibility.reasons,
                    certificateCount: eligibility.certificateCount,
                    requiredCertificates: 1, // This should come from criteria
                    hasRequiredCourses: eligibility.hasRequiredCourses,
                    hasValidDepartment: eligibility.hasValidDepartment,
                    hasValidEnrollment: eligibility.hasValidEnrollment
                  } : undefined}
                  onClaim={onClaimScholarship}
                  variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScholarshipGrid;
