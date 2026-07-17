import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon: IconComponent,
      error,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={`relative rounded-3xl border border-slate-800 bg-slate-900 p-4 ${className}`}
      >
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>

        <div className="mt-3 flex items-center gap-3">
          <IconComponent className="h-5 w-5 text-sky-300" />

          <div className="relative w-full">
            <input
              ref={ref}
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
              {...props}
            />
              {children}
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-rose-400">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';