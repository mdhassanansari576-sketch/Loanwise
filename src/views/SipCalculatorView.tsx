import React, { useState, useMemo } from 'react';
import { SavedSipCalculation, SipFrequency } from '../types';
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
import {
  TrendingUp,
  Target,
  GitCompare,
  FileSpreadsheet,
  FileText,
  Share2,
  Bookmark,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

type SipSubTab = 'SIP_CALCULATOR' | 'GOAL_PLANNER' | 'COMPARISON';

interface SipCalculatorViewProps {
  onSaveSip: (sip: SavedSipCalculation) => void;
  showNotification: (msg: string) => void;
}

export const SipCalculatorView: React.FC<SipCalculatorViewProps> = ({
  onSaveSip,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<SipSubTab>('SIP_CALCULATOR');

  // Core SIP Inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(12);
  const [investmentDurationYears, setInvestmentDurationYears] = useState<number>(15);
  const [sipFrequency, setSipFrequency] = useState<SipFrequency>('MONTHLY');

  // Step-Up & Initial Investment
  const [isStepUpEnabled, setIsStepUpEnabled] = useState<boolean>(true);
  const [stepUpPercentage, setStepUpPercentage] = useState<number>(10);
  const [initialLumpSum, setInitialLumpSum] = useState<number>(25000);

  // Inflation
  const [isInflationAdjusted, setIsInflationAdjusted] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6);

  // Goal Planner (Reverse SIP) Inputs
  const [targetGoalAmount, setTargetGoalAmount] = useState<number>(10000000); // 1 Crore default
  const [goalTargetYears, setGoalTargetYears] = useState<number>(15);

  // Save Modal
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [sipSaveName, setSipSaveName] = useState<string>('Wealth Builder SIP');

  // Main Calculation Result
  const sipResult = useMemo(() => {
    return FinancialCalculator.calculateSip(
      monthlyInvestment,
      expectedAnnualReturn,
      investmentDurationYears,
      sipFrequency,
      isStepUpEnabled ? stepUpPercentage : 0,
      initialLumpSum,
      isInflationAdjusted ? inflationRate : 0
    );
  }, [
    monthlyInvestment,
    expectedAnnualReturn,
    investmentDurationYears,
    sipFrequency,
    isStepUpEnabled,
    stepUpPercentage,
    initialLumpSum,
    isInflationAdjusted,
    inflationRate,
  ]);

  // Reverse SIP calculations
  const requiredMonthlySip = useMemo(() => {
    return FinancialCalculator.calculateRequiredMonthlySipForGoal(
      targetGoalAmount,
      expectedAnnualReturn,
      goalTargetYears,
      sipFrequency
    );
  }, [targetGoalAmount, expectedAnnualReturn, goalTargetYears, sipFrequency]);

  const requiredDurationForGoal = useMemo(() => {
    return FinancialCalculator.calculateRequiredDurationForGoal(
      targetGoalAmount,
      monthlyInvestment,
      expectedAnnualReturn
    );
  }, [targetGoalAmount, monthlyInvestment, expectedAnnualReturn]);

  const handleSave = () => {
    const finalName =
      sipSaveName.trim() ||
      `SIP - ${CurrencyFormatter.formatInr(monthlyInvestment)}/mo (${investmentDurationYears}Y)`;

    const newSip: SavedSipCalculation = {
      id: crypto.randomUUID(),
      sipName: finalName,
      monthlyInvestment,
      expectedAnnualReturn,
      investmentDurationYears,
      sipFrequency,
      stepUpPercentage: isStepUpEnabled ? stepUpPercentage : 0,
      initialInvestment: initialLumpSum,
      totalInvestedAmount: sipResult.totalInvestedAmount,
      estimatedReturns: sipResult.estimatedReturns,
      estimatedFutureValue: sipResult.estimatedFutureValue,
      inflationAdjustedValue: sipResult.inflationAdjustedFutureValue,
      goalAmount: targetGoalAmount,
      calculationDate: Date.now(),
      createdAt: Date.now(),
      yearlyBreakdown: sipResult.yearlyBreakdown,
    };

    onSaveSip(newSip);
    setShowSaveModal(false);
    showNotification('SIP scenario saved successfully to database!');
  };

  const handleShare = () => {
    const summary = `📈 LoanWise SIP Wealth Projection:
Monthly Investment: ${CurrencyFormatter.formatInr(monthlyInvestment)}
Expected Return: ${expectedAnnualReturn}% p.a.
Duration: ${investmentDurationYears} Years (${sipFrequency})
Step-Up: ${isStepUpEnabled ? `${stepUpPercentage}% yearly` : 'None'}
Total Invested: ${CurrencyFormatter.formatInr(sipResult.totalInvestedAmount)}
Estimated Profit: ${CurrencyFormatter.formatInr(sipResult.estimatedReturns)}
Estimated Portfolio Wealth: ${CurrencyFormatter.formatInr(sipResult.estimatedFutureValue)}`;

    navigator.clipboard.writeText(summary);
    showNotification('SIP report summary copied to clipboard!');
  };

  const exportTableToExcel = () => {
    const data = sipResult.yearlyBreakdown.map((row) => ({
      'Year': `Year ${row.yearNumber}`,
      'Cumulative Invested (INR)': Math.round(row.cumulativeInvested),
      'Estimated Profit (INR)': Math.round(row.estimatedProfit),
      'Estimated Portfolio Value (INR)': Math.round(row.estimatedPortfolioValue),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SIP Growth Projection');
    XLSX.writeFile(wb, 'LoanWise_SIP_Projection.xlsx');
    showNotification('Excel spreadsheet downloaded!');
  };

  const chartSlices = [
    { label: 'Invested Capital', value: sipResult.totalInvestedAmount, color: '#2563EB' },
    { label: 'Estimated Profit', value: sipResult.estimatedReturns, color: '#10B981' },
  ];

  const yearlyBarData = sipResult.yearlyBreakdown.map((item) => ({
    label: `Y${item.yearNumber}`,
    value1: item.cumulativeInvested,
    value2: item.estimatedPortfolioValue,
  }));

  const growthCurve = sipResult.yearlyBreakdown.map((item) => item.estimatedPortfolioValue);

  const stepUpAdvantage = sipResult.estimatedFutureValue - sipResult.regularComparisonFutureValue;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              SIP Investment Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Systematic wealth accumulation, Step-Up multiplier, and target goal engineering
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
              setSipSaveName(`SIP - ${CurrencyFormatter.formatInr(monthlyInvestment)}/mo (${investmentDurationYears}Y)`);
              setShowSaveModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save SIP</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 w-full sm:w-fit border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('SIP_CALCULATOR')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'SIP_CALCULATOR'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>SIP &amp; Step-Up</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GOAL_PLANNER')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'GOAL_PLANNER'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Goal Planner (Reverse SIP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPARISON')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'COMPARISON'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Step-Up vs Regular</span>
        </button>
      </div>

      {/* Mode 1: Goal Planner (Reverse SIP) */}
      {activeTab === 'GOAL_PLANNER' && (
        <div className="space-y-6">
          <FintechCard
            title="Reverse SIP Goal Calculator"
            subtitle="Determine the monthly investment required to reach your desired target wealth"
          >
            <div className="space-y-4">
              <SliderInput
                label="Target Wealth Goal Amount"
                value={targetGoalAmount}
                min={100000}
                max={50000000}
                step={100000}
                onChange={setTargetGoalAmount}
                formatter={(v) => CurrencyFormatter.formatInr(v)}
                quickPresets={[
                  { label: '₹25 Lakh', value: 2500000 },
                  { label: '₹50 Lakh', value: 5000000 },
                  { label: '₹1 Crore', value: 10000000 },
                  { label: '₹2.5 Crore', value: 25000000 },
                ]}
              />

              <SliderInput
                label="Target Horizon (Investment Duration)"
                value={goalTargetYears}
                min={1}
                max={35}
                step={1}
                onChange={setGoalTargetYears}
                formatter={(v) => `${v} Years`}
                quickPresets={[
                  { label: '5 Yrs', value: 5 },
                  { label: '10 Yrs', value: 10 },
                  { label: '15 Yrs', value: 15 },
                  { label: '20 Yrs', value: 20 },
                ]}
              />

              <SliderInput
                label="Expected Annual Return (%)"
                value={expectedAnnualReturn}
                min={4}
                max={25}
                step={0.5}
                onChange={setExpectedAnnualReturn}
                formatter={(v) => `${v.toFixed(1)}% p.a.`}
                quickPresets={[
                  { label: '10%', value: 10 },
                  { label: '12%', value: 12 },
                  { label: '14%', value: 14 },
                  { label: '16%', value: 16 },
                ]}
              />
            </div>
          </FintechCard>

          <PrimaryHeroCard
            title="Required Monthly SIP Investment"
            primaryValue={`${CurrencyFormatter.formatInr(requiredMonthlySip)} / mo`}
            subtitle={`Invest this amount monthly at ${expectedAnnualReturn}% to reach ${CurrencyFormatter.formatInrCompact(targetGoalAmount)} in ${goalTargetYears} years.`}
            badgeText="Target Milestone"
            gradient="emerald-cyan"
          />

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Alternative Horizon with Current SIP ({CurrencyFormatter.formatInr(monthlyInvestment)}/month):
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you invest your current SIP amount of <strong>{CurrencyFormatter.formatInr(monthlyInvestment)}/mo</strong> at {expectedAnnualReturn}%, it will take approximately <strong>{requiredDurationForGoal.toFixed(1)} years</strong> to reach your target milestone of {CurrencyFormatter.formatInrCompact(targetGoalAmount)}.
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Core SIP Calculator & Step-Up */}
      {activeTab !== 'GOAL_PLANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <FintechCard title="SIP Investment Inputs">
              <div className="space-y-4">
                <SliderInput
                  label="Monthly SIP Amount"
                  value={monthlyInvestment}
                  min={500}
                  max={200000}
                  step={500}
                  onChange={setMonthlyInvestment}
                  formatter={(v) => CurrencyFormatter.formatInr(v)}
                  quickPresets={[
                    { label: '₹2.5K', value: 2500 },
                    { label: '₹5K', value: 5000 },
                    { label: '₹10K', value: 10000 },
                    { label: '₹25K', value: 25000 },
                    { label: '₹50K', value: 50000 },
                  ]}
                />

                <SliderInput
                  label="Expected Annual Return Rate (%)"
                  value={expectedAnnualReturn}
                  min={1}
                  max={30}
                  step={0.5}
                  onChange={setExpectedAnnualReturn}
                  formatter={(v) => `${v.toFixed(1)}% p.a.`}
                  quickPresets={[
                    { label: '8%', value: 8 },
                    { label: '12%', value: 12 },
                    { label: '14%', value: 14 },
                    { label: '16%', value: 16 },
                  ]}
                />

                <SliderInput
                  label="Investment Duration"
                  value={investmentDurationYears}
                  min={1}
                  max={40}
                  step={1}
                  onChange={setInvestmentDurationYears}
                  formatter={(v) => `${v} Years (${v * 12} installments)`}
                  quickPresets={[
                    { label: '5 Yrs', value: 5 },
                    { label: '10 Yrs', value: 10 },
                    { label: '15 Yrs', value: 15 },
                    { label: '20 Yrs', value: 20 },
                    { label: '25 Yrs', value: 25 },
                  ]}
                />

                {/* Investment Frequency */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    SIP Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['MONTHLY', 'QUARTERLY', 'WEEKLY'] as SipFrequency[]).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setSipFrequency(freq)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all capitalize ${
                          sipFrequency === freq
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {freq.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step-Up Toggle & Slider */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Annual Step-Up SIP (Top-Up)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Increase monthly investment yearly with your annual salary increment
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isStepUpEnabled}
                      onChange={(e) => setIsStepUpEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {isStepUpEnabled && (
                    <SliderInput
                      label="Annual Step-Up Percentage (%)"
                      value={stepUpPercentage}
                      min={1}
                      max={50}
                      step={1}
                      onChange={setStepUpPercentage}
                      formatter={(v) => `${v}% Yearly`}
                      quickPresets={[
                        { label: '5%', value: 5 },
                        { label: '10%', value: 10 },
                        { label: '15%', value: 15 },
                        { label: '20%', value: 20 },
                      ]}
                    />
                  )}
                </div>

                {/* Initial Lump sum */}
                <SliderInput
                  label="Initial Lump-Sum Investment (Optional)"
                  value={initialLumpSum}
                  min={0}
                  max={1000000}
                  step={10000}
                  onChange={setInitialLumpSum}
                  formatter={(v) => (v > 0 ? CurrencyFormatter.formatInr(v) : 'None (₹0)')}
                  quickPresets={[
                    { label: 'None', value: 0 },
                    { label: '₹25K', value: 25000 },
                    { label: '₹50K', value: 50000 },
                    { label: '₹1 Lakh', value: 100000 },
                  ]}
                />

                {/* Inflation Adjustment */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Inflation-Adjusted Purchasing Power
                      </div>
                      <div className="text-[11px] text-slate-400">
                        View real future wealth discounted for inflation
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isInflationAdjusted}
                      onChange={(e) => setIsInflationAdjusted(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {isInflationAdjusted && (
                    <SliderInput
                      label="Assumed Annual Inflation Rate (%)"
                      value={inflationRate}
                      min={2}
                      max={12}
                      step={0.5}
                      onChange={setInflationRate}
                      formatter={(v) => `${v.toFixed(1)}% p.a.`}
                      quickPresets={[
                        { label: '4%', value: 4 },
                        { label: '6%', value: 6 },
                        { label: '7%', value: 7 },
                        { label: '8%', value: 8 },
                      ]}
                    />
                  )}
                </div>
              </div>
            </FintechCard>
          </div>

          {/* Results Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <PrimaryHeroCard
              title="Estimated Future Value"
              primaryValue={CurrencyFormatter.formatInr(sipResult.estimatedFutureValue)}
              subtitle={
                isInflationAdjusted
                  ? `Purchasing Power (Real Value): ${CurrencyFormatter.formatInrCompact(sipResult.inflationAdjustedFutureValue)}`
                  : `Estimated Profit: ${CurrencyFormatter.formatInrCompact(sipResult.estimatedReturns)}`
              }
              badgeText={isStepUpEnabled ? `Step-Up ${stepUpPercentage}%` : 'Regular SIP'}
              gradient="emerald-cyan"
            />

            <div className="grid grid-cols-2 gap-3">
              <MetricTile
                label="Total Invested"
                value={CurrencyFormatter.formatInr(sipResult.totalInvestedAmount)}
                subValue="Your capital contribution"
                accentColor="bg-blue-600"
              />
              <MetricTile
                label="Estimated Wealth Gain"
                value={CurrencyFormatter.formatInr(sipResult.estimatedReturns)}
                subValue={`${((sipResult.estimatedReturns / sipResult.totalInvestedAmount) * 100).toFixed(1)}% profit multiplier`}
                accentColor="bg-emerald-600"
              />
              <MetricTile
                label="Expected Return"
                value={`${expectedAnnualReturn}% p.a.`}
                subValue="Market-linked rate"
                accentColor="bg-cyan-500"
              />
              <MetricTile
                label="Investment Horizon"
                value={`${investmentDurationYears} Years`}
                subValue={`${investmentDurationYears * FinancialCalculator.getSipPeriodsPerYear(sipFrequency)} installments`}
                accentColor="bg-indigo-600"
              />
            </div>

            {/* Step-Up Advantage Card */}
            {isStepUpEnabled && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Step-Up SIP Compounding Advantage</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  By stepping up your investment by <strong>{stepUpPercentage}% annually</strong>, you will generate an additional{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                    {CurrencyFormatter.formatInr(stepUpAdvantage)}
                  </strong>{' '}
                  compared to a fixed regular SIP!
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block font-sans">Regular SIP Value</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {CurrencyFormatter.formatInrCompact(sipResult.regularComparisonFutureValue)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-sans">Step-Up SIP Value</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">
                      {CurrencyFormatter.formatInrCompact(sipResult.estimatedFutureValue)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <FintechCard title="Capital Invested vs Wealth Generated">
              <FinancialDonutChart
                slices={chartSlices}
                centerTitle="Total Portfolio"
                centerValue={CurrencyFormatter.formatInrCompact(sipResult.estimatedFutureValue)}
              />
            </FintechCard>

            <FintechCard title="Wealth Trajectory Over Time">
              <GrowthLineChart dataPoints={growthCurve} lineColor="#10B981" />
            </FintechCard>
          </div>
        </div>
      )}

      {/* Year-Wise Contributions Bar Chart & Breakdown Table */}
      <FintechCard
        title="Year-Wise Investment & Portfolio Trajectory"
        subtitle="Cumulative capital invested vs estimated total portfolio growth"
        headerAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportTableToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Excel</span>
            </button>
            <button
              type="button"
              onClick={() => FinancialExporter.exportSipPdfReport(sipSaveName, sipResult)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <YearWiseBarChart
            data={yearlyBarData}
            label1="Invested Capital (₹)"
            label2="Portfolio Value (₹)"
            color1="#2563EB"
            color2="#10B981"
          />

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Year</th>
                  <th className="py-3 px-3 text-right">Periodic SIP</th>
                  <th className="py-3 px-3 text-right">Cumulative Invested</th>
                  <th className="py-3 px-3 text-right">Estimated Gain</th>
                  <th className="py-3 px-3 text-right">Portfolio Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sipResult.yearlyBreakdown.map((row, idx) => (
                  <tr
                    key={row.yearNumber}
                    className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50/60 dark:bg-slate-800/30'}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      Year {row.yearNumber}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {CurrencyFormatter.formatInr(row.periodicInvestment)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {CurrencyFormatter.formatInr(row.cumulativeInvested)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {CurrencyFormatter.formatInr(row.estimatedProfit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {CurrencyFormatter.formatInr(row.estimatedPortfolioValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FintechCard>

      {/* Market Risk Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Regulatory Disclaimer:</strong> Mutual fund investments and equity securities are subject to market risks. Past returns are not indicative of future performance. SIP calculations are mathematical projections based on assumed CAGR rates of return for personal financial planning purposes.
        </p>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Save SIP Plan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a name to save this SIP investment scenario:
            </p>

            <input
              type="text"
              value={sipSaveName}
              onChange={(e) => setSipSaveName(e.target.value)}
              placeholder="e.g. Retirement 15Y SIP"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
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
