import React, { useState, useEffect } from 'react';
import { Printer, X, ShieldCheck, Award } from 'lucide-react';
import { generatePassportQrDataUrl } from '../../modules/passport/utils/qrPassportHelper';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: any;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  passport
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (passport?.passportCode) {
      generatePassportQrDataUrl(passport.passportCode, { width: 400 })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [passport?.passportCode]);

  // Hỗ trợ phím Esc để đóng modal ngay lập tức
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !passport) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Nút thoát nổi luôn hiện diện ở góc trên cùng bên phải màn hình */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-all print:hidden cursor-pointer"
        title="Thoát hộp thoại (Esc)"
      >
        <X className="w-4 h-4" />
        <span>THOÁT (Esc)</span>
      </button>

      {/* Khung Hộp thoại Modal: Bo góc 8px chuẩn quy tắc Antigravity Global */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-3xl max-h-[92vh] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col border border-gray-300 animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* 1. Header Cố Định 56px chuẩn BHTT */}
        <div className="h-14 min-h-[56px] px-6 bg-heritage-indigo text-white flex items-center justify-between shrink-0 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-heritage-brass">
              <Award className="w-4 h-4 text-heritage-brass" />
              <span>CHỨNG THƯ XÁC THỰC DI SẢN SỐ (A4)</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="px-3 py-1.5 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Thoát (Esc)"
          >
            <X className="w-4 h-4" />
            <span>THOÁT</span>
          </button>
        </div>

        {/* 2. Nội dung Chứng Thư Di Sản A4 cuộn bên trong */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#FAF7F0] text-stone-900 border-[10px] border-[#1A365D] relative font-serif">
          {/* Họa tiết góc cổ truyền */}
          <div className="absolute top-4 left-4 text-xs font-mono text-heritage-brass font-bold">
            ★ HERITAGE CERTIFICATE ★
          </div>
          <div className="absolute top-4 right-4 text-xs font-mono text-heritage-brass font-bold">
            ID: {passport.passportCode}
          </div>

          <div className="text-center space-y-3 pb-8 border-b-2 border-heritage-brass/40">
            <h2 className="text-xs uppercase tracking-[0.25em] text-heritage-terracotta font-sans font-bold">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h2>
            <p className="text-[11px] text-gray-500 font-sans -mt-2">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-16 h-0.5 bg-heritage-terracotta mx-auto my-2"></div>
            
            <h1 className="text-2xl md:text-3xl font-heritage font-bold text-heritage-indigo tracking-tight">
              GIẤY CHỨNG NHẬN DI SẢN ĐỘC BẢN
            </h1>
            <p className="text-xs italic text-gray-600 font-serif">
              Chứng thực nguồn gốc thủ công truyền thống &amp; Tính bất biến trên chuỗi khối Blockchain
            </p>
          </div>

          {/* Chi tiết chứng nhận */}
          <div className="py-8 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-sans text-gray-500 tracking-wider">Tác phẩm được bảo hộ</span>
              <div className="text-2xl font-bold text-heritage-indigo">{passport.product.name}</div>
              <p className="text-xs text-gray-600 font-sans">
                Chế tác tại: <strong>{passport.product.artisan.craftVillage.name}</strong> • Hà Nội, Việt Nam
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 bg-white/70 rounded-xl border border-heritage-brass/30 text-xs font-sans">
              <div>
                <span className="text-gray-500 block">Nghệ nhân tạo tác:</span>
                <span className="font-bold text-sm text-heritage-indigo">{passport.product.artisan.user.fullName}</span>
                <span className="text-[11px] text-gray-500 block">{passport.product.artisan.title}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Quy cách &amp; Kích thước:</span>
                <span className="font-bold">{passport.product.dimensions}</span>
                <span className="text-[11px] text-gray-500 block">
                  Trọng lượng: {passport.product.weightGram ? `${passport.product.weightGram / 1000}kg` : '45kg (Tiêu chuẩn)'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Chất liệu tự nhiên:</span>
                <span>{passport.product.materialInfo}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Mã Hộ chiếu số:</span>
                <span className="font-mono font-bold text-heritage-terracotta">{passport.passportCode}</span>
              </div>
            </div>

            {/* Thông tin Blockchain */}
            <div className="p-3 bg-stone-100 rounded-lg text-[11px] font-mono space-y-1 text-gray-600 border border-gray-200">
              <div>• Chuỗi Ledger: Polygon POS Mainnet</div>
              <div>• Smart Contract: {passport.smartContractAddress}</div>
              <div>• Băm SHA-256: {passport.verificationHash}</div>
            </div>
          </div>

          {/* Chữ ký & Triện ấn */}
          <div className="grid grid-cols-2 pt-6 border-t border-heritage-brass/40 items-end">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans text-gray-500 block">MÃ QR ĐỊNH DANH TRA CỨU</span>
              <div className="w-24 h-24 bg-white border-2 border-heritage-indigo p-1 mx-auto flex items-center justify-center rounded-lg shadow-sm">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR Code ${passport.passportCode}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 border-2 border-heritage-terracotta border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-[10px] font-mono text-gray-400 block">{passport.passportCode}</span>
            </div>

            <div className="text-center space-y-6">
              <div className="text-xs text-gray-600 font-sans">
                Hà Nội, ngày 27 tháng 09 năm 2026<br />
                <strong>NGHỆ NHÂN ĐẠI DIỆN TẠO TÁC</strong>
              </div>
              
              {/* Con dấu triện son đỏ */}
              <div className="w-20 h-20 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center mx-auto text-[10px] font-bold uppercase rotate-[-12deg] tracking-tighter p-1 shadow-sm">
                BÙI GIA GỐM<br />BÁT TRÀNG<br />ĐỘC BẢN
              </div>

              <div className="font-bold text-sm text-heritage-indigo">
                {passport.product.artisan.user.fullName}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Cố Định 56px chuẩn BHTT: Nút LƯU/IN và THOÁT */}
        <div className="h-14 min-h-[56px] px-6 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
          >
            THOÁT
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            IN BẢN CỨNG A4
          </button>
        </div>
      </div>
    </div>
  );
};
