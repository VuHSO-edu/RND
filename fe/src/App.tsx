import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Map, ShoppingBag, QrCode, Hammer, Globe, User, 
  Building2, ShieldAlert, LogOut, ChevronDown 
} from 'lucide-react';
import { HeritageMapPage } from './modules/map/pages/HeritageMapPage';
import { ProductCatalogPage } from './modules/ecommerce/pages/ProductCatalogPage';
import { PassportDetailPage } from './modules/passport/pages/PassportDetailPage';
import { ArtisanStudioPage } from './modules/artisan/pages/ArtisanStudioPage';
import { VillageDashboardPage } from './modules/village/pages/VillageDashboardPage';
import { SuperAdminVillagesPage } from './modules/admin/pages/SuperAdminVillagesPage';
import { HeritageAuthPage } from './modules/auth/pages/HeritageAuthPage';
import { AuthModal } from './components/auth/AuthModal';
import { useCartStore } from './stores/useCartStore';
import { useAuthStore } from './stores/useAuthStore';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Forbidden403Page } from './pages/Forbidden403Page';
import { DevRoleSwitcher } from './components/auth/DevRoleSwitcher';
import { AdaptiveMobileNav } from './components/navigation/AdaptiveMobileNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    user, 
    isAuthenticated, 
    isForbidden, 
    setForbidden, 
    setAuthModalOpen, 
    logout, 
    switchDevRole,
    initAuthRehydration 
  } = useAuthStore();

  const currentRole = user?.role || 'CUSTOMER';

  // Xác định tab mặc định dựa trên vai trò người dùng (Role-Dedicated Workspace)
  const getDefaultTab = (role: string): 'map' | 'catalog' | 'passport' | 'artisan' | 'village' | 'superadmin' | 'auth' => {
    switch (role) {
      case 'ARTISAN':
        return 'artisan';
      case 'VILLAGE_ADMIN':
        return 'village';
      case 'SUPER_ADMIN':
        return 'superadmin';
      case 'CUSTOMER':
      default:
        return 'map';
    }
  };

  const [activeTab, setActiveTab] = useState<'map' | 'catalog' | 'passport' | 'artisan' | 'village' | 'superadmin' | 'auth'>(() => getDefaultTab(currentRole));
  const [selectedPassportCode, setSelectedPassportCode] = useState<string>('VN-BT882194');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

  // Rehydrate auth khi mở ứng dụng để tránh Flash of Unauthorized Screen
  useEffect(() => {
    initAuthRehydration();
  }, [initAuthRehydration]);

  // Tự động chuyển workspace khi role thay đổi
  useEffect(() => {
    setActiveTab(getDefaultTab(currentRole));
  }, [currentRole]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  const handleOpenPassport = (code: string) => {
    setSelectedPassportCode(code);
    setActiveTab('passport');
  };

  // Nếu bị 403 Forbidden do can thiệp client hoặc truy cập trái phép
  if (isForbidden) {
    return <Forbidden403Page onBackToHome={() => { setForbidden(false); setActiveTab(getDefaultTab(currentRole)); }} />;
  }

  return (
    <div className="min-h-screen bg-heritage-paper flex flex-col text-heritage-indigo font-sans pb-20 md:pb-0">
      {/* Navigation Header Neo-Heritage */}
      <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-heritage-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo Di Sản Bên Trái */}
          <div 
            onClick={() => setActiveTab(getDefaultTab(currentRole))}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div 
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-heritage-red flex items-center justify-center text-white font-heading font-bold text-lg md:text-xl shadow-md group-hover:bg-heritage-hoverRed transition-all duration-200 border border-heritage-gold/40"
              style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
            >
              DS
            </div>
            <div>
              <span className="font-heading font-bold text-base md:text-xl text-heritage-indigo tracking-tight block">
                DI SẢN LÀNG NGHỀ
              </span>
              <span className="text-[10px] md:text-[11px] text-heritage-subtext tracking-[0.2em] uppercase block -mt-1 font-sans font-semibold">
                Neo-Heritage Digital Twin
              </span>
            </div>
          </div>

          {/* Navigation Tabs Thích Ứng Theo Vai Trò (Desktop PC) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-heritage-surface/80 p-1.5 rounded-2xl border border-heritage-border shadow-inner">
            {/* 1. Nhóm Tab Dành Cho Du Khách (CUSTOMER) */}
            {currentRole === 'CUSTOMER' && (
              <>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'map'
                      ? 'bg-heritage-red text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'map' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <Map className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'map' ? '#C59A3F' : undefined }} />
                  <span>Bản Đồ Di Sản</span>
                </button>

                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'catalog'
                      ? 'bg-heritage-red text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'catalog' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <ShoppingBag className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'catalog' ? '#C59A3F' : undefined }} />
                  <span>Chợ Di Sản</span>
                </button>

                <button
                  onClick={() => setActiveTab('passport')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'passport'
                      ? 'bg-heritage-red text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'passport' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <QrCode className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'passport' ? '#C59A3F' : undefined }} />
                  <span>Tra Cứu Hộ Chiếu</span>
                </button>

                <button
                  onClick={() => setActiveTab('auth')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'auth'
                      ? 'bg-heritage-red text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'auth' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <User className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'auth' ? '#C59A3F' : undefined }} />
                  <span>{isAuthenticated ? 'Hồ Sơ Di Sản' : 'Đăng Nhập'}</span>
                </button>
              </>
            )}

            {/* 2. Nhóm Tab Dành Cho Nghệ Nhân (ARTISAN) */}
            {currentRole === 'ARTISAN' && (
              <>
                <button
                  onClick={() => setActiveTab('artisan')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    activeTab === 'artisan'
                      ? 'bg-heritage-red text-white shadow-md'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'artisan' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <Hammer className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'artisan' ? '#C59A3F' : undefined }} />
                  <span>Studio Nghệ Nhân</span>
                </button>

                <button
                  onClick={() => setActiveTab('passport')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'passport'
                      ? 'bg-heritage-red text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'passport' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <QrCode className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'passport' ? '#C59A3F' : undefined }} />
                  <span>Khai Báo Lô & Gán NFC</span>
                </button>

                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'catalog'
                      ? 'bg-heritage-red text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'catalog' ? { backgroundColor: '#8B1E1E', color: '#FFFFFF' } : undefined}
                >
                  <ShoppingBag className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'catalog' ? '#C59A3F' : undefined }} />
                  <span>Xem Sản Phẩm</span>
                </button>
              </>
            )}

            {/* 3. Nhóm Tab Dành Cho Quản Lý Làng (VILLAGE_ADMIN) */}
            {currentRole === 'VILLAGE_ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('village')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'village'
                      ? 'bg-heritage-indigo text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'village' ? { backgroundColor: '#1C2D37', color: '#FFFFFF' } : undefined}
                >
                  <Building2 className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'village' ? '#C59A3F' : undefined }} />
                  <span>Trung Tâm Điều Hành Làng</span>
                </button>

                <button
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'map'
                      ? 'bg-heritage-indigo text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'map' ? { backgroundColor: '#1C2D37', color: '#FFFFFF' } : undefined}
                >
                  <Map className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'map' ? '#C59A3F' : undefined }} />
                  <span>Duyệt Bản Đồ Di Sản</span>
                </button>

                <button
                  onClick={() => setActiveTab('passport')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'passport'
                      ? 'bg-heritage-indigo text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-heritage-red hover:bg-white/60'
                  }`}
                  style={activeTab === 'passport' ? { backgroundColor: '#1C2D37', color: '#FFFFFF' } : undefined}
                >
                  <QrCode className="w-4 h-4 text-heritage-gold" style={{ color: activeTab === 'passport' ? '#C59A3F' : undefined }} />
                  <span>Kiểm Tra Hộ Chiếu</span>
                </button>
              </>
            )}

            {/* 4. Nhóm Tab Dành Cho Super Admin (SUPER_ADMIN) */}
            {currentRole === 'SUPER_ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('superadmin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'superadmin'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-purple-800 hover:bg-white/60'
                  }`}
                  style={activeTab === 'superadmin' ? { backgroundColor: '#6B21A8', color: '#FFFFFF' } : undefined}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span>Chỉ Huy Di Sản Quốc Gia</span>
                </button>

                <button
                  onClick={() => setActiveTab('village')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'village'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-purple-800 hover:bg-white/60'
                  }`}
                  style={activeTab === 'village' ? { backgroundColor: '#6B21A8', color: '#FFFFFF' } : undefined}
                >
                  <Building2 className="w-4 h-4 text-amber-300" />
                  <span>Quản Trị Làng Nghề</span>
                </button>

                <button
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeTab === 'map'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'text-heritage-indigo hover:text-purple-800 hover:bg-white/60'
                  }`}
                  style={activeTab === 'map' ? { backgroundColor: '#6B21A8', color: '#FFFFFF' } : undefined}
                >
                  <Map className="w-4 h-4 text-amber-300" />
                  <span>Bản Đồ Toàn Quốc</span>
                </button>
              </>
            )}
          </nav>

          {/* Cụm Tiện Ích Bên Phải */}
          <div className="flex items-center gap-3">
            {/* Nút Ngôn Ngữ */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-heritage-indigo bg-heritage-surface hover:bg-white rounded-xl transition-all border border-heritage-border shadow-2xs"
              title="Đổi ngôn ngữ hiển thị"
            >
              <Globe className="w-3.5 h-3.5 text-heritage-red" />
              <span className="uppercase">{i18n.language}</span>
            </button>

            {/* Giỏ Hàng Dành Cho Khách Hàng */}
            {currentRole === 'CUSTOMER' && (
              <div 
                onClick={() => setActiveTab('catalog')}
                className="relative cursor-pointer p-2.5 rounded-xl bg-heritage-surface hover:bg-white transition-all border border-heritage-border shadow-2xs"
                title="Giỏ hàng di sản"
              >
                <ShoppingBag className="w-4 h-4 text-heritage-indigo" />
                {cartItemsCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-heritage-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow"
                    style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </div>
            )}

            {/* Nút Tài Khoản Người Dùng */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-heritage-surface hover:bg-white transition-all border border-heritage-border text-xs font-bold shadow-2xs"
              >
                <div 
                  className="w-6 h-6 rounded-full bg-heritage-red text-white flex items-center justify-center text-[11px] font-bold"
                  style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                >
                  {user ? user.fullName?.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="max-w-[130px] truncate text-heritage-indigo">{user?.fullName || 'Khách Di Sản'}</span>
                  <span className="text-[10px] text-heritage-red uppercase font-mono tracking-wider -mt-0.5">{currentRole}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-heritage-subtext" />
              </button>

              {/* Dropdown Menu Tài Khoản */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-heritage-modal border border-heritage-border py-2 z-50 text-xs font-sans animate-in fade-in zoom-in-95">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 bg-heritage-surface/40">
                        <p className="font-bold text-heritage-indigo text-sm">{user.fullName}</p>
                        <p className="text-[11px] text-heritage-subtext truncate mt-0.5">{user.email || user.phone}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-100 text-heritage-red rounded text-[10px] font-bold uppercase tracking-wider">
                          Vai trò: {currentRole}
                        </span>
                      </div>

                      <button
                        onClick={() => { setActiveTab('auth'); setIsUserMenuOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-heritage-indigo hover:bg-stone-50 font-bold flex items-center gap-2 transition-colors border-b border-gray-100"
                      >
                        <User className="w-4 h-4 text-heritage-red" />
                        <span>Hồ Sơ Di Sản &amp; Quyền Hạn</span>
                      </button>

                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
                      </button>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <button
                        onClick={() => { setActiveTab('auth'); setIsUserMenuOpen(false); }}
                        style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                        className="w-full py-2.5 px-3.5 text-left font-bold text-white rounded-xl shadow-sm transition-all"
                      >
                        Đăng nhập hệ thống
                      </button>
                      <button
                        onClick={() => { setActiveTab('auth'); setIsUserMenuOpen(false); }}
                        className="w-full py-2.5 px-3.5 text-left font-bold text-heritage-indigo bg-heritage-surface hover:bg-stone-200 rounded-xl transition-all border border-heritage-border"
                      >
                        Đăng ký tài khoản mới
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area - Được bảo vệ bằng ProtectedRoute & ErrorBoundary */}
      <main className="flex-1">
        <ErrorBoundary>
          {activeTab === 'map' && <HeritageMapPage />}
          {activeTab === 'catalog' && <ProductCatalogPage onSelectProductForPassport={handleOpenPassport} />}
          {activeTab === 'passport' && <PassportDetailPage initialCode={selectedPassportCode} />}

          {/* Tab Đăng Nhập & Hồ Sơ Di Sản Riêng Biệt (Neo-Heritage Auth Split-Screen) */}
          {activeTab === 'auth' && (
            <HeritageAuthPage 
              onSuccessRedirect={(newRole) => setActiveTab(getDefaultTab(newRole))}
              onBackToHome={() => setActiveTab('map')}
            />
          )}

          {/* Phân hệ Nghệ Nhân: Bảo vệ chỉ ARTISAN và SUPER_ADMIN được vào */}
          {activeTab === 'artisan' && (
            <ProtectedRoute allowedRoles={['ARTISAN', 'SUPER_ADMIN']} fallbackToLogin={() => setActiveTab('auth')}>
              <ArtisanStudioPage />
            </ProtectedRoute>
          )}

          {/* Phân hệ Quản Lý Làng: Bảo vệ chỉ VILLAGE_ADMIN và SUPER_ADMIN được vào */}
          {activeTab === 'village' && (
            <ProtectedRoute allowedRoles={['VILLAGE_ADMIN', 'SUPER_ADMIN']} fallbackToLogin={() => setActiveTab('auth')}>
              <VillageDashboardPage />
            </ProtectedRoute>
          )}

          {/* Phân hệ Super Admin: Bảo vệ chỉ SUPER_ADMIN được vào */}
          {activeTab === 'superadmin' && (
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']} fallbackToLogin={() => setActiveTab('auth')}>
              <SuperAdminVillagesPage />
            </ProtectedRoute>
          )}
        </ErrorBoundary>
      </main>

      {/* MOBILE ADAPTIVE BOTTOM NAVIGATION BAR (Tự động thích ứng icon theo 4 Role) */}
      <AdaptiveMobileNav activeTab={activeTab} onSelectTab={(tab: any) => setActiveTab(tab)} />

      {/* Floating Dev Role Switcher Bar để Tester/Dev thử nghiệm 1-click */}
      <DevRoleSwitcher />

      {/* Auth Modal & Quick Login khi Token hết hạn */}
      <AuthModal />

      {/* Global Toast Notification System */}
      <Toaster position="top-right" richColors />

      {/* Footer (Ẩn trên mobile để tối ưu màn hình cảm ứng) */}
      <footer className="hidden md:block bg-heritage-indigo text-white py-12 mt-20 border-t-2 border-heritage-gold/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h4 className="font-heading font-bold text-xl text-white tracking-wide">
              NỀN TẢNG SỐ HÓA DI SẢN VĂN HÓA &amp; LÀNG NGHỀ TRUYỀN THỐNG VIỆT NAM
            </h4>
            <p className="text-xs text-white/70 mt-1 font-sans">
              Bảo chứng tính độc bản và nguồn gốc bằng Hộ Chiếu Di Sản Số trên chuỗi khối Blockchain.
            </p>
          </div>
          <div className="text-xs text-white/50 font-sans">
            © 2026 Nền Tảng Di Sản Làng Nghề. Bảo lưu mọi quyền.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
