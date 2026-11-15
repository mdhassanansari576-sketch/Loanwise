import React from 'react';
import { NavigationTab, SavedSipCalculation } from '../types';
import { CurrencyFormatter } from '../utils/calculator';
import { PrimaryHeroCard, MetricTile } from '../components/PrimaryHeroCard';
import { FintechCard } from '../components/FintechCard';
import { FinancialDonutChart } from '../components/Charts';
import { PiggyBank, Plus, Trash2, ArrowRight, Share2 } from 'lucide-react';

interface SipHistoryViewProps {
  sips: SavedSipCalculation[];
  onNavigate: (tab: NavigationTab) => void;
  onDeleteSip: (id: string) => void;
  showNotification: (msg: string) => void;
}

export const SipHistoryView: React.FC<SipHistoryViewProps> = ({
  sips,
  onNavigate,
  onDeleteSip,
  showNotification,
}) => {
  const totalMonthlyInvestment = sips.reduce((sum, s) => sum + s.monthlyInvestment, 0);
  const totalInvestedCapital = sips.reduce((sum, s) => sum + s.totalInvestedAmount, 0);
  const totalProjectedWealth = sips.reduce((sum, s) => sum + s.estimatedFutureValue, 0);
  const totalProfit = Math.max(0, totalProjectedWealth - totalInvestedCapital);

  const chartSlices = [
    { label: 'Total Invested Capital', value: totalInvestedCapital, color: '#2563EB' },
    { label: 'Estimated Wealth Gains', value: totalProfit, color: '#10B981' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              SIP Investment Portfolio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated Systematic Wealth Tracker &amp; Active Plan Portfolios
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('sip-calculator')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New SIP Plan</span>
        </button>
      </div>

      {/* Aggregate Hero Card */}
      <PrimaryHeroCard
        title="Total Projected Portfolio Wealth"
        primaryValue={CurrencyFormatter.formatInr(totalProjectedWealth)}
        subtitle={`Aggregated across ${sips.length} active SIP plan(s) • Monthly outflow: ${CurrencyFormatter.formatInr(totalMonthlyInvestment)}/month`}
        badgeText="Combined Portfolio"
        gradient="emerald-cyan"
      />

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricTile
          label="Total Monthly Outflow"
          value={CurrencyFormatter.formatInr(totalMonthlyInvestment)}
          subValue="Monthly investment sum"
          accentColor="bg-blue-600"
        />
        <MetricTile
          label="Total Capital Invested"
          value={CurrencyFormatter.formatInr(totalInvestedCapital)}
          subValue="Principal contribution"
          accentColor="bg-indigo-600"
        />
        <MetricTile
          label="Estimated Cumulative Profit"
          value={CurrencyFormatter.formatInr(totalProfit)}
          subValue="Compounded returns"
          accentColor="bg-emerald-600"
        />
      </div>

      {/* Combined Donut Chart */}
      {sips.length > 0 && (
        <FintechCard title="Combined Portfolio Wealth Distribution">
          <FinancialDonutChart
            slices={chartSlices}
            centerTitle="Total Portfolio"
            centerValue={CurrencyFormatter.formatInrCompact(totalProjectedWealth)}
          />
        </FintechCard>
      )}

      {/* Active SIP Plans Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active SIP Plans ({sips.length})
        </h3>

        {sips.length === 0 ? (
          <FintechCard>
            <div className="text-center py-12 space-y-3">
              <PiggyBank className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No active SIP plans
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a SIP investment scenario in the calculator to start tracking your systematic wealth.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('sip-calculator')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                <span>Launch SIP Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </FintechCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sips.map((sip) => (
              <div
                key={sip.id}
                className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        {sip.sipFrequency}
                      </span>
                      {sip.stepUpPercentage > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {sip.stepUpPercentage}% Step-Up
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {sip.sipName}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteSip(sip.id);
                      showNotification('SIP plan deleted from portfolio.');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete SIP plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Monthly</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {CurrencyFormatter.formatInr(sip.monthlyInvestment)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Tenure</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {sip.investmentDurationYears} Yrs
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Projected Wealth</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {CurrencyFormatter.formatInrCompact(sip.estimatedFutureValue)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Expected Return: <strong>{sip.expectedAnnualReturn}% p.a.</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `LoanWise SIP: ${sip.sipName} - Monthly: ${CurrencyFormatter.formatInr(sip.monthlyInvestment)}, Invested: ${CurrencyFormatter.formatInr(sip.totalInvestedAmount)}, Future Wealth: ${CurrencyFormatter.formatInr(sip.estimatedFutureValue)}`;
                      navigator.clipboard.writeText(text);
                      showNotification('SIP summary copied!');
                    }}
                    className="flex items-center gap-1 text-slate-500 hover:text-emerald-600"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
