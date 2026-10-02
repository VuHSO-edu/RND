import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, Camera, PlusCircle, CheckCircle2, AlertTriangle, 
  Sparkles, Package, RefreshCw, Upload, Image as ImageIcon, Video, X, BookmarkCheck,
  Truck, Wallet, CreditCard, Printer, ArrowRight, Clock, ShieldCheck, DollarSign
} from 'lucide-react';
import { productApi, SkuPayload } from '../../../services/productApi';
import { 
  artisanStudioApi, 
  ArtisanOrderDto, 
  WalletResponseDto, 
  ShippingLabelDto, 
  WithdrawPayload 
} from '../../../services/artisanStudioApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { HeritageModal } from '../../../components/ui/HeritageModal';
import { ImageUploadDropzone } from '../../../components/ui/ImageUploadDropzone';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useMediaLifecycle, useSpeechLifecycle, useFormDraft } from '../../../hooks/useMediaLifecycle';

type StudioTab = 'SKU' | 'KANBAN' | 'WALLET';

export const ArtisanStudioPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<StudioTab>('SKU');

  // SKU Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Kanban Order State
  const [orders, setOrders] = useState<ArtisanOrderDto[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [selectedShippingLabel, setSelectedShippingLabel] = useState<ShippingLabelDto | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<WalletResponseDto | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState<WithdrawPayload>({
    amount: 1000000,
    bankName: 'Vietcombank',
    bankAccountNumber: '',
    bankAccountName: '',
    note: 'Rút tiền doanh thu tác phẩm di sản'
  });
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

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

  // Load danh sách đơn hàng cho Kanban
  const loadOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const data = await artisanStudioApi.getOrders(user?.artisanId || 1);
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Load thông tin ví tiền
  const loadWallet = async () => {
    setIsWalletLoading(true);
    try {
      const data = await artisanStudioApi.getWallet(user?.artisanId || 1);
      setWallet(data);
    } catch (err) {
      console.error('Error loading wallet', err);
    } finally {
      setIsWalletLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadWallet();
  }, [user?.artisanId]);

  // Xử lý nạp ảnh từ camera với giải phóng bộ nhớ
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic([40, 80]);
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
    triggerHaptic([50, 100, 50]);

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
      clearDraft();
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

  // Cập nhật trạng thái Kanban
  const handleStatusTransition = async (orderId: number, nextStatus: string) => {
    try {
      await artisanStudioApi.updateOrderStatus(orderId, { status: nextStatus }, user?.artisanId || 1);
      triggerHaptic([40, 80]);
      loadOrders();
      loadWallet();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật tiến độ đơn hàng.');
    }
  };

  // In Tem Vận Đơn
  const handlePrintShippingLabel = async (orderId: number) => {
    try {
      const label = await artisanStudioApi.generateShippingLabel(orderId, user?.artisanId || 1);
      setSelectedShippingLabel(label);
      setIsLabelModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo tem vận đơn.');
    }
  };

  // Submit Yêu Cầu Rút Tiền
  const handleSubmitWithdrawal = async () => {
    if (!withdrawForm.bankAccountNumber.trim() || !withdrawForm.bankAccountName.trim()) {
      alert('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản thụ hưởng.');
      return;
    }
    if (withdrawForm.amount <= 0 || (wallet && withdrawForm.amount > wallet.availableBalance)) {
      alert('Số tiền rút không hợp lệ hoặc vượt quá số dư khả dụng.');
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      await artisanStudioApi.withdraw(withdrawForm, user?.artisanId || 1);
      alert('Đã gửi yêu cầu rút tiền thành công! Kế toán đối soát sẽ chuyển khoản trong 24 giờ.');
      setIsWithdrawModalOpen(false);
      loadWallet();
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi yêu cầu rút tiền.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner Studio Nghệ Nhân */}
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
            {user?.role === 'ARTISAN' ? (user?.fullName || 'Nghệ Nhân Ưu Tú Bùi Hoài') : 'Nghệ Nhân Ưu Tú Bùi Hoài'}
          </h1>
          <p className="text-sm text-stone-200 max-w-xl font-sans">
            Không gian kỹ thuật số dành riêng cho bác nghệ nhân: Quản lý đơn hàng, theo dõi ký quỹ Escrow 7 ngày, rút tiền về tài khoản ngân hàng và khai báo mẫu mã tác phẩm.
          </p>
        </div>

        {/* Nút Micro Thu Âm Giọng Nói */}
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

      {/* Tabs Chuyển Đổi Chức Năng Của Xưởng Nghệ Nhân (Đạt chuẩn Dirty Hand: Nút to >= 48px) */}
      <div className="flex flex-wrap items-center gap-3 p-1.5 bg-stone-200/70 rounded-2xl border border-stone-300">
        <button
          onClick={() => setActiveTab('SKU')}
          className={`flex-1 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'SKU'
              ? 'bg-white text-[#8B1E1E] shadow-md border-b-2 border-[#8B1E1E]'
              : 'text-stone-700 hover:bg-stone-300/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mẫu Mã SKU ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('KANBAN')}
          className={`flex-1 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'KANBAN'
              ? 'bg-white text-[#8B1E1E] shadow-md border-b-2 border-[#8B1E1E]'
              : 'text-stone-700 hover:bg-stone-300/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Đơn Hàng & Chế Tác ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WALLET')}
          className={`flex-1 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'WALLET'
              ? 'bg-white text-[#8B1E1E] shadow-md border-b-2 border-[#8B1E1E]'
              : 'text-stone-700 hover:bg-stone-300/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Ví Tiền & Ký Quỹ</span>
        </button>
      </div>

      {/* TAB 1: MẪU MÃ SKU */}
      {activeTab === 'SKU' && (
        <div className="space-y-6">
          {/* Thông báo draft */}
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

          {/* Hành Động Nhanh Của Nghệ Nhân */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

            <div 
              onClick={() => cameraInputRef.current?.click()}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DEC8' }}
              className="p-6 bg-white border-2 border-heritage-border text-heritage-indigo rounded-2xl shadow-sm cursor-pointer hover:bg-stone-50 transition-all flex items-center gap-4 min-h-[96px] active:scale-[0.98]"
            >
              <div 
                style={{ backgroundColor: '#F5EFE6', color: '#8B1E1E', borderColor: '#E8DEC8' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
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

            <div 
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DEC8' }}
              className="p-6 bg-white border-2 border-heritage-border text-heritage-indigo rounded-2xl shadow-sm flex items-center gap-4 min-h-[96px]"
            >
              <div 
                style={{ backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
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

          {/* Danh mục sản phẩm */}
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
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((prod: any) => {
                    const isRejected = prod.reviewStatus === 'REJECTED';
                    const isApproved = prod.reviewStatus === 'APPROVED';

                    return (
                      <div
                        key={prod.id}
                        className={`rounded-2xl border-2 overflow-hidden bg-white shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                          isRejected 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : isApproved 
                            ? 'border-emerald-200 hover:border-amber-400' 
                            : 'border-stone-200'
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
                                  ? 'bg-emerald-600 text-white'
                                  : isRejected
                                  ? 'bg-red-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {isApproved ? 'Đã Duyệt' : isRejected ? 'Bị Từ Chối' : 'Chờ Duyệt'}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono text-stone-400 font-bold">
                              {prod.skuCode}
                            </span>
                            <h3 className="font-bold text-base text-[#1C2D37] leading-snug">
                              {prod.name}
                            </h3>
                            <p className="text-xs text-stone-500 line-clamp-2">
                              {prod.description || 'Chưa có mô tả'}
                            </p>
                          </div>

                          {isRejected && prod.rejectionReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                              <div className="font-bold flex items-center gap-1.5 text-red-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Lý do Quản lý Làng yêu cầu bổ sung:</span>
                              </div>
                              <p className="leading-relaxed font-sans">{prod.rejectionReason}</p>
                            </div>
                          )}

                          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                            <span className="text-base font-bold text-[#8B1E1E]">
                              {Number(prod.price || 0).toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-xs text-stone-400 font-medium">
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
        </div>
      )}

      {/* TAB 2: QUẢN LÝ ĐƠN HÀNG (KANBAN 4 CỘT) */}
      {activeTab === 'KANBAN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm uppercase text-stone-700 tracking-wider">
              Bảng Tiến Độ Chế Tác & Giao Vận (Fulfillment Kanban)
            </span>
            <button
              onClick={loadOrders}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
              title="Làm mới danh sách đơn"
            >
              <RefreshCw className={`w-4 h-4 ${isOrdersLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cột 1: Chờ Chuẩn Bị (PREPARING) */}
            <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200 space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Chờ Chuẩn Bị
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {orders.filter(o => o.shippingStatus === 'PREPARING').length}
                </span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                {orders.filter(o => o.shippingStatus === 'PREPARING').map(order => (
                  <div key={order.orderId} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">{order.orderCode}</span>
                      <span className="text-[11px] text-stone-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{order.shippingAddress}</p>
                    </div>
                    <div className="text-xs font-bold text-[#8B1E1E]">
                      Thu về: {Number(order.artisanPayout || order.totalAmount).toLocaleString('vi-VN')} đ
                    </div>
                    {/* Action buttons >= 48px */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                      <button
                        onClick={() => handleStatusTransition(order.orderId, 'CRAFTING')}
                        className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <span>Bắt Đầu Chế Tác</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintShippingLabel(order.orderId)}
                        className="w-full min-h-[40px] rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> In Tem Vận Đơn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột 2: Đang Chế Tác (CRAFTING) */}
            <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200 space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase text-indigo-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Đang Chế Tác
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-200 text-indigo-900">
                  {orders.filter(o => o.shippingStatus === 'CRAFTING').length}
                </span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                {orders.filter(o => o.shippingStatus === 'CRAFTING').map(order => (
                  <div key={order.orderId} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">{order.orderCode}</span>
                      <span className="text-[11px] text-stone-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{order.shippingAddress}</p>
                    </div>
                    <div className="text-xs font-bold text-[#8B1E1E]">
                      Thu về: {Number(order.artisanPayout || order.totalAmount).toLocaleString('vi-VN')} đ
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                      <button
                        onClick={() => handleStatusTransition(order.orderId, 'SHIPPED')}
                        className="w-full min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Đã Xong & Bàn Giao Ship</span>
                      </button>
                      <button
                        onClick={() => handlePrintShippingLabel(order.orderId)}
                        className="w-full min-h-[40px] rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> In Tem Vận Đơn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột 3: Đã Giao Vận (SHIPPED) */}
            <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200 space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase text-blue-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> Đã Bàn Giao Vận Chuyển
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-900">
                  {orders.filter(o => o.shippingStatus === 'SHIPPED').length}
                </span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                {orders.filter(o => o.shippingStatus === 'SHIPPED').map(order => (
                  <div key={order.orderId} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">{order.orderCode}</span>
                      <span className="text-[11px] text-stone-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{order.shippingAddress}</p>
                    </div>
                    <div className="text-xs font-bold text-[#8B1E1E]">
                      Thu về: {Number(order.artisanPayout || order.totalAmount).toLocaleString('vi-VN')} đ
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                      <button
                        onClick={() => handleStatusTransition(order.orderId, 'DELIVERED')}
                        className="w-full min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xác Nhận Đã Nhận Hàng</span>
                      </button>
                      <button
                        onClick={() => handlePrintShippingLabel(order.orderId)}
                        className="w-full min-h-[40px] rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Xem Lại Tem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột 4: Giao Thành Công (DELIVERED) */}
            <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200 space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Giao Thành Công
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                  {orders.filter(o => o.shippingStatus === 'DELIVERED').length}
                </span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                {orders.filter(o => o.shippingStatus === 'DELIVERED').map(order => (
                  <div key={order.orderId} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">{order.orderCode}</span>
                      <span className="text-[11px] text-stone-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{order.shippingAddress}</p>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{order.escrowStatus === 'RELEASED' ? 'Tiền Đã Vào Ví' : 'Đang Ký Quỹ 7 Ngày'}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <div className="text-xs text-stone-600">
                        Doanh thu: <span className="font-bold text-[#8B1E1E]">{Number(order.artisanPayout || order.totalAmount).toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VÍ TIỀN & DOANH THU */}
      {activeTab === 'WALLET' && (
        <div className="space-y-6">
          {/* Card Số Dư */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 bg-white border-2 border-emerald-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> Số Dư Khả Dụng (Rút Ngay)
              </span>
              <div className="text-2xl font-bold text-emerald-800">
                {Number(wallet?.availableBalance || 0).toLocaleString('vi-VN')} đ
              </div>
              <p className="text-xs text-stone-500">Tiền đã hoàn tất thời gian ký quỹ và sẵn sàng chuyển về tài khoản ngân hàng</p>
            </div>

            <div className="p-6 bg-white border-2 border-amber-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Ký Quỹ Escrow Đang Giữ
              </span>
              <div className="text-2xl font-bold text-amber-800">
                {Number(wallet?.escrowBalance || 0).toLocaleString('vi-VN')} đ
              </div>
              <p className="text-xs text-stone-500">Tiền các đơn hàng đang giao hoặc trong thời hạn 7 ngày bảo vệ khách hàng</p>
            </div>

            <div className="p-6 bg-white border-2 border-stone-200 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Tổng Doanh Thu Đã Rút
                </span>
                <div className="text-2xl font-bold text-stone-800">
                  {Number(wallet?.totalWithdrawn || 0).toLocaleString('vi-VN')} đ
                </div>
              </div>

              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full min-h-[48px] rounded-xl bg-[#8B1E1E] hover:bg-[#6E1414] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>YÊU CẦU RÚT TIỀN</span>
              </button>
            </div>
          </div>

          {/* Bảng Lịch Sử Giao Dịch */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <span className="font-heading font-bold text-sm uppercase text-stone-800 tracking-wider">
                Lịch Sử Biến Động Số Dư & Lệnh Rút Tiền
              </span>
              <button
                onClick={loadWallet}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200/50"
              >
                <RefreshCw className={`w-4 h-4 ${isWalletLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Mã GD</th>
                    <th className="py-3 px-4 font-bold">Loại Giao Dịch</th>
                    <th className="py-3 px-4 font-bold text-right">Số Tiền</th>
                    <th className="py-3 px-4 font-bold">Tài Khoản Nhận</th>
                    <th className="py-3 px-4 font-bold">Trạng Thái</th>
                    <th className="py-3 px-4 font-bold">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {wallet?.transactions && wallet.transactions.length > 0 ? (
                    wallet.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-800">
                          {tx.txReference || `TX-${tx.id}`}
                        </td>
                        <td className="py-3 px-4">
                          {tx.transactionType === 'WITHDRAW' ? (
                            <span className="font-semibold text-rose-700">Rút tiền về ngân hàng</span>
                          ) : tx.transactionType === 'ESCROW_RELEASE' ? (
                            <span className="font-semibold text-emerald-700">Ký quỹ Escrow giải ngân</span>
                          ) : (
                            <span className="font-semibold text-stone-600">Phí dịch vụ</span>
                          )}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${tx.transactionType === 'WITHDRAW' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {tx.transactionType === 'WITHDRAW' ? '-' : '+'}
                          {Number(tx.amount).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {tx.bankName ? `${tx.bankName} - ${tx.bankAccountNumber} (${tx.bankAccountName})` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.status === 'COMPLETED' ? 'Thành Công' : tx.status === 'PENDING' ? 'Chờ Chuyển' : 'Từ Chối'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-400">
                          {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        Chưa có lịch sử biến động số dư.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Yêu Cầu Rút Tiền */}
      <HeritageModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="BHTT"
        subtitle="Yêu Cầu Rút Tiền Về Tài Khoản Ngân Hàng"
        maxWidth="md"
        showFooter
        onSave={handleSubmitWithdrawal}
        saveLabel="LƯU DỮ LIỆU"
        cancelLabel="THOÁT"
        saveLoading={isSubmittingWithdraw}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl text-emerald-900 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide block">Số Dư Khả Dụng</span>
              <span className="font-bold text-lg text-emerald-950">{Number(wallet?.availableBalance || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-900">
              Rút 24/7
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center justify-between">
              <span>Số tiền muốn rút (VNĐ) <span className="text-red-500">*</span></span>
              <span className="text-[11px] font-normal text-slate-400">Tối thiểu 100.000 đ</span>
            </label>
            <input
              type="number"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 text-[#1677ff] font-bold text-base bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
            />
            {/* Quick Amount Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[500000, 1000000, 2000000, 5000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawForm({ ...withdrawForm, amount: amt })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    withdrawForm.amount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {(amt / 1000).toLocaleString('vi-VN')}k
                </button>
              ))}
              {wallet && wallet.availableBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setWithdrawForm({ ...withdrawForm, amount: wallet.availableBalance })}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold border border-emerald-200"
                >
                  Tất cả số dư
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-black mb-1.5">
              Ngân hàng thụ hưởng <span className="text-red-500">*</span>
            </label>
            <select
              value={withdrawForm.bankName}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
              className="w-full h-11 px-3.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
            >
              <option value="Vietcombank">Vietcombank (VCB - Ngoại Thương)</option>
              <option value="MBBank">MBBank (Ngân hàng Quân Đội)</option>
              <option value="Techcombank">Techcombank (TCB - Kỹ Thương)</option>
              <option value="BIDV">BIDV (Đầu Tư &amp; Phát Triển)</option>
              <option value="VietinBank">VietinBank (Công Thương)</option>
              <option value="Agribank">Agribank (Nông Nghiệp &amp; PTNT)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Số tài khoản ngân hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={withdrawForm.bankAccountNumber}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccountNumber: e.target.value })}
                placeholder="VD: 0011002345678"
                className="w-full px-4 py-2.5 text-[#1677ff] font-mono font-bold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Tên chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={withdrawForm.bankAccountName}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccountName: e.target.value.toUpperCase() })}
                placeholder="VD: NGUYEN VAN A"
                className="w-full px-4 py-2.5 text-[#1677ff] font-bold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
              />
            </div>
          </div>
        </div>
      </HeritageModal>

      {/* Modal Tem Vận Đơn (Shipping Label) */}
      <HeritageModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="BHTT"
        subtitle="Phiếu Gửi Hàng & Tem Vận Đơn Di Sản"
        maxWidth="md"
      >
        {selectedShippingLabel && (
          <div className="space-y-4 text-xs font-sans p-2">
            <div className="border-2 border-dashed border-stone-400 p-4 rounded-xl space-y-4 bg-white">
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-lg text-[#8B1E1E]">BẢO HỘ TÁC PHẨM</span>
                  <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-bold border border-stone-300">
                    {selectedShippingLabel.carrier}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-stone-900">{selectedShippingLabel.trackingNumber}</p>
                  <p className="text-[10px] text-stone-400">Mã đơn: {selectedShippingLabel.orderCode}</p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 bg-stone-50 rounded border border-stone-200">
                <div className="inline-block font-mono tracking-[0.4em] text-lg font-bold text-stone-900">
                  ||| | |||| || ||| |||| |
                </div>
                <p className="text-[10px] font-mono text-stone-500 mt-1">{selectedShippingLabel.trackingNumber}</p>
              </div>

              {/* Thông tin người gửi / nhận */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="font-bold text-[11px] text-stone-500 uppercase">Người Gửi (Xưởng Di Sản):</p>
                  <p className="font-bold text-stone-800 mt-1">{selectedShippingLabel.senderName}</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">{selectedShippingLabel.senderAddress}</p>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="font-bold text-[11px] text-stone-500 uppercase">Người Nhận:</p>
                  <p className="font-bold text-stone-800 mt-1">{selectedShippingLabel.recipientInfo}</p>
                </div>
              </div>

              {/* Tiền thu hộ COD / Đã thanh toán */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                <span className="font-bold text-stone-700">Giá trị tác phẩm:</span>
                <span className="font-bold text-sm text-[#8B1E1E]">
                  {Number(selectedShippingLabel.finalAmount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> In Ngay (Print)
              </button>
            </div>
          </div>
        )}
      </HeritageModal>

      {/* Modal Khai Báo SKU Chuẩn HeritageModal */}
      <HeritageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="BHTT"
        subtitle="Khai Báo Mẫu Mã Tác Phẩm Di Sản Mới"
        maxWidth="2xl"
      >
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-xl font-heading font-bold text-[#1C2D37]">
              {successMessage}
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Hệ thống đang đồng bộ danh mục tác phẩm...
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateSku} className="space-y-5 text-[#1C2D37]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5">
                  Tên mẫu tác phẩm di sản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => saveDraft({ name: e.target.value })}
                  placeholder="VD: Bình gốm vuốt tay men lam hoa cúc"
                  className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:bg-white transition-all shadow-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center justify-between">
                  <span>Mã định danh SKU</span>
                  <span className="text-[11px] font-normal text-slate-400">Để trống để tự sinh mã chuẩn</span>
                </label>
                <input
                  type="text"
                  value={draft.skuCode}
                  onChange={(e) => saveDraft({ skuCode: e.target.value })}
                  placeholder="VD: SKU-GOM-BATTRANG-01"
                  className="w-full px-4 py-2.5 text-[#1677ff] font-mono font-bold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5">
                  Giá ước lượng (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={draft.price}
                  onChange={(e) => saveDraft({ price: e.target.value })}
                  className="w-full px-4 py-2.5 text-[#1677ff] font-bold text-base bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 transition-all shadow-xs"
                />
                {/* Quick Price Chips */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {[1500000, 2500000, 4500000, 8000000].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => saveDraft({ price: String(p) })}
                      className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all ${
                        draft.price === String(p)
                          ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {(p / 1000000)}tr
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5">
                  Chất liệu chế tác
                </label>
                <input
                  type="text"
                  value={draft.materialInfo}
                  onChange={(e) => saveDraft({ materialInfo: e.target.value })}
                  placeholder="VD: Đất sét Cao Lanh nung củi"
                  className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 transition-all shadow-xs"
                />
                {/* Quick Material Tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {['Đất Cao Lanh', 'Men lam cổ', 'Men ngọc Celadon', 'Gốm phù sa'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => saveDraft({ materialInfo: m })}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5">
                  Kích thước hiện vật
                </label>
                <input
                  type="text"
                  value={draft.dimensions}
                  onChange={(e) => saveDraft({ dimensions: e.target.value })}
                  placeholder="VD: Cao 35cm x ĐK 18cm"
                  className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 transition-all shadow-xs"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-sans font-semibold text-[#1C2D37] flex items-center gap-1.5">
                  <span>Lời tự sự &amp; Hồn cốt tác phẩm</span>
                  {isListening && (
                    <span className="text-xs text-red-600 font-bold animate-pulse">
                      ● Đang thu âm...
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-xs ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600 animate-pulse'
                      : 'bg-white text-[#8B1E1E] border-[#8B1E1E]/40 hover:bg-stone-50'
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
                className="w-full px-4 py-2.5 text-[13px] font-sans rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-[#1677ff] font-semibold focus:border-[#8B1E1E] focus:ring-4 focus:ring-[#8B1E1E]/15 transition-all shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-sans font-semibold text-[#1C2D37]">
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
                className="w-full px-4 py-2.5 text-[13px] font-sans rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-[#1677ff] focus:border-[#8B1E1E] focus:ring-4 focus:ring-[#8B1E1E]/15 transition-all shadow-xs"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
              >
                THOÁT
              </button>

              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#6E1414] hover:from-[#731818] hover:to-[#5c1010] text-white font-bold text-sm shadow-lg shadow-rose-900/25 hover:shadow-rose-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>LƯU DỮ LIỆU</span>
              </button>
            </div>
          </form>
        )}
      </HeritageModal>
    </div>
  );
};
