import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, CheckCircle2, AlertCircle, MapPin, Plus, Search, 
  UserCheck, UserX, Printer, Shield, Eye, RefreshCw, Sparkles,
  PackageCheck, Radio
} from 'lucide-react';
import { villageAdminApi, ArtisanItem, VillageStats } from '../../../services/villageAdminApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { apiClient } from '../../../services/apiClient';
import { BatchManagementModal } from '../../passport/components/BatchManagementModal';
import { BindNfcModal } from '../../passport/components/BindNfcModal';

export const VillageDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<VillageStats | null>(null);
  const [artisans, setArtisans] = useState<ArtisanItem[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  // Modal / Bottom sheet states
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [bindNfcPassportCode, setBindNfcPassportCode] = useState<string | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [createdProxyResult, setCreatedProxyResult] = useState<any | null>(null);

  // Proxy form state
  const [proxyName, setProxyName] = useState('');
  const [proxyTitle, setProxyTitle] = useState('Nghệ nhân Ưu tú');
  const [proxyExperience, setProxyExperience] = useState(30);
  const [proxyAddress, setProxyAddress] = useState('');
  const [proxySkills, setProxySkills] = useState('');
  const [proxyPhone, setProxyPhone] = useState('');

  // Debounce search 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const statsRes: any = await villageAdminApi.getStatistics(user?.villageId);
      setStats(statsRes.data || statsRes);

      const artisansRes: any = await villageAdminApi.getArtisans(user?.villageId);
      setArtisans(artisansRes.data || artisansRes);

      const prodRes: any = await apiClient.get('/products');
      if (prodRes?.data) {
        setProductsList(prodRes.data);
      }
    } catch (err) {
      console.error('Failed to load village data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.villageId]);

  const filteredArtisans = artisans.filter((a) => {
    const matchKeyword =
      !debouncedKeyword ||
      a.user?.fullName?.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
      a.title?.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
      a.workshopAddress?.toLowerCase().includes(debouncedKeyword.toLowerCase());

    if (statusFilter === 'ALL') return matchKeyword;
    if (statusFilter === 'APPROVED') return matchKeyword && (a.verificationStatus === 'APPROVED' || a.verificationStatus === 'VERIFIED');
    if (statusFilter === 'PENDING') return matchKeyword && a.verificationStatus === 'PENDING';
    return matchKeyword;
  });

  const handleOpenReview = (artisan: ArtisanItem, action: 'APPROVED' | 'REJECTED') => {
    setSelectedArtisan(artisan);
    setReviewAction(action);
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedArtisan) return;
    if (reviewAction === 'REJECTED' && !rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối hồ sơ nghệ nhân theo chuẩn BHTT');
      return;
    }

    try {
      await villageAdminApi.reviewArtisan(selectedArtisan.id, reviewAction, rejectionReason.trim());
      setIsReviewModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleCreateProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await villageAdminApi.createProxyArtisan({
        fullName: proxyName.trim(),
        title: proxyTitle.trim(),
        experienceYears: Number(proxyExperience),
        workshopAddress: proxyAddress.trim(),
        specialtySkills: proxySkills.trim(),
        phone: proxyPhone.trim() || undefined,
        villageId: user?.villageId
      });
      setCreatedProxyResult(res.data || res);
      // Reset form
      setProxyName('');
      setProxyAddress('');
      setProxySkills('');
      setProxyPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo tài khoản');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 sm:p-8" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-heritage-indigo text-white uppercase tracking-wider">
                VILLAGE ADMIN
              </span>
              <h1 className="text-xl font-bold text-black tracking-tight">
                {stats?.villageName || 'Ban Quản Lý Làng Nghề Di Sản'}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Phân hệ quản trị nghệ nhân trực thuộc, thẩm định hồ sơ và cấp phát thẻ Hộ chiếu số.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[13px] font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              QUẢN LÝ LÔ &amp; MERKLE
            </button>
            <button
              onClick={() => {
                setCreatedProxyResult(null);
                setIsProxyModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded-lg text-[13px] font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              TẠO HỘ NGHỆ NHÂN
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Chỉ Số Tóm Tắt (Metric Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats?.totalArtisans ?? 0}</div>
              <div className="text-[12px] text-gray-500 font-medium">Tổng Nghệ Nhân</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats?.approvedArtisans ?? 0}</div>
              <div className="text-[12px] text-gray-500 font-medium">Đã Phê Duyệt</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats?.pendingArtisans ?? 0}</div>
              <div className="text-[12px] text-gray-500 font-medium">Chờ Thẩm Định</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats?.coverageRadiusMeters ?? 5000}m</div>
              <div className="text-[12px] text-gray-500 font-medium">Bán Kính Quản Lý</div>
            </div>
          </div>
        </div>

        {/* Bảng Dữ Liệu & Bộ Lọc Chuẩn BHTT */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Bảng & Filter */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/60">
            {/* Thanh tìm kiếm Debounce 500ms */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm họ tên, danh hiệu, xưởng..."
                className="w-full pl-9 pr-3 py-2 text-[13px] text-[#1677ff] border border-gray-300 rounded-lg focus:outline-none focus:border-[#1677ff] bg-white"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-heritage-indigo text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tất cả ({artisans.length})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Chờ duyệt
              </button>
            </div>
          </div>

          {/* Desktop PC Table View (Ẩn trên màn hình siêu nhỏ) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-stone-100 text-black border-b border-gray-200 text-[12px] uppercase">
                <tr>
                  <th className="py-3 px-4 w-[60px] text-center">STT</th>
                  <th className="py-3 px-4">Nghệ Nhân &amp; Danh Hiệu</th>
                  <th className="py-3 px-4">Xưởng Chế Tác</th>
                  <th className="py-3 px-4">Thâm Niên</th>
                  <th className="py-3 px-4 text-center">Ủy Quyền Hộ</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 w-[130px] text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {filteredArtisans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Không tìm thấy nghệ nhân nào phù hợp tiêu chí.
                    </td>
                  </tr>
                ) : (
                  filteredArtisans.map((artisan, index) => (
                    <tr 
                      key={artisan.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-bold text-gray-500 w-[60px]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-black text-[13px]">
                          {artisan.user?.fullName}
                        </div>
                        <div className="text-[11px] text-[#1677ff] font-semibold">
                          {artisan.title}
                        </div>
                        {artisan.user?.phone && (
                          <div className="text-[11px] text-gray-400">
                            SĐT: {artisan.user.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {artisan.workshopAddress}
                      </td>
                      <td className="py-3 px-4 font-bold text-black">
                        {artisan.experienceYears} năm
                      </td>
                      <td className="py-3 px-4 text-center">
                        {artisan.managedByVillageAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Shield className="w-3 h-3" /> Đại diện
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Tự quản</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {artisan.verificationStatus === 'APPROVED' || artisan.verificationStatus === 'VERIFIED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Đã phê duyệt
                          </span>
                        ) : artisan.verificationStatus === 'REJECTED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800" title={artisan.rejectionReason}>
                            Từ chối
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            Chờ duyệt
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 w-[130px] text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {artisan.verificationStatus === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleOpenReview(artisan, 'APPROVED')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Phê duyệt hồ sơ"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenReview(artisan, 'REJECTED')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Từ chối hồ sơ kèm lý do"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Swipeable Cards View (Tối ưu cho màn hình cảm ứng di động) */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredArtisans.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                Chưa có nghệ nhân nào phù hợp.
              </div>
            ) : (
              filteredArtisans.map((artisan) => (
                <div key={artisan.id} className="p-4 space-y-2.5 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-black text-sm">{artisan.user?.fullName}</div>
                      <div className="text-xs text-[#1677ff] font-semibold">{artisan.title}</div>
                    </div>
                    {artisan.verificationStatus === 'APPROVED' || artisan.verificationStatus === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                        Chờ duyệt
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>📍 {artisan.workshopAddress}</p>
                    <p className="mt-0.5">⏳ {artisan.experienceYears} năm kinh nghiệm {artisan.managedByVillageAdmin ? '• Quản lý đại diện' : ''}</p>
                  </div>

                  {artisan.verificationStatus === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenReview(artisan, 'APPROVED')}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm"
                      >
                        Duyệt Hồ Sơ
                      </button>
                      <button
                        onClick={() => handleOpenReview(artisan, 'REJECTED')}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold shadow-sm"
                      >
                        Từ Chối
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer tổng số bản ghi */}
          <div className="p-3 bg-stone-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>Hiển thị {filteredArtisans.length} / {artisans.length} nghệ nhân</span>
            <span className="font-sans">Chuẩn dữ liệu BHTT</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: TẠO HỘ NGHỆ NHÂN CAO TUỔI (Proxy Artisan Modal) */}
      {isProxyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[85vh]">
            {/* Header 56px Chuẩn BHTT */}
            <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between border-b border-heritage-brass/40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">BHTT</span>
                <span className="text-white/40">|</span>
                <span className="text-xs font-medium">TẠO HỘ TÀI KHOẢN NGHỆ NHÂN CAO TUỔI</span>
              </div>
              <button
                onClick={() => setIsProxyModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            {createdProxyResult ? (
              /* Thẻ Kết quả & In Mã Kích Hoạt */
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center space-y-2">
                  <div className="text-base font-bold">TẠO TÀI KHOẢN ĐẠI DIỆN THÀNH CÔNG!</div>
                  <p className="text-xs">
                    Tài khoản đã được liên kết trực tiếp với Ban Quản Lý Làng Nghề và tự động phê duyệt.
                  </p>
                </div>

                <div className="p-5 bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-xl text-center space-y-2">
                  <div className="text-xs font-bold text-gray-600 uppercase">MÃ KÍCH HOẠT / IN PHIẾU CẤP PHÁT</div>
                  <div className="text-3xl font-mono font-black text-heritage-terracotta tracking-wider">
                    {createdProxyResult.activationCode}
                  </div>
                  <div className="text-xs text-gray-500 font-serif">
                    Nghệ nhân: <span className="font-bold text-black">{createdProxyResult.fullName}</span> ({createdProxyResult.title})
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> In Phiếu
                  </button>
                  <button
                    onClick={() => {
                      setCreatedProxyResult(null);
                      setIsProxyModalOpen(false);
                    }}
                    className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-bold rounded-lg"
                  >
                    HOÀN TẤT
                  </button>
                </div>
              </div>
            ) : (
              /* Form Nhập Liệu Chuẩn 2 nút */
              <form onSubmit={handleCreateProxy} className="p-5 overflow-y-auto space-y-3.5 flex-1">
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Họ và tên nghệ nhân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proxyName}
                    onChange={(e) => setProxyName(e.target.value)}
                    placeholder="VD: Cụ Nguyễn Văn Gốm"
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Danh hiệu / Chức danh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={proxyTitle}
                      onChange={(e) => setProxyTitle(e.target.value)}
                      placeholder="VD: Nghệ nhân Nhân dân"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Năm làm nghề
                    </label>
                    <input
                      type="number"
                      value={proxyExperience}
                      onChange={(e) => setProxyExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Địa chỉ xưởng chế tác <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proxyAddress}
                    onChange={(e) => setProxyAddress(e.target.value)}
                    placeholder="VD: Xóm 3, Làng Bát Tràng"
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Kỹ thuật tinh hoa đặc trưng
                  </label>
                  <textarea
                    rows={2}
                    value={proxySkills}
                    onChange={(e) => setProxySkills(e.target.value)}
                    placeholder="VD: Chuyên vuốt tay men rạn cổ, phục dựng men hoàng tộc..."
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Số điện thoại <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={proxyPhone}
                    onChange={(e) => setProxyPhone(e.target.value)}
                    placeholder="Để trống nếu nghệ nhân không dùng điện thoại"
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* 2 Buttons chuẩn BHTT */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsProxyModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    THOÁT
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow"
                  >
                    LƯU DỮ LIỆU
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: THẨM ĐỊNH HỒ SƠ NGHỆ NHÂN (Review Modal với Bắt Buộc Lý Do Từ Chối) */}
      {isReviewModalOpen && selectedArtisan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-lg shadow-2xl flex flex-col overflow-hidden">
            {/* Header 56px Chuẩn BHTT */}
            <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between border-b border-heritage-brass/40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">BHTT</span>
                <span className="text-white/40">|</span>
                <span className="text-xs font-medium">
                  {reviewAction === 'APPROVED' ? 'PHÊ DUYỆT HỒ SƠ NGHỆ NHÂN' : 'TỪ CHỐI HỒ SƠ NGHỆ NHÂN'}
                </span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1">
                <div>Nghệ nhân: <span className="font-bold text-black">{selectedArtisan.user?.fullName}</span></div>
                <div>Danh hiệu: <span className="text-[#1677ff] font-bold">{selectedArtisan.title}</span></div>
                <div>Xưởng: {selectedArtisan.workshopAddress}</div>
              </div>

              {reviewAction === 'REJECTED' && (
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Lý do từ chối <span className="text-red-500">* (Bắt buộc)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="VD: Hồ sơ chưa có hình ảnh bằng khen/chứng nhận nghệ nhân làng nghề..."
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                    style={{ fontSize: '16px' }}
                  />

                  {/* Gợi ý lý do 1 chạm cho di động */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRejectionReason('Hồ sơ thiếu bằng khen hoặc danh hiệu làng nghề.')}
                      className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      Thiếu bằng khen
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectionReason('Địa chỉ xưởng chế tác nằm ngoài phạm vi địa giới làng nghề.')}
                      className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      Ngoài địa giới
                    </button>
                  </div>
                </div>
              )}

              {reviewAction === 'APPROVED' && (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  Xác nhận phê duyệt nghệ nhân này gia nhập làng nghề và bắt đầu được cấp phép khai báo mẫu sản phẩm (SKU) &amp; lô Hộ chiếu số.
                </p>
              )}

              {/* 2 Buttons chuẩn BHTT */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  THOÁT
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  className={`px-6 py-2.5 rounded-lg text-[13px] font-bold text-white shadow ${
                    reviewAction === 'APPROVED' ? 'bg-[#1677ff] hover:bg-blue-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {reviewAction === 'APPROVED' ? 'XÁC NHẬN DUYỆT' : 'XÁC NHẬN TỪ CHỐI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Lô Xuất Xưởng & Merkle Root (Sprint 4) */}
      <BatchManagementModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        villageId={user?.villageId || 1}
        products={productsList}
        onBindNfc={(passportCode) => setBindNfcPassportCode(passportCode)}
      />

      {/* Modal Gắn Chip NFC Vật Lý (Sprint 4) */}
      {bindNfcPassportCode && (
        <BindNfcModal
          isOpen={!!bindNfcPassportCode}
          onClose={() => setBindNfcPassportCode(null)}
          passportCode={bindNfcPassportCode}
          onSuccess={() => {
            alert('Đã gắn chip NFC thành công!');
          }}
        />
      )}
    </div>
  );
};
