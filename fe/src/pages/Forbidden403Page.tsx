import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';

interface Forbidden403PageProps {
  onBackToHome?: () => void;
}

export const Forbidden403Page: React.FC<Forbidden403PageProps> = ({ onBackToHome }) => {
  const { user, switchDevRole, setForbidden } = useAuthStore();

  const handleReturnHome = () => {
    setForbidden(false);
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-heritage-paper flex items-center justify-center p-6 text-heritage-indigo select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-heritage-border shadow-heritage-card text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Dấu Triện Ấn Son Cảnh Báo Bản Sắc Di Sản */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-50 border-2 border-heritage-red flex items-center justify-center text-heritage-red shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-heritage-gold tracking-widest uppercase font-sans">
            BHTT • TRUY CẬP BỊ TỪ CHỐI (403)
          </span>
          <h2 className="font-heading text-2xl font-bold text-heritage-indigo">
            Khu Vực Giới Hạn Thẩm Quyền
          </h2>
          <p className="text-xs text-heritage-subtext leading-relaxed font-sans">
            Tài khoản hiện tại của bạn (<strong className="text-heritage-indigo">{user?.role || 'KHÁCH'}</strong>) 
            không có quyền truy cập vào phân hệ quản trị hoặc dữ liệu di sản này.
          </p>
        </div>

        <div className="p-4 bg-heritage-surface/60 rounded-xl border border-heritage-border text-left text-xs space-y-1.5 font-sans">
          <div className="flex justify-between text-heritage-subtext">
            <span>Người dùng:</span>
            <span className="font-semibold text-heritage-indigo">{user?.fullName || 'Khách vãng lai'}</span>
          </div>
          <div className="flex justify-between text-heritage-subtext">
            <span>Vai trò xác thực:</span>
            <span className="font-bold text-heritage-red">{user?.role || 'CUSTOMER'}</span>
          </div>
          <div className="flex justify-between text-heritage-subtext">
            <span>Mã bảo vệ:</span>
            <span className="font-mono text-stone-500">ERR_RBAC_FORBIDDEN_403</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={handleReturnHome}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về Không Gian Của Tôi
          </Button>

          {/* Hỗ trợ nhanh cho môi trường DEV */}
          <Button
            variant="primary"
            onClick={() => {
              setForbidden(false);
              switchDevRole('SUPER_ADMIN');
              handleReturnHome();
            }}
            className="w-full sm:w-auto text-xs"
          >
            Đổi Role Super Admin (Dev)
          </Button>
        </div>
      </div>
    </div>
  );
};
