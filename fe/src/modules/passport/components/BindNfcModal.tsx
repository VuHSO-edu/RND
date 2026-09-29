import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Smartphone, AlertCircle, CheckCircle, Copy, Cpu } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';

interface BindNfcModalProps {
  isOpen: boolean;
  onClose: () => void;
  passportCode: string;
  onSuccess: () => void;
}

export const BindNfcModal: React.FC<BindNfcModalProps> = ({
  isOpen,
  onClose,
  passportCode,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [nfcUid, setNfcUid] = useState('');
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  }, []);

  if (!isOpen) return null;

  // Quét Web NFC trên Android Chrome
  const handleScanWebNfc = async () => {
    if (!('NDEFReader' in window)) {
      alert('Trình duyệt không hỗ trợ Web NFC. Vui lòng nhập thủ công mã UID.');
      return;
    }

    try {
      setIsScanningNfc(true);
      setStatusMessage('Đang chờ chạm thẻ NFC vào mặt lưng điện thoại...');
      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        const serial = event.serialNumber;
        if (serial) {
          setNfcUid(serial.toUpperCase());
          setStatusMessage(`Đã đọc thành công UID: ${serial.toUpperCase()}`);
          setIsScanningNfc(false);
        }
      };

      ndef.onreadingerror = () => {
        setStatusMessage('Lỗi khi đọc thẻ NFC. Vui lòng thử lại!');
        setIsScanningNfc(false);
      };
    } catch (err: any) {
      setIsScanningNfc(false);
      setStatusMessage('Không thể kích hoạt NFC: ' + (err.message || 'Quyền bị từ chối'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfcUid.trim()) {
      alert('Vui lòng nhập hoặc quét mã chip NFC UID');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/passports/${passportCode}/bind-nfc`, {
        nfcTagUid: nfcUid.trim().toUpperCase()
      });
      alert('Gắn chip NFC vào Hộ chiếu di sản thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gắn chip NFC');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px Chuẩn BHTT */}
        <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between border-b border-heritage-brass/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">BHTT</span>
            <span className="text-white/40">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider">
              GẮN CHIP NFC VẬT LÝ VÀO HỘ CHIẾU
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-stone-50 p-3 rounded border text-xs text-gray-700 space-y-1">
            <div className="font-bold text-heritage-indigo">Hộ chiếu mục tiêu:</div>
            <div className="font-mono text-xs font-bold text-heritage-terracotta">{passportCode}</div>
          </div>

          {/* Phân nhánh hỗ trợ NFC */}
          {nfcSupported ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleScanWebNfc}
                disabled={isScanningNfc}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Smartphone className={`w-4 h-4 ${isScanningNfc ? 'animate-bounce' : ''}`} />
                <span>{isScanningNfc ? 'Đang chạm thẻ NFC...' : 'Chạm Thẻ NFC Vào Thiết Bị Để Quét UID'}</span>
              </button>
              {statusMessage && (
                <p className="text-[11px] text-emerald-700 font-semibold text-center">{statusMessage}</p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Trình duyệt (iOS Safari hoặc Desktop PC) không hỗ trợ Web NFC trực tiếp. Quý khách vui lòng nhập hoặc dán mã UID từ đầu đọc NFC chuyên dụng.
              </span>
            </div>
          )}

          {/* Ô nhập thủ công / Dán UID */}
          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Mã Chip NFC UID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value.toUpperCase())}
                placeholder="Ví dụ: 04:A2:3B:4C:5D:6E:7F"
                className="w-full h-10 px-3 font-mono text-[13px] text-[#1677ff] bg-stone-50 border border-gray-300 rounded focus:outline-none focus:border-[#1677ff]"
                required
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setNfcUid(text.trim().toUpperCase());
                  } catch (e) {
                    alert('Vui lòng cấp quyền dán Clipboard');
                  }
                }}
                className="absolute right-2 top-2 text-xs font-bold text-gray-500 hover:text-heritage-indigo px-2 py-1 bg-gray-200 rounded"
                title="Dán từ Clipboard"
              >
                Dán
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Hệ thống sẽ liên kết cố định định danh này vào mã Hộ chiếu di sản để chống làm giả vật lý.
            </p>
          </div>

          {/* 2-Button Rule: LƯU DỮ LIỆU & THOÁT */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 bg-white hover:bg-stone-100 transition-all uppercase"
            >
              THOÁT
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !nfcUid.trim()}
              className="px-6 py-2 bg-[#1677ff] hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-sm uppercase disabled:opacity-50"
            >
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU DỮ LIỆU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
