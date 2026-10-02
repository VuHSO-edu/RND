import { apiClient } from './apiClient';

export interface CartItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CartItemPayload[];
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  customerNote?: string;
  paymentMethod?: 'VIETQR' | 'COD';
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  skuCode?: string;
  passportCode?: string;
  artisanId?: number;
  artisanName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDto {
  id: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingAddress: string;
  vietQrPayload?: string;
  vietQrImageUrl?: string;
  bankAccountNumber?: string;
  bankName?: string;
  transferContent?: string;
  escrowStatus: string;
  escrowHoldAmount?: number;
  escrowNetPayout?: number;
  escrowAutoReleaseDate?: string;
  isDisputed?: boolean;
  items: OrderItemDto[];
  createdAt: string;
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<OrderDto> => {
    const res: any = await apiClient.post('/orders', payload);
    return res.data || res;
  },

  getMyOrders: async (): Promise<OrderDto[]> => {
    const res: any = await apiClient.get('/orders/my-orders');
    return res.data || res || [];
  },

  getOrderById: async (orderId: number): Promise<OrderDto> => {
    const res: any = await apiClient.get(`/orders/${orderId}`);
    return res.data || res;
  },

  cancelOrder: async (orderId: number, reason: string): Promise<OrderDto> => {
    const res: any = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
    return res.data || res;
  },

  disputeEscrow: async (orderId: number, disputeReason: string, evidenceImageUrl?: string): Promise<any> => {
    const res: any = await apiClient.post(`/escrow/${orderId}/dispute`, { disputeReason, evidenceImageUrl });
    return res.data || res;
  },

  releaseEscrow: async (orderId: number): Promise<any> => {
    const res: any = await apiClient.post(`/escrow/${orderId}/release`);
    return res.data || res;
  }
};
