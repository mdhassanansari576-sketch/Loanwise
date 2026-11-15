import React from 'react';
import { NavigationTab } from '../types';
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Calculator,
  TrendingUp,
  BookmarkCheck,
  GitCompare,
  PiggyBank,
  Settings,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: {
    tab: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      tab: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      tab: 'education-loan',
      label: 'Education Loan',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: 'Moratorium',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      tab: 'other-loan',
      label: 'Other Loans',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      tab: 'emi-calculator',
      label: 'EMI Calculator',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      tab: 'sip-calculator',
      label: 'SIP Calculator',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'Step-Up',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      tab: 'saved-calculations',
      label: 'Saved Calculations',
      icon: <BookmarkCheck className="w-5 h-5" />,
    },
    {
      tab: 'loan-comparison',
      label: 'Loan Comparison',
      icon: <GitCompare className="w-5 h-5" />,
    },
    {
      tab: 'sip-history',
      label: 'SIP Portfolio',
      icon: <PiggyBank className="w-5 h-5" />,
    },
    {
      tab: 'settings',
      label: 'Profile & Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#101726] border-r border-slate-200 dark:border-slate-800 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <span className="text-xl font-extrabold font-mono">₹</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              LoanWise
            </span>
            <span className="p-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Smart Loan, EMI & SIP
          </p>
        </div>
      </div>

      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Financial Suite
      </div>

      {/* Nav List */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => handleNavClick(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Theme Toggle & Bottom section */}
      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{isDarkMode ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Indian Financial Engine
            </span>
          </div>
          <span className="font-bold text-[11px] text-blue-600 dark:text-blue-400">
            ₹ INR
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-full transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
};
