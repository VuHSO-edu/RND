import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  isDirty?: boolean;
  children: React.ReactNode;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title = 'BHTT', // Title mặc định của toàn bộ popup theo rule
  isDirty = false,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty]);

  if (!isOpen) return null;

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmExit = window.confirm('Dữ liệu đã bị thay đổi. Bạn có muốn thoát không?');
      if (confirmExit) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    // Z-Index nâng lên 9999 để không bao giờ bị Leaflet Map hoặc floating overlay đè lên
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1C2D37]/65 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-heritage-paper shadow-heritage-modal border border-heritage-border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{ borderRadius: '12px' }}
      >
        {/* Header chiều cao cố định 56px với tông màu Đỏ son / Chu sa trầm sang trọng */}
        <div 
          className="h-[56px] px-6 bg-gradient-to-r from-heritage-red to-[#6E1414] text-white flex items-center justify-between shrink-0 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-heritage-gold" />
            <h3 className="text-sm font-heading font-bold text-white tracking-wide uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={handleRequestClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng hộp thoại (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] bg-heritage-surface/40 text-heritage-indigo">
          {children}
        </div>
      </div>
    </div>
  );
};
