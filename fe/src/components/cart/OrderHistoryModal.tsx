import React, { useState, useEffect } from 'react';
import { 
  Package, ShieldCheck, Clock, CheckCircle2, AlertTriangle, 
  RotateCcw, ExternalLink, QrCode, XCircle, Truck, RefreshCw
} from 'lucide-react';
import { HeritageModal } from '../ui/HeritageModal';
import { Button } from '../ui/Button';
import { orderApi, OrderDto } from '../../services/orderApi';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewQr?: (order: OrderDto) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onViewQr
}) => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  // Dispute modal sub-state
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Cancel order modal sub-state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderApi.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const handleOpenDispute = (order: OrderDto) => {
    setSelectedOrder(order);
    setDisputeReason('');
    setEvidenceUrl('');
    setIsDisputeOpen(true);
  };

  const handleOpenCancel = (order: OrderDto) => {
    setSelectedOrder(order);
    setCancelReason('');
    setIsCancelOpen(true);
  };

  const handleSubmitDispute = async () => {
    if (!selectedOrder) return;
    if (!disputeReason.trim()) {
      alert('Vui lòng nhập lý do khiếu nại.');
      return;
    }

    setIsSubmittingDispute(true);
    try {
      await orderApi.disputeEscrow(selectedOrder.id, disputeReason.trim(), evidenceUrl.trim() || undefined);
      alert('Đã gửi khiếu nại thành công! Tiền ký quỹ Escrow được tạm khóa để bảo vệ bạn.');
      setIsDisputeOpen(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi khiếu nại ký quỹ.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleSubmitCancel = async () => {
    if (!selectedOrder) return;
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn.');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      await orderApi.cancelOrder(selectedOrder.id, cancelReason.trim());
      alert('Đã hủy đơn hàng thành công!');
      setIsCancelOpen(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi hủy đơn hàng.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getShippingBadge = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Chờ Chuẩn Bị
          </span>
        );
      case 'CRAFTING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Đang Chế Tác
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Đang Giao Hàng
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Giao Thành Công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            <XCircle className="w-3.5 h-3.5" /> Đã Hủy
          </span>
        );
      default:
        return <span className="text-xs text-stone-500">{status}</span>;
    }
  };

  const getEscrowBadge = (escrowStatus: string, isDisputed?: boolean) => {
    if (isDisputed || escrowStatus === 'DISPUTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Ký Quỹ Đang Khiếu Nại
        </span>
      );
    }
    if (escrowStatus === 'RELEASED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-300">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Đã Giải Ngân Cho Nghệ Nhân
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Ký Quỹ Bảo Vệ 7 Ngày
      </span>
    );
  };

  return (
    <>
      <HeritageModal
        isOpen={isOpen}
        onClose={onClose}
        title="BHTT"
        subtitle="Lịch Sử Đơn Hàng & Bảo Vệ Ký Quỹ Escrow"
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Danh sách đơn đặt hàng của bạn ({orders.length})
            </span>
            <button
              onClick={fetchOrders}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              Đang tải danh sách đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-600">Bạn chưa có đơn đặt hàng nào.</p>
              <p className="text-xs text-stone-400">Các tác phẩm bạn đặt mua sẽ hiển thị kèm mã theo dõi và trạng thái ký quỹ tại đây.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 hover:border-amber-400/50 transition-all shadow-sm"
                >
                  {/* Header đơn hàng */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#1C2D37]">
                          {order.orderCode}
                        </span>
                        <span className="text-xs text-stone-400">
                          ({new Date(order.createdAt).toLocaleDateString('vi-VN')})
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Người nhận: <span className="font-semibold text-stone-700">{order.customerName}</span> • {order.shippingAddress}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getShippingBadge(order.shippingStatus)}
                      {getEscrowBadge(order.escrowStatus, order.isDisputed)}
                    </div>
                  </div>

                  {/* Danh sách mặt hàng */}
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-stone-800">{item.productName}</p>
                            <p className="text-[11px] text-stone-400">
                              {item.skuCode && `SKU: ${item.skuCode}`}
                              {item.artisanName && ` • Nghệ nhân: ${item.artisanName}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-stone-500">x{item.quantity}</span>
                          <span className="ml-3 font-semibold text-[#8B1E1E]">
                            {(item.subtotal || item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-stone-500">Tổng thanh toán: </span>
                      <span className="font-bold text-sm text-[#8B1E1E]">
                        {(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-stone-400 ml-2">({order.paymentMethod})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.paymentMethod === 'VIETQR' && order.vietQrPayload && (
                        <button
                          onClick={() => onViewQr && onViewQr(order)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Mã VietQR
                        </button>
                      )}

                      {order.shippingStatus === 'PREPARING' && (
                        <button
                          onClick={() => handleOpenCancel(order)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          Hủy Đơn Hàng
                        </button>
                      )}

                      {order.escrowStatus === 'HOLDING' && !order.isDisputed && (
                        <button
                          onClick={() => handleOpenDispute(order)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Khiếu Nại Ký Quỹ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </HeritageModal>

      {/* Modal Khiếu Nại Escrow */}
      <HeritageModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title="BHTT"
        subtitle={`Khiếu Nại Ký Quỹ Đơn Hàng ${selectedOrder?.orderCode || ''}`}
        maxWidth="md"
        showFooter
        onSave={handleSubmitDispute}
        saveLabel="LƯU DỮ LIỆU"
        cancelLabel="THOÁT"
        saveLoading={isSubmittingDispute}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Chính Sách Bảo Vệ Người Mua Di Sản
            </p>
            <p className="text-[11px] leading-relaxed">
              Khi bạn gửi khiếu nại, tiền ký quỹ sẽ được đóng băng ngay lập tức. Nghệ nhân và Ban Quản Lý Làng Nghề sẽ cùng đối soát giải quyết thỏa đáng hoặc hoàn tiền 100% cho bạn.
            </p>
          </div>

          <div>
            <label className="block font-bold text-black mb-1">
              Lý do khiếu nại <span className="text-red-500">*</span>
            </label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Mô tả chi tiết tình trạng sản phẩm (sai mẫu, vỡ nứt do vận chuyển, không đúng chứng nhận...)"
              className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-1">
              Link ảnh minh chứng (nếu có)
            </label>
            <input
              type="text"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </HeritageModal>

      {/* Modal Hủy Đơn Hàng */}
      <HeritageModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="BHTT"
        subtitle={`Xác Nhận Hủy Đơn Hàng ${selectedOrder?.orderCode || ''}`}
        maxWidth="md"
        showFooter
        onSave={handleSubmitCancel}
        saveLabel="LƯU DỮ LIỆU"
        cancelLabel="THOÁT"
        saveLoading={isSubmittingCancel}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-700">
            Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này sẽ hủy yêu cầu chế tác tại xưởng nghệ nhân.
          </div>

          <div>
            <label className="block font-bold text-black mb-1">
              Lý do hủy đơn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="VD: Thay đổi nhu cầu, đặt nhầm địa chỉ..."
              className="w-full px-3 py-2 text-xs text-[#1677ff] bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </HeritageModal>
    </>
  );
};
