import React from 'react';

interface FintechCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const FintechCard: React.FC<FintechCardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div
      className={`glass-card rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
