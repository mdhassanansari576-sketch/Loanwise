export type NavigationTab = 
  | 'dashboard'
  | 'education-loan'
  | 'other-loan'
  | 'emi-calculator'
  | 'sip-calculator'
  | 'saved-calculations'
  | 'loan-comparison'
  | 'sip-history'
  | 'settings';

export type LoanType = 'EDUCATION' | 'HOME' | 'PERSONAL' | 'VEHICLE' | 'BUSINESS' | 'CUSTOM';

export type InterestCalculationType = 'SIMPLE' | 'COMPOUND';

export type CompoundingFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY';

export type SipFrequency = 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export interface DisbursementInput {
  id: string;
  academicYear: number;
  installmentNumberInYear: number;
  amount: number;
  monthOffsetFromStart: number;
  dateString: string;
  label: string;
}

export interface EmiScheduleItem {
  installmentNumber: number;
  paymentMonthLabel: string;
  openingBalance: number;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  closingBalance: number;
}

export interface LoanCalculationResult {
  loanType: LoanType;
  loanName?: string;
  totalDisbursedAmount: number;
  moratoriumInterest: number;
  outstandingBalanceAtEmiStart: number;
  emiAmount: number;
  totalRepaymentAmount: number;
  totalEmiInterest: number;
  totalInterestPayable: number;
  totalCostOfBorrowing: number;
  repaymentTenureMonths: number;
  schedule: EmiScheduleItem[];
  yearWiseDisbursements: Record<number, number>;
  assumptions: string;
}

export interface SipScheduleItem {
  yearNumber: number;
  installmentNumber: number;
  periodLabel: string;
  periodicInvestment: number;
  cumulativeInvested: number;
  estimatedPortfolioValue: number;
  estimatedProfit: number;
}

export interface SipCalculationResult {
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  investmentDurationYears: number;
  frequency: SipFrequency;
  stepUpPercentage: number;
  initialLumpSum: number;
  totalInvestedAmount: number;
  estimatedReturns: number;
  estimatedFutureValue: number;
  inflationAdjustedFutureValue: number;
  yearlyBreakdown: SipScheduleItem[];
  regularComparisonFutureValue: number;
  goalAmount?: number;
  goalAchieved?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  defaultCurrency: string;
}

export interface SavedLoanCalculation {
  id: string;
  loanName: string;
  loanType: LoanType;
  interestType: InterestCalculationType;
  compoundFrequency: CompoundingFrequency;
  annualInterestRate: number;
  courseDurationYears: number;
  gracePeriodMonths: number;
  repaymentDurationYears: number;
  totalDisbursedAmount: number;
  totalInterest: number;
  moratoriumInterest: number;
  outstandingBalance: number;
  emiAmount: number;
  totalRepayment: number;
  payInterestDuringCourse: boolean;
  capitalizeInterest: boolean;
  processingFee: number;
  calculationDate: number;
  createdAt: number;
  disbursements: DisbursementInput[];
  scheduleSample?: EmiScheduleItem[];
}

export interface SavedSipCalculation {
  id: string;
  sipName: string;
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  investmentDurationYears: number;
  sipFrequency: SipFrequency;
  stepUpPercentage: number;
  initialInvestment: number;
  totalInvestedAmount: number;
  estimatedReturns: number;
  estimatedFutureValue: number;
  inflationAdjustedValue: number;
  goalAmount: number;
  calculationDate: number;
  createdAt: number;
  yearlyBreakdown?: SipScheduleItem[];
}
