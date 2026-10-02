import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, 
  ArrowRight, Sparkles, History 
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { Button } from '../ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onOpenOrderHistory: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onCheckout,
  onOpenOrderHistory
}) => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 2000000;
  const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : 30000) : 0;
  const finalTotal = subtotal + shippingFee;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="fixed inset-0 z-[1200] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-heritage-border bg-heritage-surface/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-heritage-indigo">
                  Giỏ Hàng Tác Phẩm ({items.reduce((sum, i) => sum + i.quantity, 0)})
                </h3>
                <span className="text-[11px] text-heritage-subtext flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Bảo hộ ký quỹ Escrow 7 ngày
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div 
                  style={{ backgroundColor: '#F5EFE6', borderColor: '#E8DEC8' }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border text-stone-400"
                >
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-heritage-indigo text-base">Giỏ hàng của bạn đang trống</p>
                  <p className="text-xs text-heritage-subtext max-w-xs mx-auto">
                    Hãy ghé thăm Chợ Di Sản để lựa chọn các tác phẩm thủ công độc bản có tem Hộ Chiếu Số.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={onOpenOrderHistory} className="gap-1.5 text-xs">
                    <History className="w-3.5 h-3.5 text-heritage-gold" />
                    Lịch Sử Đơn Hàng
                  </Button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 bg-white border border-heritage-border rounded-2xl shadow-2xs hover:border-heritage-red/30 transition-all flex gap-3.5"
                >
                  <img
                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80'}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-heritage-indigo line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] font-bold text-heritage-red mt-1">
                        {formatCurrency(item.product.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.product.skuCode || 'SKU-HERITAGE'}
                      </span>

                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-200 rounded-l transition-colors"
                          title="Giảm số lượng"
                        >
                          <Minus className="w-3 h-3 text-stone-600" />
                        </button>
                        <span className="px-2.5 text-xs font-bold font-mono text-heritage-indigo">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-200 rounded-r transition-colors"
                          title="Tăng số lượng"
                        >
                          <Plus className="w-3 h-3 text-stone-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-heritage-border bg-stone-50/80 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tiền tác phẩm ({items.length} món):</span>
                  <span className="font-bold text-heritage-indigo">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    Phí vận chuyển bảo hiểm:
                    {isFreeShipping && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Miễn phí
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-heritage-indigo">
                    {isFreeShipping ? '0 ₫' : formatCurrency(shippingFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-heritage-indigo">Tổng thanh toán:</span>
                  <span className="text-lg font-bold font-sans text-heritage-red">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                  className="w-full min-h-[48px] py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <span>Tiến Hành Đặt Hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={onOpenOrderHistory}
                    className="text-heritage-indigo hover:text-heritage-red font-bold flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-heritage-gold" />
                    Lịch sử đơn hàng
                  </button>

                  <button
                    onClick={clearCart}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
