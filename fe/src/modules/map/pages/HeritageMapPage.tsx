import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Calendar, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Compass, 
  Tag, 
  ChevronRight,
  Layers,
  Plus,
  Users
} from 'lucide-react';
import { fetchVillages, CraftVillage } from '../../../services/heritageApi';
import { Button } from '../../../components/ui/Button';
import { HeritageDataEntryModal } from '../components/HeritageDataEntryModal';
import { UserManagementModal } from '../../gis/components/UserManagementModal';

// Mock danh sách bổ sung nếu backend chưa nạp kịp
const FALLBACK_VILLAGES: CraftVillage[] = [
  {
    id: 1,
    name: 'Làng Gốm Bát Tràng',
    slug: 'lang-gom-bat-trang',
    region: 'Bac_Bo',
    province: 'Hà Nội',
    historicalSummary: 'Làng gốm Bát Tràng hình thành từ thời nhà Lý (hơn 700 năm), nổi danh với dòng men lam, men rạn tam thái độc đáo được lưu giữ qua nhiều thế hệ.',
    foundingYearEstimate: 1352,
    latitude: 20.9781,
    longitude: 105.9125,
    coverImageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    name: 'Làng Lụa Vạn Phúc',
    slug: 'lang-lua-van-phuc',
    region: 'Bac_Bo',
    province: 'Hà Nội',
    historicalSummary: 'Làng nghề dệt lụa tơ tằm truyền thống hơn 1.000 năm tuổi, nổi tiếng với lụa vân mỏng nhẹ, hoa văn cung đình thanh nhã.',
    foundingYearEstimate: 1020,
    latitude: 20.9792,
    longitude: 105.7728,
    coverImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    name: 'Làng Đúc Đồng Ngũ Xã',
    slug: 'lang-duc-dong-ngu-xa',
    region: 'Bac_Bo',
    province: 'Hà Nội',
    historicalSummary: 'Nổi danh từ thế kỷ XVII với nghệ thuật đúc đồng liền khối tinh xảo, tiêu biểu là pho tượng Phật A Di Đà bằng đồng nguyên khối tại chùa Thần Quang.',
    foundingYearEstimate: 1620,
    latitude: 21.0445,
    longitude: 105.8398,
    coverImageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 4,
    name: 'Làng Tranh Dân Gian Đông Hồ',
    slug: 'lang-tranh-dong-ho',
    region: 'Bac_Bo',
    province: 'Bắc Ninh',
    historicalSummary: 'Di sản văn hóa phi vật thể quốc gia, in mộc bản trên giấy điệp tự nhiên quét bằng vỏ sò sò điệp óng ánh, gam màu chế từ tro rơm, hoa hòe, sỏi son.',
    foundingYearEstimate: 1550,
    latitude: 21.0967,
    longitude: 106.0961,
    coverImageUrl: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 5,
    name: 'Làng Đá Mỹ Nghệ Non Nước',
    slug: 'lang-da-non-nuoc',
    region: 'Trung_Bo',
    province: 'Đà Nẵng',
    historicalSummary: 'Nằm dưới chân ngọn Ngũ Hành Sơn huyền thoại hơn 400 năm, các nghệ nhân biến đá cẩm thạch nguyên khối thành tượng Phật và phù điêu sống động.',
    foundingYearEstimate: 1680,
    latitude: 16.0042,
    longitude: 108.2618,
    coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 6,
    name: 'Làng Gốm Chăm Bàu Trúc',
    slug: 'lang-gom-bau-truc',
    region: 'Nam_Bo',
    province: 'Ninh Thuận',
    historicalSummary: 'Một trong những làng gốm cổ xưa nhất Đông Nam Á được UNESCO ghi danh, nung lộ thiên bằng củi và rơm rạ, phụ nữ Chăm chuốt gốm đi giật lùi bằng đôi tay không bàn xoay.',
    foundingYearEstimate: 1150,
    latitude: 11.5173,
    longitude: 108.9567,
    coverImageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'
  }
];

