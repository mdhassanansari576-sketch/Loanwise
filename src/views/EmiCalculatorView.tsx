import React, { useState, useMemo } from 'react';
import { SavedLoanCalculation } from '../types';
import { CurrencyFormatter, FinancialCalculator } from '../utils/calculator';
import { FinancialExporter } from '../utils/export';
import { SliderInput } from '../components/SliderInput';
import { PrimaryHeroCard, MetricTile } from '../components/PrimaryHeroCard';
import { FintechCard } from '../components/FintechCard';
import { FinancialDonutChart } from '../components/Charts';
import { AmortizationTable } from '../components/AmortizationTable';
import { Calculator, Info, Bookmark, Share2 } from 'lucide-react';

interface EmiCalculatorViewProps {
  onSaveLoan: (loan: SavedLoanCalculation) => void;
  showNotification: (msg: string) => void;
}

export const EmiCalculatorView: React.FC<EmiCalculatorViewProps> = ({
  onSaveLoan,
  showNotification,
}) => {
  const [principalAmount, setPrincipalAmount] = useState<number>(1000000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.75);
  const [tenureYears, setTenureYears] = useState<number>(10);

  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [loanSaveName, setLoanSaveName] = useState<string>('Standard EMI Calculation');

  const result = useMemo(() => {
    return FinancialCalculator.calculateOtherLoan(
      'CUSTOM',
      principalAmount,
      annualInterestRate,
      'COMPOUND',
      'MONTHLY',
      tenureYears
    );
  }, [principalAmount, annualInterestRate, tenureYears]);

  const handleSave = () => {
    const newLoan: SavedLoanCalculation = {
      id: crypto.randomUUID(),
      loanName: loanSaveName || `EMI - ${CurrencyFormatter.formatInrCompact(principalAmount)}`,
      loanType: 'CUSTOM',
      interestType: 'COMPOUND',
      compoundFrequency: 'MONTHLY',
      annualInterestRate,
      courseDurationYears: 0,
      gracePeriodMonths: 0,
      repaymentDurationYears: tenureYears,
      totalDisbursedAmount: principalAmount,
      totalInterest: result.totalInterestPayable,
      moratoriumInterest: 0,
      outstandingBalance: principalAmount,
      emiAmount: result.emiAmount,
      totalRepayment: result.totalRepaymentAmount,
      payInterestDuringCourse: false,
      capitalizeInterest: false,
      processingFee: 0,
      calculationDate: Date.now(),
      createdAt: Date.now(),
      disbursements: [{ id: 'd1', academicYear: 1, installmentNumberInYear: 1, amount: principalAmount, monthOffsetFromStart: 0, dateString: 'Day 1', label: 'Loan Principal' }],
      scheduleSample: result.schedule.slice(0, 24),
    };

    onSaveLoan(newLoan);
    setShowSaveModal(false);
    showNotification('EMI calculation saved to database!');
  };

  const handleShare = () => {
    const summary = `📊 LoanWise EMI Calculation:
Principal: ${CurrencyFormatter.formatInr(principalAmount)} @ ${annualInterestRate}%
Tenure: ${tenureYears} Years (${tenureYears * 12} EMIs)
Monthly EMI: ${CurrencyFormatter.formatInr(result.emiAmount)}/mo
Total Repayable: ${CurrencyFormatter.formatInr(result.totalRepaymentAmount)}
Total Interest: ${CurrencyFormatter.formatInr(result.totalInterestPayable)}`;

    navigator.clipboard.writeText(summary);
    showNotification('EMI summary copied to clipboard!');
  };

  const chartSlices = [
    { label: 'Principal', value: principalAmount, color: '#2563EB' },
    { label: 'Total Interest', value: result.totalInterestPayable, color: '#F43F5E' },
  ];

  const monthlyRateDecimal = annualInterestRate / 12 / 100;
  const totalInstallments = tenureYears * 12;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              EMI Calculator Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard Reducing-Balance Monthly Equated Installment Calculator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoanSaveName(`EMI - ${CurrencyFormatter.formatInrCompact(principalAmount)} @ ${annualInterestRate}%`);
              setShowSaveModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Calculation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <FintechCard title="Loan Principal & Term">
            <div className="space-y-4">
              <SliderInput
                label="Principal Amount"
                value={principalAmount}
                min={20000}
                max={20000000}
                step={25000}
                onChange={setPrincipalAmount}
                formatter={(v) => CurrencyFormatter.formatInr(v)}
                quickPresets={[
                  { label: '₹2L', value: 200000 },
                  { label: '₹5L', value: 500000 },
                  { label: '₹10L', value: 1000000 },
                  { label: '₹25L', value: 2500000 },
                  { label: '₹50L', value: 5000000 },
                ]}
              />

              <SliderInput
                label="Annual Interest Rate (%)"
                value={annualInterestRate}
                min={1.0}
                max={25.0}
                step={0.25}
                onChange={setAnnualInterestRate}
                formatter={(v) => `${v.toFixed(2)}% p.a.`}
                quickPresets={[
                  { label: '7.5%', value: 7.5 },
                  { label: '8.5%', value: 8.5 },
                  { label: '9.5%', value: 9.5 },
                  { label: '11.0%', value: 11.0 },
                  { label: '14.0%', value: 14.0 },
                ]}
              />

              <SliderInput
                label="Loan Tenure (Duration)"
                value={tenureYears}
                min={1}
                max={30}
                step={1}
                onChange={setTenureYears}
                formatter={(v) => `${v} Years (${v * 12} installments)`}
                quickPresets={[
                  { label: '2 Yrs', value: 2 },
                  { label: '5 Yrs', value: 5 },
                  { label: '10 Yrs', value: 10 },
                  { label: '15 Yrs', value: 15 },
                  { label: '20 Yrs', value: 20 },
                ]}
              />
            </div>
          </FintechCard>

          {/* Formula Explanation Section */}
          <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-300">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Standard Reducing-Balance EMI Mathematical Formula</span>
            </div>
            <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-slate-800 text-center shadow-inner">
              EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                <strong>P (Principal)</strong> = {CurrencyFormatter.formatInr(principalAmount)} (Outstanding principal amount at EMI commencement).
              </p>
              <p>
                <strong>r (Monthly rate)</strong> = {annualInterestRate}% ÷ 12 ÷ 100 = <strong>{monthlyRateDecimal.toFixed(6)}</strong>
              </p>
              <p>
                <strong>n (Installments)</strong> = {tenureYears} years × 12 = <strong>{totalInstallments} monthly installments</strong>.
              </p>
              <p className="text-slate-500 dark:text-slate-400 italic">
                In this standard reducing method, the interest component decreases each month as principal is repaid.
              </p>
            </div>
          </div>
        </div>

        {/* Results Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <PrimaryHeroCard
            title="Calculated Monthly EMI"
            primaryValue={`${CurrencyFormatter.formatInr(result.emiAmount)} / mo`}
            subtitle={`Total Repayment: ${CurrencyFormatter.formatInr(result.totalRepaymentAmount)} across ${totalInstallments} payments`}
            badgeText="Reducing Balance"
            gradient="blue-indigo"
          />

          <div className="grid grid-cols-2 gap-3">
            <MetricTile
              label="Principal"
              value={CurrencyFormatter.formatInr(principalAmount)}
              subValue="Disbursed amount"
              accentColor="bg-blue-600"
            />
            <MetricTile
              label="Total Interest"
              value={CurrencyFormatter.formatInr(result.totalInterestPayable)}
              subValue={`${((result.totalInterestPayable / result.totalRepaymentAmount) * 100).toFixed(1)}% of total cost`}
              accentColor="bg-rose-500"
            />
          </div>

          <FintechCard title="Principal vs Interest Breakdown">
            <FinancialDonutChart
              slices={chartSlices}
              centerTitle="Total Repayable"
              centerValue={CurrencyFormatter.formatInrCompact(result.totalRepaymentAmount)}
            />
          </FintechCard>
        </div>
      </div>

      {/* Amortization Table */}
      <FintechCard>
        <AmortizationTable
          schedule={result.schedule}
          title="Monthly EMI Amortization Schedule"
          onExportPdf={() => FinancialExporter.exportLoanPdfReport(loanSaveName, result, annualInterestRate)}
        />
      </FintechCard>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Save EMI Scenario
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a name for this EMI calculation:
            </p>

            <input
              type="text"
              value={loanSaveName}
              onChange={(e) => setLoanSaveName(e.target.value)}
              placeholder="e.g. Standard EMI Calculation"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
