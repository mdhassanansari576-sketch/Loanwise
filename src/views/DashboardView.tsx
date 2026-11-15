import React from 'react';
import { NavigationTab, SavedLoanCalculation, SavedSipCalculation, UserProfile } from '../types';
import { CurrencyFormatter } from '../utils/calculator';
import { FintechCard } from '../components/FintechCard';
import {
  GraduationCap,
  Building2,
  Calculator,
  TrendingUp,
  ArrowRight,
  GitCompare,
  History,
  PiggyBank,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  loans: SavedLoanCalculation[];
  sips: SavedSipCalculation[];
  userProfile: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  loans,
  sips,
  userProfile,
}) => {
  const totalLoanDisbursed = loans.reduce((sum, l) => sum + l.totalDisbursedAmount, 0);
  const totalSipProjected = sips.reduce((sum, s) => sum + s.estimatedFutureValue, 0);
  const totalMonthlySip = sips.reduce((sum, s) => sum + s.monthlyInvestment, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hello, {userProfile.fullName || 'Investor'} 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome to your unified Loan, EMI & Systematic Investment dashboard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('education-loan')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Plan Education Loan</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sip-calculator')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Calculate SIP</span>
          </button>
        </div>
      </div>

      {/* Hero Visual 3D Graphic Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/60 dark:border-slate-800 bg-slate-900 h-48 sm:h-56">
        <img
          src="/hero-banner.jpg"
          alt="LoanWise Fintech Hero"
          className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            // Fallback gradient if image not found
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/80 to-transparent flex flex-col justify-center p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold w-fit mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FINANCIAL SUITE 2026</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug max-w-md">
            Intelligent Loans & Wealth Compounding
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mt-1">
            Calculate complex education loan moratorium interest &amp; build multi-crore systematic wealth portfolios.
          </p>
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Total Loans Tracked</span>
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {CurrencyFormatter.formatInrCompact(totalLoanDisbursed)}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {loans.length} active loan scenarios
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Projected SIP Wealth</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {CurrencyFormatter.formatInrCompact(totalSipProjected)}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Across {sips.length} investment plans
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Monthly SIP Outflow</span>
            <PiggyBank className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {CurrencyFormatter.formatInr(totalMonthlySip)}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Systematic commitments
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Risk Persona</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {userProfile.riskProfile}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Optimal for growth assets
          </div>
        </div>
      </div>

      {/* REQUIREMENT 3: Loan Type Selection */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          What type of loan do you want to calculate?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Choose a tailored financial engine with dedicated parameters and amortization schedules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Education Loan Card */}
          <div
            onClick={() => onNavigate('education-loan')}
            className="group cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-200/70 dark:border-blue-800/50 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Education Loan
              </h4>
              <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Plan multi-year university tuition tranches, academic disbursements, interest accrual during the course moratorium, and reducing-balance repayment post-graduation.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-blue-200/40 dark:border-blue-800/30 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800">Tranche Accrual</span>
              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800">Moratorium Grace</span>
              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800">Capitalization Option</span>
            </div>
          </div>

          {/* Other Loan Card */}
          <div
            onClick={() => onNavigate('other-loan')}
            className="group cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/60 dark:to-indigo-950/20 border-2 border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Other Loans
              </h4>
              <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Standard and reducing EMI calculations for Home Loans, Personal Loans, Vehicle Loans, and Business expansions, including monthly prepayment savings.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800">Home Loan (8.4%)</span>
              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800">Personal &amp; Car</span>
              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800">Prepayment Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated SIP Showcase Card */}
      <div
        onClick={() => onNavigate('sip-calculator')}
        className="cursor-pointer rounded-2xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg relative overflow-hidden group hover:shadow-emerald-500/20 hover:shadow-xl transition-all"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                WEALTH ENGINE
              </span>
              <span className="text-xs text-emerald-100 font-semibold">
                Annuity-Due Compounding
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black tracking-tight">
              Systematic Investment Plan (SIP) Calculator
            </h4>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Project multi-year wealth accumulation with annual Step-Up SIP (0–100%), inflation-adjusted purchasing power, and Reverse SIP target goal planning.
            </p>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md group-hover:bg-emerald-50 transition-colors w-fit">
            <span>Open SIP Engine</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Tools & Shortcuts */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Tools &amp; Comparison Shortcuts
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('emi-calculator')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 text-left transition-all shadow-sm"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                EMI Engine
              </div>
              <div className="text-[10px] text-slate-400">Reducing Balance</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('loan-comparison')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 text-left transition-all shadow-sm"
          >
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Comparison
              </div>
              <div className="text-[10px] text-slate-400">Side-by-side</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('saved-calculations')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all shadow-sm"
          >
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Saved Archive
              </div>
              <div className="text-[10px] text-slate-400">Persistent database</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('sip-history')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500 text-left transition-all shadow-sm"
          >
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                SIP Portfolio
              </div>
              <div className="text-[10px] text-slate-400">Aggregated trajectory</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Calculations Section */}
      <FintechCard
        title="Recent Financial Calculations"
        subtitle="Saved scenarios stored securely in your database"
        headerAction={
          <button
            type="button"
            onClick={() => onNavigate('saved-calculations')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({loans.length + sips.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-3">
          {loans.length === 0 && sips.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No saved calculations yet. Choose a calculator above to create your first scenario!
            </div>
          ) : (
            <>
              {loans.slice(0, 2).map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => onNavigate('saved-calculations')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {loan.loanType}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {loan.loanName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Disbursed: {CurrencyFormatter.formatInr(loan.totalDisbursedAmount)} • Repayment: {loan.repaymentDurationYears} Yrs
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {CurrencyFormatter.formatInr(loan.emiAmount)}/mo
                    </div>
                    <div className="text-[11px] text-slate-400">Monthly EMI</div>
                  </div>
                </div>
              ))}

              {sips.slice(0, 1).map((sip) => (
                <div
                  key={sip.id}
                  onClick={() => onNavigate('sip-history')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        SIP {sip.sipFrequency}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {sip.sipName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Invested: {CurrencyFormatter.formatInr(sip.totalInvestedAmount)} • {sip.investmentDurationYears} Yrs @ {sip.expectedAnnualReturn}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {CurrencyFormatter.formatInrCompact(sip.estimatedFutureValue)}
                    </div>
                    <div className="text-[11px] text-slate-400">Estimated Wealth</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </FintechCard>
    </div>
  );
};
