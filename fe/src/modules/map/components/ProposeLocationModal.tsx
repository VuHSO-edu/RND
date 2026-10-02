import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Camera, X, Sparkles, Save, CheckCircle2 } from 'lucide-react';
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

  const CATEGORIES = [
    { id: 'CHECKIN_POINT', label: '📸 Điểm Check-in', desc: 'Du lịch văn hóa' },
    { id: 'WORKSHOP', label: '🔨 Xưởng Chế Tác', desc: 'Nghệ nhân ưu tú' },
    { id: 'HISTORICAL_SITE', label: '🏛️ Di Tích Lịch Sử', desc: 'Đình, đền, chùa' },
    { id: 'VILLAGE_OFFICIAL', label: '⛩️ Cổng Làng Nghề', desc: 'Biểu tượng di sản' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[88vh] border border-slate-100"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px Chuẩn BHTT Hiện Đại Năng Động */}
        <div className="h-14 min-h-[56px] px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between border-b border-white/10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-amber-300">BHTT</span>
                <span className="text-white/40">•</span>
                <span className="text-sm font-bold tracking-wide">ĐỀ XUẤT ĐIỂM DI SẢN &amp; CHECK-IN</span>
              </div>
              <p className="text-[11px] text-blue-100/90 hidden sm:block">
                Gợi ý điểm đến văn hóa để cộng đồng và ban quản lý phê duyệt
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
          <div>
            <label className="block text-[13px] font-bold text-black mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Tên địa điểm / Di tích văn hóa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cổng Làng Cổ Bát Tràng, Lò Bầu Cổ..."
              className="w-full px-4 py-2.5 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-black mb-2">
              Phân loại địa điểm di sản <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    category === cat.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{cat.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
              ))}
            </div>
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
            <label className="block text-[13px] font-bold text-black mb-1.5">
              Mô tả ý nghĩa di sản
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ nét đặc sắc, câu chuyện lịch sử hoặc trải nghiệm thú vị..."
              className="w-full px-4 py-2 text-[#1677ff] font-semibold bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-black mb-1.5">
              Ảnh hiện trường (URL hình ảnh)
            </label>
            <input
              type="text"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 text-[#1677ff] bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
            />
          </div>

          {/* 2 Buttons chuẩn BHTT: "LƯU DỮ LIỆU" và "THOÁT" */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
            >
              THOÁT
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[13px] font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'ĐANG GỬI...' : 'LƯU DỮ LIỆU'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
