import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export interface CanAccessProps {
  roles: Array<'SUPER_ADMIN' | 'VILLAGE_ADMIN' | 'ARTISAN' | 'CUSTOMER'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component che giấu giao diện (UI Masking) cấp độ Nút bấm / Thao tác
 * Ngăn chặn việc lộ các nút bấm nhạy cảm (Duyệt lô, Cấp tem, Xóa làng) cho user không đủ thẩm quyền
 */
export const CanAccess: React.FC<CanAccessProps> = ({ roles, children, fallback = null }) => {
  const currentRole = useAuthStore((state) => state.user?.role) as any;
  if (!currentRole || !roles.includes(currentRole)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
