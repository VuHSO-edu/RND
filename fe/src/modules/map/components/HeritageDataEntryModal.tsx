import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Sparkles, Layers, Landmark } from 'lucide-react';
import { CraftVillage, createVillage, createProduct } from '../../../services/heritageApi';
import { uploadImageToMinio } from '../../../services/storageApi';
import { HeritageModal } from '../../../components/ui/HeritageModal';
import { ImageUploadDropzone } from '../../../components/ui/ImageUploadDropzone';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MapCoordinatePicker } from './MapCoordinatePicker';

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
  const [isDirty, setIsDirty] = useState(false);

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
      setIsDirty(false);
      setProdName('');
      setProdSlug('');
      setVName('');
      setVSlug('');
      if (villages.length > 0) setVillageId(villages[0].id);
    }
  }, [isOpen, initialMode, villages]);

  const handleDropzoneFileReady = async (compressedFile: File) => {
    try {
      setIsDirty(true);
      setUploadingImage(true);
      setUploadPercent(0);
      const res = await uploadImageToMinio(compressedFile, (percent) => {
        setUploadPercent(percent);
      });
      setImageUrl(res.fileUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tải ảnh lên máy chủ MinIO');
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

      setIsDirty(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HeritageModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'PRODUCT' ? 'THÊM MỚI TÁC PHẨM DI SẢN' : 'THÊM MỚI LÀNG NGHỀ TRUYỀN THỐNG'}
      subtitle={mode === 'PRODUCT' ? 'Số hóa kiệt tác thủ công mỹ nghệ vào kho di sản' : 'Bổ sung nôi văn hóa làng nghề truyền thống vào bản đồ số'}
      isDirty={isDirty}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thanh chọn Tab kiểu thẻ hiện đại năng động */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('PRODUCT');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              mode === 'PRODUCT'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhập Tác Phẩm Di Sản</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('VILLAGE');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              mode === 'VILLAGE'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Nhập Làng Nghề Mới</span>
          </button>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {mode === 'PRODUCT' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên tác phẩm di sản"
                required
                placeholder="VD: Lục Bình Men Rạn Bát Tràng"
                value={prodName}
                onChange={(e) => {
                  setProdName(e.target.value);
                  setIsDirty(true);
                }}
                autoFocus
              />

              <Input
                label="Mã / Slug định danh"
                required
                placeholder="VD: luc-binh-men-ran"
                value={prodSlug}
                onChange={(e) => {
                  setProdSlug(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-sans font-semibold text-heritage-indigo">
                  Làng nghề chế tác
                </label>
                <select
                  value={villageId}
                  onChange={(e) => {
                    setVillageId(parseInt(e.target.value));
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border border-heritage-border bg-white text-heritage-indigo focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15 transition-all shadow-sm"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.province})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Giá tác phẩm (VNĐ)"
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setIsDirty(true);
                }}
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Chất liệu chế tác"
                value={material}
                placeholder="VD: Đất sét Trúc Thôn, men tro trấu"
                onChange={(e) => {
                  setMaterial(e.target.value);
                  setIsDirty(true);
                }}
              />

              <Input
                label="Kích thước tác phẩm"
                value={dimensions}
                placeholder="VD: Cao 68cm x Đường kính 28cm"
                onChange={(e) => {
                  setDimensions(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            {/* Tải ảnh MinIO tích hợp nén ảnh tối ưu 2000 CCU */}
            <ImageUploadDropzone
              onFileReady={handleDropzoneFileReady}
              previewUrl={imageUrl}
              isUploading={uploadingImage}
              uploadPercent={uploadPercent}
              onClearPreview={() => {
                setImageUrl('');
                setIsDirty(true);
              }}
              label="Hình ảnh tác phẩm (Lưu trữ MinIO S3)"
              helperText="Kéo thả hình ảnh tác phẩm vào đây hoặc bấm để chọn tệp"
            />

            <div className="space-y-1.5">
              <label className="text-[13px] font-sans font-semibold text-heritage-indigo">
                Hồn cốt & Mô tả tác phẩm
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Nét bút men chàm cổ truyền, ý niệm nghệ thuật của nghệ nhân..."
                className="w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border border-heritage-border bg-white text-heritage-indigo focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15 transition-all shadow-sm"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên làng nghề"
                required
                placeholder="VD: Làng Gốm Bát Tràng"
                value={vName}
                onChange={(e) => {
                  setVName(e.target.value);
                  setIsDirty(true);
                }}
                autoFocus
              />

              <Input
                label="Mã / Slug làng nghề"
                required
                placeholder="VD: lang-gom-bat-trang"
                value={vSlug}
                onChange={(e) => {
                  setVSlug(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-sans font-semibold text-heritage-indigo">
                  Vùng miền
                </label>
                <select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border border-heritage-border bg-white text-heritage-indigo focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15 transition-all shadow-sm"
                >
                  <option value="Bac_Bo">Đồng Bằng Bắc Bộ</option>
                  <option value="Trung_Bo">Duyên Hải Miền Trung</option>
                  <option value="Tay_Nguyen">Tây Nguyên</option>
                  <option value="Nam_Bo">Nam Bộ</option>
                </select>
              </div>

              <Input
                label="Tỉnh / Thành phố"
                value={province}
                placeholder="VD: Hà Nội"
                onChange={(e) => {
                  setProvince(e.target.value);
                  setIsDirty(true);
                }}
              />

              <Input
                label="Năm ước tính lập làng"
                type="number"
                value={foundingYear}
                onChange={(e) => {
                  setFoundingYear(e.target.value);
                  setIsDirty(true);
                }}
                className="text-right"
              />
            </div>

            {/* Chọn vị trí trực quan trên bản đồ để lấy Lat, Long */}
            <MapCoordinatePicker
              latitude={lat}
              longitude={lng}
              onChange={(newLat, newLng) => {
                setLat(String(newLat));
                setLng(String(newLng));
                setIsDirty(true);
              }}
              label="Chọn Vị Trí Làng Nghề Trên Bản Đồ"
              helperText="Nhấp chuột vào bản đồ nhỏ hoặc kéo ghim đỏ để cập nhật Vĩ độ và Kinh độ"
            />

            <div className="space-y-1.5">
              <label className="text-[13px] font-sans font-semibold text-heritage-indigo">
                Lịch sử khởi dựng & Di sản làng nghề
              </label>
              <textarea
                rows={3}
                value={vHistory}
                onChange={(e) => {
                  setVHistory(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Lịch sử lập làng, truyền tích các bậc tiền hiền khai sáng..."
                className="w-full px-3.5 py-2.5 text-[13px] font-sans rounded-xl border border-heritage-border bg-white text-heritage-indigo focus:border-heritage-red focus:ring-2 focus:ring-heritage-red/15 transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Thanh nút bấm hành động chuẩn: LƯU DỮ LIỆU và THOÁT */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 uppercase"
          >
            THOÁT
          </button>

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 uppercase"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{loading ? 'ĐANG LƯU...' : 'LƯU DỮ LIỆU'}</span>
          </button>
        </div>
      </form>
    </HeritageModal>
  );
};
