import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, ShieldCheck, QrCode, CreditCard, Truck, Copy, 
  CheckCircle2, ArrowRight, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { orderApi, CreateOrderPayload, OrderDto } from '../../services/orderApi';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: OrderDto) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { items, clearCart } = useCartStore();

  const [form, setForm] = useState({
    recipientName: '',
    recipientPhone: '',
    province: 'Hà Nội',
    addressDetail: '',
    customerNote: '',
    paymentMethod: 'VIETQR' as 'VIETQR' | 'COD'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 2000000;
  const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : 30000) : 0;
  const finalTotal = subtotal + shippingFee;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label} vào bộ nhớ tạm!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.recipientName.trim()) {
      toast.error('Vui lòng nhập họ tên người nhận hàng.');
      return;
    }
    if (!form.recipientPhone.trim() || form.recipientPhone.trim().length < 9) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ (từ 10 số).');
      return;
    }
    if (!form.addressDetail.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng chi tiết.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateOrderPayload = {
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        shippingAddress: `${form.addressDetail.trim()}, ${form.province}`,
        customerNote: form.customerNote.trim() || undefined,
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity
        }))
      };

      const order = await orderApi.createOrder(payload);
      setCreatedOrder(order);
      clearCart();
      toast.success('Đặt hàng thành công! Đơn hàng được bảo hộ bởi ký quỹ Escrow.');
      onSuccess(order);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đặt hàng, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-heritage-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Neo-Heritage */}
        <div 
          style={{ height: '56px', backgroundColor: '#FFFFFF', borderColor: '#E8DEC8' }}
          className="px-6 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div 
              style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm text-heritage-indigo">
              {createdOrder ? 'Xác Nhận Đơn Hàng & Ký Quỹ' : 'Thanh Toán Đơn Hàng Di Sản (Escrow)'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {createdOrder ? (
            /* Màn Hình Xác Nhận Sau Khi Đặt Hàng */
            <div className="space-y-6 text-center">
              <div 
                style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#059669' }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border"
              >
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-lg text-heritage-indigo">
                  Đặt Hàng Thành Công!
                </h4>
                <p className="text-xs text-stone-600">
                  Mã đơn hàng: <strong className="font-mono text-heritage-red text-sm">{createdOrder.orderCode}</strong>
                </p>
              </div>

              {/* VietQR Chuyển Khoản nếu chọn QR */}
              {createdOrder.paymentMethod === 'VIETQR' && (
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 max-w-md mx-auto text-left">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <span className="text-xs font-bold text-heritage-indigo">Quét Mã VietQR Chuyển Khoản:</span>
                    <span className="text-[11px] font-mono text-stone-500">Tự động nhận diện</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {createdOrder.vietQrImageUrl && (
                      <img
                        src={createdOrder.vietQrImageUrl}
                        alt="Mã QR Chuyển khoản"
                        className="w-40 h-40 rounded-xl border border-stone-300 shadow-sm shrink-0 bg-white p-1"
                      />
                    )}

                    <div className="space-y-2 text-xs w-full">
                      <div>
                        <span className="text-stone-500 text-[11px]">Ngân hàng thụ hưởng:</span>
                        <p className="font-bold text-heritage-indigo">{createdOrder.bankName || 'MB Bank'}</p>
                      </div>

                      <div>
                        <span className="text-stone-500 text-[11px]">Số tài khoản:</span>
                        <div className="flex items-center justify-between font-mono font-bold text-heritage-red">
                          <span>{createdOrder.bankAccountNumber || '0988123456'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(createdOrder.bankAccountNumber || '0988123456', 'Số tài khoản')}
                            className="text-stone-400 hover:text-stone-700 p-1"
                            title="Sao chép"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 text-[11px]">Số tiền cần thanh toán:</span>
                        <div className="font-bold text-sm text-heritage-indigo">
                          {formatCurrency(createdOrder.finalAmount)}
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 text-[11px]">Nội dung chuyển khoản:</span>
                        <div className="flex items-center justify-between font-mono font-bold text-heritage-indigo bg-white px-2 py-1 rounded border border-stone-200">
                          <span>{createdOrder.transferContent || createdOrder.orderCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(createdOrder.transferContent || createdOrder.orderCode, 'Nội dung')}
                            className="text-stone-400 hover:text-stone-700 p-1"
                            title="Sao chép"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Huy Hiệu Bảo Hộ Escrow 7 Ngày */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold">Đơn Hàng Được Bảo Hộ Ký Quỹ Escrow 7 Ngày</p>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    Sau khi bạn nhận tác phẩm, tiền thanh toán sẽ được hệ thống tạm giữ an toàn trong 7 ngày để bạn có thời gian kiểm tra chất lượng men gốm và quét tem Hộ Chiếu Số. Bạn có quyền mở khiếu nại nếu phát hiện tác phẩm bị nứt vỡ hoặc sai lệch mô tả.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow hover:brightness-110 transition-all"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            /* Form Nhập Thông Tin Đặt Hàng */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tóm tắt giỏ hàng */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-heritage-indigo">
                  <span>Tác phẩm đặt mua ({items.length}):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Phí vận chuyển bưu điện chống sốc:</span>
                  <span>{isFreeShipping ? 'Miễn phí (Đơn >= 2 triệu)' : formatCurrency(shippingFee)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-bold text-heritage-red">
                  <span>Tổng tiền thanh toán:</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Thông tin người nhận */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs text-heritage-indigo uppercase tracking-wider">
                  1. Thông Tin Nhận Hàng
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-black font-sans font-bold text-[13px] mb-1">
                      Họ và tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="VD: Lê Minh Anh"
                      value={form.recipientName}
                      onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      style={{ color: '#1677ff' }}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-heritage-red"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-sans font-bold text-[13px] mb-1">
                      Số điện thoại nhận hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      value={form.recipientPhone}
                      onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                      style={{ color: '#1677ff' }}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-heritage-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-black font-sans font-bold text-[13px] mb-1">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      style={{ color: '#1677ff' }}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-heritage-red"
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Bắc Ninh">Bắc Ninh</option>
                      <option value="Ninh Thuận">Ninh Thuận</option>
                      <option value="Huế">Thừa Thiên Huế</option>
                      <option value="Khác">Tỉnh thành khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-black font-sans font-bold text-[13px] mb-1">
                      Địa chỉ chi tiết (Số nhà, ngõ, đường) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Số 45 Phố Huế, Q. Hoàn Kiếm"
                      value={form.addressDetail}
                      onChange={(e) => setForm({ ...form, addressDetail: e.target.value })}
                      style={{ color: '#1677ff' }}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-heritage-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black font-sans font-bold text-[13px] mb-1">
                    Ghi chú cho Nghệ nhân / Đóng gói
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nhờ nghệ nhân ký tên và ghi lời chúc lên hộp quà di sản"
                    value={form.customerNote}
                    onChange={(e) => setForm({ ...form, customerNote: e.target.value })}
                    style={{ color: '#1677ff' }}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-heritage-red"
                  />
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs text-heritage-indigo uppercase tracking-wider">
                  2. Phương Thức Thanh Toán & Ký Quỹ
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setForm({ ...form, paymentMethod: 'VIETQR' })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      form.paymentMethod === 'VIETQR'
                        ? 'border-heritage-red bg-red-50/50 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div 
                      style={{ backgroundColor: form.paymentMethod === 'VIETQR' ? '#8B1E1E' : '#E5E7EB', color: form.paymentMethod === 'VIETQR' ? '#FFFFFF' : '#374151' }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-heritage-indigo block">Chuyển Khoản VietQR</span>
                      <span className="text-[11px] text-stone-500">Mã QR động tự điền số tiền & nội dung</span>
                    </div>
                  </label>

                  <label
                    onClick={() => setForm({ ...form, paymentMethod: 'COD' })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      form.paymentMethod === 'COD'
                        ? 'border-heritage-red bg-red-50/50 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div 
                      style={{ backgroundColor: form.paymentMethod === 'COD' ? '#8B1E1E' : '#E5E7EB', color: form.paymentMethod === 'COD' ? '#FFFFFF' : '#374151' }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-heritage-indigo block">Thanh Toán Khi Nhận (COD)</span>
                      <span className="text-[11px] text-stone-500">Kiểm tra tác phẩm trước khi giao tiền</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Thông tin ký quỹ */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Đơn hàng của bạn được bảo vệ 100% qua cơ chế ký quỹ Escrow 7 ngày, giải ngân tự động sau khi giao hàng thành công.
                </span>
              </div>

              {/* 2 Buttons theo chuẩn Rule 3: "LƯU DỮ LIỆU" và "THOÁT" */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-sans text-[13px] font-bold transition-colors"
                >
                  THOÁT
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#1677ff', color: '#ffffff' }}
                  className="px-6 py-2.5 rounded-xl text-white font-sans text-[13px] font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : 'LƯU DỮ LIỆU'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
