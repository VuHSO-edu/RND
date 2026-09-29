import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  CheckCircle2, 
  X, 
  QrCode, 
  FileCode, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { HeritagePassport } from '../../../services/heritageApi';
import { 
  generatePassportQrDataUrl, 
  generatePassportQrSvg, 
  getPassportCanonicalUrl 
} from '../utils/qrPassportHelper';

interface QrExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passportCode: string;
  passport?: HeritagePassport | null;
}

export const QrExportModal: React.FC<QrExportModalProps> = ({
  isOpen,
  onClose,
  passportCode,
  passport
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const decalCardRef = useRef<HTMLDivElement | null>(null);

  const canonicalUrl = getPassportCanonicalUrl(passportCode);

  useEffect(() => {
    if (!isOpen || !passportCode) return;

    let isMounted = true;
    setIsGenerating(true);

    generatePassportQrDataUrl(passportCode, { width: 1024, margin: 2 })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('[QrExport] Error generating QR:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, passportCode]);

  // Tải ảnh QR độc lập (PNG 1024x1024)
  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_Heritage_${passportCode}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // Tải file SVG Vector
  const handleDownloadQrSvg = async () => {
    try {
      const svgString = await generatePassportQrSvg(passportCode, { width: 1024 });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `QR_Heritage_${passportCode}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } catch (err) {
      console.error('[QrExport] Error exporting SVG:', err);
    }
  };

  // Sao chép liên kết tra cứu
  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // In tem Decal di sản trực tiếp
  const handlePrintStamp = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Box */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header 56px chuẩn BHTT */}
        <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/40">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-heritage-brass">
              XUẤT MÃ QR &amp; TEM BẢO CHỨNG DI SẢN SỐ
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-[#f0f2f5] space-y-6">
          {/* KHUNG THẺ TEM DECAL DI SẢN SỐ (PRINTABLE STAMP CARD) */}
          <div
            ref={decalCardRef}
            className="bg-[#FAF7F0] p-6 rounded-xl border-4 border-[#1A365D] shadow-md text-stone-900 relative font-serif select-none"
          >
            {/* Họa tiết hoa văn góc di sản */}
            <div className="absolute top-2 left-3 text-[10px] font-mono text-heritage-brass font-bold">
              ★ HERITAGE VERIFIED ★
            </div>
            <div className="absolute top-2 right-3 text-[10px] font-mono text-heritage-brass font-bold">
              ID: {passportCode}
            </div>

            {/* Tiêu đề Quốc gia */}
            <div className="text-center pt-2 pb-4 border-b border-heritage-brass/30">
              <span className="text-[10px] uppercase tracking-widest text-heritage-terracotta font-sans font-bold block">
                HỆ THỐNG SỐ HÓA DI SẢN &amp; BẢO CHỨNG LÀNG NGHỀ
              </span>
              <h3 className="text-lg md:text-xl font-heritage font-bold text-heritage-indigo mt-0.5">
                TEM ĐỊNH DANH HỘ CHIẾU DI SẢN SỐ
              </h3>
              <p className="text-[11px] text-gray-500 font-sans italic mt-0.5">
                Chứng thực xuất xứ nguồn gốc vật lý gắn kết chuỗi khối Blockchain
              </p>
            </div>

            {/* Nội dung trung tâm: QR Code & Thông tin tác phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 items-center">
              {/* QR Code Canvas */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2">
                <div className="w-44 h-44 bg-white p-2.5 rounded-xl border-2 border-heritage-indigo shadow-inner flex items-center justify-center">
                  {isGenerating ? (
                    <div className="w-8 h-8 border-3 border-heritage-terracotta border-t-transparent rounded-full animate-spin" />
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code ${passportCode}`}
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>
                <div className="text-center">
                  <span className="font-mono text-xs font-bold text-heritage-indigo tracking-wider">
                    {passportCode}
                  </span>
                  <span className="block text-[10px] text-gray-500 font-sans">
                    Quét để xác thực nguồn gốc
                  </span>
                </div>
              </div>

              {/* Chi tiết Hộ Chiếu & Triện Son Đỏ */}
              <div className="md:col-span-7 space-y-3 font-sans text-xs">
                <div>
                  <span className="text-gray-500 text-[11px] block">Tác phẩm bảo hộ:</span>
                  <h4 className="font-bold text-sm text-heritage-indigo line-clamp-2">
                    {passport?.product?.name || 'Tác Phẩm Thủ Công Mỹ Nghệ Di Sản'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px] bg-white/70 p-2.5 rounded-lg border border-heritage-brass/20">
                  <div>
                    <span className="text-gray-500 text-[10px] block">Nghệ nhân tạo tác:</span>
                    <strong className="text-heritage-indigo">
                      {passport?.product?.artisan?.user?.fullName || 'Nghệ nhân làng nghề'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Làng nghề truyền thống:</span>
                    <span className="font-semibold text-stone-800">
                      {passport?.product?.artisan?.craftVillage?.name || 'Làng gốm Bát Tràng'}
                    </span>
                  </div>
                </div>

                {/* Khóa Băm Blockchain */}
                <div className="p-2 bg-stone-100 rounded text-[10px] font-mono text-gray-600 border border-gray-200">
                  <div className="text-gray-400">Mã băm kiểm định SHA-256 (Blockchain):</div>
                  <div className="break-all font-bold text-emerald-800">
                    {passport?.verificationHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </div>
                </div>

                {/* Triện son đỏ bảo chứng */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-gray-500 italic">
                    * Mã QR này bảo hộ vĩnh viễn trên sổ cái Polygon Mainnet.
                  </div>
                  <div className="w-14 h-14 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center text-[8px] font-bold uppercase rotate-[-8deg] tracking-tighter text-center leading-tight shadow-xs shrink-0">
                    DI SẢN<br />BẢO CHỨNG<br />ĐỘC BẢN
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CÁC NÚT TÁC VỤ XUẤT QR (EXPORT TOOLBAR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 print:hidden">
            {/* 1. Tải ảnh QR PNG */}
            <button
              type="button"
              onClick={handleDownloadQrPng}
              disabled={isGenerating || !qrDataUrl}
              className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-gray-300 rounded-lg text-xs font-bold text-heritage-indigo flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-heritage-terracotta" />
              <span>Tải QR (PNG HD)</span>
            </button>

            {/* 2. Tải Vector SVG */}
            <button
              type="button"
              onClick={handleDownloadQrSvg}
              disabled={isGenerating}
              className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-gray-300 rounded-lg text-xs font-bold text-heritage-indigo flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <FileCode className="w-4 h-4 text-heritage-brass" />
              <span>Tải Vector (SVG)</span>
            </button>

            {/* 3. In Tem Decal */}
            <button
              type="button"
              onClick={handlePrintStamp}
              className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-gray-300 rounded-lg text-xs font-bold text-heritage-indigo flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>In Tem Decal</span>
            </button>

            {/* 4. Sao chép liên kết */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-gray-300 rounded-lg text-xs font-bold text-heritage-indigo flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Chép Liên Kết</span>
                </>
              )}
            </button>
          </div>

          {/* Dòng hiển thị link chính thức */}
          <div className="p-3 bg-stone-100 rounded-lg border border-gray-200 flex items-center justify-between text-xs text-gray-600 print:hidden">
            <span className="font-mono truncate mr-2">{canonicalUrl}</span>
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-heritage-indigo font-bold hover:text-heritage-terracotta flex items-center gap-1 shrink-0"
            >
              Mở link <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Nút thoát chuẩn quy tắc BHTT */}
          <div className="pt-3 flex items-center justify-end border-t border-gray-200 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              THOÁT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
