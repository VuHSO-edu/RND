import { apiClient } from './apiClient';

// ============================================================================
// 1. BẢN ĐỒ SỐ LÀNG NGHỀ (HERITAGE GIS MAP)
// ============================================================================

export interface GeoJsonGeometry {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: {
    id: number;
    title: string;
    category: 'VILLAGE_OFFICIAL' | 'WORKSHOP' | 'HISTORICAL_SITE' | 'CHECKIN_POINT';
    craftVillageId?: number;
    craftVillageName?: string;
    description?: string;
    images?: string[];
    approvalStatus: string;
    reviewScope?: string;
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface ProposeLocationPayload {
  title: string;
  category: string;
  description?: string;
  longitude: number;
  latitude: number;
  images?: string[];
}

export interface ReviewLocationPayload {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export interface MapProposalItem {
  id: number;
  title: string;
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  approvalStatus: string;
  rejectionReason?: string;
  createdAt: string;
}

export const heritageMapApi = {
  /**
   * Lấy danh sách điểm di sản dạng GeoJSON FeatureCollection theo bbox / category / craftType
   */
  getLocations: async (params?: {
    bbox?: string;
    category?: string;
    craftType?: string;
  }): Promise<GeoJsonFeatureCollection> => {
    const res: any = await apiClient.get('/map/locations', { params });
    return res;
  },

  /**
   * Đề xuất điểm di sản / check-in mới (Customer, Artisan, Village Admin)
   */
  proposeLocation: async (payload: ProposeLocationPayload): Promise<any> => {
    const res: any = await apiClient.post('/map/locations/propose', payload);
    return res.data || res;
  },

  /**
   * Lấy lịch sử các đề xuất điểm di sản của người dùng hiện tại
   */
  getMyProposals: async (): Promise<MapProposalItem[]> => {
    const res: any = await apiClient.get('/map/locations/my-proposals');
    return res.data || [];
  },

  /**
   * Quản lý làng duyệt hoặc từ chối điểm di sản
   */
  reviewLocation: async (locationId: number, payload: ReviewLocationPayload): Promise<any> => {
    const res: any = await apiClient.put(`/villages/map/${locationId}/review`, payload);
    return res.data || res;
  },

  /**
   * Xóa mềm điểm di sản
   */
  deleteLocation: async (locationId: number): Promise<any> => {
    const res: any = await apiClient.delete(`/villages/map/${locationId}`);
    return res.data || res;
  }
};

// ============================================================================
// 2. BLOG / TẠP CHÍ VĂN HÓA DI SẢN (HERITAGE STORIES)
// ============================================================================

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  viewsCount: number;
  publishedAt: string;
  craftVillageName?: string;
  artisanName?: string;
}

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  audioInterviewUrl?: string;
  videoInterviewUrl?: string;
  viewsCount: number;
  status: string;
  publishedAt: string;
  craftVillage?: {
    id: number;
    name: string;
    province: string;
  };
  artisan?: {
    id: number;
    name: string;
    title: string;
  };
}

export interface CreateArticlePayload {
  craftVillageId?: number;
  artisanId?: number;
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  audioInterviewUrl?: string;
  videoInterviewUrl?: string;
}

export interface PagedArticles {
  content: ArticleSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const heritageArticleApi = {
  /**
   * Lấy danh sách bài viết tạp chí phân trang
   */
  getArticles: async (params?: {
    page?: number;
    size?: number;
    villageId?: number;
    artisanId?: number;
  }): Promise<PagedArticles> => {
    const res: any = await apiClient.get('/articles', { params });
    return res.data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true };
  },

  /**
   * Lấy chi tiết bài viết theo slug
   */
  getArticleBySlug: async (slug: string): Promise<ArticleDetail> => {
    const res: any = await apiClient.get(`/articles/${slug}`);
    return res.data;
  },

  /**
   * Tạo bài viết mới
   */
  createArticle: async (payload: CreateArticlePayload): Promise<any> => {
    const res: any = await apiClient.post('/villages/articles', payload);
    return res.data || res;
  },

  /**
   * Cập nhật bài viết
   */
  updateArticle: async (articleId: string, payload: CreateArticlePayload): Promise<any> => {
    const res: any = await apiClient.put(`/villages/articles/${articleId}`, payload);
    return res.data || res;
  },

