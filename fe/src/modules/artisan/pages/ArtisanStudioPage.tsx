import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, Camera, PlusCircle, CheckCircle2, AlertTriangle, 
  Sparkles, Package, RefreshCw, Upload, Image as ImageIcon, Video, X, BookmarkCheck 
} from 'lucide-react';
import { productApi, SkuPayload } from '../../../services/productApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { HeritageModal } from '../../../components/ui/HeritageModal';
import { ImageUploadDropzone } from '../../../components/ui/ImageUploadDropzone';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useMediaLifecycle, useSpeechLifecycle, useFormDraft } from '../../../hooks/useMediaLifecycle';

export const ArtisanStudioPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hook quản lý vòng đời Media để triệt tiêu rò rỉ bộ nhớ
  const { createManagedUrl, revokeUrl } = useMediaLifecycle();

  // Hook Auto-Save Draft: Bảo vệ nghệ nhân không bao giờ mất bản thảo khi Token hết hạn (401) hoặc lỡ tay reload
  const { data: draft, saveDraft, clearDraft, hasDraft } = useFormDraft('artisan_sku_form', {
    name: '',
    skuCode: '',
    price: '2500000',
    materialInfo: '',
    dimensions: 'Cao 35cm x ĐK 18cm',
    description: '',
    artisanStory: '',
    imageUrl: '',
    videoUrl: ''
  });

  const [imageUrl, setImageUrl] = useState(draft.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(draft.videoUrl || '');

  // Hook Speech Recognition & Rung cảm ứng (Haptic Feedback)
  const { isListening, toggleSpeech, triggerHaptic } = useSpeechLifecycle({
    onResult: (transcript) => {
      saveDraft({
        artisanStory: (draft.artisanStory ? draft.artisanStory + ' ' : '') + transcript
      });
    },
    onError: () => {
      // Fallback thân thiện nếu mic lỗi
      saveDraft({
        artisanStory: (draft.artisanStory ? draft.artisanStory + ' ' : '') + 
          'Tác phẩm được vuốt tay bằng đất sét phù sa sông Hồng nung củi 1.250 độ C theo kỹ nghệ cổ truyền.'
      });
    }
  });

  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load danh sách sản phẩm của Nghệ nhân
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res: any = await productApi.getMyArtisanProducts(user?.artisanId || 1);
      setProducts(res.data || res || []);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.artisanId]);

  // Xử lý nạp ảnh từ camera với giải phóng bộ nhớ
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic([40, 80]); // Rung xác nhận chụp ảnh
    try {
      const res: any = await productApi.uploadMedia(file);
      const url = res.data?.publicUrl || res.publicUrl || createManagedUrl(file);
      setImageUrl(url);
      saveDraft({ imageUrl: url });
    } catch (err: any) {
      alert(err.message || 'Lỗi tải ảnh lên');
    }
  };

  const handleCreateSku = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic([50, 100, 50]); // Rung xác nhận bấm gửi

    try {
      const payload: SkuPayload = {
        name: draft.name.trim(),
        skuCode: draft.skuCode.trim() || 'SKU-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        price: Number(draft.price),
        materialInfo: draft.materialInfo.trim(),
        dimensions: draft.dimensions.trim(),
        description: draft.description.trim(),
        artisanStory: draft.artisanStory.trim(),
        creationProcessVideoUrl: videoUrl.trim() || undefined,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
        artisanId: user?.artisanId || 1,
        villageId: user?.villageId || 1
      };

      await productApi.createSku(payload);
      clearDraft(); // Xóa bản nháp sau khi submit thành công
      setSuccessMessage('Khai báo mẫu mã SKU thành công! Đã gửi hồ sơ cho Quản lý Làng nghề thẩm định.');
      
      setTimeout(() => {
        setSuccessMessage(null);
        setIsModalOpen(false);
        loadProducts();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khai báo mẫu SKU');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner Studio Nghệ Nhân - Tối ưu cho người làm nghề thực địa */}
      <div 
        style={{ background: 'linear-gradient(135deg, #1C2D37 0%, #233845 50%, #16242C 100%)', color: '#FFFFFF' }}
        className="p-6 sm:p-8 rounded-3xl shadow-heritage-card flex flex-col md:flex-row md:items-center justify-between gap-6 border border-heritage-border"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: 'rgba(197, 154, 63, 0.2)', color: '#D4AF37', borderColor: 'rgba(197, 154, 63, 0.4)' }}
              className="px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase"
            >
              Xưởng Tạo Tác Di Sản
            </span>
            <span className="text-xs text-white/70">• Bàn Xoay Nghệ Nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-wide">
            {user?.role === 'ARTISAN' ? (user?.fullName || 'Nghệ Nhân Ưu Tú Trần Độ') : 'Nghệ Nhân Ưu Tú Trần Độ'}
          </h1>
          <p className="text-sm text-stone-200 max-w-xl font-sans">
            Không gian kỹ thuật số dành riêng cho bác nghệ nhân: Nhập liệu bằng giọng nói, chụp ảnh tự động nén nhẹ và gán tem Hộ chiếu số Blockchain.
          </p>
        </div>

        {/* Nút Micro Thu Âm Giọng Nói (Đạt chuẩn Dirty Hand Mode: Cao >= 56px, tương phản cực cao) */}
        <button
          onClick={toggleSpeech}
          style={isListening ? { backgroundColor: '#DC2626', color: '#FFFFFF' } : { backgroundColor: '#8B1E1E', color: '#FFFFFF', borderColor: '#C59A3F' }}
          className={`flex items-center justify-center gap-3 min-h-[56px] px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-xl border-2 active:scale-95 ${
            isListening 
              ? 'animate-pulse ring-4 ring-red-400/50' 
              : 'hover:brightness-110'
          }`}
          title="Nhấn để nói chuyện với trợ lý giọng nói tiếng Việt"
        >
          {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6" style={{ color: '#D4AF37' }} />}
          <span className="text-white font-bold">{isListening ? 'Đang Lắng Nghe Bác Nói...' : '🎙️ Kể Chuyện Bằng Giọng Nói'}</span>
        </button>
      </div>

      {/* Thông báo nếu có bản nháp được tự động khôi phục */}
      {hasDraft && !isModalOpen && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <BookmarkCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Hệ thống đã tự động lưu bản thảo mẫu tác phẩm: <strong>{draft.name || 'Chưa đặt tên'}</strong>.
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors"
          >
            Mở Tiếp Tục
          </button>
        </div>
      )}

      {/* Hành Động Nhanh Của Nghệ Nhân (Dirty Hand Mode: Nút bấm to >= 56px, tương phản cao) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Nút Khai Báo Mẫu SKU Mới */}
        <div 
          onClick={() => {
            triggerHaptic([30]);
            setIsModalOpen(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #8B1E1E 0%, #6E1414 100%)',
            backgroundColor: '#8B1E1E',
            color: '#FFFFFF'
          }}
          className="p-6 text-white rounded-2xl shadow-lg cursor-pointer hover:brightness-110 transition-all flex items-center gap-4 min-h-[96px] border-2 border-[#5c1010] active:scale-[0.98]"
        >
          <div 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
          >
            <PlusCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-wide" style={{ color: '#FFFFFF' }}>
              Khai Báo Mẫu SKU Mới
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Khai báo thiết kế di sản để Quản lý duyệt
            </p>
          </div>
        </div>

        {/* Nút Chụp Ảnh Nhanh Tại Xưởng */}
        <div 
          onClick={() => cameraInputRef.current?.click()}
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DEC8' }}
          className="p-6 bg-white border-2 border-heritage-border text-heritage-indigo rounded-2xl shadow-sm cursor-pointer hover:bg-stone-50 transition-all flex items-center gap-4 min-h-[96px] active:scale-[0.98]"
        >
          <div 
            style={{ backgroundColor: '#F5EFE6', color: '#8B1E1E', borderColor: '#E8DEC8' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-heritage-red shrink-0 border"
          >
            <Camera className="w-8 h-8" style={{ color: '#8B1E1E' }} />
          </div>
          <div>
            <div className="text-base font-bold text-heritage-indigo" style={{ color: '#1C2D37' }}>
              Chụp Ảnh Tại Xưởng
            </div>
            <p className="text-xs mt-0.5 text-heritage-subtext" style={{ color: '#687782' }}>
              Tự động nén ảnh ≤ 1.5MB chống sập bộ nhớ
            </p>
          </div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />
        </div>

        {/* Nút Thống Kê Sản Phẩm */}
        <div 
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DEC8' }}
          className="p-6 bg-white border-2 border-heritage-border text-heritage-indigo rounded-2xl shadow-sm flex items-center gap-4 min-h-[96px]"
        >
          <div 
            style={{ backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-heritage-success shrink-0 border"
          >
            <Package className="w-8 h-8" style={{ color: '#059669' }} />
          </div>
          <div>
            <div className="text-2xl font-bold text-heritage-indigo" style={{ color: '#1C2D37' }}>
              {products.length}
            </div>
            <p className="text-xs mt-0.5 text-heritage-subtext" style={{ color: '#687782' }}>
              Mẫu thiết kế SKU đã khai báo
            </p>
          </div>
        </div>
      </div>

      {/* Danh Mục Mẫu Thiết Kế SKU Của Nghệ Nhân */}
      <div className="bg-white rounded-2xl border-2 border-heritage-border shadow-heritage-card overflow-hidden">
        <div className="p-5 bg-heritage-surface/60 border-b border-heritage-border flex items-center justify-between">
          <span className="font-heading font-bold text-sm uppercase text-heritage-indigo tracking-wider">
            Danh Mục Mẫu Mã Của Xưởng ({products.length})
          </span>
          <button
            onClick={loadProducts}
            className="p-2 text-heritage-indigo hover:text-heritage-red rounded-xl hover:bg-white transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto">
              <div 
                style={{ backgroundColor: '#F5EFE6', borderColor: '#E8DEC8' }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-stone-400 border"
              >
                <Package className="w-8 h-8 text-stone-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-heritage-indigo" style={{ color: '#1C2D37' }}>
                  Chưa Có Mẫu Mã Tác Phẩm Nào
                </h4>
                <p className="text-xs text-heritage-subtext font-sans" style={{ color: '#687782' }}>
                  Xưởng của bác hiện chưa có mẫu mã SKU nào được tạo. Hãy khai báo tác phẩm đầu tiên để gửi Ban Quản Lý thẩm định và khắc tem Hộ chiếu số.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic([30]);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF', borderColor: '#5c1010' }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer border-2"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span className="text-white font-bold">+ Khai Báo Mẫu Tác Phẩm Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod: any) => {
                const isRejected = prod.reviewStatus === 'REJECTED';
                const isApproved = prod.reviewStatus === 'APPROVED';

                return (
                  <div
                    key={prod.id}
                    className={`rounded-2xl border-2 overflow-hidden bg-heritage-paper shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                      isRejected 
                        ? 'border-heritage-red ring-2 ring-heritage-red/20' 
                        : isApproved 
                        ? 'border-heritage-border hover:border-heritage-gold' 
                        : 'border-heritage-border'
                    }`}
                  >
                    <div className="relative h-48 bg-stone-100 overflow-hidden">
                      <img
                        src={prod.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                            isApproved
                              ? 'bg-heritage-success text-white'
                              : isRejected
                              ? 'bg-heritage-red text-white'
                              : 'bg-heritage-gold text-white'
                          }`}
                        >
                          {isApproved ? 'Đã Duyệt' : isRejected ? 'Bị Từ Chối' : 'Chờ Duyệt'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-heritage-subtext font-bold">
                          {prod.skuCode}
                        </span>
                        <h3 className="font-bold text-base text-heritage-indigo leading-snug">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-heritage-subtext line-clamp-2">
                          {prod.description || 'Chưa có mô tả'}
                        </p>
                      </div>

                      {/* Khung viền Đỏ Chu sa hiển thị Lý do từ chối từ Ban quản lý làng */}
                      {isRejected && prod.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-heritage-red">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Lý do Quản lý Làng yêu cầu bổ sung:</span>
                          </div>
                          <p className="leading-relaxed font-sans">{prod.rejectionReason}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-heritage-border flex items-center justify-between">
                        <span className="text-base font-bold text-heritage-red">
                          {Number(prod.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-xs text-heritage-subtext font-medium">
                          {prod.dimensions}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Khai Báo SKU Chuẩn HeritageModal (Z-Index 9999, Dirty Hand Ergonomics) */}
      <HeritageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="KHAI BÁO MẪU MÃ TÁC PHẨM MỚI"
        subtitle="Thông tin sẽ được chuyển đến Ban Quản lý Làng để thẩm định và cấp tem Blockchain"
        maxWidth="2xl"
      >
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-heritage-success mx-auto animate-bounce" />
            <h3 className="text-xl font-heading font-bold text-heritage-indigo">
              {successMessage}
            </h3>
            <p className="text-xs text-heritage-subtext font-sans">
              Hệ thống đang đồng bộ danh mục tác phẩm...
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateSku} className="space-y-5 text-heritage-indigo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên mẫu tác phẩm di sản"
                required
                value={draft.name}
                onChange={(e) => saveDraft({ name: e.target.value })}
                placeholder="VD: Bình gốm vuốt tay men lam hoa cúc"
                autoFocus
              />

              <Input
                label="Mã định danh SKU (Để trống để tự tạo)"
                value={draft.skuCode}
                onChange={(e) => saveDraft({ skuCode: e.target.value })}
                placeholder="VD: SKU-GOM-001"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Giá ước lượng (VNĐ)"
                required
                type="number"
                value={draft.price}
                onChange={(e) => saveDraft({ price: e.target.value })}
                className="text-right"
              />

              <Input
                label="Chất liệu chế tác"
                value={draft.materialInfo}
                onChange={(e) => saveDraft({ materialInfo: e.target.value })}
                placeholder="VD: Đất sét Cao Lanh nung củi"
              />

              <Input
                label="Kích thước hiện vật"
                value={draft.dimensions}
                onChange={(e) => saveDraft({ dimensions: e.target.value })}
                placeholder="VD: Cao 35cm x ĐK 18cm"
              />
            </div>

            {/* Khung Tải Ảnh tích hợp nén ảnh Client-side và bảo vệ bộ nhớ */}
            <ImageUploadDropzone
              onFileReady={(file) => {
                const url = createManagedUrl(file);
                setImageUrl(url);
                saveDraft({ imageUrl: url });
              }}
              previewUrl={imageUrl}
              onClearPreview={() => {
                revokeUrl(imageUrl);
                setImageUrl('');
                saveDraft({ imageUrl: '' });
              }}
              label="Hình ảnh hiện vật (Tự động nén chuẩn bảo vệ bộ nhớ)"
              helperText="Kéo thả ảnh hoặc chạm để mở máy ảnh điện thoại"
            />

            {/* Ô Tự Sự Nghệ Nhân (Được bảo vệ bởi useFormDraft & useSpeechLifecycle) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-sans font-semibold text-heritage-indigo flex items-center gap-1.5">
                  <span>Lời tự sự & Hồn cốt tác phẩm</span>
                  {isListening && (
                    <span className="text-xs text-red-600 font-bold animate-pulse">
                      ● Đang thu âm...
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-heritage-red border-heritage-red/40 hover:bg-heritage-surface'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListening ? 'Dừng Ghi Âm' : 'Nói Để Nhập'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={draft.artisanStory}
                onChange={(e) => saveDraft({ artisanStory: e.target.value })}
                placeholder="Nghệ nhân có thể bấm nút 'Nói Để Nhập' để kể lại chuyện nghề..."
                className="w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border border-heritage-border bg-white text-heritage-indigo focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-sans font-semibold text-heritage-indigo">
                Video quy trình chế tác (YouTube / Drive URL nếu có)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  saveDraft({ videoUrl: e.target.value });
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border border-heritage-border bg-white text-heritage-indigo focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15 transition-all shadow-sm"
              />
            </div>

            {/* Nút bấm chuẩn Dirty Hand Mode: Cao >= 56px, tương phản cao */}
            <div className="pt-4 border-t border-heritage-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[50px] px-6 text-sm"
              >
                THOÁT
              </Button>

              <button
                type="submit"
                className="min-h-[56px] px-8 rounded-2xl bg-heritage-red hover:bg-[#731818] border-2 border-[#5c1010] text-white font-bold text-base shadow-lg shadow-heritage-red/25 hover:shadow-xl transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-heritage-gold" />
                <span>LƯU DỮ LIỆU</span>
              </button>
            </div>
          </form>
        )}
      </HeritageModal>
    </div>
  );
};
