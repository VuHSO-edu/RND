import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Search, 
  RotateCw, 
  Settings, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Layers,
  MapPin,
  SlidersHorizontal,
  Folder,
  Zap,
  Radio,
  Trash2,
  Maximize2
} from 'lucide-react';
import { 
  fetchOrgUnitTree, 
  fetchOrgUnits, 
  fetchPowerAssets, 
  fetchAssetCounts, 
  createPowerAsset,
  deletePowerAsset,
  OrgUnitTreeNode, 
  OrgUnit, 
  PowerAsset,
  CreatePowerAssetRequest 
} from '../../../services/gisApi';
import { DataEntryModal } from '../components/DataEntryModal';
import { UserManagementModal } from '../components/UserManagementModal';

export const GisWebMapPage: React.FC = () => {
  // Tree & Asset state
  const [treeData, setTreeData] = useState<OrgUnitTreeNode[]>([]);
  const [allUnits, setAllUnits] = useState<OrgUnit[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'F01': true,
    'F01A02': true,
    'F01D04': true
  });
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('F01');
  const [treeKeyword, setTreeKeyword] = useState<string>('');

  // Asset table state
  const [assetTab, setAssetTab] = useState<'UNIT' | 'LINE' | 'DEVICE'>('UNIT');
  const [assets, setAssets] = useState<PowerAsset[]>([]);
  const [assetKeyword, setAssetKeyword] = useState<string>('');
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({
    UNIT: 2,
    LINE: 9936,
    DEVICE: 15420
  });

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // 1. Tải cây đơn vị và danh sách đơn vị
  const loadTreeAndUnits = async () => {
    try {
      const [tree, units, counts] = await Promise.all([
        fetchOrgUnitTree(),
        fetchOrgUnits(),
        fetchAssetCounts()
      ]);
      setTreeData(tree);
      setAllUnits(units);
      if (counts && Object.keys(counts).length > 0) {
        setAssetCounts((prev) => ({ ...prev, ...counts }));
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu cây đơn vị:', err);
    }
  };

  // 2. Tải danh sách thiết bị theo tab
  const loadAssets = async () => {
    try {
      const res = await fetchPowerAssets({
        assetType: assetTab,
        unitCode: selectedUnitCode === 'F01' ? undefined : selectedUnitCode,
        keyword: assetKeyword,
        size: 50
      });
      setAssets(res.content);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tài sản/thiết bị:', err);
    }
  };

  useEffect(() => {
    loadTreeAndUnits();
  }, []);

  useEffect(() => {
    loadAssets();
  }, [assetTab, selectedUnitCode, assetKeyword]);

  // 3. Khởi tạo Bản đồ Leaflet (Google Maps Tiles)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.0285, 105.8542], // Trung tâm Hà Nội / Miền Bắc
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 60
    });

    // Google Maps Roadmap
    const googleRoadmap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20
    }).addTo(map);

    // Google Maps Satellite Hybrid
    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20
    });

    // Google Maps Terrain
    const googleTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20
    });

    // ESRI World Street
    const esriStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    const baseMaps = {
      'Bản đồ Google Maps': googleRoadmap,
      'Google Vệ tinh (Hybrid)': googleHybrid,
      'Google Địa hình (Terrain)': googleTerrain,
      'Bản đồ Chi tiết ESRI': esriStreet
    };
    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    // Zoom control ở góc dưới bên trái
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Cập nhật Markers trên bản đồ cho Đơn vị và Thiết bị
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Marker cho các đơn vị
    allUnits.forEach((u) => {
      if (!u.latitude || !u.longitude) return;

      const unitIcon = L.divIcon({
        className: 'custom-unit-pin',
        html: `
          <div style="
            background-color: #1677ff;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            <div style="transform: rotate(45deg); font-size: 12px; font-weight: bold;">⚡</div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([u.latitude, u.longitude], { icon: unitIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Tahoma, sans-serif; padding: 4px; max-width: 240px; font-size: 13px;">
          <h4 style="font-weight: bold; color: #1677ff; margin: 0 0 4px 0;">${u.code} - ${u.name}</h4>
          <p style="margin: 0 0 4px 0; color: #555; font-size: 12px;">Cấp: ${u.level} • Loại: ${u.type}</p>
          <p style="margin: 0 0 6px 0; color: #666; font-size: 11px;">${u.address || ''}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${u.latitude},${u.longitude}" 
             target="_blank" 
             style="display: inline-block; font-size: 11px; background-color: #1677ff; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none; font-weight: bold;">
             📍 Chỉ đường Google Maps
          </a>
        </div>
      `);

      markersRef.current[`unit_${u.code}`] = marker;
    });

    // Marker cho các tài sản / thiết bị
    assets.forEach((a) => {
      if (!a.latitude || !a.longitude) return;

      const isLine = a.assetType === 'LINE';
      const assetIcon = L.divIcon({
        className: 'custom-asset-pin',
        html: `
          <div style="
            background-color: ${isLine ? '#f59e0b' : '#10b981'};
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          ">
            <span style="font-size: 11px; font-weight: bold;">${isLine ? '〰' : '🔌'}</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([a.latitude, a.longitude], { icon: assetIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Tahoma, sans-serif; padding: 4px; max-width: 240px; font-size: 13px;">
          <h4 style="font-weight: bold; color: #1677ff; margin: 0 0 4px 0;">${a.name}</h4>
          <p style="margin: 0 0 4px 0; color: #555; font-size: 12px;">Mã: <strong>${a.code}</strong> • Loại: ${a.assetType}</p>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Điện áp: ${a.voltageLevel || 'N/A'}</p>
          <p style="margin: 0 0 6px 0; color: #888; font-size: 11px;">Đơn vị: ${a.unitName || a.unitCode || 'F01'}</p>
        </div>
      `);

      markersRef.current[`asset_${a.id}`] = marker;
    });
  }, [allUnits, assets]);

  // Click vào node trên cây đơn vị
  const handleSelectUnitNode = (node: OrgUnitTreeNode) => {
    setSelectedUnitCode(node.code);
    const map = mapInstanceRef.current;
    if (map && node.latitude && node.longitude) {
      map.flyTo([node.latitude, node.longitude], 12, { duration: 1.2 });
      const marker = markersRef.current[`unit_${node.code}`];
      if (marker) marker.openPopup();
    }
  };

  // Toggle node expand/collapse
  const toggleNodeExpand = (code: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Click vào dòng tài sản
  const handleSelectAssetRow = (asset: PowerAsset) => {
    const map = mapInstanceRef.current;
    if (map && asset.latitude && asset.longitude) {
      map.flyTo([asset.latitude, asset.longitude], 14, { duration: 1.2 });
      const marker = markersRef.current[`asset_${asset.id}`];
      if (marker) marker.openPopup();
    }
  };

  // Xóa tài sản
  const handleDeleteAsset = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài sản [${name}] không?`)) {
      try {
        await deletePowerAsset(id);
        loadAssets();
      } catch (err) {
        console.error('Lỗi khi xóa:', err);
      }
    }
  };

  // Lưu tài sản mới
  const handleSaveAsset = async (req: CreatePowerAssetRequest) => {
    await createPowerAsset(req);
    loadAssets();
    const counts = await fetchAssetCounts();
    setAssetCounts((prev) => ({ ...prev, ...counts }));
  };

  // Render đệ quy các node của Cây đơn vị
  const renderTreeNodes = (nodes: OrgUnitTreeNode[]) => {
    return nodes
      .filter((n) => !treeKeyword || n.label.toLowerCase().includes(treeKeyword.toLowerCase()))
      .map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes[node.code] ?? false;
        const isSelected = selectedUnitCode === node.code;

        return (
          <div key={node.code} className="select-none text-[13px]">
            <div 
              className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors group ${
                isSelected ? 'bg-blue-100 text-[#1677ff] font-bold' : 'hover:bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleSelectUnitNode(node)}
            >
              {hasChildren ? (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNodeExpand(node.code);
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded text-gray-500"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </span>
              ) : (
                <span className="w-3.5" />
              )}

              <span className="truncate leading-tight">
                {node.label}
              </span>
            </div>

            {/* Render con nếu được mở */}
            {hasChildren && isExpanded && (
              <div className="pl-4 border-l border-gray-200 ml-2 space-y-0.5 mt-0.5">
                {renderTreeNodes(node.children)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-hidden" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      {/* 1. Sub-Header Breadcrumb Bar */}
      <div className="h-10 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">Web map</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#1677ff] font-semibold">{selectedUnitCode} - {allUnits.find(u => u.code === selectedUnitCode)?.name || 'Tổng Công ty'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button 
            onClick={() => setIsUserModalOpen(true)}
            className="px-3 py-1 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            👥 Quản lý Người Dùng &amp; Nhập Data
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* CỘT TRÁI: CÂY ĐƠN VỊ & BẢNG THIẾT BỊ (THEO ẢNH USER) */}
        {!sidebarCollapsed && (
          <div className="w-[380px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
            {/* Top Filter Bar */}
            <div className="p-2.5 border-b border-gray-200 flex items-center gap-2 bg-[#f0f2f5]">
              <button 
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                title="Thu gọn bảng điều khiển"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nhập từ khoá tìm kiếm"
                  value={treeKeyword}
                  onChange={(e) => setTreeKeyword(e.target.value)}
                  className="w-full pl-2.5 pr-2 py-1.5 text-xs border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>
              <button className="p-1.5 rounded bg-white border hover:bg-gray-100 text-gray-600">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* KHU VỰC 1: CÂY ĐƠN VỊ (Chiếm 45% chiều cao) */}
            <div className="h-[46%] flex flex-col border-b border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-100 text-[13px]">
                <span className="font-bold text-black flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-[#1677ff]" />
                  Cây đơn vị
                </span>
                <button
                  onClick={loadTreeAndUnits}
                  className="px-2.5 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs text-gray-700 font-semibold flex items-center gap-1 shadow-2xs"
                >
                  <RotateCw className="w-3 h-3 text-gray-500" />
                  Tải lại
                </button>
              </div>

              {/* Danh sách cây cuộn mượt mà */}
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {renderTreeNodes(treeData)}
              </div>
            </div>

            {/* KHU VỰC 2: THIẾT BỊ THEO NHÓM TÀI SẢN (Chiếm phần còn lại) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-2.5 pb-1 space-y-2">
                <span className="font-bold text-black text-[13px] block">
                  Thiết bị theo nhóm tài sản
                </span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={assetKeyword}
                    onChange={(e) => setAssetKeyword(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 text-xs border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {/* Tabs: Đơn vị (2), Đường dây (9.936), Thiết bị (15.420) */}
              <div className="flex items-center justify-between px-2.5 border-b border-gray-200 text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAssetTab('UNIT')}
                    className={`py-2 font-bold transition-all relative ${
                      assetTab === 'UNIT' ? 'text-[#1677ff]' : 'text-gray-600 hover:text-[#1677ff]'
                    }`}
                  >
                    Đơn vị ({assetCounts.UNIT || 2})
                    {assetTab === 'UNIT' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]" />}
                  </button>

                  <button
                    onClick={() => setAssetTab('LINE')}
                    className={`py-2 font-bold transition-all relative ${
                      assetTab === 'LINE' ? 'text-[#1677ff]' : 'text-gray-600 hover:text-[#1677ff]'
                    }`}
                  >
                    Đường dây ({assetCounts.LINE || '9.936'})
                    {assetTab === 'LINE' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]" />}
                  </button>

                  <button
                    onClick={() => setAssetTab('DEVICE')}
                    className={`py-2 font-bold transition-all relative ${
                      assetTab === 'DEVICE' ? 'text-[#1677ff]' : 'text-gray-600 hover:text-[#1677ff]'
                    }`}
                  >
                    Thiết bị ({assetCounts.DEVICE || '15.420'})
                    {assetTab === 'DEVICE' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677ff]" />}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEntryModalOpen(true)}
                    className="p-1 rounded text-[#1677ff] hover:bg-blue-50 font-bold"
                    title="Thêm tài sản / thiết bị mới"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bảng Dữ Liệu Tên - Mã */}
              <div className="flex-1 overflow-y-auto text-[13px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-black text-left text-xs uppercase border-b">
                      <th className="p-2 pl-3 font-bold">Tên</th>
                      <th className="p-2 font-bold">Mã</th>
                      <th className="p-2 w-10 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-gray-400 text-xs">
                          Chưa có bản ghi nào. Bấm [+] để nhập dữ liệu mới.
                        </td>
                      </tr>
                    ) : (
                      assets.map((asset) => (
                        <tr 
                          key={asset.id}
                          onClick={() => handleSelectAssetRow(asset)}
                          className="hover:bg-blue-50/70 cursor-pointer border-b transition-colors group"
                        >
                          <td className="p-2 pl-3 font-semibold text-black group-hover:text-[#1677ff]">
                            {asset.name}
                          </td>
                          <td className="p-2 font-mono text-xs text-[#1677ff]">
                            {asset.code}
                          </td>
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDeleteAsset(asset.id, asset.name)}
                              className="text-gray-300 hover:text-red-500 p-1"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Nút mở lại sidebar nếu bị thu gọn */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="h-10 w-10 bg-white border-r border-b flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow"
            title="Mở bảng điều khiển"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* CỘT PHẢI: BẢN ĐỒ TƯƠNG TÁC TOÀN MÀN HÌNH (LEAFLET / GOOGLE MAPS) */}
        <div className="flex-1 relative overflow-hidden bg-stone-100">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Overlay chỉ dẫn */}
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-800 border border-gray-200 shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ Thống Bản Đồ Số Lưới Điện &amp; Cung Cấp Điện • Lăn chuột để phóng to/thu nhỏ</span>
          </div>
        </div>
      </div>

      {/* Modal Nhập Liệu Tài Sản / Thiết Bị */}
      <DataEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={handleSaveAsset}
        orgUnits={allUnits}
        defaultType={assetTab}
      />

      {/* Modal Quản Lý Người Dùng & Phân Quyền */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        orgUnits={allUnits}
      />
    </div>
  );
};
