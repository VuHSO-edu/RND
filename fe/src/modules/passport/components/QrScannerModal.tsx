import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';
import jsQR from 'jsqr';
import { extractPassportCode, decodeQrFromImageFile } from '../utils/qrPassportHelper';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
  initialTab?: 'camera' | 'upload';
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  initialTab = 'camera'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>(initialTab);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  // Cập nhật tab khi modal mở
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDetectedCode(null);
      setFileError(null);
    }
  }, [isOpen, initialTab]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dừng camera stream
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Khởi động Camera stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setDetectedCode(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera trực tiếp.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestScanFrame();
      }
    } catch (err: any) {
      console.error('[QrScanner] Camera start error:', err);
      let msg = 'Không thể kết nối với Camera thiết bị.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Quyền truy cập Camera bị từ chối. Vui lòng cho phép Camera trong cài đặt trình duyệt hoặc chuyển sang tab Tải ảnh QR.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Không tìm thấy thiết bị Camera trên máy này.';
      }
      setCameraError(msg);
    }
  };

  // Vòng lặp quét từng khung hình từ Video qua Canvas & jsQR
  const requestScanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animFrameIdRef.current = requestAnimationFrame(requestScanFrame);
      return;
    }

    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        const passportCode = extractPassportCode(code.data);
        if (passportCode) {
          handleSuccessScan(passportCode);
          return; // Dừng vòng lặp quét
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(requestScanFrame);
  };

  // Xử lý khi nhận diện mã thành công
  const handleSuccessScan = (code: string) => {
    setDetectedCode(code);
    stopCamera();

    // Rung nhẹ trên thiết bị di động nếu hỗ trợ
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }

    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 600);
  };

  // Quản lý lifecycle camera theo trạng thái Modal & Tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  // Hỗ trợ dán ảnh từ Clipboard (Ctrl + V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Xử lý tệp hình ảnh được chọn hoặc kéo thả
  const processImageFile = async (file: File) => {
    setIsProcessingFile(true);
    setFileError(null);
    try {
      const code = await decodeQrFromImageFile(file);
      handleSuccessScan(code);
    } catch (err: any) {
      setFileError(err?.message || 'Không tìm thấy mã QR trong hình ảnh tải lên.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal Container: Bo góc 8px chuẩn quy tắc Antigravity Global */}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header 56px chuẩn BHTT */}
        <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/40">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-heritage-brass">
              QUÉT MÃ QR HỘ CHIẾU DI SẢN SỐ
            </span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-[13px] font-sans">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-heritage-indigo border-b-2 border-heritage-terracotta shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Camera className="w-4 h-4 text-heritage-terracotta" />
            <span>Quét Bằng Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-heritage-indigo border-b-2 border-heritage-terracotta shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Upload className="w-4 h-4 text-heritage-terracotta" />
            <span>Tải Ảnh QR Lên</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 bg-[#f0f2f5] space-y-4">
          {/* TAB 1: CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-square max-w-[360px] mx-auto bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-heritage-indigo/20">
                {/* Video Stream Element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Viewfinder Bounding Box & Animated Laser */}
                {!cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-56 h-56 border-2 border-dashed border-white/50 rounded-2xl flex items-center justify-center">
                      {/* 4 Góc màu son đỏ bảo chứng di sản */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-heritage-terracotta rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-heritage-terracotta rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-heritage-terracotta rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-heritage-terracotta rounded-br-lg" />

                      {/* Tia quét Laser đỏ chuyển động */}
                      <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_12px_#ff0000] animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Khi nhận diện mã thành công */}
                {detectedCode && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center animate-in zoom-in-95">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                    <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Đã nhận diện mã thành công!</span>
                    <span className="text-lg font-mono font-bold text-white mt-1">{detectedCode}</span>
                    <span className="text-[11px] text-emerald-200 mt-2">Đang tải hồ sơ Hộ chiếu số...</span>
                  </div>
                )}

                {/* Thông báo lỗi Camera */}
                {cameraError && (
                  <div className="absolute inset-0 bg-stone-900/90 p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-xs text-gray-200 max-w-xs leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-1.5 bg-white text-stone-900 rounded-lg text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                    </button>
                  </div>
                )}
              </div>

              {/* Thanh điều khiển Camera */}
              <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                <span>Hướng camera về phía tem QR trên sản phẩm</span>
                <button
                  type="button"
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-gray-300 rounded text-heritage-indigo font-bold flex items-center gap-1 shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Đổi Camera ({facingMode === 'environment' ? 'Sau' : 'Trước'})
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD QR IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-heritage-indigo hover:bg-stone-50/80 transition-colors rounded-xl p-8 text-center bg-white space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 bg-heritage-indigo/5 text-heritage-indigo rounded-full flex items-center justify-center mx-auto shadow-inner">
                  {isProcessingFile ? (
                    <div className="w-6 h-6 border-2 border-heritage-indigo border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-heritage-terracotta" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-heritage-indigo">
                    Nhấp để tải ảnh lên hoặc Kéo & Thả vào đây
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Hỗ trợ tệp PNG, JPG, JPEG, WEBP hoặc nhấn <strong>Ctrl + V</strong> để dán ảnh chụp màn hình
                  </p>
                </div>
              </div>

              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{fileError}</span>
                </div>
              )}

              {detectedCode && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Đã tìm thấy mã Hộ chiếu: <strong>{detectedCode}</strong>. Đang nạp dữ liệu...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nút thoát chuẩn quy tắc BHTT */}
          <div className="pt-3 flex items-center justify-end border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-6 py-2 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              THOÁT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
