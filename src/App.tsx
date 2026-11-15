import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  SavedLoanCalculation,
  SavedSipCalculation,
  UserProfile,
} from './types';
import { StorageService } from './services/storage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { EducationLoanView } from './views/EducationLoanView';
import { OtherLoanView } from './views/OtherLoanView';
import { EmiCalculatorView } from './views/EmiCalculatorView';
import { SipCalculatorView } from './views/SipCalculatorView';
import { SavedCalculationsView } from './views/SavedCalculationsView';
import { LoanComparisonView } from './views/LoanComparisonView';
import { SipHistoryView } from './views/SipHistoryView';
import { ProfileSettingsView } from './views/ProfileSettingsView';
import { CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [loans, setLoans] = useState<SavedLoanCalculation[]>([]);
  const [sips, setSips] = useState<SavedSipCalculation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getProfile());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('loanwise_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setLoans(StorageService.getLoans());
    setSips(StorageService.getSips());
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('loanwise_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Loan handlers
  const handleSaveLoan = (loan: SavedLoanCalculation) => {
    StorageService.addLoan(loan);
    setLoans(StorageService.getLoans());
  };

  const handleRenameLoan = (id: string, newName: string) => {
    StorageService.renameLoan(id, newName);
    setLoans(StorageService.getLoans());
  };

  const handleDuplicateLoan = (id: string) => {
    StorageService.duplicateLoan(id);
    setLoans(StorageService.getLoans());
    showNotification('Loan scenario duplicated!');
  };

  const handleDeleteLoan = (id: string) => {
    StorageService.deleteLoan(id);
    setLoans(StorageService.getLoans());
  };

  // SIP handlers
  const handleSaveSip = (sip: SavedSipCalculation) => {
    StorageService.addSip(sip);
    setSips(StorageService.getSips());
  };

  const handleRenameSip = (id: string, newName: string) => {
    StorageService.renameSip(id, newName);
    setSips(StorageService.getSips());
  };

  const handleDuplicateSip = (id: string) => {
    StorageService.duplicateSip(id);
    setSips(StorageService.getSips());
    showNotification('SIP scenario duplicated!');
  };

  const handleDeleteSip = (id: string) => {
    StorageService.deleteSip(id);
    setSips(StorageService.getSips());
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    StorageService.saveProfile(profile);
    setUserProfile(profile);
  };

  const handleRestoreSampleData = () => {
    StorageService.restoreSampleData();
    setLoans(StorageService.getLoans());
    setSips(StorageService.getSips());
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    setLoans([]);
    setSips([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/50 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-white dark:hover:text-slate-900 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          userProfile={userProfile}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              loans={loans}
              sips={sips}
              userProfile={userProfile}
            />
          )}

          {currentTab === 'education-loan' && (
            <EducationLoanView
              onSaveLoan={handleSaveLoan}
              showNotification={showNotification}
            />
          )}

          {currentTab === 'other-loan' && (
            <OtherLoanView
              onSaveLoan={handleSaveLoan}
              showNotification={showNotification}
            />
          )}

          {currentTab === 'emi-calculator' && (
            <EmiCalculatorView
              onSaveLoan={handleSaveLoan}
              showNotification={showNotification}
            />
          )}

          {currentTab === 'sip-calculator' && (
            <SipCalculatorView
              onSaveSip={handleSaveSip}
              showNotification={showNotification}
            />
          )}

          {currentTab === 'saved-calculations' && (
            <SavedCalculationsView
              loans={loans}
              sips={sips}
              onRenameLoan={handleRenameLoan}
              onDuplicateLoan={handleDuplicateLoan}
              onDeleteLoan={handleDeleteLoan}
              onRenameSip={handleRenameSip}
              onDuplicateSip={handleDuplicateSip}
              onDeleteSip={handleDeleteSip}
              showNotification={showNotification}
            />
          )}

          {currentTab === 'loan-comparison' && <LoanComparisonView />}

          {currentTab === 'sip-history' && (
            <SipHistoryView
              sips={sips}
              onNavigate={setCurrentTab}
              onDeleteSip={handleDeleteSip}
              showNotification={showNotification}
            />
          )}

          {currentTab === 'settings' && (
            <ProfileSettingsView
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              isDarkMode={isDarkMode}
              onToggleTheme={handleToggleTheme}
              onRestoreSampleData={handleRestoreSampleData}
              onClearAllData={handleClearAllData}
              showNotification={showNotification}
            />
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
