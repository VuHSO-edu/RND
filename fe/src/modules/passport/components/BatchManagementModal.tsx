import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PackageCheck, 
  Layers, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Plus, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Radio,
  FileCheck
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';

interface ProductBatch {
  id: number;
  batchCode: string;
  quantity: number;
  approvalStatus: string;
  rejectionReason?: string;
  onchainStatus: string;
  merkleRootHash?: string;
  blockchainTxHash?: string;
  blockchainNetwork?: string;
  blockNumber?: number;
  batchNotes?: string;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    skuCode: string;
    coverImageUrl?: string;
  };
}

interface BatchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  villageId?: number;
  products?: Array<{ id: number; name: string; skuCode: string }>;
}

export const BatchManagementModal: React.FC<BatchManagementModalProps> = ({
  isOpen,
  onClose,
  villageId = 1,
  products = []
}) => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);
  const [passports, setPassports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form tạo Lô mới
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [batchNotes, setBatchNotes] = useState('');
  const [craftingVideoUrl, setCraftingVideoUrl] = useState('');
  const [artisanStoryQuote, setArtisanStoryQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rejection modal
  const [rejectingBatchId, setRejectingBatchId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get(`/villages/batches?villageId=${villageId}`);
      if (res?.data) {
        setBatches(res.data);
      }
    } catch (err) {
      console.log('Chưa tải được danh sách lô:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBatches();
      if (products.length > 0 && !productId) {
        setProductId(products[0].id);
      }
    }
  }, [isOpen, villageId]);

  const loadPassports = async (batch: ProductBatch) => {
    setSelectedBatch(batch);
    try {
      const res: any = await apiClient.get(`/villages/batches/${batch.id}/passports`);
      if (res?.data) {
        setPassports(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      alert('Vui lòng chọn một tác phẩm SKU');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/villages/passports/batch-generate', {
        productId: Number(productId),
        quantity: Number(quantity),
        batchNotes: batchNotes.trim() || undefined,
        craftingVideoUrl: craftingVideoUrl.trim() || undefined,
        artisanStoryQuote: artisanStoryQuote.trim() || undefined
      });
      alert('Tạo Lô sản phẩm và sinh danh sách Hộ chiếu thành công!');
      setIsCreating(false);
      setBatchNotes('');
      loadBatches();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo lô sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewBatch = async (batchId: number, approved: boolean, reason?: string) => {
    try {
      await apiClient.put(`/villages/batches/${batchId}/review`, {
        approved,
        rejectionReason: reason
      });
      alert(approved 
        ? 'Duyệt Lô xuất xưởng thành công! Hệ thống đang băm cây Merkle và ghi nhận giao dịch On-chain ngầm.'
        : 'Đã từ chối duyệt Lô sản phẩm.');
      setRejectingBatchId(null);
      setRejectionReason('');
      loadBatches();
      if (selectedBatch?.id === batchId) {
        const updatedRes: any = await apiClient.get(`/villages/batches/${batchId}/passports`);
        if (updatedRes?.data) setPassports(updatedRes.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái Lô');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-100"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px Chuẩn BHTT Hiện Đại */}
        <div className="h-14 min-h-[56px] px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between border-b border-white/10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <PackageCheck className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-emerald-200">BHTT</span>
                <span className="text-white/40">•</span>
                <span className="text-sm font-bold tracking-wide">QUẢN LÝ LÔ XUẤT XƯỞNG &amp; MÃ BĂM MERKLE</span>
              </div>
              <p className="text-[11px] text-emerald-100/90 hidden sm:block">
                Thẩm định xuất xưởng &amp; đóng gói cây Merkle Tree On-chain
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-95"
            title="Đóng (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/60">
          {/* Thanh tác vụ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Danh Sách Lô Xuất Xưởng Làng Nghề</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {batches.length} Lô
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Kiểm định lô hàng, sinh Merkle Root Tree và neo bằng chứng số hóa Polygon Ledger</p>
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 ${
                isCreating 
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25'
              }`}
            >
              <Plus className={`w-4 h-4 transition-transform ${isCreating ? 'rotate-45' : ''}`} />
              <span>{isCreating ? 'Đóng Biểu Mẫu' : '+ Khai Báo Lô Mới'}</span>
            </button>
          </div>

          {/* Form Tạo Lô Mới Năng Động Trẻ Trung */}
          {isCreating && (
            <form onSubmit={handleCreateBatch} className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-xs uppercase text-emerald-800 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Khai Báo Lô Sản Phẩm &amp; Cấp Hàng Loạt Hộ Chiếu Di Sản
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Chuẩn Merkle Tree
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1.5">
                    Chọn Mẫu Tác Phẩm SKU <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(Number(e.target.value))}
                    className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-[13px] text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
                    required
                  >
                    <option value="">-- Chọn tác phẩm SKU đã được duyệt --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.skuCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center justify-between">
                    <span>Số Lượng Xuất Xưởng <span className="text-red-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-400">Tối đa 1000 tem/lô</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-[13px] text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
                    required
                  />
                  {/* Quick Quantity Chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[10, 25, 50, 100, 250, 500].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setQuantity(qty)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          quantity === qty
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {qty} tem
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1.5">
                  Ghi Chú Đợt Nung / Xuất Xưởng
                </label>
                <textarea
                  rows={2}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Ví dụ: Đợt nung củi truyền thống tháng 10/2026, đất sét non phù sa sông Hồng nung 1250°C..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-[13px] text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-xs"
                />
              </div>

              {/* 2-Button Rule: LƯU DỮ LIỆU & THOÁT */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 uppercase"
                >
                  THOÁT
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 uppercase"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isSubmitting ? 'ĐANG KHỞI TẠO...' : 'LƯU DỮ LIỆU'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Danh Sách Các Lô Hàng */}
          <div className="space-y-3">
            {batches.length === 0 ? (
              <div className="p-8 bg-white rounded-lg border text-center text-gray-500 text-xs">
                Chưa có Lô sản phẩm nào được khai báo cho làng nghề.
              </div>
            ) : (
              batches.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-heritage-indigo">{b.batchCode}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          b.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          b.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.approvalStatus === 'APPROVED' ? '✓ ĐÃ DUYỆT XUẤT XƯỞNG' :
                           b.approvalStatus === 'REJECTED' ? '✕ ĐÃ TỪ CHỐI' : '⏳ CHỜ DUYỆT'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.onchainStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {b.onchainStatus === 'CONFIRMED' ? '⛓️ ON-CHAIN: CONFIRMED' : '⛓️ ' + b.onchainStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Sản phẩm: <strong>{b.product?.name || 'Tác phẩm truyền thống'}</strong> • Số lượng: <strong>{b.quantity} chiếc</strong>
                      </p>
                    </div>

                    {/* Thao tác Duyệt Lô */}
                    <div className="flex items-center gap-2">
                      {b.approvalStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewBatch(b.id, true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-all shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Duyệt Lô Xuất Xưởng</span>
                          </button>
                          <button
                            onClick={() => setRejectingBatchId(b.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Từ Chối</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => loadPassports(b)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-heritage-indigo font-bold text-xs rounded transition-all border border-stone-300 flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Xem {b.quantity} Hộ Chiếu</span>
                      </button>
                    </div>
                  </div>

                  {/* Thông tin Blockchain On-chain */}
                  {b.merkleRootHash && (
                    <div className="bg-[#FBF9F5] p-3 rounded border border-heritage-brass/30 text-xs space-y-1">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Merkle Root Hash (SHA-256):</span>
                        <span className="font-mono text-[11px] text-heritage-terracotta font-bold truncate max-w-[320px]">{b.merkleRootHash}</span>
                      </div>
                      {b.blockchainTxHash && (
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Polygon Tx Hash (Amoy):</span>
                          <span className="font-mono text-[11px] text-[#1677ff] font-bold truncate max-w-[320px]">{b.blockchainTxHash}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Modal từ chối nhỏ nếu bấm Từ chối */}
                  {rejectingBatchId === b.id && (
                    <div className="p-3 bg-red-50 rounded border border-red-200 space-y-2">
                      <label className="block text-xs font-bold text-red-800">Nhập lý do từ chối xuất xưởng lô:</label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ví dụ: Sản phẩm chưa đạt độ đồng đều nước men, sai quy cách..."
                        className="w-full p-2 border border-red-300 rounded text-xs text-red-900 bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setRejectingBatchId(null)} className="px-3 py-1 text-xs border rounded bg-white">Hủy</button>
                        <button
                          onClick={() => handleReviewBatch(b.id, false, rejectionReason)}
                          className="px-3 py-1 text-xs bg-red-700 text-white rounded font-bold"
                        >
                          Xác nhận Từ Chối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modal danh sách Hộ chiếu con */}
          {selectedBatch && (
            <div className="bg-white p-5 rounded-lg border border-heritage-indigo/20 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-bold text-xs uppercase text-heritage-indigo tracking-wider">
                  Danh Sách Hộ Chiếu Di Sản Thuộc Lô {selectedBatch.batchCode} ({passports.length} thẻ)
                </h4>
                <button onClick={() => setSelectedBatch(null)} className="text-xs text-gray-500 hover:text-black">Đóng danh sách</button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {passports.map((p) => (
                  <div key={p.id} className="p-2.5 bg-stone-50 rounded border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-heritage-indigo">{p.serialNumber || p.passportCode}</span>
                      <span className="text-[10px] text-gray-500 ml-2">Mã băm: {p.verificationHash?.substring(0, 16)}...</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        QR Sẵn Sàng
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/passport/${p.passportCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-heritage-indigo hover:bg-blue-950 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Xem Thẻ</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer 2 nút chuẩn BHTT */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-black rounded text-xs font-bold transition-all uppercase"
          >
            THOÁT
          </button>
        </div>
      </div>
    </div>
  );
};