// Danh sách sản phẩm tiêu biểu theo từng làng
const VILLAGE_PRODUCTS: Record<string, string[]> = {
  'lang-gom-bat-trang': ['Lục bình men rạn', 'Ấm chén tử sa', 'Bình hút lộc hoa lam'],
  'lang-lua-van-phuc': ['Lụa vân cung đình', 'Khăn lụa tơ tằm', 'Áo dài lụa tơ sen'],
  'lang-duc-dong-ngu-xa': ['Tượng đồng liền khối', 'Đỉnh hương trầm', 'Tranh đồng phong thủy'],
  'lang-tranh-dong-ho': ['Tranh Đám cưới chuột', 'Tranh Vinh hoa - Phú quý', 'Tranh Chăn trâu thổi sáo'],
  'lang-da-non-nuoc': ['Tượng Phật cẩm thạch', 'Kỳ lân trấn trạch', 'Vòng tay đá phong thủy'],
  'lang-gom-bau-truc': ['Bình gốm Chăm nung củi', 'Tượng Apsara đất nung', 'Tháp gốm nung khói']
};

export const HeritageMapPage: React.FC = () => {
  const { t } = useTranslation();
  const [villages, setVillages] = useState<CraftVillage[]>(FALLBACK_VILLAGES);
  const [selectedVillage, setSelectedVillage] = useState<CraftVillage>(FALLBACK_VILLAGES[0]);
  const [activeRegion, setActiveRegion] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  
  // Leaflet Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  // 1. Tải danh sách làng nghề từ API
  const loadVillages = () => {
    fetchVillages()
      .then((data) => {
        if (data && data.length > 0) {
          setVillages(data);
          setSelectedVillage(data[0]);
        }
      })
      .catch((err) => console.log('Sử dụng dữ liệu làng nghề tiêu biểu cục bộ:', err));
  };

  useEffect(() => {
    loadVillages();
  }, []);

  // 2. Khởi tạo Bản Đồ Tương Tác Leaflet (Google Maps & Vệ Tinh & OpenStreetMap)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Chỉ khởi tạo 1 lần

    // Khởi tạo bản đồ trung tâm Việt Nam
    const map = L.map(mapContainerRef.current, {
      center: [16.0042, 107.5], // Giữa Việt Nam
      zoom: 6,
      zoomControl: false, // Tắt zoom mặc định ở góc trên trái để không đè lên badge
      attributionControl: false, // Tắt thanh attribution thô ở góc dưới phải
      scrollWheelZoom: true, // Bật tính năng lăn chuột để phóng to / thu nhỏ bản đồ mượt mà
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 60
    });

    // Gọi invalidateSize sau khi DOM sẵn sàng để render chuẩn tọa độ
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Thêm nút Zoom ở góc dưới bên trái, tránh hoàn toàn va chạm giao diện
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // 1. Bản đồ Google Maps Chuẩn (Mặc định): Sáng đẹp, màu sắc rực rỡ, quen thuộc, 100% tiếng Việt
    const googleRoadmapLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(map);

    // 2. Google Maps Vệ tinh Hybrid (Ảnh vệ tinh sắc nét + Tên đường làng xã tiếng Việt)
    const googleHybridLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps Satellite',
      maxZoom: 20
    });

    // 3. Google Maps Địa hình (Terrain 3D phong cảnh non nước)
    const googleTerrainLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps Terrain',
      maxZoom: 20
    });

    // 4. Bản đồ OpenStreetMap (OSM) chuẩn
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    // 5. Bản đồ Chi tiết ESRI
    const esriStreetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    });

    // Thêm bộ chuyển đổi lớp bản đồ trực quan góc phải
    const baseMaps = {
      'Bản đồ Google Maps': googleRoadmapLayer,
      'Google Vệ tinh (Hybrid)': googleHybridLayer,
      'Google Địa hình (Terrain)': googleTerrainLayer,
      'Bản đồ OpenStreetMap': osmLayer,
      'Bản đồ Chi tiết ESRI': esriStreetLayer
    };
    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Cập nhật các Marker/Pin lên Bản Đồ với Popup Thông Tin Chi Tiết Phong Phú
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Xóa marker cũ
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Tạo icon Marker di sản đỏ son đặc sắc
    const customIcon = L.divIcon({
      className: 'custom-heritage-pin',
      html: `
        <div style="
          background-color: #C53030;
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); font-size: 15px; font-weight: bold;">🏺</div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    villages.forEach((v) => {
      const marker = L.marker([v.latitude, v.longitude], { icon: customIcon }).addTo(map);

      const regionName = v.region === 'Bac_Bo' ? 'Đồng Bằng Bắc Bộ' : v.region === 'Trung_Bo' ? 'Duyên Hải Miền Trung' : 'Nam Bộ';
      const age = v.foundingYearEstimate ? 2026 - v.foundingYearEstimate : 500;
      const products = VILLAGE_PRODUCTS[v.slug] ? VILLAGE_PRODUCTS[v.slug].slice(0, 3).join(', ') : 'Sản phẩm thủ công truyền thống';

      const popupHtml = `
        <div style="width: 280px; overflow: hidden; border-radius: 14px; font-family: 'Times New Roman', Times, serif; background: #ffffff;">
          ${v.coverImageUrl ? `
            <div style="position: relative; width: 100%; height: 120px; overflow: hidden; background: #cbd5e1;">
              <img src="${v.coverImageUrl}" alt="${v.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
              <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);"></div>
              <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(197, 48, 48, 0.95); color: #ffffff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                ✨ Di Sản Lâu Đời
              </span>
            </div>
          ` : ''}
          <div style="padding: 12px 14px 14px 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1A365D; line-height: 1.25;">${v.name}</h3>
            <p style="margin: 3px 0 6px 0; font-size: 11px; color: #718096; display: flex; align-items: center; gap: 3px;">
              📍 ${v.province} • ${regionName}
            </p>

            <div style="margin: 7px 0; padding: 6px 10px; background: #FBF9F5; border-left: 3px solid #C53030; border-radius: 4px;">
              <div style="font-size: 11px; font-weight: bold; color: #C53030;">
                Niên đại: Khởi lập ~${v.foundingYearEstimate} (Hơn ${age} năm)
              </div>
              <div style="font-size: 11px; color: #4A5568; margin-top: 3px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${v.historicalSummary || 'Làng nghề di sản truyền thống tiêu biểu của dân tộc.'}
              </div>
            </div>

            <div style="margin: 6px 0 10px 0; font-size: 11px; color: #4A5568; line-height: 1.35;">
              <strong style="color: #1A365D;">Tác phẩm tiêu biểu:</strong> ${products}
            </div>

            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}" 
                 target="_blank" 
                 rel="noreferrer"
                 style="flex: 1; text-align: center; font-size: 11px; font-weight: bold; background: #1A365D; color: #ffffff; padding: 7px 10px; border-radius: 6px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 6px rgba(26,54,93,0.25);">
                <span>📍 Chỉ đường</span>
              </a>
              <button onclick="document.getElementById('village-detail-card')?.scrollIntoView({ behavior: 'smooth' })"
                      style="font-size: 11px; font-weight: bold; background: #FFF5F5; color: #C53030; border: 1px solid #FEB2B2; padding: 7px 12px; border-radius: 6px; cursor: pointer;">
                Chi tiết ↓
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 290,
        minWidth: 270,
        className: 'heritage-custom-popup'
      });

      marker.on('click', () => {
        setSelectedVillage(v);
        marker.openPopup();
      });

      markersRef.current[v.id] = marker;
    });
  }, [villages]);

  // 4. Khi chọn một làng nghề từ cột trái -> Bản đồ tự động FlyTo đến tọa độ và mở Popup chi tiết
  const handleSelectVillage = (village: CraftVillage) => {
    setSelectedVillage(village);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([village.latitude, village.longitude], 14, {
        duration: 1.2
      });
      setTimeout(() => {
        const marker = markersRef.current[village.id];
        if (marker) {
          marker.openPopup();
        }
      }, 400);
    }
  };

  // 5. Bộ lọc chuẩn tiếng Việt có dấu
  const REGION_TABS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'Bac_Bo', label: 'Bắc Bộ' },
    { key: 'Trung_Bo', label: 'Trung Bộ' },
    { key: 'Tay_Nguyen', label: 'Tây Nguyên' },
    { key: 'Nam_Bo', label: 'Nam Bộ' }
  ];

  const filteredVillages = villages.filter((v) => {
    const matchRegion = activeRegion === 'ALL' || v.region === activeRegion;
    const matchKeyword = !searchKeyword.trim() || 
      v.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      v.province.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      v.historicalSummary.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchRegion && matchKeyword;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 font-serif">
      {/* Header Bản Đồ Số: Trình bày thoáng đãng 2 dòng, tránh ép chữ */}
      <div className="space-y-4 pb-4 border-b border-heritage-brass/30">
        <div>
          <span className="text-xs uppercase tracking-widest text-heritage-terracotta font-bold font-sans">
            Hệ Thống Địa Lý &amp; Không Gian Văn Hóa
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-heritage-indigo mt-1">
            Bản Đồ Số Làng Nghề Di Sản Việt Nam
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Khám phá trực quan các nôi văn hóa thủ công truyền thống qua bản đồ tương tác và định vị GPS thực tế
          </p>
        </div>

        {/* Thanh công cụ: Nút Nhập Liệu / Người Dùng & Bộ Lọc Vùng Miền */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-heritage-terracotta hover:bg-red-800 transition-all shadow-sm font-sans"
              title="Nhập liệu tác phẩm hoặc làng nghề mới"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nhập Liệu Di Sản</span>
            </button>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-heritage-indigo bg-white hover:bg-stone-100 transition-all border border-stone-300 shadow-sm font-sans"
              title="Quản lý danh sách người dùng và cấp quyền"
            >
              <Users className="w-4 h-4 text-heritage-indigo" />
              <span>Người Dùng</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
            {REGION_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveRegion(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRegion === tab.key
                    ? 'bg-heritage-indigo text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-heritage-indigo hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Cột Trái (Danh Sách & Tìm Kiếm) - Cột Phải (Bản Đồ Rộng Rãi & Thẻ Chi Tiết) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: Tìm kiếm & Danh mục Làng nghề */}
        <div className="lg:col-span-4 space-y-4">
          {/* Ô Tìm Kiếm Nhanh */}
          <div className="bg-white p-4 rounded-xl border border-heritage-indigo/15 shadow-sm space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm làng nghề, tỉnh thành..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-indigo text-heritage-indigo bg-stone-50"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans px-1">
              <span>Hiển thị <strong>{filteredVillages.length}</strong> / {villages.length} làng nghề</span>
              {searchKeyword && (
                <button onClick={() => setSearchKeyword('')} className="text-heritage-terracotta hover:underline">
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          </div>

          {/* Danh Sách Làng Nghề (Chiều cao đồng bộ với bản đồ) */}
          <div className="space-y-3 max-h-[520px] lg:max-h-[580px] overflow-y-auto pr-1">
            {filteredVillages.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border text-center text-gray-500 text-xs">
                Không tìm thấy làng nghề phù hợp với từ khóa "{searchKeyword}".
              </div>
            ) : (
              filteredVillages.map((village) => {
                const isSelected = selectedVillage?.id === village.id;
                return (
                  <div
                    key={village.id}
                    onClick={() => handleSelectVillage(village)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white border-heritage-terracotta shadow-md ring-2 ring-heritage-terracotta/20'
                        : 'bg-white/80 hover:bg-white border-gray-200 hover:border-heritage-indigo/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected ? 'bg-heritage-terracotta text-white shadow' : 'bg-stone-100 text-heritage-indigo'
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-heritage-indigo leading-tight">{village.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{village.province} • Lập nghề ~{village.foundingYearEstimate}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-heritage-terracotta translate-x-1' : 'text-gray-300'}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Bản Đồ Leaflet Tương Tác Kích Thước Lớn & Thẻ Thông Tin Chi Tiết */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. KHU VỰC BẢN ĐỒ TƯƠNG TÁC RỘNG RÃI */}
          <div className="bg-white p-2 rounded-2xl border border-heritage-indigo/15 shadow-sm overflow-hidden">
            <div className="relative h-[520px] lg:h-[580px] w-full rounded-xl overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full" />
              
              {/* Floating Map Overlay Info */}
              <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-heritage-indigo border border-heritage-indigo/15 shadow-md flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-heritage-terracotta" />
                <span>Bản Đồ Số Làng Nghề Di Sản • Nhấp ghim để xem thông tin chi tiết</span>
              </div>
            </div>
          </div>

          {/* 2. THẺ THÔNG TIN CHI TIẾT LÀNG NGHỀ ĐANG CHỌN */}
          {selectedVillage && (
            <div id="village-detail-card" className="bg-white rounded-2xl border border-heritage-indigo/15 shadow-sm p-6 md:p-8 space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs uppercase font-bold text-heritage-terracotta tracking-wider">
                    {selectedVillage.province} • {selectedVillage.region === 'Bac_Bo' ? 'Đồng Bằng Bắc Bộ' : selectedVillage.region === 'Trung_Bo' ? 'Duyên Hải Miền Trung' : 'Nam Bộ'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-heritage-indigo mt-0.5">
                    {selectedVillage.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Đã Số Hóa Di Sản
                  </span>
                </div>
              </div>

              {/* Lịch sử lập làng */}
              <div>
                <h4 className="text-xs uppercase font-bold text-heritage-terracotta tracking-wider mb-1.5">
                  Lịch Sử Khởi Dựng &amp; Hồn Cốt Nghề Cổ Truyền
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedVillage.historicalSummary}
                </p>
              </div>

              {/* Địa chỉ thực tế & Chỉ đường Google Maps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-500 block font-sans">Địa chỉ hành chính:</span>
                  <span className="font-bold text-heritage-indigo text-sm block">
                    {selectedVillage.province === 'Hà Nội' && selectedVillage.name.includes('Bát Tràng')
                      ? 'Xã Bát Tràng, Huyện Gia Lâm, Hà Nội'
                      : selectedVillage.name.includes('Vạn Phúc')
                      ? 'Phường Vạn Phúc, Quận Hà Đông, Hà Nội'
                      : `${selectedVillage.name}, ${selectedVillage.province}`}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVillage.latitude},${selectedVillage.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-heritage-terracotta hover:underline font-bold mt-1"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Chỉ đường trên Google Maps ↗
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 block font-sans">Thời gian khởi lập nghề:</span>
                  <span className="font-bold text-sm block">
                    Khoảng năm {selectedVillage.foundingYearEstimate} (Hơn {2026 - selectedVillage.foundingYearEstimate} năm)
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Tọa độ GPS: {selectedVillage.latitude.toFixed(4)}, {selectedVillage.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Tag Sản phẩm tiêu biểu của làng */}
              {VILLAGE_PRODUCTS[selectedVillage.slug] && (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-heritage-indigo" />
                    Các Tác Phẩm Tiêu Biểu Của Làng Nghề:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {VILLAGE_PRODUCTS[selectedVillage.slug].map((prodName, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-heritage-paper text-heritage-indigo text-xs font-semibold border border-heritage-brass/30 shadow-sm"
                      >
                        {prodName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút Call to Action */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="heritage" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Xem Các Tác Phẩm Của Làng
                </Button>
                <Button variant="secondary" className="gap-2">
                  <Calendar className="w-4 h-4 text-heritage-terracotta" />
                  Đặt Tour Trải Nghiệm Thực Tế
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nhập liệu Di sản / Làng nghề / Tác phẩm cho Client */}
      <HeritageDataEntryModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onSuccess={() => {
          setIsDataModalOpen(false);
          loadVillages();
        }}
        villages={villages}
      />

      {/* Modal Quản lý Người Dùng & Cấp Quyền */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </div>
  );
};
