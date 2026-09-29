import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { AppGlobalSkeleton } from '../components/ui/AppGlobalSkeleton';
import { Forbidden403Page } from '../pages/Forbidden403Page';

interface ProtectedRouteProps {
  allowedRoles: Array<'SUPER_ADMIN' | 'VILLAGE_ADMIN' | 'ARTISAN' | 'CUSTOMER'>;
  children: React.ReactNode;
  fallbackToLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  fallbackToLogin
}) => {
  const { user, isAuthenticated, isAuthLoading, setAuthModalOpen } = useAuthStore();

  // 1. Khắc phục lỗ hổng "Flash of Unauthorized Screen" khi F5 Rehydration
  if (isAuthLoading) {
    return <AppGlobalSkeleton />;
  }

  // 2. Chưa đăng nhập -> Mở modal đăng nhập hoặc chuyển hướng
  if (!isAuthenticated || !user) {
    if (fallbackToLogin) {
      fallbackToLogin();
    } else {
      setAuthModalOpen(true, 'login');
    }
    return <AppGlobalSkeleton />;
  }

  // 3. Sai Role -> Hiển thị màn hình 403 Forbidden trang trọng
  if (!allowedRoles.includes(user.role as any)) {
    return <Forbidden403Page />;
  }

  return <>{children}</>;
};
