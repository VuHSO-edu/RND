import React, { useState, useEffect } from 'react';
import { 
  Compass, Heart, BookOpen, Clock, Users, Calendar, MapPin, 
  Sparkles, CheckCircle2, QrCode, ArrowRight, RefreshCw, AlertCircle, DollarSign
} from 'lucide-react';
import { 
  heritageTourApi, 
  heritageCrowdfundingApi, 
  heritageArticleApi,
  TourDetail, 
  CrowdfundingSummary, 
  ArticleSummary, 
  ArticleDetail,
  BookTourPayload,
  BookingResponse,
  DonatePayload,
  DonateResponse
} from '../../../services/heritageCommunityApi';
import { HeritageModal } from '../../../components/ui/HeritageModal';
import { useAuthStore } from '../../../stores/useAuthStore';

type CommunityTab = 'TOURS' | 'CROWDFUNDING' | 'STORIES';

export const HeritageCommunityPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<CommunityTab>('TOURS');

  // Tours state
  const [tours, setTours] = useState<TourDetail[]>([]);
  const [isToursLoading, setIsToursLoading] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourDetail | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookPayload, setBookPayload] = useState<BookTourPayload>({
    tourId: '',
    customerName: user?.fullName || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    sessionTime: 'MORNING',
    numberOfParticipants: 1
  });
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Crowdfunding state
  const [campaigns, setCampaigns] = useState<CrowdfundingSummary[]>([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CrowdfundingSummary | null>(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donatePayload, setDonatePayload] = useState<DonatePayload>({
    donorName: user?.fullName || 'Nhà hảo tâm',
    donorEmail: user?.email || '',
    amount: 200000,
    isAnonymous: false,
    message: 'Chúc dự án bảo tồn di sản làng nghề thành công tốt đẹp!'
  });
  const [donateResult, setDonateResult] = useState<DonateResponse | null>(null);
  const [isSubmittingDonate, setIsSubmittingDonate] = useState(false);

  // Articles state
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Fetch Tours
  const fetchTours = async () => {
    setIsToursLoading(true);
    try {
      const data = await heritageTourApi.getTours();
      setTours(data);
    } catch (err) {
      console.error('Lỗi tải danh sách tour:', err);
    } finally {
      setIsToursLoading(false);
    }
  };

  // Fetch Crowdfunding
  const fetchCampaigns = async () => {
    setIsCampaignsLoading(true);
    try {
      const data = await heritageCrowdfundingApi.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Lỗi tải danh sách gây quỹ:', err);
    } finally {
      setIsCampaignsLoading(false);
    }
  };

  // Fetch Articles
  const fetchArticles = async () => {
    setIsArticlesLoading(true);
    try {
      const data = await heritageArticleApi.getArticles();
      setArticles(data.content || []);
    } catch (err) {
      console.error('Lỗi tải tạp chí:', err);
    } finally {
      setIsArticlesLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
    fetchCampaigns();
    fetchArticles();
  }, []);

  // Handle Book Tour
  const handleOpenBookTour = (tour: TourDetail) => {
    setSelectedTour(tour);
    setBookPayload({
      ...bookPayload,
      tourId: tour.id,
      customerName: user?.fullName || bookPayload.customerName,
      customerPhone: user?.phone || bookPayload.customerPhone
    });
    setBookingResult(null);
    setIsBookModalOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!bookPayload.customerName.trim() || !bookPayload.customerPhone.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const res = await heritageTourApi.bookTour(bookPayload);
      setBookingResult(res);
    } catch (err: any) {
      alert(err.message || 'Lỗi đặt tour trải nghiệm.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Donate
  const handleOpenDonate = (campaign: CrowdfundingSummary) => {
    setSelectedCampaign(campaign);
    setDonatePayload({
      ...donatePayload,
      donorName: user?.fullName || 'Nhà hảo tâm'
    });
    setDonateResult(null);
    setIsDonateModalOpen(true);
  };

  const handleSubmitDonate = async () => {
    if (!selectedCampaign) return;
    if (donatePayload.amount < 10000) {
      alert('Số tiền ủng hộ tối thiểu là 10.000 VNĐ.');
      return;
    }

    setIsSubmittingDonate(true);
    try {
      const res = await heritageCrowdfundingApi.donate(selectedCampaign.id, donatePayload);
      setDonateResult(res);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || 'Lỗi quyên góp gây quỹ.');
    } finally {
      setIsSubmittingDonate(false);
    }
  };

  // Handle View Article
  const handleViewArticle = async (slug: string) => {
    try {
      const detail = await heritageArticleApi.getArticleBySlug(slug);
      setSelectedArticle(detail);
      setIsArticleModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải bài viết.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner Cộng Đồng */}
      <div 
        style={{ background: 'linear-gradient(135deg, #1C2D37 0%, #2A4354 50%, #16242C 100%)', color: '#FFFFFF' }}
        className="p-6 sm:p-8 rounded-3xl shadow-heritage-card flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-700"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: 'rgba(197, 154, 63, 0.25)', color: '#D4AF37', borderColor: 'rgba(197, 154, 63, 0.4)' }}
              className="px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase"
            >
              Không Gian Văn Hóa & Cộng Đồng Di Sản
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-wide">
            Kết Nối Nghệ Nhân & Du Khách
          </h1>
          <p className="text-sm text-stone-200 max-w-xl font-sans">
            Đặt vé trải nghiệm làm gốm, dệt lụa trực tiếp tại làng nghề; đóng góp gây quỹ bảo tồn di sản cổ truyền và thưởng thức các câu chuyện làng nghề.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 p-1.5 bg-stone-200/70 rounded-2xl border border-stone-300">
        <button
          onClick={() => setActiveTab('TOURS')}
          className={`flex-1 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'TOURS'
              ? 'bg-white text-[#8B1E1E] shadow-md border-b-2 border-[#8B1E1E]'
              : 'text-stone-700 hover:bg-stone-300/60'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Tour & Workshop ({tours.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CROWDFUNDING')}
          className={`flex-1 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'CROWDFUNDING'
              ? 'bg-white text-[#8B1E1E] shadow-md border-b-2 border-[#8B1E1E]'
              : 'text-stone-700 hover:bg-stone-300/60'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Gây Quỹ Bảo Tồn ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STORIES')}
          className={`flex-1 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'STORIES'
              ? 'bg-white text-[#8B1E1E] shadow-md border-b-2 border-[#8B1E1E]'
              : 'text-stone-700 hover:bg-stone-300/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tạp Chí Di Sản ({articles.length})</span>
        </button>
      </div>

      {/* TAB 1: TOURS & WORKSHOP */}
      {activeTab === 'TOURS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm uppercase text-stone-700 tracking-wider">
              Khám Phá Các Tour Trải Nghiệm Độc Bản
            </span>
            <button
              onClick={fetchTours}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${isToursLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={tour.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{tour.durationHours} Giờ</span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {tour.villageName || 'Làng Nghề Truyền Thống'}
                    </p>
                    <h3 className="font-bold text-base text-[#1C2D37] leading-snug">
                      {tour.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {tour.description || 'Trải nghiệm vuốt gốm, nung men cùng nghệ nhân ưu tú.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Giới hạn {tour.maxSlotsPerSession} khách/buổi
                      </span>
                      <span className="font-bold text-base text-[#8B1E1E]">
                        {Number(tour.pricePerPerson).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenBookTour(tour)}
                      className="w-full min-h-[44px] rounded-xl bg-[#8B1E1E] hover:bg-[#731818] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <QrCode className="w-4 h-4 text-amber-300" />
                      <span>Đặt Chỗ & Nhận Vé QR</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GÂY QUỸ BẢO TỒN (CROWDFUNDING) */}
      {activeTab === 'CROWDFUNDING' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm uppercase text-stone-700 tracking-wider">
              Chung Tay Gây Quỹ Bảo Tồn Di Sản & Hỗ Trợ Nghệ Nhân
            </span>
            <button
              onClick={fetchCampaigns}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${isCampaignsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              // Phòng chống chia cho 0 triệt để theo RULE
              const target = camp.targetAmount || 1;
              const current = camp.currentAmount || 0;
              const percent = Math.min(100, Math.round((current / target) * 100));

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={camp.coverImageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'}
                      alt={camp.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-[#8B1E1E] text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                      Còn {camp.daysRemaining} ngày
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400">
                        {camp.villageName || 'Làng Nghề Truyền Thống'}
                      </p>
                      <h3 className="font-bold text-base text-[#1C2D37] leading-snug">
                        {camp.title}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-700">{percent}% Đạt mục tiêu</span>
                        <span className="text-stone-400">{camp.donorsCount} lượt ủng hộ</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                        <div>
                          <span className="text-stone-400 block text-[11px]">Đã gây quỹ</span>
                          <span className="font-bold text-sm text-[#8B1E1E]">
                            {Number(camp.currentAmount).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-stone-400 block text-[11px]">Mục tiêu</span>
                          <span className="font-semibold text-xs text-stone-700">
                            {Number(camp.targetAmount).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenDonate(camp)}
                        className="w-full min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                      >
                        <Heart className="w-4 h-4 text-rose-300" />
                        <span>Ủng Hộ Chiến Dịch Này</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TẠP CHÍ VĂN HÓA (STORIES) */}
      {activeTab === 'STORIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm uppercase text-stone-700 tracking-wider">
              Tạp Chí & Ký Sự Nghệ Nhân Di Sản
            </span>
            <button
              onClick={fetchArticles}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${isArticlesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => handleViewArticle(art.slug)}
                className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={art.coverImageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-amber-700 uppercase">
                      {art.craftVillageName || 'Ký Sự Di Sản'}
                    </span>
                    <h3 className="font-bold text-base text-[#1C2D37] line-clamp-2 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>{art.artisanName && `Nghệ nhân: ${art.artisanName}`}</span>
                    <span className="flex items-center gap-1 text-[#8B1E1E] font-bold">
                      Đọc tiếp <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Đặt Vé Tour */}
      <HeritageModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="BHTT"
        subtitle={selectedTour ? `Đặt Chỗ Tour: ${selectedTour.title}` : 'Đặt Chỗ Tour'}
        maxWidth="md"
        showFooter={!bookingResult}
        onSave={handleSubmitBooking}
        saveLabel="LƯU DỮ LIỆU"
        cancelLabel="THOÁT"
        saveLoading={isSubmittingBooking}
      >
        {bookingResult ? (
          <div className="p-4 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              {bookingResult.message || 'Giữ Chỗ Thành Công Trong 15 Phút!'}
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Mã đặt chỗ: <span className="font-mono font-bold text-stone-800">{bookingResult.bookingId}</span>
            </p>

            {bookingResult.vietQrUrl && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block">
                <img
                  src={bookingResult.vietQrUrl}
                  alt="VietQR Chuyển Khoản"
                  className="w-48 h-48 mx-auto object-contain rounded-lg"
                />
                <p className="text-[11px] text-stone-500 mt-2">
                  Quét mã VietQR trên App Ngân Hàng để thanh toán ngay
                </p>
              </div>
            )}

            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
              Vé điện tử QR code đã được gửi về email của bạn. Hủy vé trước 24 giờ để được hoàn tiền 100%.
            </div>

            <button
              onClick={() => setIsBookModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs"
            >
              THOÁT
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Chỗ sẽ được khóa tạm thời trong 15 phút sau khi gửi đơn để bạn hoàn tất thanh toán VietQR.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-black mb-1">
                  Họ và tên du khách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookPayload.customerName}
                  onChange={(e) => setBookPayload({ ...bookPayload, customerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">
                  Số điện thoại nhận vé <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookPayload.customerPhone}
                  onChange={(e) => setBookPayload({ ...bookPayload, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-black mb-1">Email nhận vé điện tử</label>
              <input
                type="email"
                value={bookPayload.customerEmail}
                onChange={(e) => setBookPayload({ ...bookPayload, customerEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-black mb-1">Ngày trải nghiệm</label>
                <input
                  type="date"
                  value={bookPayload.bookingDate}
                  onChange={(e) => setBookPayload({ ...bookPayload, bookingDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Buổi</label>
                <select
                  value={bookPayload.sessionTime}
                  onChange={(e: any) => setBookPayload({ ...bookPayload, sessionTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="MORNING">Sáng (08:30 - 11:30)</option>
                  <option value="AFTERNOON">Chiều (14:00 - 17:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Số lượng khách</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bookPayload.numberOfParticipants}
                  onChange={(e) => setBookPayload({ ...bookPayload, numberOfParticipants: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {selectedTour && (
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <span className="font-bold text-stone-600">Tổng tiền:</span>
                <span className="font-bold text-sm text-[#8B1E1E]">
                  {(Number(selectedTour.pricePerPerson) * bookPayload.numberOfParticipants).toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}
          </div>
        )}
      </HeritageModal>

      {/* Modal Ủng Hộ Gây Quỹ */}
      <HeritageModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        title="BHTT"
        subtitle={selectedCampaign ? `Ủng Hộ: ${selectedCampaign.title}` : 'Ủng Hộ Chiến Dịch'}
        maxWidth="md"
        showFooter={!donateResult}
        onSave={handleSubmitDonate}
        saveLabel="LƯU DỮ LIỆU"
        cancelLabel="THOÁT"
        saveLoading={isSubmittingDonate}
      >
        {donateResult ? (
          <div className="p-4 text-center space-y-4">
            <Heart className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-stone-800">
              {donateResult.thankYouMessage || 'Cảm Ơn Nghĩa Cử Cao Đẹp Của Bạn!'}
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Mã giao dịch: <span className="font-mono font-bold text-stone-800">{donateResult.donationId}</span>
            </p>

            {donateResult.vietQrPayload && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block">
                <img
                  src={`https://api.vietqr.io/image/970436-0011002345678-compact2.png?amount=${donateResult.amount}&addInfo=GAYQUY%20${donateResult.donationId}`}
                  alt="VietQR Quyên Góp"
                  className="w-48 h-48 mx-auto object-contain rounded-lg"
                />
                <p className="text-[11px] text-stone-500 mt-2">
                  Quét mã VietQR trên App Ngân Hàng để chuyển tiền ủng hộ
                </p>
              </div>
            )}

            <button
              onClick={() => setIsDonateModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs"
            >
              THOÁT
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-black mb-1">
                Tên nhà hảo tâm
              </label>
              <input
                type="text"
                value={donatePayload.donorName}
                onChange={(e) => setDonatePayload({ ...donatePayload, donorName: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-black mb-1">
                Số tiền ủng hộ (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[50000, 100000, 200000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonatePayload({ ...donatePayload, amount: amt })}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      donatePayload.amount === amt 
                        ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]' 
                        : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {(amt / 1000)}k
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={donatePayload.amount}
                onChange={(e) => setDonatePayload({ ...donatePayload, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-black mb-1">
                Lời nhắn gửi làng nghề
              </label>
              <textarea
                value={donatePayload.message}
                onChange={(e) => setDonatePayload({ ...donatePayload, message: e.target.value })}
                className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-16"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={donatePayload.isAnonymous}
                onChange={(e) => setDonatePayload({ ...donatePayload, isAnonymous: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="isAnonymous" className="text-stone-600 cursor-pointer">
                Ủng hộ ẩn danh (không hiển thị tên trên bảng vinh danh)
              </label>
            </div>
          </div>
        )}
      </HeritageModal>

      {/* Modal Chi Tiết Tạp Chí */}
      <HeritageModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        title="BHTT"
        subtitle={selectedArticle?.title || 'Tạp Chí Di Sản'}
        maxWidth="2xl"
      >
        {selectedArticle && (
          <div className="space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto pr-2">
            {selectedArticle.coverImageUrl && (
              <img
                src={selectedArticle.coverImageUrl}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-xl"
              />
            )}
            <div className="space-y-2">
              <h2 className="text-lg font-heading font-bold text-[#1C2D37]">
                {selectedArticle.title}
              </h2>
              <div className="text-[11px] text-stone-400">
                {selectedArticle.publishedAt && new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')}
                {selectedArticle.craftVillage && ` • Làng nghề: ${selectedArticle.craftVillage.name}`}
                {selectedArticle.artisan && ` • Nghệ nhân: ${selectedArticle.artisan.name}`}
              </div>
            </div>

            <div className="text-stone-700 leading-relaxed text-sm whitespace-pre-line border-t border-stone-100 pt-3">
              {selectedArticle.content}
            </div>

            {selectedArticle.videoInterviewUrl && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-700">Video phỏng vấn nghệ nhân:</span>
                <p className="text-blue-600 underline">
                  <a href={selectedArticle.videoInterviewUrl} target="_blank" rel="noopener noreferrer">
                    {selectedArticle.videoInterviewUrl}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </HeritageModal>
    </div>
  );
};
