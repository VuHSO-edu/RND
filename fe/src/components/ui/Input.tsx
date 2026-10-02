import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  className,
  onBlur,
  disabled,
  ...props
}) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Tự động cắt tỉa khoảng trắng thừa trước khi lưu
    if (e.target.value) {
      e.target.value = e.target.value.trim();
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label className="text-[13px] font-sans font-bold text-black flex items-center justify-between">
          <span className="flex items-center gap-1">
            {label}
            {required && <span className="text-red-500 font-bold">*</span>}
          </span>
        </label>
      )}
      <input
        className={twMerge(
          clsx(
            'w-full px-4 py-2.5 text-[14px] font-semibold font-sans rounded-xl border transition-all duration-200 focus:outline-none shadow-xs',
            'text-[#1677ff] placeholder:text-slate-400 bg-slate-50/60 hover:bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:bg-white',
            disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900',
            className
          )
        )}
        disabled={disabled}
        onBlur={handleBlur}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-sans mt-0.5">{error}</span>}
    </div>
  );
};
