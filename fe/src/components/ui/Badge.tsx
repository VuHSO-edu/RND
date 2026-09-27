import React from 'react';

interface BadgeProps {
  variant?: 'verified' | 'warning' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children }) => {
  const styles = {
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-300',
    info: 'bg-blue-50 text-heritage-indigo border-blue-200'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
};
