import React, { useState } from 'react';
import { SavedLoanCalculation, SavedSipCalculation } from '../types';
import { CurrencyFormatter } from '../utils/calculator';
import { FinancialExporter } from '../utils/export';
import { FintechCard } from '../components/FintechCard';
import {
  Search,
  Edit2,
  Copy,
  Trash2,
  FileSpreadsheet,
  FileText,
  Share2,
  History,
  GraduationCap,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface SavedCalculationsViewProps {
  loans: SavedLoanCalculation[];
  sips: SavedSipCalculation[];
  onRenameLoan: (id: string, newName: string) => void;
  onDuplicateLoan: (id: string) => void;
  onDeleteLoan: (id: string) => void;
  onRenameSip: (id: string, newName: string) => void;
  onDuplicateSip: (id: string) => void;
  onDeleteSip: (id: string) => void;
  showNotification: (msg: string) => void;
}

export const SavedCalculationsView: React.FC<SavedCalculationsViewProps> = ({
  loans,
  sips,
  onRenameLoan,
  onDuplicateLoan,
  onDeleteLoan,
  onRenameSip,
  onDuplicateSip,
  onDeleteSip,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LOANS' | 'SIPS'>('ALL');

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<{ id: string; type: 'LOAN' | 'SIP'; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState<string>('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'LOAN' | 'SIP'; name: string } | null>(null);

  const filteredLoans = loans.filter((l) => {
    if (activeFilter === 'SIPS') return false;
    return (
      l.loanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.loanType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredSips = sips.filter((s) => {
    if (activeFilter === 'LOANS') return false;
    return (
      s.sipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sipFrequency.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleConfirmRename = () => {
    if (!renameTarget || !renameInput.trim()) return;
    if (renameTarget.type === 'LOAN') {
      onRenameLoan(renameTarget.id, renameInput.trim());
    } else {
      onRenameSip(renameTarget.id, renameInput.trim());
    }
    setRenameTarget(null);
    showNotification('Calculation renamed successfully!');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'LOAN') {
      onDeleteLoan(deleteTarget.id);
    } else {
      onDeleteSip(deleteTarget.id);
    }
    setDeleteTarget(null);
    showNotification('Calculation removed from database!');
  };

  const handleShareLoan = (loan: SavedLoanCalculation) => {
    const text = `LoanWise: ${loan.loanName} - Disbursed: ${CurrencyFormatter.formatInr(loan.totalDisbursedAmount)}, EMI: ${CurrencyFormatter.formatInr(loan.emiAmount)}/mo, Total Repayment: ${CurrencyFormatter.formatInr(loan.totalRepayment)}`;
    navigator.clipboard.writeText(text);
    showNotification('Loan summary copied to clipboard!');
  };

  const handleShareSip = (sip: SavedSipCalculation) => {
    const text = `LoanWise: ${sip.sipName} - Monthly: ${CurrencyFormatter.formatInr(sip.monthlyInvestment)}, Invested: ${CurrencyFormatter.formatInr(sip.totalInvestedAmount)}, Projected Wealth: ${CurrencyFormatter.formatInr(sip.estimatedFutureValue)}`;
    navigator.clipboard.writeText(text);
    showNotification('SIP summary copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Saved Calculations Archive
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage, search, duplicate, and export your persistent financial scenarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            Total Stored: {loans.length + sips.length}
          </span>
        </div>
      </div>

      {/* Search Bar & Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved loans or SIP portfolios..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          {(['ALL', 'LOANS', 'SIPS'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter === 'LOANS' ? 'Loans Only' : 'SIPs Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredLoans.length === 0 && filteredSips.length === 0 && (
        <FintechCard>
          <div className="text-center py-12 space-y-3">
            <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No saved calculations found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No calculations matching "${searchQuery}". Try a different keyword.`
                : 'You have not saved any calculations yet. Visit the Education, Other Loan, or SIP calculator to plan and save your scenarios.'}
            </p>
          </div>
        </FintechCard>
      )}

      {/* Loans Section */}
      {filteredLoans.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Loan Scenarios ({filteredLoans.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {loan.loanType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {loan.loanName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameTarget({ id: loan.id, type: 'LOAN', name: loan.loanName });
                        setRenameInput(loan.loanName);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Rename loan scenario"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateLoan(loan.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate loan scenario"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: loan.id, type: 'LOAN', name: loan.loanName })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete loan scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Disbursed</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {CurrencyFormatter.formatInr(loan.totalDisbursedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Monthly EMI</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {CurrencyFormatter.formatInr(loan.emiAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Total Repayment</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {CurrencyFormatter.formatInrCompact(loan.totalRepayment)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>
                    {loan.repaymentDurationYears} Years • {loan.annualInterestRate}% p.a.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareLoan(loan)}
                      className="p-1 text-slate-500 hover:text-blue-600"
                      title="Share summary"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIPs Section */}
      {filteredSips.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>SIP Investment Portfolios ({filteredSips.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSips.map((sip) => (
              <div
                key={sip.id}
                className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        SIP {sip.sipFrequency}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sip.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {sip.sipName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameTarget({ id: sip.id, type: 'SIP', name: sip.sipName });
                        setRenameInput(sip.sipName);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Rename SIP scenario"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateSip(sip.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate SIP scenario"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: sip.id, type: 'SIP', name: sip.sipName })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete SIP scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Monthly Outflow</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {CurrencyFormatter.formatInr(sip.monthlyInvestment)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Total Capital</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {CurrencyFormatter.formatInrCompact(sip.totalInvestedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Future Wealth</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {CurrencyFormatter.formatInrCompact(sip.estimatedFutureValue)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>
                    {sip.investmentDurationYears} Years • {sip.expectedAnnualReturn}% Return
                    {sip.stepUpPercentage > 0 && ` • ${sip.stepUpPercentage}% Step-Up`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareSip(sip)}
                      className="p-1 text-slate-500 hover:text-emerald-600"
                      title="Share summary"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Rename Calculation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update the title for this scenario:
            </p>

            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRename}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> from your persistent database? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
              >
                Delete Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
