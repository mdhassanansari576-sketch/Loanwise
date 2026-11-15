import {
  DisbursementInput,
  SavedLoanCalculation,
  SavedSipCalculation,
  UserProfile,
} from '../types';
import { FinancialCalculator } from '../utils/calculator';

const PROFILE_KEY = 'loanwise_user_profile';
const LOANS_KEY = 'loanwise_saved_loans';
const SIPS_KEY = 'loanwise_saved_sips';

export class StorageService {
  static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read profile', e);
    }
    const defaultProfile: UserProfile = {
      id: 'default_user',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@loanwise.in',
      riskProfile: 'Moderate',
      defaultCurrency: 'INR',
    };
    this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  static getLoans(): SavedLoanCalculation[] {
    try {
      const data = localStorage.getItem(LOANS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read loans', e);
    }
    const samples = this.createSampleLoans();
    this.saveLoans(samples);
    return samples;
  }

  static saveLoans(loans: SavedLoanCalculation[]): void {
    try {
      localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    } catch (e) {
      console.error('Failed to save loans', e);
    }
  }

  static addLoan(loan: SavedLoanCalculation): void {
    const loans = this.getLoans();
    loans.unshift(loan);
    this.saveLoans(loans);
  }

  static renameLoan(id: string, newName: string): void {
    const loans = this.getLoans();
    const item = loans.find((l) => l.id === id);
    if (item) {
      item.loanName = newName;
      this.saveLoans(loans);
    }
  }

  static duplicateLoan(id: string): void {
    const loans = this.getLoans();
    const item = loans.find((l) => l.id === id);
    if (item) {
      const copy: SavedLoanCalculation = {
        ...item,
        id: crypto.randomUUID(),
        loanName: `${item.loanName} (Copy)`,
        createdAt: Date.now(),
      };
      loans.unshift(copy);
      this.saveLoans(loans);
    }
  }

  static deleteLoan(id: string): void {
    const loans = this.getLoans().filter((l) => l.id !== id);
    this.saveLoans(loans);
  }

  static getSips(): SavedSipCalculation[] {
    try {
      const data = localStorage.getItem(SIPS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read sips', e);
    }
    const samples = this.createSampleSips();
    this.saveSips(samples);
    return samples;
  }

  static saveSips(sips: SavedSipCalculation[]): void {
    try {
      localStorage.setItem(SIPS_KEY, JSON.stringify(sips));
    } catch (e) {
      console.error('Failed to save sips', e);
    }
  }

  static addSip(sip: SavedSipCalculation): void {
    const sips = this.getSips();
    sips.unshift(sip);
    this.saveSips(sips);
  }

  static renameSip(id: string, newName: string): void {
    const sips = this.getSips();
    const item = sips.find((s) => s.id === id);
    if (item) {
      item.sipName = newName;
      this.saveSips(sips);
    }
  }

  static duplicateSip(id: string): void {
    const sips = this.getSips();
    const item = sips.find((s) => s.id === id);
    if (item) {
      const copy: SavedSipCalculation = {
        ...item,
        id: crypto.randomUUID(),
        sipName: `${item.sipName} (Copy)`,
        createdAt: Date.now(),
      };
      sips.unshift(copy);
      this.saveSips(sips);
    }
  }

  static deleteSip(id: string): void {
    const sips = this.getSips().filter((s) => s.id !== id);
    this.saveSips(sips);
  }

  static restoreSampleData(): void {
    this.saveLoans(this.createSampleLoans());
    this.saveSips(this.createSampleSips());
  }

  static clearAllData(): void {
    this.saveLoans([]);
    this.saveSips([]);
  }

  private static createSampleLoans(): SavedLoanCalculation[] {
    const eduDisbursements: DisbursementInput[] = [
      { id: '1', academicYear: 1, installmentNumberInYear: 1, amount: 250000, monthOffsetFromStart: 0, dateString: 'Year 1', label: 'Year 1 Tuition & Hostels' },
      { id: '2', academicYear: 2, installmentNumberInYear: 1, amount: 250000, monthOffsetFromStart: 12, dateString: 'Year 2', label: 'Year 2 Tuition & Labs' },
      { id: '3', academicYear: 3, installmentNumberInYear: 1, amount: 250000, monthOffsetFromStart: 24, dateString: 'Year 3', label: 'Year 3 Tuition & Project' },
      { id: '4', academicYear: 4, installmentNumberInYear: 1, amount: 250000, monthOffsetFromStart: 36, dateString: 'Year 4', label: 'Year 4 Tuition & Placement' },
    ];
    const eduResult = FinancialCalculator.calculateEducationLoan(
      eduDisbursements,
      9.5,
      'COMPOUND',
      'ANNUALLY',
      4,
      12,
      10,
      false,
      true
    );

    const homeResult = FinancialCalculator.calculateOtherLoan(
      'HOME',
      3000000,
      8.4,
      'COMPOUND',
      'MONTHLY',
      20,
      10000
    );

    return [
      {
        id: 'sample-edu-1',
        loanName: 'B.Tech Education Loan (IIT/NIT)',
        loanType: 'EDUCATION',
        interestType: 'COMPOUND',
        compoundFrequency: 'ANNUALLY',
        annualInterestRate: 9.5,
        courseDurationYears: 4,
        gracePeriodMonths: 12,
        repaymentDurationYears: 10,
        totalDisbursedAmount: eduResult.totalDisbursedAmount,
        totalInterest: eduResult.totalInterestPayable,
        moratoriumInterest: eduResult.moratoriumInterest,
        outstandingBalance: eduResult.outstandingBalanceAtEmiStart,
        emiAmount: eduResult.emiAmount,
        totalRepayment: eduResult.totalRepaymentAmount,
        payInterestDuringCourse: false,
        capitalizeInterest: true,
        processingFee: 0,
        calculationDate: Date.now() - 86400000 * 2,
        createdAt: Date.now() - 86400000 * 2,
        disbursements: eduDisbursements,
        scheduleSample: eduResult.schedule.slice(0, 24),
      },
      {
        id: 'sample-home-1',
        loanName: 'Primary Residence Home Loan',
        loanType: 'HOME',
        interestType: 'COMPOUND',
        compoundFrequency: 'MONTHLY',
        annualInterestRate: 8.4,
        courseDurationYears: 0,
        gracePeriodMonths: 0,
        repaymentDurationYears: 20,
        totalDisbursedAmount: 3000000,
        totalInterest: homeResult.totalInterestPayable,
        moratoriumInterest: 0,
        outstandingBalance: 3000000,
        emiAmount: homeResult.emiAmount,
        totalRepayment: homeResult.totalRepaymentAmount,
        payInterestDuringCourse: false,
        capitalizeInterest: false,
        processingFee: 10000,
        calculationDate: Date.now() - 86400000 * 5,
        createdAt: Date.now() - 86400000 * 5,
        disbursements: [{ id: 'h1', academicYear: 1, installmentNumberInYear: 1, amount: 3000000, monthOffsetFromStart: 0, dateString: 'Day 1', label: 'Full Disbursement' }],
        scheduleSample: homeResult.schedule.slice(0, 24),
      },
    ];
  }

  private static createSampleSips(): SavedSipCalculation[] {
    const sipResult = FinancialCalculator.calculateSip(
      15000,
      13,
      15,
      'MONTHLY',
      10,
      50000
    );

    return [
      {
        id: 'sample-sip-1',
        sipName: 'Retirement Wealth Creator (10% Step-Up)',
        monthlyInvestment: 15000,
        expectedAnnualReturn: 13,
        investmentDurationYears: 15,
        sipFrequency: 'MONTHLY',
        stepUpPercentage: 10,
        initialInvestment: 50000,
        totalInvestedAmount: sipResult.totalInvestedAmount,
        estimatedReturns: sipResult.estimatedReturns,
        estimatedFutureValue: sipResult.estimatedFutureValue,
        inflationAdjustedValue: sipResult.inflationAdjustedFutureValue,
        goalAmount: 10000000,
        calculationDate: Date.now() - 86400000,
        createdAt: Date.now() - 86400000,
        yearlyBreakdown: sipResult.yearlyBreakdown,
      },
    ];
  }
}
