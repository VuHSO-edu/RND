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
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label className="text-[13px] font-sans font-medium text-[#000000] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <input
        className={twMerge(
          clsx(
            'w-full px-3 py-2 text-[13px] font-sans rounded border transition-colors focus:outline-none focus:ring-1',
            // Chữ nhập liệu màu xanh men lam #1A365D hoặc #1677ff
            'text-[#1677ff] placeholder:text-gray-400 bg-white border-gray-300 focus:border-[#1677ff] focus:ring-[#1677ff]',
            disabled && 'bg-[#f5f5f5] text-gray-400 cursor-not-allowed border-gray-200',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )
        )}
        disabled={disabled}
        onBlur={handleBlur}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-sans">{error}</span>}
    </div>
  );
};
