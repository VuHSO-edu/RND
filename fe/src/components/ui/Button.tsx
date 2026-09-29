import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'heritage' | 'gold' | 'artisan';
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
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    // Đổi màu chính từ #1677ff sang Đỏ Chu sa quý phái
    primary: 'bg-heritage-red hover:bg-heritage-hoverRed text-white text-[13px] font-bold shadow-md shadow-heritage-red/20 focus:ring-heritage-red',
    heritage: 'bg-heritage-indigo hover:bg-[#122028] text-white text-[13px] font-bold shadow-sm focus:ring-heritage-indigo',
    gold: 'bg-heritage-gold hover:bg-heritage-hoverGold text-white text-[13px] font-bold shadow-sm focus:ring-heritage-gold',
    danger: 'bg-red-700 hover:bg-red-800 text-white text-[13px] font-bold focus:ring-red-600',
    secondary: 'bg-heritage-surface hover:bg-white text-heritage-indigo border border-heritage-border text-[13px] font-medium hover:shadow-sm focus:ring-heritage-border',
    // Nút đặc thù cho Nghệ nhân: Nút lớn >= 48px, font >= 16px
    artisan: 'bg-heritage-red hover:bg-heritage-hoverRed text-white text-[16px] font-bold min-h-[52px] px-6 shadow-lg shadow-heritage-red/25 rounded-2xl'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-[13px]',
    lg: 'px-7 py-3.5 text-base'
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
