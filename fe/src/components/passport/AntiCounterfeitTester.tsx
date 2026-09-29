import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, MapPin, Clock, AlertTriangle, RefreshCw, Crosshair, Wifi } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiClient } from '../../services/apiClient';

interface AntiCounterfeitTesterProps {
  passportCode: string;
  currentStatus: string;
  scanCount: number;
  onScanCompleted: () => void;
}

export const AntiCounterfeitTester: React.FC<AntiCounterfeitTesterProps> = ({
  passportCode,
  currentStatus,
  scanCount,
  onScanCompleted
}) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get(`/public/passports/${passportCode}/audit-logs`);
      setLogs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [passportCode, scanCount]);

  const handleScan = async (city: string, lat: number, lon: number, country: string, accuracyLevel: string, accuracyMeters?: number) => {
    try {
      setSimulating(true);
      setAlertMessage(null);
      const res: any = await apiClient.post(`/public/passports/${passportCode}/scan`, {
        passportCode,
        city,
        latitude: lat,
        longitude: lon,
        country,
        accuracyLevel,
        accuracyMeters
      });

      if (res.data?.status === 'BLOCKED_COUNTERFEIT' || res.data?.status === 'FLAGGED_ANOMALY') {
        setAlertMessage(`🚨 CẢNH BÁO ĐỎ: Phát hiện 2 lần quét liên tiếp có GPS chính xác cao với tốc độ bất khả thi tại ${city}! Hệ thống đã TỰ ĐỘNG KHÓA THẺ để chống nhân bản chip NFC.`);
      } else {
        const latestLog = logs[0];
        if (latestLog?.warningNote) {
          setAlertMessage(`⚠️ CẢNH BÁO PHÂN TẦNG: Vị trí quét tại ${city} có sai lệch nhưng xuất phát từ GeoIP mạng 4G/ISP. Hệ thống KHÔNG khóa thẻ của nghệ nhân.`);
        } else {
          setAlertMessage(`✅ Lượt quét hợp lệ tại ${city}. Hộ chiếu di sản hoạt động bình thường.`);
        }
      }

      onScanCompleted();
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi kiểm định vị trí quét');
    } finally {
      setSimulating(false);
    }
  };

  // Quét vị trí GPS thực tế của người dùng
  const handleRealGpsScan = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ Geolocation');
      return;
    }
    setSimulating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleScan(
          'Vị trí GPS thực tế',
          pos.coords.latitude,
          pos.coords.longitude,
          'VN',
          'GPS_HIGH_ACCURACY',
          pos.coords.accuracy
        );
      },
      (err) => {
        setSimulating(false);
        alert('Không thể lấy tọa độ GPS: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-heritage-indigo/10 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs uppercase font-bold text-heritage-terracotta tracking-wider">Hệ Thống Kiểm Định An Ninh</span>
          <h3 className="text-lg font-heritage font-bold text-heritage-indigo flex items-center gap-2">
            {currentStatus === 'ACTIVE' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
            )}
            <span>Thuật Toán Giám Sát Quét Mã Chống Hàng Giả (Tiered Geo-Velocity Guard)</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-sans">
            Tổng lượt quét: <strong className="text-heritage-indigo">{scanCount}</strong>
          </span>
          <Button variant="secondary" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Banner thông báo kết quả quét */}
      {alertMessage && (
        <div className={`p-4 rounded-xl text-xs font-sans font-medium flex items-center gap-3 ${
          alertMessage.includes('CẢNH BÁO ĐỎ')
            ? 'bg-red-50 text-red-800 border border-red-300 animate-pulse'
            : alertMessage.includes('CẢNH BÁO PHÂN TẦNG')
            ? 'bg-amber-50 text-amber-900 border border-amber-300'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Khu vực nút Test Giả Lập & Quét GPS Thực Tế */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
        <span className="text-xs font-bold text-gray-700 block">
          🧪 Thử Nghiệm Thuật Toán Phân Tầng Chống Giả (GPS vs GeoIP):
        </span>
        <div className="flex flex-wrap gap-2">
          {/* Nút Quét GPS thực tế */}
          <Button
            variant="heritage"
            size="sm"
            disabled={simulating}
            onClick={handleRealGpsScan}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            Quét GPS Thiết Bị Thực Tế
          </Button>

          {/* Test Case 1: GPS chuẩn tại làng nghề */}
          <Button
            variant="secondary"
            size="sm"
            disabled={simulating}
            onClick={() => handleScan('Làng Bát Tràng (Hà Nội)', 20.9781, 105.9125, 'VN', 'GPS_HIGH_ACCURACY', 15)}
            className="text-xs gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            1. GPS Chuẩn Tại Xưởng
          </Button>

          {/* Test Case 2: 2 lần GPS chính xác cao ở 2 miền trong 1 giây -> Khóa đỏ */}
          <Button
            variant="danger"
            size="sm"
            disabled={simulating}
            onClick={() => handleScan('TP. Hồ Chí Minh (Cách 1.150 km)', 10.8231, 106.6297, 'VN', 'GPS_HIGH_ACCURACY', 20)}
            className="text-xs gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
            2. GPS Bất Khả Thi (Khóa Thẻ)
          </Button>

          {/* Test Case 3: GeoIP lệch do trạm phát 4G/VPN -> Cảnh báo nhưng KHÔNG khóa */}
          <Button
            variant="secondary"
            size="sm"
            disabled={simulating}
            onClick={() => handleScan('Trạm BTS 4G Viettel (Đà Nẵng)', 16.0544, 108.2022, 'VN', 'GEOIP_LOW_ACCURACY', 50000)}
            className="text-xs gap-1.5 text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
          >
            <Wifi className="w-3.5 h-3.5 text-amber-600" />
            3. GeoIP Lệch (Chỉ Cảnh Báo, Không Khóa)
          </Button>
        </div>
      </div>

      {/* Lịch sử vết quét (Audit Trail Table) */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
          Nhật ký vết quét định danh phân tầng (Audit Logs):
        </span>
        <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${log.isAnomaly ? 'text-red-500' : 'text-emerald-600'}`} />
                <div>
                  <span className="font-semibold text-gray-800">{log.city || 'Việt Nam'} ({log.country})</span>
                  <div className="text-gray-400 text-[11px] font-mono flex items-center gap-2">
                    <span>Độ chính xác: <strong>{log.accuracyLevel || 'GPS_HIGH_ACCURACY'}</strong></span>
                    {log.accuracyMeters && <span>(±{Math.round(log.accuracyMeters)}m)</span>}
                  </div>
                  {log.warningNote && (
                    <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                      ⚠️ {log.warningNote}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  log.isAnomaly 
                    ? 'bg-red-100 text-red-800' 
                    : log.warningNote 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {log.isAnomaly ? 'Đã Khóa Giả Mạo' : log.warningNote ? 'Nghi vấn GeoIP' : 'Hợp Lệ'}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                  {new Date(log.scannedAt).toLocaleTimeString('vi-VN')} {new Date(log.scannedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
