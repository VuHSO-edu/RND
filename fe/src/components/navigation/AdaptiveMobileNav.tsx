import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { 
  Map, ShoppingBag, QrCode, Hammer, Building2, ShieldAlert, 
  CheckSquare, Users, AlertTriangle, User, Compass 
} from 'lucide-react';

interface AdaptiveMobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const AdaptiveMobileNav: React.FC<AdaptiveMobileNavProps> = ({
  activeTab,
  onSelectTab
}) => {
  const { user } = useAuthStore();
  const role = user?.role || 'CUSTOMER';

  // 1. Phân hệ Khách Hàng / Du Khách (CUSTOMER)
  if (role === 'CUSTOMER') {
    return (
      <nav 
        aria-label="Thanh điều hướng di động cho du khách"
        className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-heritage-border flex items-center justify-around z-[1000] md:hidden shadow-lg"
      >
        <button
          onClick={() => onSelectTab('catalog')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'catalog' ? 'text-heritage-red font-bold' : 'text-heritage-subtext'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-1">Chợ Di Sản</span>
        </button>

        <button
          onClick={() => onSelectTab('community')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'community' ? 'text-heritage-red font-bold' : 'text-heritage-subtext'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cộng Đồng</span>
        </button>

        <button
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'map' ? 'text-heritage-red font-bold' : 'text-heritage-subtext'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1">Bản Đồ</span>
        </button>

        <button
          onClick={() => onSelectTab('passport')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'passport' ? 'text-heritage-red font-bold' : 'text-heritage-subtext'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px] mt-1">Quét Tem</span>
        </button>

        <button
          onClick={() => onSelectTab('auth')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'auth' ? 'text-heritage-red font-bold' : 'text-heritage-subtext'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">{user ? 'Tài Khoản' : 'Đăng Nhập'}</span>
        </button>
      </nav>
    );
  }

  // 2. Phân hệ Nghệ Nhân (ARTISAN) - Nút ngoại cỡ >= 56px cho thợ làm nghề
  if (role === 'ARTISAN') {
    return (
      <nav 
        aria-label="Thanh điều hướng di động cho nghệ nhân"
        className="fixed bottom-0 inset-x-0 h-18 bg-heritage-surface border-t-2 border-heritage-red flex items-center justify-around z-[1000] md:hidden shadow-2xl"
      >
        <button
          onClick={() => onSelectTab('artisan')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-2 min-h-[56px] ${
            activeTab === 'artisan' ? 'text-heritage-red font-bold bg-red-50/60' : 'text-heritage-subtext'
          }`}
        >
          <Hammer className="w-6 h-6" />
          <span className="text-[11px] font-bold mt-0.5">Xưởng Nghề</span>
        </button>

        <button
          onClick={() => onSelectTab('passport')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-2 min-h-[56px] ${
            activeTab === 'passport' ? 'text-heritage-red font-bold bg-red-50/60' : 'text-heritage-subtext'
          }`}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-[11px] font-bold mt-0.5">Xuất Tem QR</span>
        </button>
      </nav>
    );
  }

  // 3. Phân hệ Quản Lý Làng Nghề (VILLAGE_ADMIN)
  if (role === 'VILLAGE_ADMIN') {
    return (
      <nav 
        aria-label="Thanh điều hướng di động cho quản lý làng"
        className="fixed bottom-0 inset-x-0 h-16 bg-heritage-indigo text-white flex items-center justify-around z-[1000] md:hidden shadow-2xl border-t border-heritage-border"
      >
        <button
          onClick={() => onSelectTab('village')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'village' ? 'text-heritage-gold font-bold bg-white/10' : 'text-white/70'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] mt-1">Quản Trị</span>
        </button>

        <button
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
            activeTab === 'map' ? 'text-heritage-gold font-bold bg-white/10' : 'text-white/70'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1">Duyệt Map</span>
        </button>
      </nav>
    );
  }

  // 4. Phân hệ Super Admin (SUPER_ADMIN)
  return (
    <nav 
      aria-label="Thanh điều hướng di động cho quản trị viên tối cao"
      className="fixed bottom-0 inset-x-0 h-16 bg-[#122028] text-white flex items-center justify-around z-[1000] md:hidden shadow-2xl border-t border-purple-500/40"
    >
      <button
        onClick={() => onSelectTab('superadmin')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
          activeTab === 'superadmin' ? 'text-purple-400 font-bold bg-white/10' : 'text-white/70'
        }`}
      >
        <ShieldAlert className="w-5 h-5" />
        <span className="text-[10px] mt-1">Chỉ Huy Tổng</span>
      </button>

      <button
        onClick={() => onSelectTab('community')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
          activeTab === 'community' ? 'text-purple-400 font-bold bg-white/10' : 'text-white/70'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-1">Cộng Đồng</span>
      </button>

      <button
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
          activeTab === 'map' ? 'text-purple-400 font-bold bg-white/10' : 'text-white/70'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[10px] mt-1">Bản Đồ QG</span>
      </button>
    </nav>
  );
};
