import React from 'react';

interface PrimaryHeroCardProps {
  title: string;
  primaryValue: string;
  subtitle: string;
  badgeText?: string;
  icon?: React.ReactNode;
  gradient?: 'blue-indigo' | 'emerald-cyan' | 'indigo-blue';
}

export const PrimaryHeroCard: React.FC<PrimaryHeroCardProps> = ({
  title,
  primaryValue,
  subtitle,
  badgeText,
  icon,
  gradient = 'blue-indigo',
}) => {
  const gradientClass =
    gradient === 'emerald-cyan'
      ? 'from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900'
      : gradient === 'indigo-blue'
      ? 'from-indigo-600 to-blue-700 dark:from-indigo-700 dark:to-blue-900'
      : 'from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-700 dark:via-indigo-800 dark:to-blue-900';

  return (
    <div
      className={`rounded-2xl p-6 md:p-7 text-white shadow-lg bg-gradient-to-r ${gradientClass} relative overflow-hidden`}
    >
      {/* Decorative blurred circles */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-20 -top-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            {title}
          </span>
          {badgeText && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              {badgeText}
            </span>
          )}
          {icon && !badgeText && (
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
              {icon}
            </div>
          )}
        </div>

        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-mono">
          {primaryValue}
        </div>

        <p className="text-sm text-white/90 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

interface MetricTileProps {
  label: string;
  value: string;
  subValue?: string;
  accentColor?: string;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subValue,
  accentColor = 'bg-blue-600',
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 transition-all ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${accentColor}`} />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {subValue}
        </div>
      )}
    </div>
  );
};
