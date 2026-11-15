import React, { useState } from 'react';
import { EmiScheduleItem } from '../types';
import { CurrencyFormatter } from '../utils/calculator';
import { FinancialExporter } from '../utils/export';
import {
  FileSpreadsheet,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AmortizationTableProps {
  schedule: EmiScheduleItem[];
  title?: string;
  onExportPdf?: () => void;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  schedule,
  title = 'Amortization Schedule',
  onExportPdf,
}) => {
  const [displayCount, setDisplayCount] = useState<number>(12);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  const displayedItems = schedule.slice(0, displayCount);

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Displaying {displayedItems.length} of {schedule.length} monthly installments
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>EMI Formula</span>
          </button>

          <button
            type="button"
            onClick={() => FinancialExporter.exportAmortizationToExcel(schedule)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-colors"
            title="Download Amortization Table as Excel spreadsheet (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => FinancialExporter.exportAmortizationToCsv(schedule)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 transition-colors"
            title="Download Amortization Table as CSV"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 transition-colors"
              title="Download Full Loan PDF Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Formula Explainer Panel */}
      {showFormula && (
        <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-bold text-blue-800 dark:text-blue-300">
            Standard Reducing-Balance Monthly EMI Calculation Formula:
          </div>
          <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-blue-100 dark:border-slate-800">
            EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>
              <strong>P</strong>: Outstanding Principal balance at EMI commencement.
            </li>
            <li>
              <strong>r</strong>: Periodic monthly interest rate (Annual % / 12 / 100).
            </li>
            <li>
              <strong>n</strong>: Total number of monthly installments.
            </li>
            <li>
              In reducing balance, every monthly EMI contains an interest component (calculated on remaining balance) and a principal component that reduces the balance for next month.
            </li>
          </ul>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3">Mo.</th>
              <th className="py-3 px-3 text-right">Opening Bal</th>
              <th className="py-3 px-3 text-right">Monthly EMI</th>
              <th className="py-3 px-3 text-right">Principal</th>
              <th className="py-3 px-3 text-right">Interest</th>
              <th className="py-3 px-3 text-right">Closing Bal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {displayedItems.map((item, idx) => (
              <tr
                key={item.installmentNumber}
                className={
                  idx % 2 === 0
                    ? 'bg-white dark:bg-slate-900/50'
                    : 'bg-slate-50/60 dark:bg-slate-800/30'
                }
              >
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  {item.installmentNumber}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                  {CurrencyFormatter.formatInr(item.openingBalance)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                  {CurrencyFormatter.formatInr(item.emiAmount)}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                  {CurrencyFormatter.formatInr(item.principalComponent)}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-rose-500 dark:text-rose-400">
                  {CurrencyFormatter.formatInr(item.interestComponent)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                  {CurrencyFormatter.formatInr(item.closingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination / Expand controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {displayCount < schedule.length && (
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => Math.min(prev + 24, schedule.length))}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Load Next 24 Months</span>
          </button>
        )}

        {displayCount < schedule.length && (
          <button
            type="button"
            onClick={() => setDisplayCount(schedule.length)}
            className="px-3 py-2 text-xs font-semibold rounded-xl text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
          >
            Show All ({schedule.length})
          </button>
        )}

        {displayCount > 12 && (
          <button
            type="button"
            onClick={() => setDisplayCount(12)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Collapse to 12</span>
          </button>
        )}
      </div>
    </div>
  );
};
