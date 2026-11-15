import {
  CompoundingFrequency,
  DisbursementInput,
  EmiScheduleItem,
  InterestCalculationType,
  LoanCalculationResult,
  LoanType,
  SipCalculationResult,
  SipFrequency,
  SipScheduleItem,
} from '../types';

export class CurrencyFormatter {
  static formatInr(amount: number, includeDecimals = false): string {
    if (isNaN(amount) || !isFinite(amount)) return '₹0';

    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);

    const longVal = Math.floor(absAmount);
    let decimalPart = '';
    if (includeDecimals) {
      const decimals = Math.round((absAmount - longVal) * 100);
      decimalPart = '.' + decimals.toString().padStart(2, '0');
    }

    const s = longVal.toString();
    let formatted = '';
    if (s.length <= 3) {
      formatted = s;
    } else {
      const lastThree = s.substring(s.length - 3);
      const rest = s.substring(0, s.length - 3);
      const chars = rest.split('');
      const parts: string[] = [];
      let count = 0;
      for (let i = chars.length - 1; i >= 0; i--) {
        parts.unshift(chars[i]);
        count++;
        if (count % 2 === 0 && i > 0) {
          parts.unshift(',');
        }
      }
      formatted = parts.join('') + ',' + lastThree;
    }

    const prefix = isNegative ? '-₹' : '₹';
    return `${prefix}${formatted}${decimalPart}`;
  }

  static formatInrCompact(amount: number): string {
    if (isNaN(amount) || !isFinite(amount)) return '₹0';
    const absAmount = Math.abs(amount);
    const prefix = amount < 0 ? '-₹' : '₹';

    if (absAmount >= 10000000) {
      // Crore
      const cr = absAmount / 10000000;
      return `${prefix}${cr.toFixed(2)} Cr`;
    } else if (absAmount >= 100000) {
      // Lakh
      const lakh = absAmount / 100000;
      return `${prefix}${lakh.toFixed(2)} L`;
    } else if (absAmount >= 1000) {
      // Thousand
      const k = absAmount / 1000;
      return `${prefix}${k.toFixed(1)} K`;
    }
    return this.formatInr(amount, false);
  }

  static formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }
}

export class FinancialCalculator {
  static getCompoundingPeriods(freq: CompoundingFrequency): number {
    switch (freq) {
      case 'MONTHLY': return 12;
      case 'QUARTERLY': return 4;
      case 'HALF_YEARLY': return 2;
      case 'ANNUALLY': return 1;
      default: return 12;
    }
  }

  static getSipPeriodsPerYear(freq: SipFrequency): number {
    switch (freq) {
      case 'MONTHLY': return 12;
      case 'QUARTERLY': return 4;
      case 'WEEKLY': return 52;
      default: return 12;
    }
  }

