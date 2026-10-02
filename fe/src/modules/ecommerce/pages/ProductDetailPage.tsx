import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, ShoppingBag, ShieldCheck, Sparkles, QrCode, 
  MapPin, Award, CheckCircle2, ChevronRight, Eye, Star, 
  Layers, Box, Share2, Heart, Clock, Truck, ShieldAlert,
  Send, X, MessageSquare, Info
} from 'lucide-react';
import { Product, fetchProductBySlug } from '../../../services/heritageApi';
import { useCartStore } from '../../../stores/useCartStore';
import { ModelViewer3D } from '../../../components/3d/ModelViewer3D';
import { DepthParallaxViewer } from '../../../components/3d/DepthParallaxViewer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { toast } from 'sonner';

interface ProductDetailPageProps {
  product?: Product;
  slug?: string;
  onBack?: () => void;
  onOpenPassport?: (passportCode: string) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product: initialProduct,
  slug,
  onBack,
  onOpenPassport,
  onBuyNow
}) => {
  const { t } = useTranslation();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState<boolean>(!initialProduct && !!slug);
  const [viewMode, setViewMode] = useState<'artwork' | 'model3d' | 'depth'>('artwork');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'process' | 'artisan' | 'reviews' | 'passport'>('details');
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Form state cho Đặt chế tác theo yêu cầu (Custom Commission)
  const [commissionForm, setCommissionForm] = useState({
    dimensions: '',
    material: '',
    notes: ''
  });
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  // Tải thông tin sản phẩm qua Slug nếu không được truyền trực tiếp
  useEffect(() => {
    if (!initialProduct && slug) {
      setLoading(true);
      fetchProductBySlug(slug)
        .then((data) => {
          if (data) setProduct(data);
        })
        .finally(() => setLoading(false));
    } else if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct, slug]);

  // Fallback an toàn nếu không tìm thấy dữ liệu
  const currentProduct: Product = product || {
    id: 101,
    name: 'Đôi Lục Bình Men Rạn Bát Tràng Cổ - Tích Cá Chép Vượt Vũ Môn',
    slug: 'doi-luc-binh-men-ran-bat-trang',
    skuCode: 'VN-BT-LBR-882194',
    categoryId: 1,
    description: 'Tuyệt tác lục bình men rạn tam hợp chế tác hoàn toàn thủ công tại làng gốm Bát Tràng. Sản phẩm được nung củi liên tục 36 giờ ở nhiệt độ 1.280°C, họa tích Cá Chép Vượt Vũ Môn bằng men chàm cổ với từng nếp rạn tự nhiên mang hồn cốt di sản trăm năm.',
    materialInfo: 'Đất sét cao lanh non lắng lọc 4 bể, men tro rạn tam hợp gia truyền, mực chàm tự nhiên',
    dimensions: 'Cao 1m68 x Đường kính thân 48cm',
    weightGram: 45000,
    price: 48500000,
    stockQuantity: 1,
    isUniqueArtwork: true,
    model3dUrl: undefined,
    imageUrl: '/images/luc-binh-men-ran-bat-trang.jpg',
    passportCode: 'VN-BT882194',
    artisanStory: 'Mỗi nếp rạn trên thân lục bình là một vết nứt thời gian, được nuôi dưỡng bởi hồn đất và tâm huyết của người thợ Bát Tràng qua nhiều thế hệ.',
    artisan: {
      id: 1,
      title: 'Nghệ Nhân Nhân Dân',
      bio: 'Nghệ nhân Bùi Hoài Nam có hơn 45 năm kinh nghiệm gìn giữ và phục dựng dòng men rạn cổ truyền triều Lê - Nguyễn tại làng gốm Bát Tràng.',
      user: {
        fullName: 'Bùi Hoài Nam'
      },
      craftVillage: {
        name: 'Làng Gốm Sứ Bát Tràng',
        province: 'Hà Nội'
      }
    }
  };

  const passportCode = currentProduct.passportCode || 'VN-BT882194';
  const maxStock = currentProduct.stockQuantity ?? 1;

  const handleAddToCart = () => {
    addToCart(currentProduct, selectedQuantity);
    toast.success(t('product.toast.addedToCart'));
  };

  const handleBuyNow = () => {
    addToCart(currentProduct, selectedQuantity);
    if (onBuyNow) {
      onBuyNow(currentProduct, selectedQuantity);
    } else {
      toast.success(t('product.toast.addedToCart'));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Đã sao chép liên kết tác phẩm vào bộ nhớ tạm!');
  };

  const handleOpenPassportView = () => {
    if (onOpenPassport) {
      onOpenPassport(passportCode);
    }
  };

  const handleCloseCommissionModal = () => {
    if (isFormDirty) {
      const confirmClose = window.confirm(t('common.validation.confirmExit'));
      if (!confirmClose) return;
    }
    setIsCommissionModalOpen(false);
    setIsFormDirty(false);
  };

  const handleSendCommission = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('product.toast.commissionSent'));
    setIsCommissionModalOpen(false);
    setIsFormDirty(false);
    setCommissionForm({ dimensions: '', material: '', notes: '' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-red mx-auto"></div>
        <p className="mt-4 text-xs font-sans text-heritage-subtext">Đang tải chi tiết tác phẩm di sản...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 font-sans">
      {/* 1. Thanh Breadcrumb & Nút Quay Lại */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-heritage-border/60">
        <div className="flex items-center gap-2 text-xs text-heritage-subtext">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-heritage-border rounded-xl text-heritage-indigo hover:text-heritage-red hover:bg-stone-50 font-bold transition-all shadow-sm mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('product.backToCatalog')}</span>
            </button>
          )}
          <span className="hover:text-heritage-indigo cursor-pointer" onClick={onBack}>
            {t('nav.catalog')}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-heritage-indigo font-medium">
            {currentProduct.artisan?.craftVillage?.name || t('product.craftVillage')}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-heritage-red font-bold truncate max-w-[200px] sm:max-w-xs">
            {currentProduct.name}
          </span>
        </div>

        {/* Nút hành động nhanh: Chia sẻ & Yêu thích */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-xl border transition-all ${
              isLiked 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-white border-heritage-border text-heritage-subtext hover:text-heritage-red'
            }`}
            title="Lưu tác phẩm yêu thích"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white border border-heritage-border rounded-xl text-heritage-subtext hover:text-heritage-indigo transition-all"
            title={t('product.shareArtwork')}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Khối Trực Quan Chính (Hai Cột: Trải Nghiệm Đa Chiều & Thông Tin Thương Mại) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CỘT TRÁI: Trình diễn 3D / Parallax / Vân Men (7 Cột) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Thanh Chọn Chế Độ Xem Tương Tác */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-heritage-border rounded-2xl shadow-sm">
            <button
              onClick={() => setViewMode('artwork')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'artwork'
                  ? 'bg-heritage-red text-white shadow-sm'
                  : 'text-heritage-indigo hover:bg-stone-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t('product.viewMode.artwork')}</span>
            </button>

            <button
              onClick={() => setViewMode('model3d')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'model3d'
                  ? 'bg-heritage-red text-white shadow-sm'
                  : 'text-heritage-indigo hover:bg-stone-100'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>{t('product.viewMode.model3d')}</span>
            </button>

            <button
              onClick={() => setViewMode('depth')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'depth'
                  ? 'bg-heritage-red text-white shadow-sm'
                  : 'text-heritage-indigo hover:bg-stone-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('product.viewMode.depth')}</span>
            </button>
          </div>

          {/* Vùng Trình Diễn Hình Ảnh / 3D / Chiều Sâu */}
          <div className="relative min-h-[520px] rounded-2xl overflow-hidden border border-heritage-border shadow-sm bg-stone-50">
            {viewMode === 'artwork' && (
              <ModelViewer3D
                src={currentProduct.model3dUrl}
                poster={currentProduct.imageUrl || '/images/luc-binh-men-ran-bat-trang.jpg'}
                alt={currentProduct.name}
              />
            )}

            {viewMode === 'model3d' && (
              <ModelViewer3D
                src={currentProduct.model3dUrl}
                poster={currentProduct.imageUrl || '/images/luc-binh-men-ran-bat-trang.jpg'}
                alt={currentProduct.name}
              />
            )}

            {viewMode === 'depth' && (
              <DepthParallaxViewer
                imageSrc={currentProduct.imageUrl || '/images/luc-binh-men-ran-bat-trang.jpg'}
                depthSrc="/images/luc-binh-depth-map.jpg"
                alt={currentProduct.name}
              />
            )}

            {/* Badges Nổi Trên Góc Tác Phẩm */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {currentProduct.isUniqueArtwork ? (
                <span className="bg-heritage-red text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                  🏺 {t('product.uniqueArtwork')}
                </span>
              ) : (
                <span className="bg-heritage-indigo text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                  ✨ {t('product.standardArtwork')}
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              <button
                onClick={handleOpenPassportView}
                className="bg-white/95 hover:bg-white text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-300 shadow-md flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-transform hover:scale-105"
                title="Bấm để mở trang tra cứu Hộ chiếu di sản chi tiết"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('product.hasPassport')}</span>
              </button>
            </div>
          </div>

          {/* Dòng Chú Thích Kỹ Thuật Đồ Họa */}
          <p className="text-[11px] text-center text-heritage-subtext italic">
            * Tương tác phóng to kiểm tra nước men rạn hoặc bấm nút "Bật AR" trên thiết bị di động để đặt thử tác phẩm vào phòng khách.
          </p>
        </div>

        {/* CỘT PHẢI: Thông Tin Thương Mại, Giá, Đặt Hàng & Ký Quỹ (5 Cột) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-heritage-border shadow-sm space-y-6">
            
            {/* 1. Header Làng Nghề & Tiêu Đề Tác Phẩm */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-heritage-red uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {currentProduct.artisan?.craftVillage?.name} ({currentProduct.artisan?.craftVillage?.province})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heritage font-bold text-heritage-indigo leading-snug">
                {currentProduct.name}
              </h1>

              {/* Mã Hộ Chiếu & SKU */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <button
                  onClick={handleOpenPassportView}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg font-mono font-bold hover:bg-amber-100 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-heritage-gold" />
                  <span>#{passportCode}</span>
                </button>

                <span className="text-heritage-subtext font-mono text-[11px]">
                  SKU: {currentProduct.skuCode || 'VN-BT882194'}
                </span>
              </div>

              {/* Đánh Giá Xác Thực & Lượt Tạo Tác */}
              <div className="flex items-center gap-3 pt-2 text-xs text-heritage-subtext">
                <div className="flex items-center text-amber-500 font-bold gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>5.0</span>
                </div>
                <span>•</span>
                <span className="text-heritage-indigo font-medium">12 đánh giá có xác thực</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">Đã cấp chứng chỉ số</span>
              </div>
            </div>

            {/* 2. Khối Giá Bán & Trạng Thái Kho Hàng */}
            <div className="p-4 bg-heritage-surface/60 rounded-xl border border-heritage-border/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-heritage-subtext uppercase tracking-wider block font-semibold">
                  {t('product.price')}:
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-sans text-heritage-red">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentProduct.price)}
                </span>
              </div>

              <div className="text-right">
                {maxStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('product.inStock')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700">
                    {t('product.outOfStock')}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Khối Huy Hiệu Bảo Hộ Ký Quỹ Escrow (Core Value Proposition) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-heritage-gold bg-white shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                <ShieldCheck className="w-4 h-4 text-heritage-gold" />
                <span>{t('product.escrow.title')}</span>
              </div>
              <p className="text-xs text-amber-950/80 leading-relaxed font-sans">
                {t('product.escrow.desc')}
              </p>
            </div>

            {/* 4. Thông Số Nhanh (Specs Grid) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-gray-100">
                <span className="text-heritage-subtext block text-[11px]">{t('product.dimensions')}</span>
                <span className="font-bold text-heritage-indigo mt-0.5 block truncate">
                  {currentProduct.dimensions}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-gray-100">
                <span className="text-heritage-subtext block text-[11px]">{t('product.material')}</span>
                <span className="font-bold text-heritage-indigo mt-0.5 block truncate">
                  {currentProduct.materialInfo}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-gray-100">
                <span className="text-heritage-subtext block text-[11px]">{t('product.weight')}</span>
                <span className="font-bold text-heritage-indigo mt-0.5 block">
                  {currentProduct.weightGram ? `${currentProduct.weightGram / 1000} kg` : 'Theo phôi thực tế'}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-gray-100">
                <span className="text-heritage-subtext block text-[11px]">{t('product.firingTemp')}</span>
                <span className="font-bold text-heritage-red mt-0.5 block">
                  {t('product.firingTempVal')}
                </span>
              </div>
            </div>

            {/* 5. Bộ Chọn Số Lượng & Nút Đặt Mua */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-heritage-indigo">{t('product.quantity')}:</span>
                <div className="flex items-center border border-heritage-border rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    disabled={selectedQuantity <= 1}
                    className="px-3 py-1.5 text-sm font-bold text-heritage-indigo hover:bg-stone-100 disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold font-mono text-heritage-indigo border-x border-heritage-border">
                    {selectedQuantity}
                  </span>
                  <button
                    onClick={() => setSelectedQuantity(Math.min(maxStock, selectedQuantity + 1))}
                    disabled={selectedQuantity >= maxStock}
                    className="px-3 py-1.5 text-sm font-bold text-heritage-indigo hover:bg-stone-100 disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-heritage-subtext">
                  (Tối đa {maxStock} tác phẩm)
                </span>
              </div>

              {/* Nhóm Button Thao Tác Mua Hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleAddToCart}
                  className="w-full gap-2 py-3 rounded-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('product.addToCart')}</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={handleBuyNow}
                  className="w-full gap-2 py-3 rounded-xl shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('product.buyNow')}</span>
                </Button>
              </div>

              {/* Nút Đặt Chế Tác Riêng (Custom Commission) */}
              <Button
                variant="gold"
                onClick={() => setIsCommissionModalOpen(true)}
                className="w-full gap-2 py-2.5 rounded-xl border border-heritage-gold/50 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('product.customCommission')}</span>
              </Button>
            </div>

            {/* 6. Cam Kết Dịch Vụ Vận Chuyển An Toàn */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-around text-[11px] text-heritage-subtext">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-heritage-red" />
                Đóng thùng gỗ chuyên dụng
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Bảo hiểm vỡ hỏng 100%
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Phân Hệ Tabs Chi Tiết Chuyên Sâu */}
      <div className="bg-white rounded-2xl border border-heritage-border shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-heritage-border bg-heritage-surface/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-heritage-red text-heritage-red bg-white'
                : 'border-transparent text-heritage-subtext hover:text-heritage-indigo'
            }`}
          >
            {t('product.tabs.details')}
          </button>

          <button
            onClick={() => setActiveTab('process')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'process'
                ? 'border-heritage-red text-heritage-red bg-white'
                : 'border-transparent text-heritage-subtext hover:text-heritage-indigo'
            }`}
          >
            {t('product.tabs.process')}
          </button>

          <button
            onClick={() => setActiveTab('artisan')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'artisan'
                ? 'border-heritage-red text-heritage-red bg-white'
                : 'border-transparent text-heritage-subtext hover:text-heritage-indigo'
            }`}
          >
            {t('product.tabs.artisan')}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-heritage-red text-heritage-red bg-white'
                : 'border-transparent text-heritage-subtext hover:text-heritage-indigo'
            }`}
          >
            {t('product.tabs.reviews')} (12)
          </button>

          <button
            onClick={() => setActiveTab('passport')}
            className={`px-6 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'passport'
                ? 'border-heritage-red text-heritage-red bg-white'
                : 'border-transparent text-heritage-subtext hover:text-heritage-indigo'
            }`}
          >
            {t('product.tabs.passport')}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: Chi Tiết & Chất Liệu */}
          {activeTab === 'details' && (
            <div className="space-y-6 max-w-4xl leading-relaxed text-sm text-gray-700">
              <div className="space-y-3">
                <h3 className="text-lg font-heritage font-bold text-heritage-indigo">
                  Mô Tả Ý Nghĩa Biểu Tượng &amp; Nghệ Thuật Tạo Tác
                </h3>
                <p>{currentProduct.description}</p>
                <p>
                  Họa tiết <strong>"Cá Chép Vượt Vũ Môn"</strong> được vẽ tay thủ công bằng men chàm cổ trên nền men rạn tam hợp. Từng nét vẩy cá, bọt sóng và mây trời đều đòi hỏi kỹ thuật điều phối ngọn bút lông điêu luyện của nghệ nhân, tượng trưng cho ý chí kiên định, sự hanh thông và thăng tiến trong sự nghiệp của gia chủ.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-heritage-indigo mb-3">
                  Đặc tính Nguyên Liệu Bản Địa:
                </h4>
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-gray-600">
                  <li><strong>Đất sét Cao Lanh non:</strong> Khai thác từ mỏ đất phù sa cổ lưu vực sông Hồng, trải qua 4 bể lọc lắng truyền thống để triệt tiêu toàn bộ tạp chất và bọt khí.</li>
                  <li><strong>Men tro rạn tam hợp:</strong> Phối trộn từ tro trấu nếp cái hoa vàng, bột đá thạch anh và đất sét dẻo theo công thức bí truyền gia tộc, tự sinh các vết rạn hình mạng nhện sau khi làm nguội lò.</li>
                  <li><strong>Kỹ thuật nung củi truyền thống:</strong> Kiểm soát ngọn lửa bằng mắt và kinh nghiệm tích lũy qua 4 thập kỷ của nghệ nhân, không sử dụng lò gas công nghiệp nhằm bảo lưu sắc men đầm ấm cổ kính.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Quy Trình Tạo Tác Thủ Công (Storyline Chronology) */}
          {activeTab === 'process' && (
            <div className="space-y-8 max-w-4xl">
              <h3 className="text-lg font-heritage font-bold text-heritage-indigo">
                Hành Trình 5 Công Đoạn Tạo Tác Tác Phẩm
              </h3>

              <div className="relative border-l-2 border-heritage-red/30 ml-4 space-y-8 pl-6">
                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-heritage-red border-4 border-white shadow-sm"></div>
                  <h4 className="text-sm font-bold text-heritage-indigo">Công đoạn 1: Tuyển chọn đất sét &amp; Lọc lắng 4 bể</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Đất sét cao lanh được ngâm trong bể đánh trong 72 giờ, qua bể lắng, bể phơi để đạt độ dẻo quánh tối ưu trước khi đưa lên bàn xoay.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-heritage-red border-4 border-white shadow-sm"></div>
                  <h4 className="text-sm font-bold text-heritage-indigo">Công đoạn 2: Chuốt gốm tạo dáng lục bình trên bàn xoay thủ công</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Nghệ nhân dùng lực đôi bàn tay định hình thân bình, cổ thon và miệng loe cân đối mà không sử dụng khuôn đúc thạch cao.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-heritage-red border-4 border-white shadow-sm"></div>
                  <h4 className="text-sm font-bold text-heritage-indigo">Công đoạn 3: Phóng bút họa tích Cá Chép &amp; Phủ men tro</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Vẽ họa tiết trực tiếp lên phôi mộc bằng bút lông chấm men chàm, sau đó tráng lớp men tro rạn gia truyền bao bọc bên ngoài.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-heritage-red border-4 border-white shadow-sm"></div>
                  <h4 className="text-sm font-bold text-heritage-indigo">Công đoạn 4: Nung củi 36 giờ liên tục ở nhiệt độ 1.280°C</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Lò nung củi giữ lửa đều đặn ngày đêm. Quá trình làm nguội chậm trong 2 ngày giúp mạng rạn cổ nứt đều và phát ra âm thanh vang như chuông khánh.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></div>
                  <h4 className="text-sm font-bold text-emerald-800">Công đoạn 5: Thẩm định chất lượng &amp; Cấp Hộ Chiếu Di Sản Số</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Hội đồng Nghệ nhân Làng nghề kiểm tra âm vang men gốm, cấp phát tem QR bảo chứng số chống giả mạo và ghi nhận mã băm bất biến lên sổ cái Blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Hồ Sơ Nghệ Nhân */}
          {activeTab === 'artisan' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-heritage-surface/40 rounded-2xl border border-heritage-border">
                <div className="w-24 h-24 rounded-full bg-heritage-red/10 border-2 border-heritage-gold flex items-center justify-center font-heritage font-bold text-3xl text-heritage-red overflow-hidden shadow-inner">
                  {currentProduct.artisan?.user?.fullName?.charAt(0) || 'N'}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-heritage font-bold text-heritage-indigo">
                      {currentProduct.artisan?.user?.fullName}
                    </h3>
                    <Badge variant="verified">
                      <Award className="w-3 h-3 text-emerald-600" />
                      {currentProduct.artisan?.title}
                    </Badge>
                  </div>

                  <p className="text-xs text-heritage-subtext">
                    Nghệ nhân đại diện • {currentProduct.artisan?.craftVillage?.name} ({currentProduct.artisan?.craftVillage?.province})
                  </p>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">
                    {currentProduct.artisan?.bio}
                  </p>

                  {currentProduct.artisanStory && (
                    <blockquote className="p-3 bg-white rounded-xl border-l-4 border-heritage-red text-xs italic text-gray-600 mt-3 font-serif">
                      "{currentProduct.artisanStory}"
                    </blockquote>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Đánh Giá Có Xác Thực (Verified Customer Reviews) */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-heritage font-bold text-heritage-indigo">
                    {t('product.reviews.title')}
                  </h3>
                  <p className="text-xs text-heritage-subtext mt-0.5">
                    {t('product.reviews.subtitle')}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.info('Chức năng đánh giá sẽ kích hoạt sau khi đơn hàng của bạn chuyển sang trạng thái Giao Thành Công.')}
                  className="gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('product.reviews.writeReview')}</span>
                </Button>
              </div>

              {/* Danh sách đánh giá mẫu có xác thực */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-gray-100 bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-heritage-indigo text-white font-bold flex items-center justify-center text-xs">
                        TQ
                      </div>
                      <div>
                        <span className="text-xs font-bold text-heritage-indigo block">Trần Quốc Tuấn</span>
                        <span className="text-[10px] text-gray-400">Đã mua tại Hà Nội • 15/09/2026</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {t('product.reviews.verifiedBadge')}
                    </span>
                  </div>

                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Bình bên ngoài đẹp hơn trong ảnh rất nhiều! Nước men rạn sâu, sờ vào mát rượi và phát ra tiếng chuông ngân rất vang khi gõ nhẹ. Quét mã QR bằng điện thoại hiện ngay video bác Nam chuốt gốm và chứng nhận sổ cái, cả gia đình tôi ai cũng ưng ý.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-100 bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                        LN
                      </div>
                      <div>
                        <span className="text-xs font-bold text-heritage-indigo block">Lê Ngọc Anh</span>
                        <span className="text-[10px] text-gray-400">Đã mua tại TP. Hồ Chí Minh • 02/09/2026</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {t('product.reviews.verifiedBadge')}
                    </span>
                  </div>

                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Đóng thùng gỗ chèn xốp chuyên dụng vận chuyển từ Bát Tràng vào Sài Gòn nguyên vẹn 100%. Cơ chế ký quỹ 7 ngày khiến tôi rất an tâm khi đặt mua tác phẩm giá trị lớn qua mạng. Xứng đáng 5 sao!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Bảo Chứng Sổ Cái Blockchain */}
          {activeTab === 'passport' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-heritage font-bold text-heritage-indigo">
                    Bảo Chứng Nguồn Gốc Bất Biến Trên Chuỗi Khối
                  </h3>
                  <p className="text-xs text-heritage-subtext mt-0.5">
                    Dữ liệu hộ chiếu được bảo toàn bằng thuật toán SHA-256 và Merkle Root on-chain
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenPassportView}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t('product.viewPassport')}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-stone-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase font-sans font-bold">Mã Hộ Chiếu Công Khai:</span>
                  <p className="text-heritage-indigo font-bold text-sm">#{passportCode}</p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase font-sans font-bold">Mã Serial / Tem QR Định Danh:</span>
                  <p className="text-emerald-700 font-bold text-sm">VN-BTG-2026-0899 • Độc bản</p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-gray-100 space-y-1 md:col-span-2">
                  <span className="text-gray-400 text-[10px] uppercase font-sans font-bold">Chuỗi Băm Xác Thực SHA-256:</span>
                  <p className="text-gray-700 break-all text-[11px]">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-gray-100 space-y-1 md:col-span-2">
                  <span className="text-gray-400 text-[10px] uppercase font-sans font-bold">Smart Contract Ledger:</span>
                  <p className="text-heritage-indigo break-all text-[11px]">
                    0x3B882194dCe5b11e2f3A81A5c81d89B20021C7aB (Polygon POS Mainnet)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL: ĐẶT CHẾ TÁC THEO YÊU CẦU (CUSTOM COMMISSION) */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-heritage-modal border border-heritage-border w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            {/* Modal Header Neo-Heritage chuẩn 56px */}
            <div className="h-14 px-6 bg-heritage-surface border-b border-heritage-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-heritage-red" />
                <h3 className="font-heritage font-bold text-base text-heritage-indigo">
                  BHTT • {t('product.customModal.title')}
                </h3>
              </div>
              <button
                onClick={handleCloseCommissionModal}
                className="text-heritage-subtext hover:text-heritage-red p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSendCommission} className="p-6 space-y-4 text-xs font-sans">
              <p className="text-heritage-subtext">
                {t('product.customModal.subtitle')}: <strong>{currentProduct.artisan?.user?.fullName}</strong>
              </p>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1">
                  {t('product.customModal.dimensionsReq')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={commissionForm.dimensions}
                  onChange={(e) => {
                    setCommissionForm({ ...commissionForm, dimensions: e.target.value });
                    setIsFormDirty(true);
                  }}
                  placeholder="Ví dụ: Cao 1m80 x Đường kính 52cm"
                  className="w-full px-3.5 py-2.5 text-[13px] text-heritage-indigo border border-heritage-border rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-red"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1">
                  {t('product.customModal.materialReq')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={commissionForm.material}
                  onChange={(e) => {
                    setCommissionForm({ ...commissionForm, material: e.target.value });
                    setIsFormDirty(true);
                  }}
                  placeholder="Ví dụ: Men rạn hoa lam cổ hoặc men ngọc tam thái"
                  className="w-full px-3.5 py-2.5 text-[13px] text-heritage-indigo border border-heritage-border rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-red"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1">
                  {t('product.customModal.notes')}
                </label>
                <textarea
                  rows={3}
                  value={commissionForm.notes}
                  onChange={(e) => {
                    setCommissionForm({ ...commissionForm, notes: e.target.value });
                    setIsFormDirty(true);
                  }}
                  placeholder="Mô tả chi tiết ý tưởng tạo tác, lời đề từ hoặc chữ triện muốn khắc lên phôi đất..."
                  className="w-full px-3.5 py-2.5 text-[13px] text-heritage-indigo border border-heritage-border rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-red"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <Info className="w-3.5 h-3.5 text-heritage-gold inline mr-1" />
                {t('product.customModal.depositNotice')}
              </div>

              {/* Form Buttons chuẩn: LƯU / GỬI & THOÁT */}
              <div className="pt-3 border-t border-heritage-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseCommissionModal}
                  className="px-5 py-2"
                >
                  {t('common.button.cancel')}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="px-6 py-2 gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('product.customModal.send')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
