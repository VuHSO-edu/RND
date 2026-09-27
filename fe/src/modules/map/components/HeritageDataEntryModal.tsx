import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, UploadCloud } from 'lucide-react';
import { CraftVillage, createVillage, createProduct } from '../../../services/heritageApi';
import { uploadImageToMinio } from '../../../services/storageApi';

interface HeritageDataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  villages: CraftVillage[];
  initialMode?: 'PRODUCT' | 'VILLAGE';
}

export const HeritageDataEntryModal: React.FC<HeritageDataEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  villages,
  initialMode = 'PRODUCT'
}) => {
  const [mode, setMode] = useState<'PRODUCT' | 'VILLAGE'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fields cho Tác phẩm (PRODUCT)
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [villageId, setVillageId] = useState<number>(villages[0]?.id || 1);
  const [price, setPrice] = useState('4800000');
  const [material, setMaterial] = useState('Đất sét Cao Lanh, men tro trấu');
  const [dimensions, setDimensions] = useState('Cao 68cm x Đường kính 28cm');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/luc-binh-men-ran-bat-trang.jpg');

  // Fields cho Làng nghề (VILLAGE)
  const [vName, setVName] = useState('');
  const [vSlug, setVSlug] = useState('');
  const [region, setRegion] = useState('Bac_Bo');
  const [province, setProvince] = useState('Hà Nội');
  const [foundingYear, setFoundingYear] = useState('1352');
  const [lat, setLat] = useState('20.9781');
  const [lng, setLng] = useState('105.9125');
  const [vHistory, setVHistory] = useState('');

  // Upload ảnh state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setProdName('');
      setProdSlug('');
      setVName('');
      setVSlug('');
      if (villages.length > 0) setVillageId(villages[0].id);
    }
  }, [isOpen, initialMode, villages]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadPercent(0);
      const res = await uploadImageToMinio(file, (p) => setUploadPercent(p));
      setImageUrl(res.fileUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tải ảnh lên MinIO');
    } finally {
      setUploadingImage(false);
      setUploadPercent(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);

      if (mode === 'PRODUCT') {
        const cleanName = prodName.trim();
        const cleanSlug = prodSlug.trim().toLowerCase() || cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (!cleanName) {
          setErrorMsg('Vui lòng nhập Tên tác phẩm di sản');
          return;
        }

        await createProduct({
          name: cleanName,
          slug: cleanSlug,
          price: parseFloat(price) || 0,
          materialInfo: material.trim(),
          dimensions: dimensions.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          categoryId: 1
        });
      } else {
        const cleanVName = vName.trim();
        const cleanVSlug = vSlug.trim().toLowerCase() || cleanVName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (!cleanVName) {
          setErrorMsg('Vui lòng nhập Tên làng nghề di sản');
          return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
          setErrorMsg('Vĩ độ phải nằm trong khoảng [-90..90]');
          return;
        }
        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
          setErrorMsg('Kinh độ phải nằm trong khoảng [-180..180]');
          return;
        }

        await createVillage({
          name: cleanVName,
          slug: cleanVSlug,
          region,
          province: province.trim(),
          foundingYearEstimate: parseInt(foundingYear) || 1200,
          latitude: latNum,
          longitude: lngNum,
          historicalSummary: vHistory.trim()
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px cố định chuẩn quy tắc */}
        <div className="h-14 px-6 bg-[#1677ff] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/60">•</span>
            <h3 className="font-bold text-sm">
              {mode === 'PRODUCT' ? 'THÊM MỚI TÁC PHẨM DI SẢN' : 'THÊM MỚI LÀNG NGHỀ TRUYỀN THỐNG'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab chọn loại nhập liệu */}
        <div className="flex border-b bg-gray-100 text-xs font-bold px-6 pt-2">
          <button
            type="button"
            onClick={() => setMode('PRODUCT')}
            className={`py-2 px-4 rounded-t border-t border-x transition-all ${
              mode === 'PRODUCT' ? 'bg-white text-[#1677ff] border-gray-200 -mb-px' : 'text-gray-600 hover:text-black border-transparent'
            }`}
          >
            Nhập Tác phẩm Di sản
          </button>
          <button
            type="button"
            onClick={() => setMode('VILLAGE')}
            className={`py-2 px-4 rounded-t border-t border-x transition-all ${
              mode === 'VILLAGE' ? 'bg-white text-[#1677ff] border-gray-200 -mb-px' : 'text-gray-600 hover:text-black border-transparent'
            }`}
          >
            Nhập Làng nghề Mới
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#f0f2f5] text-[13px] max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'PRODUCT' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-1">
                    Tên tác phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Lục Bình Men Rạn Bát Tràng"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">
                    Mã/Slug định danh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: luc-binh-men-ran"
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-1">Làng nghề chế tác</label>
                  <select
                    value={villageId}
                    onChange={(e) => setVillageId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">Giá tác phẩm (VNĐ)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] text-right focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-1">Chất liệu chế tác</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">Kích thước</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>
              </div>

              {/* Tải ảnh tác phẩm lên MinIO */}
              <div>
                <label className="block text-black font-semibold mb-1">Hình ảnh tác phẩm (Lưu trữ MinIO)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded bg-white text-xs text-[#1677ff]"
                  />
                  <label className="px-4 py-2 rounded bg-white border border-[#1677ff] text-[#1677ff] hover:bg-blue-50 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingImage ? `${uploadPercent || 0}%...` : 'Tải ảnh MinIO'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Mô tả tác phẩm</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hồn cốt tác phẩm, nét bút men chàm cổ..."
                  className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-1">
                    Tên làng nghề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Làng Gốm Bát Tràng"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">
                    Mã/Slug làng nghề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: lang-gom-bat-trang"
                    value={vSlug}
                    onChange={(e) => setVSlug(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-1">Vùng miền</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  >
                    <option value="Bac_Bo">Bắc Bộ</option>
                    <option value="Trung_Bo">Trung Bộ</option>
                    <option value="Tay_Nguyen">Tây Nguyên</option>
                    <option value="Nam_Bo">Nam Bộ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">Tỉnh thành</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">Năm khởi lập</label>
                  <input
                    type="number"
                    value={foundingYear}
                    onChange={(e) => setFoundingYear(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] text-right focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-1">Vĩ độ (Latitude) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] text-right focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-black font-semibold mb-1">Kinh độ (Longitude) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] text-right focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Lịch sử khởi dựng &amp; di sản</label>
                <textarea
                  rows={2}
                  value={vHistory}
                  onChange={(e) => setVHistory(e.target.value)}
                  placeholder="Lịch sử lập làng, các bậc tiền hiền khai sáng..."
                  className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>
            </>
          )}

          {/* Form Buttons: Chuẩn 2 nút LƯU DỮ LIỆU và THOÁT */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-[13px] transition-colors"
            >
              THOÁT
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-[13px] flex items-center gap-2 shadow transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'ĐANG LƯU...' : 'LƯU DỮ LIỆU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
