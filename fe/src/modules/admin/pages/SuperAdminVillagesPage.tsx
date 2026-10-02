import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle2, XCircle, Landmark, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { villageAdminApi } from '../../../services/villageAdminApi';
import { apiClient } from '../../../services/apiClient';

interface PendingVillage {
  id: number;
  name: string;
  slug: string;
  craftType?: string;
  region: string;
  province: string;
  district?: string;
  addressLine?: string;
  historicalSummary: string;
  latitude: number;
  longitude: number;
  verificationStatus: string;
  rejectionReason?: string;
  createdAt: string;
}

export const SuperAdminVillagesPage: React.FC = () => {
  const { t } = useTranslation();
  const [villages, setVillages] = useState<PendingVillage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review dialog state
  const [selectedVillage, setSelectedVillage] = useState<PendingVillage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadPendingVillages = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get('/admin/villages/pending');
      setVillages(res.data || res || []);
    } catch (err) {
      console.error('Error fetching pending villages', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingVillages();
  }, []);

  const handleOpenReview = (village: PendingVillage, act: 'APPROVED' | 'REJECTED') => {
    setSelectedVillage(village);
    setAction(act);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedVillage) return;
    if (action === 'REJECTED' && !rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối hồ sơ làng nghề');
      return;
    }

    try {
      await villageAdminApi.verifyVillage(
        selectedVillage.id,
        action === 'APPROVED',
        undefined,
        rejectionReason.trim()
      );
      setIsModalOpen(false);
      loadPendingVillages();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phê duyệt hồ sơ làng nghề');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 sm:p-8" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-700 text-white uppercase tracking-wider">
                SUPER ADMIN
              </span>
              <h1 className="text-xl font-bold text-black tracking-tight">
                Thẩm Định Hồ Sơ Pháp Lý Làng Nghề Di Sản
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Phê duyệt tư cách Quản lý Làng nghề và kích hoạt cơ chế quản trị di sản trên hệ thống.
            </p>
          </div>

          <button
            onClick={loadPendingVillages}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Danh sách Làng nghề Chờ Duyệt */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-gray-200 font-bold text-xs text-gray-700 flex items-center justify-between">
            <span>DANH SÁCH LÀNG NGHỀ CHỜ THẨM ĐỊNH ({villages.length})</span>
            <span className="text-[11px] text-gray-400">Chuẩn BHTT</span>
          </div>

          {villages.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              Hiện không có hồ sơ làng nghề nào đang chờ thẩm định.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {villages.map((v, idx) => (
                <div key={v.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/40 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-black">{v.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                        Chờ duyệt
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>🏷️ Loại hình: <strong className="text-gray-800">{v.craftType || 'Thủ công truyền thống'}</strong></span>
                      <span>📍 Địa chỉ: <strong className="text-gray-800">{v.addressLine ? `${v.addressLine}, ` : ''}{v.district ? `${v.district}, ` : ''}{v.province}</strong></span>
                      <span>🌐 Tọa độ: <strong className="text-[#1677ff]">{v.latitude}, {v.longitude}</strong></span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 italic">
                      "{v.historicalSummary}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenReview(v, 'APPROVED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> PHÊ DUYỆT
                    </button>
                    <button
                      onClick={() => handleOpenReview(v, 'REJECTED')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> TỪ CHỐI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal Chuẩn BHTT Hiện Đại & Trẻ Trung */}
      {isModalOpen && selectedVillage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header 56px Chuẩn BHTT */}
            <div className={`h-14 min-h-[56px] px-6 text-white flex items-center justify-between border-b border-white/10 shrink-0 shadow-sm ${
              action === 'APPROVED' 
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600' 
                : 'bg-gradient-to-r from-rose-600 via-red-600 to-pink-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-md text-amber-300">BHTT</span>
                <span className="text-white/40">•</span>
                <span className="text-sm font-bold tracking-wide">
                  {action === 'APPROVED' ? 'PHÊ DUYỆT LÀNG NGHỀ DI SẢN' : 'TỪ CHỐI HỒ SƠ LÀNG NGHỀ'}
                </span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[11px]">Hồ sơ thẩm định:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    ID #{selectedVillage.id}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedVillage.name}</div>
                <div className="text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{selectedVillage.province} • {selectedVillage.region}</span>
                </div>
              </div>

              {action === 'APPROVED' ? (
                <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-purple-800">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    Xác nhận phê duyệt làng nghề di sản quốc gia
                  </p>
                  <p className="text-purple-700 leading-relaxed">
                    Hệ thống sẽ kích hoạt thẩm quyền quản trị của Ban Quản Lý, cho phép phát hành Hộ chiếu số và phân phối sản phẩm ra thị trường.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Lý do từ chối <span className="text-red-500">* (Bắt buộc theo chuẩn BHTT)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="VD: Thông tin địa giới không chính xác, thiếu văn bản công nhận làng nghề truyền thống..."
                    className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:bg-white transition-all shadow-xs"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Thông tin ranh giới tọa độ không trùng khớp bản đồ địa chính.',
                      'Thiếu quyết định công nhận làng nghề truyền thống cấp tỉnh.',
                      'Hồ sơ đại diện Ban quản lý chưa được xác thực thông tin CCCD.'
                    ].map(reason => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setRejectionReason(reason)}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-700 border border-slate-200 transition-all text-left"
                      >
                        • {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2 Buttons chuẩn BHTT */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  THOÁT
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                    action === 'APPROVED' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25' 
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/25'
                  }`}
                >
                  {action === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{action === 'APPROVED' ? 'XÁC NHẬN DUYỆT' : 'XÁC NHẬN TỪ CHỐI'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
