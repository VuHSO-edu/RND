import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { compressImageClientSide } from '../../utils/imageCompressor';
import { useMediaLifecycle } from '../../hooks/useMediaLifecycle';

export interface ImageUploadDropzoneProps {
  onFileReady: (compressedFile: File) => void;
  previewUrl?: string;
  onClearPreview?: () => void;
  isUploading?: boolean;
  uploadPercent?: number | null;
  label?: string;
  helperText?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  onFileReady,
  previewUrl,
  onClearPreview,
  isUploading = false,
  uploadPercent = null,
  label = 'Tải ảnh tác phẩm di sản',
  helperText = 'Kéo thả hình ảnh tác phẩm vào đây hoặc bấm để chọn tệp'
}) => {
  const [compressing, setCompressing] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);
  const [fileStats, setFileStats] = useState<{ originalSize: string; compressedSize: string } | null>(null);

  // Hook quản lý và giải phóng bộ nhớ Blob/URL tự động
  const { createManagedUrl, revokeUrl } = useMediaLifecycle();

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setCompressing(true);
      const originalSizeStr = formatSize(file.size);

      // Tự động nén ảnh client-side về <= 1.5MB để tiết kiệm băng thông khi có 2000 CCU
      const compressed = await compressImageClientSide(file, 1.5, 1920);
      const compressedSizeStr = formatSize(compressed.size);

      setFileStats({
        originalSize: originalSizeStr,
        compressedSize: compressedSizeStr
      });

      // Giải phóng URL cũ nếu có trước khi tạo mới để tránh memory leak trên Safari/Android
      if (localPreview) {
        revokeUrl(localPreview);
      }

      // Tạo object URL xem trước tức thì qua Managed Hook
      const preview = createManagedUrl(compressed);
      setLocalPreview(preview);

      // Trả file đã nén cho component cha gọi API upload
      onFileReady(compressed);
    } catch (err) {
      console.error('Lỗi khi nén ảnh:', err);
      // Fallback dùng file gốc
      onFileReady(file);
    } finally {
      setCompressing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading || compressing,
    onDrop: handleDrop
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPreview) {
      revokeUrl(localPreview);
    }
    setLocalPreview(null);
    setFileStats(null);
    if (onClearPreview) onClearPreview();
  };

  const currentPreview = previewUrl || localPreview;

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-heritage-indigo">
          <span>{label}</span>
          {fileStats && (
            <span className="text-[11px] text-heritage-success font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Đã tối ưu: {fileStats.originalSize} ➔ {fileStats.compressedSize}
            </span>
          )}
        </div>
      )}

      {currentPreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-heritage-border bg-heritage-surface/40 p-2 group shadow-inner">
          <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-stone-900 flex items-center justify-center">
            <img
              src={currentPreview}
              alt="Xem trước tác phẩm"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />

            {/* Trạng thái Uploading / Tiến độ */}
            {isUploading && (
              <div className="absolute inset-0 bg-heritage-indigo/80 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 p-4">
                <Loader2 className="w-8 h-8 animate-spin text-heritage-gold" />
                <span className="text-xs font-bold tracking-wide">
                  ĐANG TẢI LÊN MINIO S3 {uploadPercent !== null ? `(${uploadPercent}%)` : ''}...
                </span>
                {uploadPercent !== null && (
                  <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-heritage-gold h-full transition-all duration-200"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Nút Xóa / Chọn ảnh khác */}
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-heritage-red transition-all shadow-md active:scale-95"
                title="Xóa ảnh và chọn lại"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-heritage-gold bg-heritage-gold/5 scale-[0.99]'
              : 'border-heritage-border hover:border-heritage-red/60 bg-heritage-surface/40 hover:bg-white'
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-13 h-13 rounded-2xl bg-heritage-surface flex items-center justify-center text-heritage-red shadow-sm border border-heritage-border">
              {compressing ? (
                <Loader2 className="w-6 h-6 animate-spin text-heritage-red" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-heritage-indigo">
                {compressing ? (
                  'Đang xử lý nén ảnh tối ưu...'
                ) : (
                  <>
                    {helperText.split('bấm để chọn tệp')[0]}
                    <span className="text-heritage-red underline underline-offset-2 hover:text-heritage-hoverRed">
                      bấm để chọn tệp
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-heritage-subtext">
                Hỗ trợ định dạng JPG, PNG, WEBP tối đa 10MB • Tự động nén tối ưu băng thông
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
