import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CreatePowerAssetRequest, OrgUnit } from '../../../services/gisApi';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreatePowerAssetRequest) => Promise<void>;
  orgUnits: OrgUnit[];
  defaultType?: string;
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orgUnits,
  defaultType = 'DEVICE'
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState(defaultType);
  const [unitCode, setUnitCode] = useState('');
  const [voltageLevel, setVoltageLevel] = useState('110kV');
  const [latitude, setLatitude] = useState('21.0285');
  const [longitude, setLongitude] = useState('105.8542');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setName('');
      setAssetType(defaultType);
      setUnitCode(orgUnits.length > 0 ? orgUnits[0].code : 'F01');
      setVoltageLevel('110kV');
      setLatitude('21.0285');
      setLongitude('105.8542');
      setNotes('');
      setErrorMsg('');
    }
  }, [isOpen, defaultType, orgUnits]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập Mã thiết bị/tài sản');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Vui lòng nhập Tên thiết bị/tài sản');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setErrorMsg('Vĩ độ (Latitude) phải nằm trong khoảng [-90..90]');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setErrorMsg('Kinh độ (Longitude) phải nằm trong khoảng [-180..180]');
      return;
    }

    try {
      setLoading(true);
      const selectedUnit = orgUnits.find((u) => u.code === unitCode);
      await onSuccess({
        code: cleanCode,
        name: cleanName,
        assetType,
        unitCode,
        unitName: selectedUnit ? selectedUnit.name : undefined,
        voltageLevel,
        latitude: latNum,
        longitude: lngNum,
        notes: notes.trim()
      });
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
        {/* Modal Header cố định 56px */}
        <div className="h-14 px-6 bg-[#1677ff] flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/60">•</span>
            <h3 className="font-bold text-sm">THÊM MỚI TÀI SẢN &amp; THIẾT BỊ LƯỚI ĐIỆN</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#f0f2f5] text-[13px]">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Mã thiết bị */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Mã thiết bị / Tài sản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: TEST2, DZ-110-01"
                autoFocus
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff] font-semibold"
              />
            </div>

            {/* Tên thiết bị */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Tên thiết bị / Tài sản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: TE, ĐZ 110kV Bắc Ninh"
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nhóm tài sản */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Nhóm tài sản <span className="text-red-500">*</span>
              </label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
              >
                <option value="UNIT">Đơn vị</option>
                <option value="LINE">Đường dây</option>
                <option value="DEVICE">Thiết bị</option>
              </select>
            </div>

            {/* Đơn vị quản lý */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Đơn vị quản lý
              </label>
              <select
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
              >
                {orgUnits.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Cấp điện áp */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Cấp điện áp
              </label>
              <select
                value={voltageLevel}
                onChange={(e) => setVoltageLevel(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
              >
                <option value="500kV">500kV</option>
                <option value="220kV">220kV</option>
                <option value="110kV">110kV</option>
                <option value="35kV">35kV</option>
                <option value="22kV">22kV</option>
              </select>
            </div>

            {/* Vĩ độ */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Vĩ độ (Lat) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] text-right focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
              />
            </div>

            {/* Kinh độ */}
            <div>
              <label className="block text-black font-semibold mb-1">
                Kinh độ (Lng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] text-right focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-black font-semibold mb-1">Ghi chú kỹ thuật</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thông số vận hành, chiều dài tuyến..."
              className="w-full px-3 py-2 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
            />
          </div>

          {/* Buttons Form: Chuẩn 2 nút LƯU DỮ LIỆU và THOÁT */}
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
