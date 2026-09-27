import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, QrCode, Package, CreditCard, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { CustomModal } from '../../../components/ui/CustomModal';
import { Input } from '../../../components/ui/Input';

export const ArtisanStudioPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // State tạo Hộ chiếu thông thường
  const [productName, setProductName] = useState('');
  const [material, setMaterial] = useState('');
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      setProductName('Bình Gốm Men Rạn Hoa Sen');
      setMaterial('Đất sét Bát Tràng non nung lò củi');
    }
  };

  const handleCreatePassport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const randomCode = 'VN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setSuccessCode(randomCode);
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessCode(null);
      setProductName('');
      setMaterial('');
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-serif">
      {/* Studio Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-heritage-indigo/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-heritage-terracotta font-semibold font-sans">
            Kênh Dành Riêng Cho Bậc Thầy Nghề
          </span>
          <h1 className="text-2xl md:text-3xl font-heritage font-bold text-heritage-indigo mt-1">
            {t('artisan.studioTitle')}: Bùi Gia Gốm
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-sans">
            Nghệ nhân Ưu tú • Xưởng gốm Thôn 1, Bát Tràng, Hà Nội
          </p>
        </div>

        {/* Nút Voice Assistant thân thiện */}
        <Button
          variant={isVoiceActive ? 'danger' : 'secondary'}
          onClick={toggleVoiceAssistant}
          className="gap-2 px-5 py-3 rounded-xl shadow-sm text-sm border-2 border-heritage-indigo/20 font-sans"
        >
          <Mic className={`w-5 h-5 ${isVoiceActive ? 'animate-pulse text-white' : 'text-heritage-terracotta'}`} />
          <span>{isVoiceActive ? 'Đang lắng nghe bác nói...' : 'Bật Trợ Lý Giọng Nói 🎙️'}</span>
        </Button>
      </div>

      {/* Quick Summary Cards (Font to, số lớn) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-sans font-medium uppercase">Số dư khả dụng nhận về</span>
          <div className="text-2xl md:text-3xl font-bold font-sans text-emerald-700 mt-2">
            34.200.000 đ
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-sans">Sẵn sàng rút về tài khoản ngân hàng</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-sans font-medium uppercase">Tiền tạm giữ (Ký quỹ an toàn)</span>
          <div className="text-2xl md:text-3xl font-bold font-sans text-heritage-indigo mt-2">
            9.600.000 đ
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-sans">Tự động giải ngân sau 7 ngày khách nhận hàng</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-sans font-medium uppercase">Khách quét tra cứu tuần này</span>
          <div className="text-2xl md:text-3xl font-bold font-sans text-heritage-terracotta mt-2">
            145 lượt
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-sans">100% đánh giá tác phẩm chính hãng</span>
        </div>
      </div>

      {/* Action Buttons for Artisans (Nút bấm lớn >= 48px, font >= 16px) */}
      <div className="space-y-4">
        <h2 className="text-lg font-heritage font-bold text-heritage-indigo">
          Các Công Việc Bác Muốn Làm Hôm Nay:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="artisan"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-start gap-4 p-5 text-left h-auto rounded-xl shadow-md cursor-pointer"
          >
            <div className="p-3 bg-white/20 rounded-xl">
              <PlusCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{t('artisan.createPassport')}</div>
              <span className="text-xs text-white/80 block mt-0.5 font-sans">Bác tạo tem Hộ Chiếu chống hàng giả ngay</span>
            </div>
          </Button>

          <Button
            variant="heritage"
            className="flex items-center justify-start gap-4 p-5 text-left h-auto min-h-[52px] rounded-xl shadow-md cursor-pointer"
          >
            <div className="p-3 bg-white/10 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{t('artisan.processOrders')}</div>
              <span className="text-xs text-white/70 block mt-0.5 font-sans">Có 02 đơn hàng mới đang chờ bác đóng gói</span>
            </div>
          </Button>

          <Button
            variant="secondary"
            className="flex items-center justify-start gap-4 p-5 text-left h-auto min-h-[52px] border-2 border-gray-300 rounded-xl shadow-sm cursor-pointer"
          >
            <div className="p-3 bg-gray-100 rounded-xl">
              <QrCode className="w-8 h-8 text-heritage-indigo" />
            </div>
            <div>
              <div className="text-base font-bold text-heritage-indigo">{t('artisan.printTags')}</div>
              <span className="text-xs text-gray-500 block mt-0.5 font-sans">In tem nhãn dán sẵn khổ Decal nhiệt</span>
            </div>
          </Button>

          <Button
            variant="secondary"
            className="flex items-center justify-start gap-4 p-5 text-left h-auto min-h-[52px] border-2 border-gray-300 rounded-xl shadow-sm cursor-pointer"
          >
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CreditCard className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <div className="text-base font-bold text-emerald-800">{t('artisan.withdraw')}</div>
              <span className="text-xs text-gray-500 block mt-0.5 font-sans">Nhận tiền về ngân hàng liên kết trong 5 phút</span>
            </div>
          </Button>
        </div>
      </div>

      {/* MODAL: TẠO HỘ CHIẾU THÔNG THƯỜNG (Bo góc 8px, Header 56px, Title BHTT) */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="BHTT - TẠO HỘ CHIẾU TÁC PHẨM MỚI"
        isDirty={!!productName}
      >
        {successCode ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-heritage-indigo font-heritage">
              Đã Cấp Hộ Chiếu Di Sản Thành Công!
            </h3>
            <p className="text-sm text-gray-600 font-sans">
              Mã bảo chứng Blockchain: <strong className="font-mono text-heritage-terracotta">{successCode}</strong>
            </p>
            <p className="text-xs text-gray-400 font-sans">Máy in tem nhiệt đang tự động xuất bản in...</p>
          </div>
        ) : (
          <form onSubmit={handleCreatePassport} className="space-y-4 font-sans">
            <Input
              label="Tên tác phẩm thủ công"
              required
              placeholder="VD: Bình Men Rạn Tích Cá Chép"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />

            <Input
              label="Nguyên liệu truyền thống"
              required
              placeholder="VD: Đất sét Cao Lanh non Bát Tràng"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-heritage-indigo">
              💡 <strong>Mẹo nhỏ:</strong> Hệ thống sẽ tự động tạo mã băm SHA-256 đối chiếu và ghi sổ cái Blockchain để bảo vệ bản quyền tác phẩm của bác.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                {t('common.button.cancel')}
              </Button>
              <Button type="submit" variant="heritage">
                {t('common.button.save')}
              </Button>
            </div>
          </form>
        )}
      </CustomModal>
    </div>
  );
};
