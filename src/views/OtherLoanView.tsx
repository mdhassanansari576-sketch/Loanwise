import React, { useState, useMemo } from 'react';
import {
  CompoundingFrequency,
  InterestCalculationType,
  LoanType,
  SavedLoanCalculation,
} from '../types';
import { CurrencyFormatter, FinancialCalculator } from '../utils/calculator';
import { FinancialExporter } from '../utils/export';
import { SliderInput } from '../components/SliderInput';
import { PrimaryHeroCard, MetricTile } from '../components/PrimaryHeroCard';
import { FintechCard } from '../components/FintechCard';
import {
  FinancialDonutChart,
  GrowthLineChart,
} from '../components/Charts';
import { AmortizationTable } from '../components/AmortizationTable';
import {
  Home,
  User,
  Car,
  Briefcase,
  Sliders,
  Bookmark,
  Share2,
  Sparkles,
} from 'lucide-react';

interface OtherLoanViewProps {
  onSaveLoan: (loan: SavedLoanCalculation) => void;
  showNotification: (msg: string) => void;
}

export const OtherLoanView: React.FC<OtherLoanViewProps> = ({
  onSaveLoan,
  showNotification,
}) => {
  const [selectedType, setSelectedType] = useState<LoanType>('HOME');
  const [loanAmount, setLoanAmount] = useState<number>(3500000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.5);
  const [interestType, setInterestType] = useState<InterestCalculationType>('COMPOUND');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('MONTHLY');
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [processingFee, setProcessingFee] = useState<number>(10000);
  const [prepaymentMonthly, setPrepaymentMonthly] = useState<number>(0);

  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [loanSaveName, setLoanSaveName] = useState<string>('');

  const loanCategories: { type: LoanType; label: string; icon: React.ReactNode; defaultRate: number; defaultAmount: number; defaultTenure: number }[] = [
    { type: 'HOME', label: 'Home Loan', icon: <Home className="w-4 h-4" />, defaultRate: 8.4, defaultAmount: 3500000, defaultTenure: 20 },
    { type: 'PERSONAL', label: 'Personal Loan', icon: <User className="w-4 h-4" />, defaultRate: 11.5, defaultAmount: 500000, defaultTenure: 5 },
    { type: 'VEHICLE', label: 'Vehicle Loan', icon: <Car className="w-4 h-4" />, defaultRate: 8.8, defaultAmount: 900000, defaultTenure: 7 },
    { type: 'BUSINESS', label: 'Business Loan', icon: <Briefcase className="w-4 h-4" />, defaultRate: 13.0, defaultAmount: 2000000, defaultTenure: 5 },
    { type: 'CUSTOM', label: 'Custom Loan', icon: <Sliders className="w-4 h-4" />, defaultRate: 9.0, defaultAmount: 1000000, defaultTenure: 10 },
  ];

  const handleSelectCategory = (cat: typeof loanCategories[0]) => {
    setSelectedType(cat.type);
    setAnnualInterestRate(cat.defaultRate);
    setLoanAmount(cat.defaultAmount);
    setTenureYears(cat.defaultTenure);
  };

  const result = useMemo(() => {
    return FinancialCalculator.calculateOtherLoan(
      selectedType,
      loanAmount,
      annualInterestRate,
      interestType,
      compoundingFrequency,
      tenureYears,
      processingFee,
      prepaymentMonthly
    );
  }, [selectedType, loanAmount, annualInterestRate, interestType, compoundingFrequency, tenureYears, processingFee, prepaymentMonthly]);

  // Baseline without prepayment for comparison
  const baselineResult = useMemo(() => {
    return FinancialCalculator.calculateOtherLoan(
      selectedType,
      loanAmount,
      annualInterestRate,
      interestType,
      compoundingFrequency,
      tenureYears,
      processingFee,
      0
    );
  }, [selectedType, loanAmount, annualInterestRate, interestType, compoundingFrequency, tenureYears, processingFee]);

  const interestSaved = Math.max(0, baselineResult.totalInterestPayable - result.totalInterestPayable);
  const monthsSaved = Math.max(0, Math.round(tenureYears * 12) - result.repaymentTenureMonths);

  const handleSave = () => {
    const finalName = loanSaveName.trim() || `${selectedType} Loan - ${CurrencyFormatter.formatInrCompact(loanAmount)}`;
    const newLoan: SavedLoanCalculation = {
      id: crypto.randomUUID(),
      loanName: finalName,
      loanType: selectedType,
      interestType,
      compoundFrequency: compoundingFrequency,
      annualInterestRate,
      courseDurationYears: 0,
      gracePeriodMonths: 0,
      repaymentDurationYears: tenureYears,
      totalDisbursedAmount: result.totalDisbursedAmount,
      totalInterest: result.totalInterestPayable,
      moratoriumInterest: 0,
      outstandingBalance: loanAmount,
      emiAmount: result.emiAmount,
      totalRepayment: result.totalRepaymentAmount,
      payInterestDuringCourse: false,
      capitalizeInterest: false,
      processingFee,
      calculationDate: Date.now(),
      createdAt: Date.now(),
      disbursements: [{ id: 'd1', academicYear: 1, installmentNumberInYear: 1, amount: loanAmount, monthOffsetFromStart: 0, dateString: 'Day 1', label: `${selectedType} Disbursed` }],
      scheduleSample: result.schedule.slice(0, 24),
    };

    onSaveLoan(newLoan);
    setShowSaveModal(false);
    showNotification('Loan calculation saved successfully!');
  };

  const handleShare = () => {
    const summary = `🏦 LoanWise ${selectedType} Loan Plan:
Principal: ${CurrencyFormatter.formatInr(loanAmount)} @ ${annualInterestRate}%
Tenure: ${tenureYears} Years (${tenureYears * 12} EMIs)
Monthly EMI: ${CurrencyFormatter.formatInr(result.emiAmount)}/month
Total Interest: ${CurrencyFormatter.formatInr(result.totalInterestPayable)}
Total Repayment: ${CurrencyFormatter.formatInr(result.totalRepaymentAmount)}`;

    navigator.clipboard.writeText(summary);
    showNotification('Loan calculation copied to clipboard!');
  };

  const chartSlices = [
    { label: 'Principal Amount', value: result.totalDisbursedAmount, color: '#2563EB' },
    { label: 'Total Interest', value: result.totalInterestPayable, color: '#F43F5E' },
  ];

  const balanceCurve = result.schedule.slice(0, 36).map((item) => item.closingBalance);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Other Loan Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personal, Home, Vehicle, Business &amp; Custom loans with reducing-balance EMI and prepayment benefits
          </p>
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
              setLoanSaveName(`${selectedType} Loan - ${CurrencyFormatter.formatInrCompact(loanAmount)}`);
              setShowSaveModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Loan</span>
          </button>
        </div>
      </div>

      {/* Category selector chips */}
      <div className="flex flex-wrap gap-2">
        {loanCategories.map((cat) => {
          const isSelected = selectedType === cat.type;
          return (
            <button
              key={cat.type}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inputs & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <FintechCard title="Loan Parameters">
            <div className="space-y-4">
              <SliderInput
                label="Loan Amount (Principal)"
                value={loanAmount}
                min={50000}
                max={10000000}
                step={50000}
                onChange={setLoanAmount}
                formatter={(v) => CurrencyFormatter.formatInr(v)}
                quickPresets={[
                  { label: '₹5L', value: 500000 },
                  { label: '₹15L', value: 1500000 },
                  { label: '₹25L', value: 2500000 },
                  { label: '₹50L', value: 5000000 },
                  { label: '₹1Cr', value: 10000000 },
                ]}
              />

              <SliderInput
                label="Annual Interest Rate (%)"
                value={annualInterestRate}
                min={4.0}
                max={24.0}
                step={0.1}
                onChange={setAnnualInterestRate}
                formatter={(v) => `${v.toFixed(2)}% p.a.`}
                quickPresets={[
                  { label: '7.5%', value: 7.5 },
                  { label: '8.4%', value: 8.4 },
                  { label: '10.5%', value: 10.5 },
                  { label: '12.0%', value: 12.0 },
                ]}
              />

              <SliderInput
                label="Repayment Tenure (Duration)"
                value={tenureYears}
                min={1}
                max={30}
                step={1}
                onChange={setTenureYears}
                formatter={(v) => `${v} Years (${v * 12} EMIs)`}
                quickPresets={[
                  { label: '3 Yrs', value: 3 },
                  { label: '5 Yrs', value: 5 },
                  { label: '10 Yrs', value: 10 },
                  { label: '20 Yrs', value: 20 },
                  { label: '30 Yrs', value: 30 },
                ]}
              />

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <SliderInput
                  label="Extra Monthly Prepayment (Optional)"
                  value={prepaymentMonthly}
                  min={0}
                  max={50000}
                  step={1000}
                  onChange={setPrepaymentMonthly}
                  formatter={(v) => (v > 0 ? `+${CurrencyFormatter.formatInr(v)}/mo` : 'None (₹0)')}
                  quickPresets={[
                    { label: 'None', value: 0 },
                    { label: '+₹2,500', value: 2500 },
                    { label: '+₹5,000', value: 5000 },
                    { label: '+₹10,000', value: 10000 },
                  ]}
                />

                {prepaymentMonthly > 0 && monthsSaved > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">Prepayment Advantage Active:</div>
                      <p className="mt-0.5">
                        By paying an extra {CurrencyFormatter.formatInr(prepaymentMonthly)} every month, you save{' '}
                        <strong>{CurrencyFormatter.formatInr(interestSaved)}</strong> in total interest and close your loan{' '}
                        <strong>{monthsSaved} months ({Math.floor(monthsSaved / 12)} yrs {monthsSaved % 12} mos)</strong> early!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FintechCard>
        </div>

        {/* Results Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <PrimaryHeroCard
            title="Monthly EMI Amount"
            primaryValue={`${CurrencyFormatter.formatInr(result.emiAmount)} / mo`}
            subtitle={`Total Repayment: ${CurrencyFormatter.formatInr(result.totalRepaymentAmount)}`}
            badgeText={selectedType}
            gradient="indigo-blue"
          />

          <div className="grid grid-cols-2 gap-3">
            <MetricTile
              label="Principal Disbursed"
              value={CurrencyFormatter.formatInr(result.totalDisbursedAmount)}
              subValue="Original loan amount"
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

          <FintechCard title="Loan Balance Amortization Trajectory (Months 1–36)">
            <GrowthLineChart dataPoints={balanceCurve} lineColor="#4F46E5" />
          </FintechCard>
        </div>
      </div>

      {/* Amortization Table */}
      <FintechCard>
        <AmortizationTable
          schedule={result.schedule}
          title={`${selectedType} Loan Monthly Amortization Schedule`}
          onExportPdf={() => FinancialExporter.exportLoanPdfReport(loanSaveName || `${selectedType} Loan`, result, annualInterestRate)}
        />
      </FintechCard>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Save Loan Scenario
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a name for this loan calculation:
            </p>

            <input
              type="text"
              value={loanSaveName}
              onChange={(e) => setLoanSaveName(e.target.value)}
              placeholder="e.g. Dream Villa Home Loan"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
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
