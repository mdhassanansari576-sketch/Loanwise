import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatter?: (val: number) => string;
  quickPresets?: { label: string; value: number }[];
  unitSuffix?: string;
  className?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatter = (v) => v.toString(),
  quickPresets = [],
  unitSuffix = '',
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
        <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
          {formatter(value)} {unitSuffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none"
      />

      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
        <span>{formatter(min)}</span>
        <span>{formatter(max)}</span>
      </div>

      {quickPresets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickPresets.map((preset) => {
            const isSelected = Math.abs(value - preset.value) < 0.001;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.value)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
