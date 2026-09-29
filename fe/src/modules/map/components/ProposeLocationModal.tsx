import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Camera, X } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import { MapCoordinatePicker } from './MapCoordinatePicker';

interface ProposeLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLat?: number;
  initialLng?: number;
}

export const ProposeLocationModal: React.FC<ProposeLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLat = 21.0,
  initialLng = 105.8
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CHECKIN_POINT');
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [images, setImages] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLatitude(initialLat);
      setLongitude(initialLng);
    }
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/map/locations/propose', {
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: Number(latitude),
        longitude: Number(longitude),
        images: images.trim() || undefined
      });
      alert('Đề xuất điểm di sản thành công! Hệ thống đã tự động định tuyến theo bán kính quản trị.');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi đề xuất');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[85vh]"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px Chuẩn BHTT */}
        <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between border-b border-heritage-brass/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">BHTT</span>
            <span className="text-white/40">|</span>
            <span className="text-xs font-medium">ĐỀ XUẤT ĐIỂM DI SẢN &amp; CHECK-IN</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Tên địa điểm / Di tích <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cổng Làng Cổ Bát Tràng"
              className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Phân loại địa điểm <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="CHECKIN_POINT">📸 Điểm Check-in / Du lịch văn hóa</option>
              <option value="WORKSHOP">🔨 Xưởng Chế Tác Nghệ Nhân</option>
              <option value="HISTORICAL_SITE">🏛️ Di Tích Lịch Sử / Đình Đền</option>
              <option value="VILLAGE_OFFICIAL">🏛️ Cổng Làng / Biểu Tượng Làng Nghề</option>
            </select>
          </div>

          {/* Tọa độ PostGIS WGS84 chọn trên Bản Đồ */}
          <MapCoordinatePicker
            latitude={latitude}
            longitude={longitude}
            onChange={(newLat, newLng) => {
              setLatitude(newLat);
              setLongitude(newLng);
            }}
            label="Tọa độ PostGIS WGS84 (Chọn trên bản đồ)"
            helperText="Nhấp vào bản đồ hoặc kéo ghim đỏ để chọn vị trí chính xác. Hệ thống sẽ tự động đối chiếu hàm ST_DWithin với bán kính các làng nghề."
          />

          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Mô tả ý nghĩa di sản
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ nét đặc sắc, câu chuyện lịch sử của địa điểm..."
              className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Ảnh hiện trường (URL)
            </label>
            <input
              type="text"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* 2 Buttons chuẩn BHTT: "LƯU DỮ LIỆU" và "THOÁT" */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              THOÁT
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              LƯU DỮ LIỆU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
