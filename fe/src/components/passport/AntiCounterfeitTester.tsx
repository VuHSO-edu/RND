import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, MapPin, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
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

  const handleSimulateScan = async (city: string, lat: number, lon: number, country: string) => {
    try {
      setSimulating(true);
      setAlertMessage(null);
      const res: any = await apiClient.post('/public/passports/scan', {
        passportCode,
        city,
        latitude: lat,
        longitude: lon,
        country
      });

      if (res.data?.status === 'FLAGGED_ANOMALY') {
        setAlertMessage(`🚨 CẢNH BÁO ĐỎ: Phát hiện lượt quét bất thường tại ${city}! Khoảng cách quá xa so với lần quét trước trong thời gian cực ngắn. Mã tem có nguy cơ bị nhân bản sao chép trái phép.`);
      } else {
        setAlertMessage(`✅ Lượt quét hợp lệ tại ${city}. Sản phẩm an toàn.`);
      }

      onScanCompleted();
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Lỗi mô phỏng');
    } finally {
      setSimulating(false);
    }
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
            <span>Thuật Toán Giám Sát Quét Mã Chống Hàng Giả</span>
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
          alertMessage.includes('CẢNH BÁO')
            ? 'bg-red-50 text-red-800 border border-red-200 animate-pulse'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Khu vực nút Test Giả Lập cho Ban Giám Khảo & Khách */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
        <span className="text-xs font-bold text-gray-700 block">
          🧪 Thử Nghiệm Thuật Toán Phát Hiện Vận Tốc Bất Khả Thi (Impossible Travel Velocity):
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={simulating}
            onClick={() => handleSimulateScan('Hà Nội (Xưởng Bát Tràng)', 20.9781, 105.9125, 'VN')}
            className="text-xs gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Quét Tại Hà Nội (Hợp Lệ)
          </Button>

          <Button
            variant="danger"
            size="sm"
            disabled={simulating}
            onClick={() => handleSimulateScan('TP. Hồ Chí Minh (Cách 1.150 km)', 10.8231, 106.6297, 'VN')}
            className="text-xs gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-yellow-300" />
            Quét Tại TP.HCM (Kích Hoạt Cảnh Báo Đỏ)
          </Button>

          <Button
            variant="danger"
            size="sm"
            disabled={simulating}
            onClick={() => handleSimulateScan('Paris, Pháp (Cách 9.200 km)', 48.8566, 2.3522, 'FR')}
            className="text-xs gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-yellow-300" />
            Quét Tại Paris (Cách 9.200 km)
          </Button>
        </div>
      </div>

      {/* Lịch sử vết quét (Audit Trail Table) */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
          Nhật ký vết quét định danh (Audit Logs gần nhất):
        </span>
        <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${log.isAnomaly ? 'text-red-500' : 'text-emerald-600'}`} />
                <div>
                  <span className="font-semibold text-gray-800">{log.city || 'Việt Nam'} ({log.country})</span>
                  <span className="text-gray-400 block text-[11px] font-mono">IP: {log.ipAddress} • {log.userAgent}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  log.isAnomaly ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {log.isAnomaly ? 'Bất thường (Fake)' : 'Chính hãng'}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
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
