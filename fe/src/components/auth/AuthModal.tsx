import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lock, Phone, Mail, User, ShieldCheck, Landmark } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export const AuthModal: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthModalOpen, authModalMode, setAuthModalOpen, login, register, isLoading, error } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'ROLE_CUSTOMER' | 'ROLE_ARTISAN' | 'ROLE_VILLAGE_ADMIN'>('ROLE_CUSTOMER');

  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Village Admin fields
  const [villageName, setVillageName] = useState('');
  const [craftType, setCraftType] = useState('Gốm sứ thủ công');
  const [province, setProvince] = useState('Hà Nội');
  const [addressLine, setAddressLine] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 150);
    }
  }, [isAuthModalOpen, mode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login({
        identifier: identifier.trim(),
        password: password.trim()
      });
    } else {
      await register({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim(),
        fullName: fullName.trim(),
        role,
        villageName: role === 'ROLE_VILLAGE_ADMIN' ? villageName.trim() : undefined,
        craftType: role === 'ROLE_VILLAGE_ADMIN' ? craftType.trim() : undefined,
        province: role === 'ROLE_VILLAGE_ADMIN' ? province.trim() : undefined,
        addressLine: role === 'ROLE_VILLAGE_ADMIN' ? addressLine.trim() : undefined
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      {/* Modal / Bottom Sheet Container */}
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[85vh] animate-in fade-in slide-in-from-bottom duration-200"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px Chuẩn BHTT */}
        <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between border-b border-heritage-brass/40 select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/40">|</span>
            <span className="text-xs text-white/90 font-medium">
              {mode === 'login' ? 'ĐĂNG NHẬP HỆ THỐNG DI SẢN' : 'ĐĂNG KÝ TÀI KHOẢN MỚI'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch Mode */}
        <div className="flex border-b border-gray-200 bg-stone-50">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-heritage-terracotta text-heritage-terracotta bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'register'
                ? 'border-heritage-terracotta text-heritage-terracotta bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {/* Form Body with Smooth Scrolling */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span className="font-bold">LỖI:</span> {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Chọn Nhóm Vai Trò */}
              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5">
                  Vai trò đăng ký <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_CUSTOMER')}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                      role === 'ROLE_CUSTOMER'
                        ? 'border-heritage-terracotta bg-heritage-terracotta/10 text-heritage-terracotta'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    Du Khách
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_ARTISAN')}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                      role === 'ROLE_ARTISAN'
                        ? 'border-heritage-terracotta bg-heritage-terracotta/10 text-heritage-terracotta'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    Nghệ Nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_VILLAGE_ADMIN')}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                      role === 'ROLE_VILLAGE_ADMIN'
                        ? 'border-heritage-terracotta bg-heritage-terracotta/10 text-heritage-terracotta'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    Quản Lý Làng
                  </button>
                </div>
              </div>

              {/* Họ và tên */}
              <div>
                <label className="block text-[13px] font-bold text-black mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full pl-9 pr-3 py-2.5 text-[13px] sm:text-[13px] text-[#1677ff] border border-gray-300 rounded-lg focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    style={{ fontSize: '16px' }} // Chống Safari zoom
                  />
                </div>
              </div>

              {/* SĐT */}
              <div>
                <label className="block text-[13px] font-bold text-black mb-1">
                  Số điện thoại <span className="text-gray-400 font-normal">(dùng đăng nhập)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full pl-9 pr-3 py-2.5 text-[#1677ff] border border-gray-300 rounded-lg focus:outline-none focus:border-[#1677ff]"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-bold text-black mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: artisan@heritage.vn"
                    className="w-full pl-9 pr-3 py-2.5 text-[#1677ff] border border-gray-300 rounded-lg focus:outline-none focus:border-[#1677ff]"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Thông tin Làng Nghề nếu chọn Quản lý làng */}
              {role === 'ROLE_VILLAGE_ADMIN' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Landmark className="w-4 h-4 text-amber-700" />
                    KHAI BÁO THÔNG TIN LÀNG NGHỀ (ĐỘC LẬP KHÓA VÒNG TRÒN)
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-black mb-1">
                      Tên Làng Nghề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      placeholder="VD: Làng Gốm Bát Tràng"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm bg-white"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[12px] font-bold text-black mb-1">Loại hình</label>
                      <input
                        type="text"
                        value={craftType}
                        onChange={(e) => setCraftType(e.target.value)}
                        placeholder="VD: Gốm sứ"
                        className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm bg-white"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-black mb-1">Tỉnh / Thành</label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="VD: Hà Nội"
                        className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm bg-white"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-black mb-1">Địa chỉ cụ thể</label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="VD: Xã Bát Tràng, Huyện Gia Lâm"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm bg-white"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <p className="text-[11px] text-amber-800 italic">
                    * Tài khoản làng nghề sẽ ở trạng thái chờ duyệt. Super Admin sẽ thẩm định và kích hoạt quyền quản lý.
                  </p>
                </div>
              )}
            </>
          )}

          {mode === 'login' && (
            <div>
              <label className="block text-[13px] font-bold text-black mb-1">
                Tài khoản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  ref={firstInputRef}
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email hoặc Số điện thoại"
                  className="w-full pl-9 pr-3 py-2.5 text-[#1677ff] border border-gray-300 rounded-lg focus:outline-none focus:border-[#1677ff]"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          )}

          {/* Mật khẩu */}
          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-9 pr-3 py-2.5 text-[#1677ff] border border-gray-300 rounded-lg focus:outline-none focus:border-[#1677ff]"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          {/* 2 Buttons Chuẩn BHTT: "LƯU DỮ LIỆU" / "ĐĂNG NHẬP" và "THOÁT" */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              THOÁT
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {mode === 'login' ? 'ĐĂNG NHẬP' : 'LƯU DỮ LIỆU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
