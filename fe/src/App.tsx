import React, { useState } from 'react';
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
import { AuthModal } from './components/auth/AuthModal';
import { useCartStore } from './stores/useCartStore';
import { useAuthStore } from './stores/useAuthStore';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'map' | 'catalog' | 'passport' | 'artisan' | 'village' | 'superadmin'>('map');
  const [selectedPassportCode, setSelectedPassportCode] = useState<string>('VN-BT882194');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));
  const { user, isAuthenticated, setAuthModalOpen, logout, switchDevRole } = useAuthStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  const handleOpenPassport = (code: string) => {
    setSelectedPassportCode(code);
    setActiveTab('passport');
  };

  return (
    <div className="min-h-screen bg-heritage-paper flex flex-col text-heritage-dark font-serif pb-16 md:pb-0">
      {/* Navigation Header Neo-Heritage */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-heritage-brass/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-20 flex items-center justify-between">
          {/* Logo Di Sản Bên Trái */}
          <div 
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-heritage-indigo flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md group-hover:bg-heritage-terracotta transition-colors border border-heritage-brass/40">
              DS
            </div>
            <div>
              <span className="font-bold text-base md:text-xl text-heritage-indigo tracking-tight block">
                DI SẢN LÀNG NGHỀ
              </span>
              <span className="text-[10px] md:text-[11px] text-gray-500 tracking-[0.2em] uppercase block -mt-1 font-sans">
                Heritage Digital Twin
              </span>
            </div>
          </div>

          {/* Navigation Tabs Trung Tâm (Desktop PC) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-xl border border-stone-200 shadow-inner">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-heritage-indigo shadow-sm font-bold'
                  : 'text-gray-600 hover:text-heritage-indigo'
              }`}
            >
              <Map className="w-4 h-4 text-heritage-terracotta" />
              Bản Đồ Số
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-heritage-indigo shadow-sm font-bold'
                  : 'text-gray-600 hover:text-heritage-indigo'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-heritage-terracotta" />
              Chợ Di Sản
            </button>

            <button
              onClick={() => setActiveTab('passport')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'passport'
                  ? 'bg-white text-heritage-indigo shadow-sm font-bold'
                  : 'text-gray-600 hover:text-heritage-indigo'
              }`}
            >
              <QrCode className="w-4 h-4 text-heritage-terracotta" />
              Tra Cứu Hộ Chiếu
            </button>

            <button
              onClick={() => setActiveTab('artisan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'artisan'
                  ? 'bg-white text-heritage-indigo shadow-sm font-bold'
                  : 'text-gray-600 hover:text-heritage-indigo'
              }`}
            >
              <Hammer className="w-4 h-4 text-heritage-terracotta" />
              Xưởng Nghệ Nhân
            </button>

            {/* Quản lý Làng Nghề */}
            <button
              onClick={() => setActiveTab('village')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'village'
                  ? 'bg-heritage-indigo text-white shadow-sm font-bold'
                  : 'text-gray-600 hover:text-heritage-indigo'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              Quản Trị Làng
            </button>

            {/* Super Admin Thẩm Định */}
            <button
              onClick={() => setActiveTab('superadmin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'superadmin'
                  ? 'bg-purple-700 text-white shadow-sm font-bold'
                  : 'text-gray-500 hover:text-purple-700'
              }`}
              title="Super Admin thẩm định làng nghề"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
              Admin Duyệt
            </button>
          </nav>

          {/* Cụm Tiện Ích Bên Phải */}
          <div className="flex items-center gap-2.5">
            {/* Nút Ngôn Ngữ */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 text-xs font-bold text-gray-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-gray-200"
              title="Đổi ngôn ngữ"
            >
              <Globe className="w-3.5 h-3.5 text-heritage-indigo" />
              <span className="uppercase">{i18n.language}</span>
            </button>

            {/* Giỏ Hàng */}
            <div 
              onClick={() => setActiveTab('catalog')}
              className="relative cursor-pointer p-2 md:p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors border border-gray-200"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-heritage-indigo" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-heritage-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </div>

            {/* Tài Khoản / Phân Quyền */}
            <div className="relative">
              <div 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors border border-gray-200 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-heritage-indigo text-white flex items-center justify-center text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-heritage-indigo block leading-none">
                    {isAuthenticated ? user?.fullName || 'Tài khoản' : 'Đăng Nhập'}
                  </span>
                  {user?.role && (
                    <span className="text-[10px] text-gray-500 font-sans leading-none block mt-0.5">
                      {user.role.replace('ROLE_', '')}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
              </div>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 text-xs font-sans">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="font-bold text-black text-sm">{user?.fullName}</div>
                        <div className="text-gray-500">{user?.email || user?.phone}</div>
                        <div className="mt-1 inline-block px-2 py-0.5 rounded bg-blue-50 text-[#1677ff] font-bold text-[10px]">
                          {user?.role}
                        </div>
                      </div>

                      {/* Quick Dev Role Switcher */}
                      <div className="p-2 border-b border-gray-100 bg-stone-50">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Chuyển vai trò test (Dev):</div>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <button
                            onClick={() => { switchDevRole('ROLE_VILLAGE_ADMIN'); setActiveTab('village'); setIsUserMenuOpen(false); }}
                            className="p-1 text-left hover:bg-white rounded font-medium text-gray-700"
                          >
                            🏛️ Quản lý Làng
                          </button>
                          <button
                            onClick={() => { switchDevRole('ROLE_ARTISAN'); setActiveTab('artisan'); setIsUserMenuOpen(false); }}
                            className="p-1 text-left hover:bg-white rounded font-medium text-gray-700"
                          >
                            🔨 Nghệ nhân
                          </button>
                          <button
                            onClick={() => { switchDevRole('ROLE_SUPER_ADMIN'); setActiveTab('superadmin'); setIsUserMenuOpen(false); }}
                            className="p-1 text-left hover:bg-white rounded font-medium text-gray-700"
                          >
                            🛡️ Super Admin
                          </button>
                          <button
                            onClick={() => { switchDevRole('ROLE_CUSTOMER'); setActiveTab('catalog'); setIsUserMenuOpen(false); }}
                            className="p-1 text-left hover:bg-white rounded font-medium text-gray-700"
                          >
                            🛍️ Khách hàng
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { setAuthModalOpen(true, 'login'); setIsUserMenuOpen(false); }}
                        className="w-full py-2 px-3 text-left font-bold text-heritage-indigo hover:bg-stone-50 rounded-lg"
                      >
                        Đăng nhập tài khoản
                      </button>
                      <button
                        onClick={() => { setAuthModalOpen(true, 'register'); setIsUserMenuOpen(false); }}
                        className="w-full py-2 px-3 text-left font-bold text-heritage-terracotta hover:bg-stone-50 rounded-lg"
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

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'map' && <HeritageMapPage />}
        {activeTab === 'catalog' && <ProductCatalogPage onSelectProductForPassport={handleOpenPassport} />}
        {activeTab === 'passport' && <PassportDetailPage initialCode={selectedPassportCode} />}
        {activeTab === 'artisan' && <ArtisanStudioPage />}
        {activeTab === 'village' && <VillageDashboardPage />}
        {activeTab === 'superadmin' && <SuperAdminVillagesPage />}
      </main>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (60px Thumb Zone Compliance) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-gray-200 z-40 flex items-stretch shadow-lg">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors min-h-[48px] ${
            activeTab === 'map' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Bản Đồ</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors min-h-[48px] ${
            activeTab === 'catalog' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Chợ</span>
        </button>

        <button
          onClick={() => setActiveTab('passport')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors min-h-[48px] ${
            activeTab === 'passport' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span>Hộ Chiếu</span>
        </button>

        <button
          onClick={() => setActiveTab('artisan')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors min-h-[48px] ${
            activeTab === 'artisan' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'
          }`}
        >
          <Hammer className="w-5 h-5" />
          <span>Nghệ Nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('village')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors min-h-[48px] ${
            activeTab === 'village' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>Quản Lý</span>
        </button>
      </nav>

      {/* Auth Modal / Bottom Sheet */}
      <AuthModal />

      {/* Footer (Ẩn trên mobile để tối ưu màn hình cảm ứng) */}
      <footer className="hidden md:block bg-heritage-indigo text-white py-12 mt-20 border-t-2 border-heritage-brass/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h4 className="font-bold text-xl text-white tracking-wide">
              NỀN TẢNG SỐ HÓA DI SẢN VĂN HÓA &amp; LÀNG NGHỀ TRUYỀN THỐNG VIỆT NAM
            </h4>
            <p className="text-xs text-white/70 mt-1">
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
