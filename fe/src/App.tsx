import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, ShoppingBag, QrCode, Hammer, Globe, User } from 'lucide-react';
import { HeritageMapPage } from './modules/map/pages/HeritageMapPage';
import { ProductCatalogPage } from './modules/ecommerce/pages/ProductCatalogPage';
import { PassportDetailPage } from './modules/passport/pages/PassportDetailPage';
import { ArtisanStudioPage } from './modules/artisan/pages/ArtisanStudioPage';
import { useCartStore } from './stores/useCartStore';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'map' | 'catalog' | 'passport' | 'artisan'>('map');
  const [selectedPassportCode, setSelectedPassportCode] = useState<string>('VN-BT882194');
  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  const handleOpenPassport = (code: string) => {
    setSelectedPassportCode(code);
    setActiveTab('passport');
  };

  return (
    <div className="min-h-screen bg-heritage-paper flex flex-col text-heritage-dark font-serif">
      {/* Navigation Header Neo-Heritage (Được căn chỉnh cân xứng hoàn hảo) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-heritage-brass/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Di Sản Bên Trái */}
          <div 
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-heritage-indigo flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-heritage-terracotta transition-colors border border-heritage-brass/40">
              DS
            </div>
            <div>
              <span className="font-bold text-xl text-heritage-indigo tracking-tight block">
                DI SẢN LÀNG NGHỀ
              </span>
              <span className="text-[11px] text-gray-500 tracking-[0.2em] uppercase block -mt-1 font-sans">
                Heritage Digital Twin
              </span>
            </div>
          </div>

          {/* Navigation Tabs Trung Tâm */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-xl border border-stone-200 shadow-inner">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'artisan'
                  ? 'bg-heritage-terracotta text-white shadow-sm font-bold'
                  : 'text-gray-600 hover:text-heritage-terracotta'
              }`}
            >
              <Hammer className="w-4 h-4" />
              Xưởng Nghệ Nhân
            </button>
          </nav>

          {/* Cụm Tiện Ích Bên Phải: Ngôn Ngữ, Giỏ Hàng & Tài Khoản (Padding Cân Xứng) */}
          <div className="flex items-center gap-3">
            {/* Nút Ngôn Ngữ */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-gray-200"
              title="Đổi ngôn ngữ"
            >
              <Globe className="w-4 h-4 text-heritage-indigo" />
              <span className="uppercase">{i18n.language}</span>
            </button>

            {/* Giỏ Hàng */}
            <div className="relative cursor-pointer p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors border border-gray-200">
              <ShoppingBag className="w-5 h-5 text-heritage-indigo" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-heritage-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </div>

            {/* Tài Khoản Khách / Nghệ Nhân */}
            <div 
              onClick={() => setActiveTab('artisan')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors border border-gray-200 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-heritage-indigo text-white flex items-center justify-center text-xs font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-heritage-indigo hidden sm:inline">
                Nghệ Nhân
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex border-t border-gray-200 divide-x divide-gray-200 bg-white text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-center font-bold ${activeTab === 'map' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'}`}
          >
            Bản Đồ
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-3 text-center font-bold ${activeTab === 'catalog' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'}`}
          >
            Chợ Di Sản
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`flex-1 py-3 text-center font-bold ${activeTab === 'passport' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'}`}
          >
            Hộ Chiếu
          </button>
          <button
            onClick={() => setActiveTab('artisan')}
            className={`flex-1 py-3 text-center font-bold ${activeTab === 'artisan' ? 'text-heritage-terracotta bg-stone-50' : 'text-gray-500'}`}
          >
            Nghệ Nhân
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'map' && <HeritageMapPage />}
        {activeTab === 'catalog' && <ProductCatalogPage onSelectProductForPassport={handleOpenPassport} />}
        {activeTab === 'passport' && <PassportDetailPage initialCode={selectedPassportCode} />}
        {activeTab === 'artisan' && <ArtisanStudioPage />}
      </main>

      {/* Footer */}
      <footer className="bg-heritage-indigo text-white py-12 mt-20 border-t-2 border-heritage-brass/40">
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
