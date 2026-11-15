import React, { useState, useMemo } from 'react';
import {
  CompoundingFrequency,
  DisbursementInput,
  InterestCalculationType,
  SavedLoanCalculation,
} from '../types';
import { CurrencyFormatter, FinancialCalculator } from '../utils/calculator';
import { FinancialExporter } from '../utils/export';
import { SliderInput } from '../components/SliderInput';
import { PrimaryHeroCard, MetricTile } from '../components/PrimaryHeroCard';
import { FintechCard } from '../components/FintechCard';
import {
  FinancialDonutChart,
  YearWiseBarChart,
  GrowthLineChart,
} from '../components/Charts';
import { AmortizationTable } from '../components/AmortizationTable';
import {
  GraduationCap,
  Plus,
  Trash2,
  Bookmark,
  Share2,
  RotateCcw,
  Check,
} from 'lucide-react';

interface EducationLoanViewProps {
  onSaveLoan: (loan: SavedLoanCalculation) => void;
  showNotification: (msg: string) => void;
}

export const EducationLoanView: React.FC<EducationLoanViewProps> = ({
  onSaveLoan,
  showNotification,
}) => {
  // Course details
  const [courseDurationYears, setCourseDurationYears] = useState<number>(4);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(9.5);
  const [interestType, setInterestType] = useState<InterestCalculationType>('COMPOUND');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('ANNUALLY');
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(12);
  const [repaymentDurationYears, setRepaymentDurationYears] = useState<number>(10);
  const [payInterestDuringCourse, setPayInterestDuringCourse] = useState<boolean>(false);
  const [capitalizeInterest, setCapitalizeInterest] = useState<boolean>(true);

  // Dynamic disbursements
  const [disbursements, setDisbursements] = useState<DisbursementInput[]>([
    { id: 'd1', academicYear: 1, installmentNumberInYear: 1, amount: 200000, monthOffsetFromStart: 0, dateString: 'Year 1 Tranche 1', label: 'Year 1 Tuition & Fees' },
    { id: 'd2', academicYear: 2, installmentNumberInYear: 1, amount: 300000, monthOffsetFromStart: 12, dateString: 'Year 2 Tranche 1', label: 'Year 2 Tuition & Labs' },
    { id: 'd3', academicYear: 3, installmentNumberInYear: 1, amount: 250000, monthOffsetFromStart: 24, dateString: 'Year 3 Tranche 1', label: 'Year 3 Tuition & Project' },
    { id: 'd4', academicYear: 4, installmentNumberInYear: 1, amount: 250000, monthOffsetFromStart: 36, dateString: 'Year 4 Tranche 1', label: 'Year 4 Tuition & Placement' },
  ]);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [loanSaveName, setLoanSaveName] = useState<string>('B.Tech / Masters Education Loan');

  // Sync rows when course duration changes
  const handleDurationChange = (newDuration: number) => {
    setCourseDurationYears(newDuration);
    const maxYear = disbursements.reduce((max, d) => Math.max(max, d.academicYear), 0);
    if (newDuration > maxYear) {
      const added: DisbursementInput[] = [];
      for (let y = maxYear + 1; y <= newDuration; y++) {
        added.push({
          id: `d-${y}-${Date.now()}`,
          academicYear: y,
          installmentNumberInYear: 1,
          amount: 250000,
          monthOffsetFromStart: (y - 1) * 12,
          dateString: `Year ${y} Tranche 1`,
          label: `Year ${y} Tuition`,
        });
      }
      setDisbursements([...disbursements, ...added]);
    } else if (newDuration < maxYear) {
      setDisbursements(disbursements.filter((d) => d.academicYear <= newDuration));
    }
  };

  const updateDisbursementAmount = (id: string, amount: number) => {
    setDisbursements(
      disbursements.map((d) => (d.id === id ? { ...d, amount: Math.max(0, amount) } : d))
    );
  };

  const addDisbursementTranche = (year: number) => {
    const existingForYear = disbursements.filter((d) => d.academicYear === year);
    const newInstallmentNum = existingForYear.length + 1;
    const newTranche: DisbursementInput = {
      id: `d-${year}-${newInstallmentNum}-${Date.now()}`,
      academicYear: year,
      installmentNumberInYear: newInstallmentNum,
      amount: 100000,
      monthOffsetFromStart: (year - 1) * 12 + 6,
      dateString: `Year ${year} Sem ${newInstallmentNum}`,
      label: `Year ${year} Additional Tranche`,
    };
    setDisbursements([...disbursements, newTranche]);
  };

  const removeDisbursementTranche = (id: string) => {
    if (disbursements.length > 1) {
      setDisbursements(disbursements.filter((d) => d.id !== id));
    }
  };

  // Real-time calculation engine
  const result = useMemo(() => {
    return FinancialCalculator.calculateEducationLoan(
      disbursements,
      annualInterestRate,
      interestType,
      compoundingFrequency,
      courseDurationYears,
      gracePeriodMonths,
      repaymentDurationYears,
      payInterestDuringCourse,
      capitalizeInterest
    );
  }, [
    disbursements,
    annualInterestRate,
    interestType,
    compoundingFrequency,
    courseDurationYears,
    gracePeriodMonths,
    repaymentDurationYears,
    payInterestDuringCourse,
    capitalizeInterest,
  ]);

  const handleSave = () => {
    const newLoan: SavedLoanCalculation = {
      id: crypto.randomUUID(),
      loanName: loanSaveName || 'Education Loan Plan',
      loanType: 'EDUCATION',
      interestType,
      compoundFrequency: compoundingFrequency,
      annualInterestRate,
      courseDurationYears,
      gracePeriodMonths,
      repaymentDurationYears,
      totalDisbursedAmount: result.totalDisbursedAmount,
      totalInterest: result.totalInterestPayable,
      moratoriumInterest: result.moratoriumInterest,
      outstandingBalance: result.outstandingBalanceAtEmiStart,
      emiAmount: result.emiAmount,
      totalRepayment: result.totalRepaymentAmount,
      payInterestDuringCourse,
      capitalizeInterest,
      processingFee: 0,
      calculationDate: Date.now(),
      createdAt: Date.now(),
      disbursements,
      scheduleSample: result.schedule.slice(0, 24),
    };

    onSaveLoan(newLoan);
    setShowSaveModal(false);
    showNotification('Education Loan calculation saved successfully to database!');
  };

  const handleShare = () => {
    const summary = `🎓 LoanWise Education Loan Plan:
Disbursed: ${CurrencyFormatter.formatInr(result.totalDisbursedAmount)}
Moratorium Interest: ${CurrencyFormatter.formatInr(result.moratoriumInterest)}
Outstanding at EMI: ${CurrencyFormatter.formatInr(result.outstandingBalanceAtEmiStart)}
Monthly EMI: ${CurrencyFormatter.formatInr(result.emiAmount)}/month (${repaymentDurationYears} Yrs)
Total Repayment: ${CurrencyFormatter.formatInr(result.totalRepaymentAmount)}`;

    navigator.clipboard.writeText(summary);
    showNotification('Calculation summary copied to clipboard!');
  };

  const chartSlices = [
    { label: 'Disbursed Principal', value: result.totalDisbursedAmount, color: '#2563EB' },
    { label: 'Moratorium Interest', value: result.moratoriumInterest, color: '#F59E0B' },
    { label: 'EMI Repayment Interest', value: result.totalEmiInterest, color: '#F43F5E' },
  ];

  const barChartData = Object.entries(result.yearWiseDisbursements).map(([yr, amt]) => ({
    label: `Yr ${yr}`,
    value1: amt,
  }));

  const balanceCurve = result.schedule.slice(0, 36).map((item) => item.closingBalance);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Education Loan Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-year tranche interest accrual during moratorium and reducing EMI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAnnualInterestRate(9.5);
              setGracePeriodMonths(12);
              setRepaymentDurationYears(10);
              setPayInterestDuringCourse(false);
              setCapitalizeInterest(true);
              handleDurationChange(4);
              showNotification('Parameters reset to default Indian banking terms');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
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
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Plan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Course & Moratorium Parameters */}
          <FintechCard
            title="1. Course & Moratorium Parameters"
            subtitle="Study period, interest accrual method, and repayment term"
          >
            <div className="space-y-4">
              <SliderInput
                label="Course Duration"
                value={courseDurationYears}
                min={1}
                max={10}
                step={1}
                onChange={handleDurationChange}
                formatter={(v) => `${v} Years`}
                quickPresets={[
                  { label: '2 Yrs', value: 2 },
                  { label: '3 Yrs', value: 3 },
                  { label: '4 Yrs', value: 4 },
                  { label: '5 Yrs', value: 5 },
                ]}
              />

              <SliderInput
                label="Annual Interest Rate (%)"
                value={annualInterestRate}
                min={5.0}
                max={18.0}
                step={0.25}
                onChange={setAnnualInterestRate}
                formatter={(v) => `${v.toFixed(2)}% p.a.`}
                quickPresets={[
                  { label: '8.5%', value: 8.5 },
                  { label: '9.5%', value: 9.5 },
                  { label: '10.5%', value: 10.5 },
                  { label: '11.5%', value: 11.5 },
                ]}
              />

              {/* Interest Type: Simple vs Compound */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Interest Calculation Type During Moratorium
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterestType('SIMPLE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      interestType === 'SIMPLE'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Simple Interest
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType('COMPOUND')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      interestType === 'COMPOUND'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Compound Interest
                  </button>
                </div>
              </div>

              {interestType === 'COMPOUND' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Compounding Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY'] as CompoundingFrequency[]).map(
                      (freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setCompoundingFrequency(freq)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all capitalize ${
                            compoundingFrequency === freq
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {freq.toLowerCase().replace('_', '-')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              <SliderInput
                label="Grace Period After Course Completion"
                value={gracePeriodMonths}
                min={0}
                max={24}
                step={3}
                onChange={setGracePeriodMonths}
                formatter={(v) => `${v} Months`}
                quickPresets={[
                  { label: '0 Mo', value: 0 },
                  { label: '6 Mos', value: 6 },
                  { label: '12 Mos', value: 12 },
                  { label: '18 Mos', value: 18 },
                ]}
              />

              <SliderInput
                label="EMI Repayment Duration (Post Moratorium)"
                value={repaymentDurationYears}
                min={1}
                max={30}
                step={1}
                onChange={setRepaymentDurationYears}
                formatter={(v) => `${v} Years (${v * 12} EMIs)`}
                quickPresets={[
                  { label: '5 Yrs', value: 5 },
                  { label: '7 Yrs', value: 7 },
                  { label: '10 Yrs', value: 10 },
                  { label: '15 Yrs', value: 15 },
                ]}
              />

              {/* Servicing & Capitalization Toggles */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pay Interest During Course
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Service interest monthly while studying to prevent principal inflation
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={payInterestDuringCourse}
                    onChange={(e) => setPayInterestDuringCourse(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {!payInterestDuringCourse && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Capitalize Moratorium Interest
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Adds accrued interest to principal before calculating reducing EMI
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={capitalizeInterest}
                      onChange={(e) => setCapitalizeInterest(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </FintechCard>

          {/* Section 2: Dynamic Year-Wise Loan Disbursements */}
          <FintechCard
            title="2. Year-Wise Multi-Disbursement Schedule"
            subtitle="Disbursements accrue interest separately from their respective release dates"
            headerAction={
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                Total: {CurrencyFormatter.formatInr(result.totalDisbursedAmount)}
              </span>
            }
          >
            <div className="space-y-3">
              {disbursements.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px]">
                        Year {d.academicYear}
                      </span>
                      <span>{d.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Accrues interest for {Math.max(0, courseDurationYears * 12 + gracePeriodMonths - d.monthOffsetFromStart)} months
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={d.amount || ''}
                        onChange={(e) => updateDisbursementAmount(d.id, parseFloat(e.target.value) || 0)}
                        step={10000}
                        className="w-36 py-1.5 pl-6 pr-2 text-xs font-bold font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => addDisbursementTranche(d.academicYear)}
                      title="Add semester / additional fee tranche for this year"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {disbursements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDisbursementTranche(d.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FintechCard>
        </div>

        {/* Right Column: Results Dashboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hero Monthly EMI Card */}
          <PrimaryHeroCard
            title="Monthly EMI Repayment"
            primaryValue={`${CurrencyFormatter.formatInr(result.emiAmount)} / mo`}
            subtitle={`Repayment commences after ${courseDurationYears * 12 + gracePeriodMonths} months total moratorium.`}
            badgeText={`${repaymentDurationYears} Years Tenure`}
            gradient="blue-indigo"
          />

          {/* Key Summary Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricTile
              label="Total Disbursed"
              value={CurrencyFormatter.formatInr(result.totalDisbursedAmount)}
              subValue="Tuition & living fees"
              accentColor="bg-blue-600"
            />
            <MetricTile
              label="Moratorium Interest"
              value={CurrencyFormatter.formatInr(result.moratoriumInterest)}
              subValue={payInterestDuringCourse ? 'Serviced during study' : 'Capitalized to balance'}
              accentColor="bg-amber-500"
            />
            <MetricTile
              label="Outstanding at EMI Start"
              value={CurrencyFormatter.formatInr(result.outstandingBalanceAtEmiStart)}
              subValue="Base for reducing EMI"
              accentColor="bg-indigo-600"
            />
            <MetricTile
              label="Total Cost to Borrower"
              value={CurrencyFormatter.formatInr(result.totalCostOfBorrowing)}
              subValue="Principal + all interest"
              accentColor="bg-emerald-600"
            />
          </div>

          {/* Donut Chart: Cost Breakdown */}
          <FintechCard title="Financial Breakdown">
            <FinancialDonutChart
              slices={chartSlices}
              centerTitle="Total Borrowing Cost"
              centerValue={CurrencyFormatter.formatInrCompact(result.totalCostOfBorrowing)}
            />
          </FintechCard>

          {/* Year-Wise Disbursement Bar Chart */}
          <FintechCard title="Year-Wise Disbursements">
            <YearWiseBarChart
              data={barChartData}
              label1="Disbursement (₹)"
              color1="#2563EB"
            />
          </FintechCard>

          {/* Balance Reduction Trajectory */}
          <FintechCard title="Balance Amortization Curve (Months 1–36)">
            <GrowthLineChart
              dataPoints={balanceCurve}
              lineColor="#10B981"
            />
          </FintechCard>
        </div>
      </div>

      {/* Full Amortization Table */}
      <FintechCard>
        <AmortizationTable
          schedule={result.schedule}
          title="Education Loan EMI Amortization Schedule"
          onExportPdf={() => FinancialExporter.exportLoanPdfReport(loanSaveName, result, annualInterestRate)}
        />
      </FintechCard>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Save Education Loan Scenario
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a name for this scenario to archive it into your database:
            </p>

            <input
              type="text"
              value={loanSaveName}
              onChange={(e) => setLoanSaveName(e.target.value)}
              placeholder="e.g. Stanford Masters Loan"
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
                Save to Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
