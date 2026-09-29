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

      {/* Review Modal Chuẩn BHTT */}
      {isModalOpen && selectedVillage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header 56px */}
            <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">BHTT</span>
                <span className="text-white/40">|</span>
                <span className="text-xs font-medium">
                  {action === 'APPROVED' ? 'PHÊ DUYỆT LÀNG NGHỀ DI SẢN' : 'TỪ CHỐI HỒ SƠ LÀNG NGHỀ'}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1">
                <div>Làng nghề: <strong className="text-black">{selectedVillage.name}</strong></div>
                <div>Địa bàn: {selectedVillage.province}</div>
              </div>

              {action === 'APPROVED' ? (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  Xác nhận duyệt hồ sơ làng nghề. Hệ thống sẽ kích hoạt tài khoản Quản lý làng và liên kết khóa ngoại tương ứng.
                </p>
              ) : (
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Lý do từ chối <span className="text-red-500">* (Bắt buộc)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="VD: Thông tin địa giới không chính xác, thiếu giấy công nhận làng nghề..."
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}

              {/* 2 Buttons chuẩn BHTT */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  THOÁT
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 rounded-lg text-[13px] font-bold text-white shadow ${
                    action === 'APPROVED' ? 'bg-[#1677ff] hover:bg-blue-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {action === 'APPROVED' ? 'XÁC NHẬN DUYỆT' : 'XÁC NHẬN TỪ CHỐI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
