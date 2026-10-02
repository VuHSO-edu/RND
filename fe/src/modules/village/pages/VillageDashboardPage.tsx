import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, CheckCircle2, AlertCircle, MapPin, Plus, Search, 
  UserCheck, UserX, Printer, Shield, Eye, RefreshCw, Sparkles,
  PackageCheck, Radio, Award, Phone, Clock, User, X, ChevronRight
} from 'lucide-react';
import { villageAdminApi, ArtisanItem, VillageStats } from '../../../services/villageAdminApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { apiClient } from '../../../services/apiClient';
import { BatchManagementModal } from '../../passport/components/BatchManagementModal';

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

      {/* MODAL 1: TẠO HỘ NGHỆ NHÂN CAO TUỔI (Proxy Artisan Modal - Trẻ Trung, Năng Động) */}
      {isProxyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[88vh] border border-slate-100">
            {/* Header 56px Chuẩn BHTT với Gradient Hiện Đại Năng Động */}
            <div className="h-14 min-h-[56px] px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between border-b border-white/10 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs tracking-wider uppercase text-amber-300">BHTT</span>
                    <span className="text-white/40">•</span>
                    <span className="text-sm font-bold tracking-wide">CẤP PHÁT TÀI KHOẢN NGHỆ NHÂN</span>
                  </div>
                  <p className="text-[11px] text-blue-100/90 hidden sm:block">
                    Tạo hồ sơ số hóa &amp; cấp thẻ bảo chứng cho nghệ nhân làng nghề
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProxyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-95"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdProxyResult ? (
              /* Thẻ Kết quả & In Mã Kích Hoạt */
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl text-emerald-900 text-center space-y-2 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-base font-bold text-emerald-950">TẠO TÀI KHOẢN ĐẠI DIỆN THÀNH CÔNG!</div>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Hồ sơ nghệ nhân đã được liên kết trực tiếp với Ban Quản Lý Làng Nghề và tự động kích hoạt trạng thái phê duyệt.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-dashed border-amber-300/80 rounded-2xl text-center space-y-3 relative overflow-hidden">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>MÃ KÍCH HOẠT / IN PHIẾU BẢO HỘ</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-rose-700 tracking-widest bg-white/80 py-2.5 px-4 rounded-xl border border-amber-200/60 inline-block shadow-inner">
                    {createdProxyResult.activationCode}
                  </div>
                  <div className="text-xs text-slate-600">
                    Nghệ nhân: <span className="font-bold text-slate-900">{createdProxyResult.fullName}</span> ({createdProxyResult.title})
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Printer className="w-4 h-4" /> In Phiếu Cấp
                  </button>
                  <button
                    onClick={() => {
                      setCreatedProxyResult(null);
                      setIsProxyModalOpen(false);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all"
                  >
                    HOÀN TẤT
                  </button>
                </div>
              </div>
            ) : (
              /* Form Nhập Liệu Trẻ Trung, Năng Động Chuẩn BHTT */
              <form onSubmit={handleCreateProxy} className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
                {/* Banner Chỉ dẫn Mini */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>Dành cho nghệ nhân cao tuổi chưa quen smartphone — Ban Quản Lý hỗ trợ đại diện 100%.</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200/80 text-blue-800 uppercase tracking-wide">
                    Ủy Quyền 1-Chạm
                  </span>
                </div>

                {/* Trường Họ Tên */}
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Họ và tên nghệ nhân <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">Tên trên giấy chứng nhận / CCCD</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proxyName}
                    onChange={(e) => setProxyName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Gốm"
                    className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                    style={{ fontSize: '15px' }}
                    autoFocus
                  />
                </div>

                {/* Danh hiệu & Năm Làm Nghề */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Danh hiệu / Chức danh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={proxyTitle}
                      onChange={(e) => setProxyTitle(e.target.value)}
                      placeholder="VD: Nghệ nhân Ưu tú"
                      className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                      style={{ fontSize: '15px' }}
                    />
                    {/* Quick Selection Chips Trẻ Trung */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {['Nghệ nhân Ưu tú', 'Nghệ nhân Nhân dân', 'Thợ Giỏi Làng Nghề', 'Nghệ Nhân Dân Gian'].map(title => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => setProxyTitle(title)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                            proxyTitle === title
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Năm thâm niên làm nghề
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="80"
                      value={proxyExperience}
                      onChange={(e) => setProxyExperience(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                      style={{ fontSize: '15px' }}
                    />
                    {/* Quick Year Chips */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[15, 25, 35, 50].map(yr => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setProxyExperience(yr)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                            proxyExperience === yr
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          {yr} năm
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Địa chỉ xưởng */}
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    Địa chỉ xưởng chế tác <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proxyAddress}
                    onChange={(e) => setProxyAddress(e.target.value)}
                    placeholder="VD: Số 18 Thôn 1 Làng Cổ Bát Tràng, Gia Lâm, Hà Nội"
                    className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                    style={{ fontSize: '15px' }}
                  />
                </div>

                {/* Kỹ thuật tinh hoa */}
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Kỹ thuật tinh hoa đặc trưng
                  </label>
                  <textarea
                    rows={2}
                    value={proxySkills}
                    onChange={(e) => setProxySkills(e.target.value)}
                    placeholder="VD: Vuốt tay men rạn cổ, phục dựng men hoàng tộc triều Nguyễn..."
                    className="w-full px-4 py-2 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                    style={{ fontSize: '14px' }}
                  />
                  {/* Quick Skill Tags */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {['Vuốt tay men rạn cổ', 'Gốm men lam truyền thống', 'Điêu khắc phù điêu nổi', 'Nung củi cổ truyền'].map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setProxySkills(proxySkills ? `${proxySkills}, ${skill}` : skill)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-all"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Số điện thoại liên hệ
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">Không bắt buộc nếu nghệ nhân không dùng ĐT</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={proxyPhone}
                    onChange={(e) => setProxyPhone(e.target.value)}
                    placeholder="0988xxxxxx (hoặc để trống)"
                    className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                    style={{ fontSize: '15px' }}
                  />
                </div>

                {/* 2 Buttons Chuẩn BHTT với Style Trẻ Trung Năng Động */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsProxyModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95"
                  >
                    THOÁT
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>LƯU DỮ LIỆU</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: THẨM ĐỊNH HỒ SƠ NGHỆ NHÂN (Review Modal Hiện Đại & Trẻ Trung) */}
      {isReviewModalOpen && selectedArtisan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
            {/* Header 56px Chuẩn BHTT */}
            <div className={`h-14 min-h-[56px] px-6 text-white flex items-center justify-between border-b border-white/10 shrink-0 shadow-sm ${
              reviewAction === 'APPROVED' 
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600' 
                : 'bg-gradient-to-r from-rose-600 via-red-600 to-pink-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-md">BHTT</span>
                <span className="text-white/40">•</span>
                <span className="text-sm font-bold tracking-wide">
                  {reviewAction === 'APPROVED' ? 'PHÊ DUYỆT HỒ SƠ NGHỆ NHÂN' : 'TỪ CHỐI HỒ SƠ NGHỆ NHÂN'}
                </span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Thẻ xem nhanh thông tin nghệ nhân */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[11px]">Hồ sơ thẩm định:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    ID #{selectedArtisan.id}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedArtisan.user?.fullName}</div>
                <div className="text-[#1677ff] font-semibold">{selectedArtisan.title}</div>
                <div className="text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span>{selectedArtisan.workshopAddress}</span>
                </div>
              </div>

              {reviewAction === 'REJECTED' && (
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Lý do từ chối <span className="text-red-500">* (Bắt buộc theo chuẩn BHTT)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Mô tả cụ thể lý do từ chối để nghệ nhân bổ sung hồ sơ..."
                    className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:bg-white transition-all shadow-xs"
                    style={{ fontSize: '14px' }}
                    autoFocus
                  />

                  {/* Gợi ý lý do 1 chạm cho di động */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Hồ sơ thiếu bằng khen hoặc danh hiệu làng nghề.',
                      'Địa chỉ xưởng chế tác nằm ngoài phạm vi địa giới làng.',
                      'Ảnh chứng thực tác phẩm chưa đúng quy cách.',
                      'Trùng lặp thông tin với nghệ nhân khác trong xưởng.'
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

              {reviewAction === 'APPROVED' && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Xác nhận phê duyệt nghệ nhân làng nghề
                  </p>
                  <p className="text-emerald-700 leading-relaxed">
                    Nghệ nhân sẽ được cấp quyền khai báo tác phẩm (SKU), xuất tem Hộ chiếu số và kích hoạt Ví điện tử xưởng tạo tác.
                  </p>
                </div>
              )}

              {/* 2 Buttons chuẩn BHTT */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  THOÁT
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  className={`px-6 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                    reviewAction === 'APPROVED' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25' 
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/25'
                  }`}
                >
                  {reviewAction === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{reviewAction === 'APPROVED' ? 'XÁC NHẬN DUYỆT' : 'XÁC NHẬN TỪ CHỐI'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Lô Xuất Xưởng & Merkle Root */}
      <BatchManagementModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        villageId={user?.villageId || 1}
        products={productsList}
      />
    </div>
  );
};
