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
        <label className="text-[13px] font-sans font-semibold text-heritage-indigo flex items-center gap-1">
          {label}
          {required && <span className="text-heritage-red font-bold">*</span>}
        </label>
      )}
      <input
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border transition-all duration-200 focus:outline-none shadow-sm',
            // Thay màu chữ kỹ thuật #1677ff bằng Chàm sẫm #1C2D37 và viền nét Đỏ son #8B1E1E khi focus
            'text-heritage-indigo placeholder:text-heritage-subtext/60 bg-white border-heritage-border focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15',
            disabled && 'bg-heritage-surface/70 text-heritage-subtext/80 cursor-not-allowed border-heritage-border/50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-900',
            className
          )
        )}
        disabled={disabled}
        onBlur={handleBlur}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-sans mt-0.5">{error}</span>}
    </div>
  );
};
