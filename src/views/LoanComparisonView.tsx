import React, { useState, useMemo } from 'react';
import { CurrencyFormatter, FinancialCalculator } from '../utils/calculator';
import { SliderInput } from '../components/SliderInput';
import { FintechCard } from '../components/FintechCard';
import { GitCompare, CheckCircle2, TrendingDown } from 'lucide-react';

export const LoanComparisonView: React.FC = () => {
  // Option A (e.g. Bank 1)
  const [amountA, setAmountA] = useState<number>(3000000);
  const [rateA, setRateA] = useState<number>(8.5);
  const [tenureA, setTenureA] = useState<number>(20);

  // Option B (e.g. Bank 2)
  const [amountB, setAmountB] = useState<number>(3000000);
  const [rateB, setRateB] = useState<number>(8.1);
  const [tenureB, setTenureB] = useState<number>(20);

  const resultA = useMemo(() => {
    return FinancialCalculator.calculateOtherLoan('CUSTOM', amountA, rateA, 'COMPOUND', 'MONTHLY', tenureA);
  }, [amountA, rateA, tenureA]);

  const resultB = useMemo(() => {
    return FinancialCalculator.calculateOtherLoan('CUSTOM', amountB, rateB, 'COMPOUND', 'MONTHLY', tenureB);
  }, [amountB, rateB, tenureB]);

  const emiDiff = Math.abs(resultA.emiAmount - resultB.emiAmount);
  const interestDiff = Math.abs(resultA.totalInterestPayable - resultB.totalInterestPayable);
  const totalCostDiff = Math.abs(resultA.totalCostOfBorrowing - resultB.totalCostOfBorrowing);

  const isAWinner = resultA.totalCostOfBorrowing < resultB.totalCostOfBorrowing;
  const isTie = Math.abs(resultA.totalCostOfBorrowing - resultB.totalCostOfBorrowing) < 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Loan Comparison Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare two bank offers side-by-side to find the lowest interest and lowest monthly EMI
          </p>
        </div>
      </div>

      {/* Winner Spotlight Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isTie
            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isTie ? 'Equal Offers' : 'Optimal Financial Choice'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {isTie ? 'Both Loan Options Are Equivalent' : `${isAWinner ? 'Loan Option A' : 'Loan Option B'} Saves More Money!`}
            </h3>
            {!isTie && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                You will save{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {CurrencyFormatter.formatInr(interestDiff)}
                </strong>{' '}
                in total interest and{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {CurrencyFormatter.formatInr(emiDiff)}/mo
                </strong>{' '}
                on monthly installments.
              </p>
            )}
          </div>
        </div>

        {!isTie && (
          <div className="text-right sm:border-l sm:border-emerald-200/60 dark:sm:border-emerald-800/60 sm:pl-6">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Borrowing Savings
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {CurrencyFormatter.formatInr(totalCostDiff)}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Table */}
      <FintechCard title="Side-by-Side Matrix Comparison">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4">Financial Metric</th>
                <th className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                  Option A (e.g. Bank 1)
                </th>
                <th className="py-3 px-4 text-right text-indigo-600 dark:text-indigo-400">
                  Option B (e.g. Bank 2)
                </th>
                <th className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                  Differential
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              <tr className="bg-white dark:bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                  Principal Loan Amount
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {CurrencyFormatter.formatInr(amountA)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {CurrencyFormatter.formatInr(amountB)}
                </td>
                <td className="py-3 px-4 text-right text-slate-500 font-sans">
                  {amountA === amountB ? 'Identical' : CurrencyFormatter.formatInr(Math.abs(amountA - amountB))}
                </td>
              </tr>

              <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                  Annual Interest Rate
                </td>
                <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                  {rateA.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  {rateB.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.abs(rateA - rateB).toFixed(2)}% difference
                </td>
              </tr>

              <tr className="bg-white dark:bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                  Repayment Tenure
                </td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-sans">
                  {tenureA} Years ({tenureA * 12} EMIs)
                </td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-sans">
                  {tenureB} Years ({tenureB * 12} EMIs)
                </td>
                <td className="py-3 px-4 text-right text-slate-500 font-sans">
                  {tenureA === tenureB ? 'Identical' : `${Math.abs(tenureA - tenureB)} Years`}
                </td>
              </tr>

              <tr className="bg-blue-50/40 dark:bg-blue-950/20">
                <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                  Monthly Reducing EMI
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-bold text-base ${
                    resultA.emiAmount <= resultB.emiAmount
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {CurrencyFormatter.formatInr(resultA.emiAmount)}
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-bold text-base ${
                    resultB.emiAmount <= resultA.emiAmount
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {CurrencyFormatter.formatInr(resultB.emiAmount)}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {CurrencyFormatter.formatInr(emiDiff)}/mo
                </td>
              </tr>

              <tr className="bg-white dark:bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                  Total Interest Payable
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {CurrencyFormatter.formatInr(resultA.totalInterestPayable)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {CurrencyFormatter.formatInr(resultB.totalInterestPayable)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {CurrencyFormatter.formatInr(interestDiff)}
                </td>
              </tr>

              <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                  Total Cost of Borrowing
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-bold text-base ${
                    resultA.totalCostOfBorrowing <= resultB.totalCostOfBorrowing
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {CurrencyFormatter.formatInr(resultA.totalCostOfBorrowing)}
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-bold text-base ${
                    resultB.totalCostOfBorrowing <= resultA.totalCostOfBorrowing
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {CurrencyFormatter.formatInr(resultB.totalCostOfBorrowing)}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {CurrencyFormatter.formatInr(totalCostDiff)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FintechCard>

      {/* Config Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A Config */}
        <FintechCard title="Option A (Bank 1) Parameters">
          <div className="space-y-4">
            <SliderInput
              label="Principal Loan"
              value={amountA}
              min={100000}
              max={10000000}
              step={50000}
              onChange={setAmountA}
              formatter={(v) => CurrencyFormatter.formatInr(v)}
            />
            <SliderInput
              label="Annual Rate (%)"
              value={rateA}
              min={4.0}
              max={20.0}
              step={0.1}
              onChange={setRateA}
              formatter={(v) => `${v.toFixed(2)}%`}
            />
            <SliderInput
              label="Loan Tenure"
              value={tenureA}
              min={1}
              max={30}
              step={1}
              onChange={setTenureA}
              formatter={(v) => `${v} Years`}
            />
          </div>
        </FintechCard>

        {/* Option B Config */}
        <FintechCard title="Option B (Bank 2) Parameters">
          <div className="space-y-4">
            <SliderInput
              label="Principal Loan"
              value={amountB}
              min={100000}
              max={10000000}
              step={50000}
              onChange={setAmountB}
              formatter={(v) => CurrencyFormatter.formatInr(v)}
            />
            <SliderInput
              label="Annual Rate (%)"
              value={rateB}
              min={4.0}
              max={20.0}
              step={0.1}
              onChange={setRateB}
              formatter={(v) => `${v.toFixed(2)}%`}
            />
            <SliderInput
              label="Loan Tenure"
              value={tenureB}
              min={1}
              max={30}
              step={1}
              onChange={setTenureB}
              formatter={(v) => `${v} Years`}
            />
          </div>
        </FintechCard>
      </div>
    </div>
  );
};
