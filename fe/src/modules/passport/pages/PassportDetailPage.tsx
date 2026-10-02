import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Video, 
  History, 
  QrCode, 
  Share2, 
  Award, 
  UserCheck, 
  FileText,
  Flame,
  CheckCircle2,
  Camera,
  Upload,
  Download
} from 'lucide-react';
import { lookupPassport, HeritagePassport } from '../../../services/heritageApi';
import { ArtworkMagnifier } from '../../../components/passport/ArtworkMagnifier';
import { CertificateModal } from '../../../components/passport/CertificateModal';
import { AntiCounterfeitTester } from '../../../components/passport/AntiCounterfeitTester';
import { QrScannerModal } from '../components/QrScannerModal';
import { QrExportModal } from '../components/QrExportModal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface PassportDetailPageProps {
  initialCode?: string;
}

export const PassportDetailPage: React.FC<PassportDetailPageProps> = ({ initialCode = 'VN-BT882194' }) => {
  const { t } = useTranslation();
  const [passportCode, setPassportCode] = useState(initialCode);
  const [passport, setPassport] = useState<HeritagePassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerInitialTab, setScannerInitialTab] = useState<'camera' | 'upload'>('camera');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const fetchPassportData = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await lookupPassport(code);
      setPassport(data);
    } catch (err: any) {
      setError(err?.message || 'Không tìm thấy thông tin Hộ chiếu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passportCode) {
      fetchPassportData(passportCode);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header Tra Cứu Hộ Chiếu */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-heritage-indigo/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-heritage-terracotta font-semibold">
            Hệ Thống Số Hóa Di Sản Văn Hóa &amp; Bảo Chứng Làng Nghề
          </span>
          <h1 className="text-2xl md:text-3xl font-heritage font-bold text-heritage-indigo mt-1">
            Hộ Chiếu Di Sản Số (Heritage Passport)
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-sans">
            Định danh độc bản vật lý sang số • Chứng nhận nguồn gốc bất biến trên chuỗi khối Blockchain
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-2">
          {/* Ô nhập mã Hộ chiếu */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={passportCode}
              onChange={(e) => setPassportCode(e.target.value.trim().toUpperCase())}
              placeholder="Mã Passport (VD: VN-BT882194)"
              className="w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-indigo text-heritage-indigo font-mono uppercase shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchPassportData(passportCode);
              }}
            />
          </div>

          {/* Nút Tra Cứu */}
          <Button 
            variant="heritage" 
            onClick={() => fetchPassportData(passportCode)} 
            className="px-4 py-2.5 text-xs font-bold shadow-sm"
          >
            <QrCode className="w-4 h-4 mr-1.5" />
            Tra Cứu
          </Button>

          {/* Bộ 3 công cụ QR Di Sản Số: Quét Camera, Tải Ảnh, Xuất QR */}
          <div className="flex items-center gap-1.5">
            {/* 1. Nút Quét Camera */}
            <button
              type="button"
              onClick={() => {
                setScannerInitialTab('camera');
                setIsScannerModalOpen(true);
              }}
              title="Quét tem mã QR bằng Camera thiết bị"
              className="flex-1 sm:flex-none px-3 py-2.5 bg-stone-100 hover:bg-stone-200 border border-gray-300 rounded-xl text-xs font-bold text-heritage-indigo flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Camera className="w-4 h-4 text-heritage-terracotta" />
              <span>Quét QR</span>
            </button>

            {/* 2. Nút Tải Ảnh QR */}
            <button
              type="button"
              onClick={() => {
                setScannerInitialTab('upload');
                setIsScannerModalOpen(true);
              }}
              title="Tải ảnh QR từ máy tính hoặc dán ảnh clipboard"
              className="flex-1 sm:flex-none px-3 py-2.5 bg-stone-100 hover:bg-stone-200 border border-gray-300 rounded-xl text-xs font-bold text-heritage-indigo flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Upload className="w-4 h-4 text-heritage-brass" />
              <span>Tải Ảnh</span>
            </button>

            {/* 3. Nút Xuất QR Di Sản */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              title="Xuất mã QR & Tem bảo chứng di sản số (In/Tải PNG/SVG)"
              className="flex-1 sm:flex-none px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất QR</span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-terracotta mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 font-sans">Đang đồng bộ dữ liệu sổ cái Blockchain...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-8 bg-red-50 border-2 border-red-200 rounded-2xl text-center text-red-700 font-sans space-y-2">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold">Không tìm thấy Hộ chiếu</h3>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {passport && !loading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Status Bar */}
          <div className={`p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
            passport.status === 'ACTIVE' 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border-red-300 text-red-900 animate-pulse'
          }`}>
            <div className="flex items-center gap-3.5">
              {passport.status === 'ACTIVE' ? (
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              ) : (
                <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wide font-sans text-sm md:text-base">
                    {passport.status === 'ACTIVE' ? 'CHÍNH HÃNG ĐỘC BẢN - ĐÃ XÁC THỰC' : 'CẢNH BÁO QUÉT BẤT THƯỜNG'}
                  </span>
                  <Badge variant={passport.status === 'ACTIVE' ? 'verified' : 'warning'}>
                    Mã số: {passport.passportCode}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 font-sans">
                  Tổng lượt quét: <strong className="text-heritage-indigo">{passport.scanCount} lượt</strong> • Mã Serial: <span className="font-mono font-bold text-heritage-terracotta">{passport.serialNumber || passport.passportCode}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsExportModalOpen(true)}
                className="gap-1.5 text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 font-bold shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Xuất Tem QR Di Sản
              </Button>
              <Button 
                variant="heritage" 
                size="sm" 
                onClick={() => setIsCertModalOpen(true)}
                className="gap-1.5 text-xs shadow-md"
              >
                <Award className="w-4 h-4 text-heritage-brass" />
                In Chứng Thư A4
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-xs"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* MAIN GRID: TÁC PHẨM & THÔNG TIN NGUỒN GỐC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI (7 cột): Showcase Tác Phẩm Kính Lúp & Video Chế Tác */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tác phẩm có kính lúp soi chi tiết men rạn */}
              <div className="bg-white p-4 rounded-2xl border border-heritage-indigo/10 shadow-sm">
                <ArtworkMagnifier
                  mainImage="/images/luc-binh-men-ran-bat-trang.jpg"
                  artworkName={passport.product.name}
                />
              </div>

              {/* 2. Video Tư Liệu Quy Trình Chế Tác */}
              <div className="bg-white p-6 rounded-2xl border border-heritage-indigo/10 shadow-sm space-y-3">
                <h3 className="text-base font-heritage font-bold text-heritage-indigo flex items-center gap-2">
                  <Video className="w-5 h-5 text-heritage-terracotta" />
                  Video Ký Sự Quy Trình Chế Tác Thủ Công
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Ghi lại công đoạn chuốt gốm trên bàn xoay và nung liên tục 36 giờ trong lò củi của nghệ nhân.
                </p>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Video Quy trình chế tác gốm Bát Tràng"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (5 cột): Hồ sơ Nghệ Nhân, Sổ Cái Blockchain, Chống Hàng Giả */}
            <div className="lg:col-span-5 space-y-6">
              {/* Thông tin tác phẩm & Nghệ nhân */}
              <div className="bg-white p-6 rounded-2xl border border-heritage-indigo/10 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-heritage-celadon">
                  {passport.product?.artisan?.craftVillage?.name || 'Làng Nghề Truyền Thống'}
                </span>
                <h2 className="text-xl font-heritage font-bold text-heritage-indigo leading-snug">
                  {passport.product?.name || 'Tác Phẩm Di Sản Số'}
                </h2>
                
                <div className="space-y-2.5 text-xs text-gray-600 divide-y divide-gray-100">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Nghệ nhân tạo tác:</span>
                    <span className="font-bold text-heritage-indigo">
                      {passport.product?.artisan?.user?.fullName || 'Nghệ Nhân Làng Nghề'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Danh hiệu công nhận:</span>
                    <span className="font-semibold text-heritage-brass">
                      {passport.product?.artisan?.title || 'Nghệ Nhân Ưu Tú'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Chất liệu tự nhiên:</span>
                    <span>{passport.product?.materialInfo || 'Nguyên liệu tự nhiên bản địa'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Quy cách kích thước:</span>
                    <span>{passport.product?.dimensions || 'Quy cách mỹ nghệ tiêu chuẩn'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Định danh vật lý:</span>
                    <span className="font-mono font-bold text-heritage-terracotta">Tem QR Bảo Chứng Số</span>
                  </div>
                </div>
              </div>

              {/* 3. Câu Chuyện & Tâm Huyết Nghệ Nhân */}
              <div className="bg-white p-6 rounded-2xl border border-heritage-indigo/10 shadow-sm space-y-3">
                <h3 className="text-sm font-heritage font-bold text-heritage-indigo flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-heritage-terracotta" />
                  Câu Chuyện &amp; Tâm Huyết Của Nghệ Nhân
                </h3>
                <div className="p-4 bg-[#FAF7F0] rounded-xl border-l-4 border-heritage-terracotta italic text-gray-700 text-xs font-serif leading-relaxed">
                  "{passport.artisanStoryQuote || 'Mỗi nếp rạn trên thân bình là một vết nứt thời gian, được nuôi dưỡng bởi hồn đất và tâm huyết của người thợ.'}"
                  <span className="block mt-2 font-sans font-bold text-[11px] text-heritage-indigo not-italic">
                    — {passport.product?.artisan?.title || 'Nghệ Nhân'} {passport.product?.artisan?.user?.fullName || 'Làng Nghề'} (45 năm tuổi nghề)
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-sans">
                  {passport.product?.artisan?.bio || 'Nghệ nhân có nhiều năm cống hiến gìn giữ tinh hoa di sản làng nghề.'}
                </p>
              </div>
            </div>
          </div>

          {/* 5. Tra Cứu Lịch Sử Hành Trình Sản Phẩm (Provenance Timeline) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-heritage-indigo/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-heritage font-bold text-heritage-indigo flex items-center gap-2">
                <History className="w-5 h-5 text-heritage-terracotta" />
                Hành Trình Lịch Sử Tác Phẩm (Provenance Timeline)
              </h3>
              <span className="text-xs text-gray-400 font-sans">Minh bạch 100% từ xưởng đến tay khách hàng</span>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-heritage-indigo/20">
              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-heritage-terracotta border-2 border-white shadow"></div>
                <h4 className="text-sm font-bold text-heritage-indigo">Mốc 1: Khai thác đất sét non Cao Lanh</h4>
                <p className="text-xs text-gray-600 mt-1">Đất sét được khai thác và lọc lắng qua hệ thống 4 bể truyền thống tại Bát Tràng, ủ dẻo tự nhiên trong 90 ngày.</p>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">Thời gian: Tháng 05/2026</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-heritage-terracotta border-2 border-white shadow"></div>
                <h4 className="text-sm font-bold text-heritage-indigo">Mốc 2: Chuốt gốm tạo dáng lục bình</h4>
                <p className="text-xs text-gray-600 mt-1">Nghệ nhân Bùi Gia Gốm trực tiếp dùng tay vuốt tròn từng đường lượn trên bàn xoay truyền thống, tạo phôi dáng cân đối.</p>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">Thời gian: Tháng 07/2026</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-heritage-terracotta border-2 border-white shadow"></div>
                <h4 className="text-sm font-bold text-heritage-indigo">Mốc 3: Phóng bút chấm men chàm &amp; Vẽ tích Cá Chép</h4>
                <p className="text-xs text-gray-600 mt-1">Họa sĩ làng nghề vẽ tay từng vảy cá chép vượt cổng vũ môn, sử dụng nước men tro trấu tự nhiên.</p>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">Thời gian: Tháng 08/2026</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white shadow"></div>
                <h4 className="text-sm font-bold text-heritage-indigo flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Mốc 4: Nung lò củi 36 giờ ở nhiệt độ 1.280°C
                </h4>
                <p className="text-xs text-gray-600 mt-1">Nhiệt độ nung đạt đỉnh tạo nên mạng lưới nứt rạn men tự nhiên, tiếng gõ vang thanh như chuông khánh.</p>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">Thời gian: Tháng 09/2026</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-heritage-celadon border-2 border-white shadow"></div>
                <h4 className="text-sm font-bold text-heritage-celadon">Mốc 5: Kiểm định âm sắc &amp; Cấp Hộ Chiếu Di Sản</h4>
                <p className="text-xs text-gray-600 mt-1">Kiểm định chất lượng, ghi mã băm SHA-256 lên Blockchain Polygon và xuất mã tem QR Decal độc bản.</p>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">Thời gian: 26/09/2026</span>
              </div>
            </div>
          </div>

          {/* 6. Hệ Thống Giám Sát Quét Mã Chống Hàng Giả */}
          <AntiCounterfeitTester
            passportCode={passport.passportCode}
            currentStatus={passport.status}
            scanCount={passport.scanCount}
            onScanCompleted={() => fetchPassportData(passport.passportCode)}
          />

          {/* Modal Giấy Chứng Nhận A4 In Ấn */}
          <CertificateModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            passport={passport}
          />
        </div>
      )}

      {/* Modal Quét Mã QR (Camera trực tiếp & Tải ảnh) */}
      <QrScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        initialTab={scannerInitialTab}
        onScanSuccess={(scannedCode) => {
          setPassportCode(scannedCode);
          fetchPassportData(scannedCode);
        }}
      />

      {/* Modal Xuất Mã QR & Tem Di Sản Số */}
      <QrExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        passportCode={passportCode || 'VN-BT882194'}
        passport={passport}
      />
    </div>
  );
};
