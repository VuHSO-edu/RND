import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, CheckCircle2, Compass } from 'lucide-react';

interface MapCoordinatePickerProps {
  latitude: number | string;
  longitude: number | string;
  onChange: (lat: number, lng: number) => void;
  label?: string;
  helperText?: string;
}

export const MapCoordinatePicker: React.FC<MapCoordinatePickerProps> = ({
  latitude,
  longitude,
  onChange,
  label = 'Chọn Vị Trí Trên Bản Đồ (Lấy Tọa Độ Tự Động)',
  helperText = 'Nhấp chuột vào bất cứ đâu trên bản đồ hoặc kéo ghim đỏ để lấy Vĩ độ & Kinh độ chính xác'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = parseFloat(String(latitude)) || 20.9781;
  const parsedLng = parseFloat(String(longitude)) || 105.9125;

  const [currentLat, setCurrentLat] = useState<number>(parsedLat);
  const [currentLng, setCurrentLng] = useState<number>(parsedLng);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Đồng bộ khi props thay đổi từ ngoài
  useEffect(() => {
    const lat = parseFloat(String(latitude));
    const lng = parseFloat(String(longitude));
    if (!isNaN(lat) && !isNaN(lng) && (lat !== currentLat || lng !== currentLng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  // Khởi tạo Mini Leaflet Map Picker
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = parseFloat(String(latitude)) || 20.9781;
    const initialLng = parseFloat(String(longitude)) || 105.9125;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true
    });

    // Bản đồ nền Google Maps chuẩn nét
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(map);

    // Ghim đỏ di sản có thể kéo thả (Draggable Marker)
    const pinIcon = L.divIcon({
      className: 'picker-heritage-pin',
      html: `
        <div style="
          background-color: #8B1E1E;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          cursor: grab;
        ">
          <div style="transform: rotate(45deg); font-size: 16px; font-weight: bold;">📍</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.bindTooltip('Kéo thả ghim đến đúng vị trí', { permanent: false, direction: 'top' });

    // Sự kiện khi KÉO THẢ GHIM
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newLat = parseFloat(pos.lat.toFixed(6));
      const newLng = parseFloat(pos.lng.toFixed(6));
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      onChange(newLat, newLng);
    });

    // Sự kiện khi NHẤP CHUỘT VÀO BẢN ĐỒ
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newLat = parseFloat(e.latlng.lat.toFixed(6));
      const newLng = parseFloat(e.latlng.lng.toFixed(6));
      marker.setLatLng([newLat, newLng]);
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      onChange(newLat, newLng);
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Đảm bảo Leaflet render đầy đủ kích thước khi nằm trong Modal
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Lấy vị trí GPS thực tế của người dùng
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ Geolocation.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setCurrentLat(lat);
        setCurrentLng(lng);
        onChange(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }
        setIsLocating(false);
      },
      (err) => {
        alert('Không thể lấy tọa độ GPS: ' + err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Tiêu đề & Hướng dẫn */}
      <div className="flex items-center justify-between">
        <label 
          className="font-bold text-[#000000] text-[13px] flex items-center gap-1.5" 
          style={{ fontFamily: 'Tahoma, sans-serif' }}
        >
          <Compass className="w-4 h-4 text-heritage-red" />
          <span>{label}</span>
          <span className="text-red-500">*</span>
        </label>
        
        {/* Nút bấm nhanh Lấy GPS hiện tại */}
        <button
          type="button"
          onClick={handleGetMyLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-heritage-indigo bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
        >
          <Crosshair className={`w-3.5 h-3.5 text-heritage-red ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Đang định vị...' : 'Vị trí GPS của tôi'}</span>
        </button>
      </div>

      <p className="text-[11px] text-gray-500 font-sans -mt-1">
        {helperText}
      </p>

      {/* Khung bản đồ chọn vị trí trực quan */}
      <div className="relative h-[220px] w-full rounded-2xl overflow-hidden border-2 border-heritage-border shadow-inner bg-stone-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Thanh chỉ dẫn nổi trên góc bản đồ */}
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-heritage-indigo shadow border border-heritage-border flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Nhấp bản đồ để đặt ghim</span>
        </div>
      </div>

      {/* Hiển thị tọa độ đã chọn tự động (Vĩ độ & Kinh độ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#000000]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
              Vĩ độ (Latitude) [-90..90]
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Đã lấy từ map
            </span>
          </div>
          <input
            type="number"
            step="any"
            required
            value={currentLat}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentLat(val);
              if (!isNaN(val)) onChange(val, currentLng);
            }}
            className="w-full px-3.5 py-2 text-[13px] rounded-xl border border-heritage-border bg-stone-50 text-[#1677ff] font-mono font-bold focus:bg-white focus:border-heritage-red"
            style={{ fontFamily: 'Tahoma, sans-serif' }}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#000000]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
              Kinh độ (Longitude) [-180..180]
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Đã lấy từ map
            </span>
          </div>
          <input
            type="number"
            step="any"
            required
            value={currentLng}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentLng(val);
              if (!isNaN(val)) onChange(currentLat, val);
            }}
            className="w-full px-3.5 py-2 text-[13px] rounded-xl border border-heritage-border bg-stone-50 text-[#1677ff] font-mono font-bold focus:bg-white focus:border-heritage-red"
            style={{ fontFamily: 'Tahoma, sans-serif' }}
          />
        </div>
      </div>
    </div>
  );
};
