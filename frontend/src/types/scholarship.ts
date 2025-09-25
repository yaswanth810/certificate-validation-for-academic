export interface Scholarship {
  id: string;
  name: string;
  description: string;
  amount: string; // in wei
  tokenAddress?: string; // for ERC20 tokens, undefined for ETH
  tokenSymbol: string; // ETH, USDC, DAI, etc.
  totalFunds: string;
  claimedFunds: string;
  maxRecipients: number;
  currentRecipients: number;
  deadline: number; // timestamp
  isActive: boolean;
  creator: string;
  eligibilityCriteria: EligibilityCriteria;
  createdAt: number;
}

export interface EligibilityCriteria {
  minGPA?: number;
  requiredCertificates: string[]; // certificate names or token IDs
  departments: string[];
  minEnrollmentDate?: number; // timestamp
  maxEnrollmentDate?: number; // timestamp
  courseCompletionRequired?: boolean;
  customCriteria?: string;
}

export interface ScholarshipClaim {
  scholarshipId: string;
  student: string;
  amount: string;
  claimedAt: number;
  transactionHash: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface StudentEligibility {
  scholarshipId: string;
  isEligible: boolean;
  hasClaimed: boolean;
  eligibilityReasons: string[];
  missingRequirements: string[];
  gpaScore?: number;
  ownedCertificates: string[];
  department: string;
  enrollmentDate: number;
}

export interface ScholarshipFilter {
  department?: string;
  minAmount?: string;
  maxAmount?: string;
  tokenType?: string;
  eligibilityStatus?: 'all' | 'eligible' | 'not-eligible' | 'claimed';
  sortBy?: 'amount' | 'deadline' | 'created' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateScholarshipForm {
  name: string;
  description: string;
  amount: string;
  tokenAddress: string;
  tokenSymbol: string;
  maxRecipients: number;
  deadline: string; // ISO date string
  minGPA: number;
  requiredCertificates: string[];
  departments: string[];
  minEnrollmentDate: string;
  maxEnrollmentDate: string;
  courseCompletionRequired: boolean;
  customCriteria: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  usdPrice?: number;
}

export interface ScholarshipStats {
  totalScholarships: number;
  activeScholarships: number;
  totalFundsDeposited: string;
  totalFundsClaimed: string;
  totalRecipients: number;
  averageAmount: string;
  topDepartments: { department: string; count: number }[];
}
