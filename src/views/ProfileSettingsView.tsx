import React, { useState } from 'react';
import { UserProfile } from '../types';
import { FintechCard } from '../components/FintechCard';
import {
  Settings,
  User,
  Shield,
  RotateCcw,
  Trash2,
  Sun,
  Moon,
  Check,
  Sparkles,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onRestoreSampleData: () => void;
  onClearAllData: () => void;
  showNotification: (msg: string) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  isDarkMode,
  onToggleTheme,
  onRestoreSampleData,
  onClearAllData,
  showNotification,
}) => {
  const [fullName, setFullName] = useState<string>(userProfile.fullName || 'Fintech Investor');
  const [email, setEmail] = useState<string>(userProfile.email || 'investor@loanwise.in');
  const [riskProfile, setRiskProfile] = useState<'Conservative' | 'Moderate' | 'Aggressive'>(
    userProfile.riskProfile || 'Moderate'
  );

  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      fullName: fullName.trim() || 'Investor',
      email: email.trim(),
      riskProfile,
    });
    showNotification('Investor profile updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Profile &amp; Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize investor profile, theme preferences, and manage database storage
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <FintechCard title="Investor Profile & Persona">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Investment Risk Appetite
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Conservative', 'Moderate', 'Aggressive'] as const).map((risk) => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => setRiskProfile(risk)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    riskProfile === risk
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </FintechCard>

      {/* Theme & Appearance */}
      <FintechCard title="Theme & Display Preferences">
        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Dark Mode Aesthetic
                </div>
                <div className="text-xs text-slate-400">
                  {isDarkMode ? 'Dark luxury fintech theme enabled' : 'Clean crisp light theme enabled'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Base Currency Standard
              </div>
              <div className="text-xs text-slate-400">
                Indian Rupee (₹) formatting with Lakh (L) and Crore (Cr) grouping
              </div>
            </div>

            <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ₹ INR
            </span>
          </div>
        </div>
      </FintechCard>

      {/* Database Management Card */}
      <FintechCard title="Database & Storage Operations">
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All your loan calculations, multi-year university disbursements, and SIP wealth projections are securely stored in your browser's persistent database storage and persist across refreshes and sessions.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onRestoreSampleData();
                showNotification('Sample loan & SIP scenarios restored to database!');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Restore Sample Calculations</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-800/40 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Clear All Saved Data</span>
            </button>
          </div>
        </div>
      </FintechCard>

      {/* App Specs */}
      <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
        <div className="font-bold text-slate-700 dark:text-slate-300">
          LoanWise – Smart Loan, EMI &amp; SIP Calculator v1.0.0 (Web Edition)
        </div>
        <p>• Mathematical precision verified against Reserve Bank of India lending norms</p>
        <p>• Reducing-balance amortization with exact monthly principal / interest segregation</p>
        <p>• Education loan multi-tranche accrual engine during academic and grace moratoriums</p>
        <p>• Systematic Investment Plan (SIP) annuity-due compounding with annual step-ups and reverse goal engineering</p>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Clear All Saved Calculations?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will permanently delete all saved loans, disbursements, and SIP portfolios from your database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                  showNotification('All calculations cleared.');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
