import { apiClient } from './apiClient';
import { OrderItemDto } from './orderApi';

export interface ArtisanOrderDto {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  totalAmount: number;
  artisanPayout: number;
  shippingStatus: 'PREPARING' | 'CRAFTING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: string;
  escrowStatus: string;
  items: OrderItemDto[];
  createdAt: string;
}

export interface WalletTransactionDto {
  id: number;
  amount: number;
  transactionType: 'WITHDRAW' | 'ESCROW_RELEASE' | 'PLATFORM_FEE';
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  txReference?: string;
  note?: string;
  createdAt: string;
}

export interface WalletResponseDto {
  artisanId: number;
  artisanName: string;
  availableBalance: number;
  escrowBalance: number;
  totalWithdrawn: number;
  transactions: WalletTransactionDto[];
}

export interface WithdrawPayload {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  note?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
  trackingNumber?: string;
  note?: string;
}

export interface ShippingLabelDto {
  orderCode: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  recipientInfo: string;
  finalAmount: number;
  barcodeUrl: string;
  carrier: string;
}

export const artisanStudioApi = {
  getOrders: async (artisanId?: number): Promise<ArtisanOrderDto[]> => {
    const headers = artisanId ? { 'X-Artisan-Id': String(artisanId) } : undefined;
    const res: any = await apiClient.get('/artisan/orders', { headers });
    return res.data || res || [];
  },

  updateOrderStatus: async (orderId: number, payload: UpdateOrderStatusPayload, artisanId?: number): Promise<ArtisanOrderDto> => {
    const headers = artisanId ? { 'X-Artisan-Id': String(artisanId) } : undefined;
    const res: any = await apiClient.put(`/artisan/orders/${orderId}/status`, payload, { headers });
    return res.data || res;
  },

  generateShippingLabel: async (orderId: number, artisanId?: number): Promise<ShippingLabelDto> => {
    const headers = artisanId ? { 'X-Artisan-Id': String(artisanId) } : undefined;
    const res: any = await apiClient.post(`/artisan/orders/${orderId}/shipping-label`, {}, { headers });
    return res.data || res;
  },

  getWallet: async (artisanId?: number): Promise<WalletResponseDto> => {
    const headers = artisanId ? { 'X-Artisan-Id': String(artisanId) } : undefined;
    const res: any = await apiClient.get('/artisan/wallet', { headers });
    return res.data || res;
  },

  withdraw: async (payload: WithdrawPayload, artisanId?: number): Promise<WalletTransactionDto> => {
    const headers = artisanId ? { 'X-Artisan-Id': String(artisanId) } : undefined;
    const res: any = await apiClient.post('/artisan/wallet/withdraw', payload, { headers });
    return res.data || res;
  }
};
