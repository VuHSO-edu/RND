import React from 'react';
import { Printer, X, ShieldCheck, Award } from 'lucide-react';
import { Button } from '../ui/Button';

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
  if (!isOpen || !passport) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden my-8">
        {/* Thanh công cụ Modal */}
        <div className="h-14 px-6 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wide">
            <Award className="w-5 h-5 text-heritage-brass" />
            <span>CHỨNG THƯ XÁC THỰC DI SẢN SỐ (A4)</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="heritage" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-4 h-4" />
              In Bản Cứng A4
            </Button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung Chứng Thư Di Sản A4 */}
        <div className="p-10 md:p-14 bg-[#FAF7F0] text-stone-900 border-[12px] border-[#1A365D] relative font-serif">
          {/* Họa tiết góc cổ truyền */}
          <div className="absolute top-4 left-4 text-xs font-mono text-heritage-brass font-bold">★ HERITAGE CERTIFICATE ★</div>
          <div className="absolute top-4 right-4 text-xs font-mono text-heritage-brass font-bold">ID: {passport.passportCode}</div>

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
                <span className="text-[11px] text-gray-500 block">Trọng lượng: {passport.product.weightGram / 1000}kg</span>
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
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://heritage.vn/passport/${passport.passportCode}`}
                  alt="QR Code"
                  className="w-full h-full"
                />
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
      </div>
    </div>
  );
};
