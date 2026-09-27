import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'heritage' | 'artisan';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#1677ff] hover:bg-blue-600 text-white text-[13px]',
    heritage: 'bg-heritage-indigo hover:bg-[#122540] text-white text-[13px]',
    danger: 'bg-heritage-terracotta hover:bg-red-700 text-white text-[13px]',
    secondary: 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-[13px]',
    // Nút đặc thù cho Nghệ nhân: Nút lớn >= 48px, font >= 16px
    artisan: 'bg-heritage-terracotta hover:bg-red-700 text-white text-[16px] font-semibold min-h-[52px] px-6 shadow-md rounded-lg'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], variant !== 'artisan' && sizes[size], className))}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