  static calculateStandardEmi(
    principal: number,
    annualRate: number,
    tenureMonths: number
  ): number {
    if (principal <= 0 || tenureMonths <= 0) return 0;
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate <= 0) {
      return principal / tenureMonths;
    }
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    if (!isFinite(factor) || factor === 1) return principal / tenureMonths;
    return (principal * monthlyRate * factor) / (factor - 1);
  }

  static generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    fixedEmi: number
  ): EmiScheduleItem[] {
    const schedule: EmiScheduleItem[] = [];
    let balance = principal;
    const monthlyRate = annualRate / 12 / 100;

    for (let month = 1; month <= tenureMonths; month++) {
      if (balance <= 0.01) break;
      const interestComponent = balance * monthlyRate;
      let principalComponent = fixedEmi - interestComponent;

      if (principalComponent > balance || month === tenureMonths) {
        principalComponent = balance;
      }
      if (principalComponent < 0) {
        principalComponent = 0;
      }

      const closingBalance = Math.max(0, balance - principalComponent);
      const actualEmi = principalComponent + interestComponent;

      schedule.push({
        installmentNumber: month,
        paymentMonthLabel: `Month ${month}`,
        openingBalance: balance,
        emiAmount: actualEmi,
        principalComponent: principalComponent,
        interestComponent: interestComponent,
        closingBalance: closingBalance,
      });

      balance = closingBalance;
    }
    return schedule;
  }

  static calculateEducationLoan(
    disbursements: DisbursementInput[],
    annualRate: number,
    interestType: InterestCalculationType,
    compoundingFrequency: CompoundingFrequency,
    courseDurationYears: number,
    gracePeriodMonths: number,
    repaymentDurationYears: number,
    payInterestDuringCourse: boolean,
    capitalizeInterest: boolean,
    processingFee = 0
  ): LoanCalculationResult {
    const totalMoratoriumMonths = courseDurationYears * 12 + gracePeriodMonths;
    let totalDisbursed = 0;
    let totalMoratoriumInterest = 0;
    const yearWiseDisbursements: Record<number, number> = {};

    for (const d of disbursements) {
      totalDisbursed += d.amount;
      yearWiseDisbursements[d.academicYear] = (yearWiseDisbursements[d.academicYear] || 0) + d.amount;

      const accrualMonths = Math.max(0, totalMoratoriumMonths - d.monthOffsetFromStart);
      const accrualYears = accrualMonths / 12;

      let itemInterest = 0;
      if (interestType === 'SIMPLE') {
        itemInterest = d.amount * (annualRate / 100) * accrualYears;
      } else {
        const m = this.getCompoundingPeriods(compoundingFrequency);
        const totalPeriods = accrualYears * m;
        const periodicRate = annualRate / 100 / m;
        itemInterest = d.amount * (Math.pow(1 + periodicRate, totalPeriods) - 1);
      }
      totalMoratoriumInterest += itemInterest;
    }

    const outstandingAtEmiStart = payInterestDuringCourse
      ? totalDisbursed
      : capitalizeInterest
      ? totalDisbursed + totalMoratoriumInterest
      : totalDisbursed + totalMoratoriumInterest;

    const repaymentTenureMonths = Math.max(1, Math.round(repaymentDurationYears * 12));
    const emi = this.calculateStandardEmi(outstandingAtEmiStart, annualRate, repaymentTenureMonths);
    const schedule = this.generateAmortizationSchedule(
      outstandingAtEmiStart,
      annualRate,
      repaymentTenureMonths,
      emi
    );

    const totalEmiInterest = schedule.reduce((sum, item) => sum + item.interestComponent, 0);
    const totalRepayment = schedule.reduce((sum, item) => sum + item.emiAmount, 0);
    const totalInterestPayable = payInterestDuringCourse
      ? totalMoratoriumInterest + totalEmiInterest
      : outstandingAtEmiStart - totalDisbursed + totalEmiInterest;

    const totalCostOfBorrowing =
      totalRepayment + processingFee + (payInterestDuringCourse ? totalMoratoriumInterest : 0);

    const assumptions = `Moratorium: ${courseDurationYears} yrs course + ${gracePeriodMonths} mos grace (${totalMoratoriumMonths} mos total). Interest calculation: ${interestType} (${compoundingFrequency.toLowerCase()} compounding). ${
      payInterestDuringCourse
        ? `Moratorium interest (${CurrencyFormatter.formatInr(totalMoratoriumInterest)}) serviced during course.`
        : `Moratorium interest (${CurrencyFormatter.formatInr(totalMoratoriumInterest)}) capitalized into principal.`
    }`;

    return {
      loanType: 'EDUCATION',
      totalDisbursedAmount: totalDisbursed,
      moratoriumInterest: totalMoratoriumInterest,
      outstandingBalanceAtEmiStart: outstandingAtEmiStart,
      emiAmount: emi,
      totalRepaymentAmount: totalRepayment,
      totalEmiInterest: totalEmiInterest,
      totalInterestPayable: totalInterestPayable,
      totalCostOfBorrowing: totalCostOfBorrowing,
      repaymentTenureMonths: repaymentTenureMonths,
      schedule: schedule,
      yearWiseDisbursements: yearWiseDisbursements,
      assumptions: assumptions,
    };
  }

  static calculateOtherLoan(
    loanType: LoanType,
    loanAmount: number,
    annualRate: number,
    interestType: InterestCalculationType,
    compoundingFrequency: CompoundingFrequency,
    tenureYears: number,
    processingFee = 0,
    prepaymentMonthly = 0
  ): LoanCalculationResult {
    const tenureMonths = Math.max(1, Math.round(tenureYears * 12));
    const standardEmi = this.calculateStandardEmi(loanAmount, annualRate, tenureMonths);
    const schedule = this.generateAmortizationSchedule(
      loanAmount,
      annualRate,
      tenureMonths,
      standardEmi + prepaymentMonthly
    );

    const totalEmiInterest = schedule.reduce((sum, item) => sum + item.interestComponent, 0);
    const totalRepayment = schedule.reduce((sum, item) => sum + item.emiAmount, 0);
    const totalCostOfBorrowing = totalRepayment + processingFee;

    const assumptions = `${loanType}: Principal ${CurrencyFormatter.formatInr(
      loanAmount
    )} at ${annualRate}% for ${tenureYears} yrs. Reducing-balance amortized over ${schedule.length} payments. ${
      prepaymentMonthly > 0
        ? `Extra monthly prepayment ${CurrencyFormatter.formatInr(
            prepaymentMonthly
          )} reduces tenure to ${schedule.length} months.`
        : ''
    }`;

    return {
      loanType: loanType,
      totalDisbursedAmount: loanAmount,
      moratoriumInterest: 0,
      outstandingBalanceAtEmiStart: loanAmount,
      emiAmount: standardEmi,
      totalRepaymentAmount: totalRepayment,
      totalEmiInterest: totalEmiInterest,
      totalInterestPayable: totalEmiInterest,
      totalCostOfBorrowing: totalCostOfBorrowing,
      repaymentTenureMonths: schedule.length,
      schedule: schedule,
      yearWiseDisbursements: { 1: loanAmount },
      assumptions: assumptions,
    };
  }

  static calculateSip(
    monthlyInvestment: number,
    expectedAnnualReturn: number,
    investmentDurationYears: number,
    frequency: SipFrequency = 'MONTHLY',
    stepUpPercentage = 0,
    initialLumpSum = 0,
    inflationRate = 0,
    goalAmount?: number
  ): SipCalculationResult {
    const installmentsPerYear = this.getSipPeriodsPerYear(frequency);
    const totalPeriods = investmentDurationYears * installmentsPerYear;
    const periodicRate =
      expectedAnnualReturn > 0 ? expectedAnnualReturn / 100 / installmentsPerYear : 0;

    const basePeriodicInvestment = monthlyInvestment * (12 / installmentsPerYear);

    let totalInvested = initialLumpSum;
    let portfolioValue = initialLumpSum;
    const yearlyBreakdown: SipScheduleItem[] = [];

    let currentPeriodicInvestment = basePeriodicInvestment;

    for (let period = 1; period <= totalPeriods; period++) {
      const yearIndex = Math.floor((period - 1) / installmentsPerYear);
      // Annual step-up applied at the start of each year after Year 1
      if ((period - 1) % installmentsPerYear === 0 && yearIndex > 0) {
        currentPeriodicInvestment *= 1 + stepUpPercentage / 100;
      }

      totalInvested += currentPeriodicInvestment;
      portfolioValue = (portfolioValue + currentPeriodicInvestment) * (1 + periodicRate);

      if (period % installmentsPerYear === 0 || period === totalPeriods) {
        const currentYear = Math.floor((period - 1) / installmentsPerYear) + 1;
        const profit = portfolioValue - totalInvested;
        yearlyBreakdown.push({
          yearNumber: currentYear,
          installmentNumber: period,
          periodLabel: `Year ${currentYear}`,
          periodicInvestment: currentPeriodicInvestment,
          cumulativeInvested: totalInvested,
          estimatedPortfolioValue: portfolioValue,
          estimatedProfit: Math.max(0, profit),
        });
      }
    }

    const estimatedReturns = Math.max(0, portfolioValue - totalInvested);

    // Regular SIP comparison without step-up
    let regularComparisonFutureValue = 0;
    if (periodicRate > 0) {
      const fvAnnuity =
        basePeriodicInvestment *
        ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate) *
        (1 + periodicRate);
      const fvLumpSum = initialLumpSum * Math.pow(1 + periodicRate, totalPeriods);
      regularComparisonFutureValue = fvAnnuity + fvLumpSum;
    } else {
      regularComparisonFutureValue = basePeriodicInvestment * totalPeriods + initialLumpSum;
    }

    const inflationAdjustedFutureValue =
      inflationRate > 0
        ? portfolioValue / Math.pow(1 + inflationRate / 100, investmentDurationYears)
        : portfolioValue;

    const goalAchieved = goalAmount ? portfolioValue >= goalAmount : false;

    return {
      monthlyInvestment,
      expectedAnnualReturn,
      investmentDurationYears,
      frequency,
      stepUpPercentage,
      initialLumpSum,
      totalInvestedAmount: totalInvested,
      estimatedReturns,
      estimatedFutureValue: portfolioValue,
      inflationAdjustedFutureValue,
      yearlyBreakdown,
      regularComparisonFutureValue,
      goalAmount,
      goalAchieved,
    };
  }

  static calculateRequiredMonthlySipForGoal(
    targetAmount: number,
    expectedAnnualReturn: number,
    durationYears: number,
    frequency: SipFrequency = 'MONTHLY'
  ): number {
    if (targetAmount <= 0 || durationYears <= 0) return 0;
    const k = this.getSipPeriodsPerYear(frequency);
    const totalPeriods = durationYears * k;
    const periodicRate = expectedAnnualReturn / 100 / k;
    if (periodicRate <= 0) {
      const periodic = targetAmount / totalPeriods;
      return periodic * (k / 12);
    }
    const factor = Math.pow(1 + periodicRate, totalPeriods) - 1;
    const requiredPeriodic = (targetAmount * periodicRate) / (factor * (1 + periodicRate));
    return requiredPeriodic * (k / 12);
  }

  static calculateRequiredDurationForGoal(
    targetAmount: number,
    monthlyInvestment: number,
    expectedAnnualReturn: number
  ): number {
    if (targetAmount <= 0 || monthlyInvestment <= 0) return 0;
    const monthlyRate = expectedAnnualReturn / 100 / 12;
    if (monthlyRate <= 0) {
      return targetAmount / monthlyInvestment / 12;
    }
    const argument = 1 + (targetAmount * monthlyRate) / (monthlyInvestment * (1 + monthlyRate));
    if (argument <= 0) return 0;
    const totalMonths = Math.log(argument) / Math.log(1 + monthlyRate);
    return totalMonths / 12;
  }
}
