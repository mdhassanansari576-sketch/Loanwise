import React from 'react';
import { NavigationTab, UserProfile } from '../types';
import { Menu, Sun, Moon, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  isDarkMode,
  onToggleTheme,
  userProfile,
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard': return 'Financial Dashboard';
      case 'education-loan': return 'Education Loan Calculator';
      case 'other-loan': return 'Other Loans (Home, Personal, Car, Business)';
      case 'emi-calculator': return 'Reducing-Balance EMI Engine';
      case 'sip-calculator': return 'SIP & Step-Up Wealth Calculator';
      case 'saved-calculations': return 'Saved Calculations Archive';
      case 'loan-comparison': return 'Loan Scenario Comparison';
      case 'sip-history': return 'SIP Investment Portfolio';
      case 'settings': return 'Profile & Settings';
      default: return 'LoanWise';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#101726]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {getTabTitle(currentTab)}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            LoanWise Financial Engineering Suite
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBI Compliant Formulae</span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
            {userProfile.fullName ? userProfile.fullName.charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {userProfile.fullName || 'Investor'}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
              {userProfile.riskProfile} Risk
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