  /**
   * Xóa mềm bài viết
   */
  deleteArticle: async (articleId: string): Promise<any> => {
    const res: any = await apiClient.delete(`/villages/articles/${articleId}`);
    return res.data || res;
  }
};

// ============================================================================
// 3. TOUR TRẢI NGHIỆM & ĐẶT VÉ QR (WORKSHOP & TOUR BOOKING)
// ============================================================================

export interface TourDetail {
  id: string;
  title: string;
  description?: string;
  pricePerPerson: number;
  durationHours: number;
  maxSlotsPerSession: number;
  includedMaterials?: string;
  images?: string[];
  status: string;
  villageName?: string;
  artisanName?: string;
}

export interface BookTourPayload {
  tourId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string; // YYYY-MM-DD
  sessionTime: 'MORNING' | 'AFTERNOON';
  numberOfParticipants: number;
}

export interface BookingResponse {
  bookingId: string;
  paymentStatus: string;
  totalAmount: number;
  expiresAt: string;
  vietQrUrl: string;
  ticketQrUrl?: string;
  message: string;
}

export interface CancelBookingResponse {
  bookingId: string;
  paymentStatus: string;
  refundStatus: string;
  message: string;
}

export interface VerifyTicketPayload {
  ticketCode: string;
}

export interface VerifyTicketResponse {
  valid: boolean;
  message: string;
  customerName?: string;
  tourTitle?: string;
  participants?: number;
  sessionTime?: string;
  bookingDate?: string;
}

export interface CreateTourPayload {
  craftVillageId?: number;
  artisanId?: number;
  title: string;
  description?: string;
  pricePerPerson: number;
  durationHours: number;
  maxSlotsPerSession: number;
  includedMaterials?: string;
  images?: string[];
  status?: string;
}

export const heritageTourApi = {
  /**
   * Lấy danh sách tour mở đón khách
   */
  getTours: async (params?: {
    villageId?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<TourDetail[]> => {
    const res: any = await apiClient.get('/tours', { params });
    return res.data || [];
  },

  /**
   * Lấy chi tiết tour trải nghiệm
   */
  getTourById: async (id: string): Promise<TourDetail> => {
    const res: any = await apiClient.get(`/tours/${id}`);
    return res.data;
  },

  /**
   * Đặt tour & giữ chỗ 15 phút
   */
  bookTour: async (payload: BookTourPayload): Promise<BookingResponse> => {
    const res: any = await apiClient.post('/tours/book', payload);
    return res.data || res;
  },

  /**
   * Hủy vé và hoàn tiền trước >= 24h
   */
  cancelBooking: async (bookingId: string, reason?: string): Promise<CancelBookingResponse> => {
    const res: any = await apiClient.put(`/tours/bookings/${bookingId}/cancel`, { reason });
    return res.data || res;
  },

  /**
   * Quét soát vé tại xưởng bằng mã QR
   */
  verifyTicket: async (payload: VerifyTicketPayload): Promise<VerifyTicketResponse> => {
    const res: any = await apiClient.post('/tours/verify-ticket', payload);
    return res.data || res;
  },

  /**
   * Tạo tour mới
   */
  createTour: async (payload: CreateTourPayload): Promise<any> => {
    const res: any = await apiClient.post('/villages/tours', payload);
    return res.data || res;
  },

  /**
   * Cập nhật tour
   */
  updateTour: async (tourId: string, payload: CreateTourPayload): Promise<any> => {
    const res: any = await apiClient.put(`/villages/tours/${tourId}`, payload);
    return res.data || res;
  },

  /**
   * Xóa mềm tour
   */
  deleteTour: async (tourId: string): Promise<any> => {
    const res: any = await apiClient.delete(`/villages/tours/${tourId}`);
    return res.data || res;
  }
};

// ============================================================================
// 4. GÂY QUỸ CỘNG ĐỒNG BẢO TỒN (HERITAGE CROWDFUNDING)
// ============================================================================

export interface RewardTier {
  tierId: string;
  minAmount: number;
  rewardTitle: string;
  description: string;
}

export interface CrowdfundingSummary {
  id: string;
  title: string;
  coverImageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  donorsCount: number;
  daysRemaining: number;
  status: string;
  fundingType: string;
  villageName?: string;
}

export interface CrowdfundingDetail {
  id: string;
  title: string;
  storyContent: string;
  coverImageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  donorsCount: number;
  daysRemaining: number;
  startDate: string;
  deadline: string;
  fundingType: string;
  status: string;
  village?: {
    id: number;
    name: string;
    province: string;
  };
  artisan?: {
    id: number;
    name: string;
    title: string;
  };
  rewardTiers?: RewardTier[];
  recentDonations?: {
    donorName: string;
    amount: number;
    message?: string;
    donatedAt: string;
  }[];
}

export interface DonatePayload {
  donorName: string;
  donorEmail?: string;
  amount: number;
  isAnonymous?: boolean;
  message?: string;
  tierId?: string;
}

export interface DonateResponse {
  donationId: string;
  paymentStatus: string;
  amount: number;
  thankYouMessage: string;
  vietQrPayload: string;
}

export interface CreateCampaignPayload {
  craftVillageId?: number;
  targetArtisanId?: number;
  title: string;
  storyContent: string;
  coverImageUrl?: string;
  targetAmount: number;
  startDate: string;
  deadline: string;
  fundingType?: string;
  rewardTiers?: RewardTier[];
}

export const heritageCrowdfundingApi = {
  /**
   * Tra cứu danh sách chiến dịch đang mở
   */
  getCampaigns: async (): Promise<CrowdfundingSummary[]> => {
    const res: any = await apiClient.get('/crowdfunding');
    return res.data || [];
  },

  /**
   * Chi tiết chiến dịch & tiến độ & danh sách ủng hộ
   */
  getCampaignById: async (id: string): Promise<CrowdfundingDetail> => {
    const res: any = await apiClient.get(`/crowdfunding/${id}`);
    return res.data;
  },

  /**
   * Quyên góp ủng hộ dự án bảo tồn di sản
   */
  donate: async (campaignId: string, payload: DonatePayload): Promise<DonateResponse> => {
    const res: any = await apiClient.post(`/crowdfunding/${campaignId}/donate`, payload);
    return res.data || res;
  },

  /**
   * Tạo chiến dịch gây quỹ mới
   */
  createCampaign: async (payload: CreateCampaignPayload): Promise<any> => {
    const res: any = await apiClient.post('/villages/crowdfunding', payload);
    return res.data || res;
  },

  /**
   * Cập nhật trạng thái chiến dịch
   */
  updateCampaignStatus: async (campaignId: string, status: string): Promise<any> => {
    const res: any = await apiClient.put(`/villages/crowdfunding/${campaignId}/status`, { status });
    return res.data || res;
  },

  /**
   * Xóa mềm chiến dịch gây quỹ
   */
  deleteCampaign: async (campaignId: string): Promise<any> => {
    const res: any = await apiClient.delete(`/villages/crowdfunding/${campaignId}`);
    return res.data || res;
  }
};
