import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Save } from 'lucide-react';

export interface HeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  isDirty?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showFooter?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveLoading?: boolean;
  children: React.ReactNode;
}

export const HeritageModal: React.FC<HeritageModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  isDirty = false,
  maxWidth = 'xl',
  showFooter = false,
  onSave,
  saveLabel = 'LƯU DỮ LIỆU',
  cancelLabel = 'THOÁT',
  saveLoading = false,
  children
}) => {
  // Lắng nghe phím Esc để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty]);

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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-heritage-indigo/65 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Lớp nền mờ khi click ra ngoài */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRequestClose}
            className="fixed inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-heritage-paper rounded-2xl shadow-heritage-modal border border-heritage-border overflow-hidden z-10 my-8`}
          >
            {/* Header màu Đỏ Chu Sa cổ truyền sang trọng với chiều cao 56px */}
            <div className="min-h-[56px] px-6 py-3.5 bg-gradient-to-r from-heritage-red to-[#6E1414] text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-heritage-gold animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold tracking-wide uppercase text-white drop-shadow-sm flex items-center gap-2">
                    <span className="text-heritage-gold text-xs font-sans font-semibold tracking-widest">BHTT •</span>
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-xs text-white/80 mt-0.5 font-sans font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestClose}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-150 active:scale-95"
                title="Đóng hộp thoại (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung Form cuộn mềm mại với nền nhạt */}
            <div className="p-6 max-h-[75vh] overflow-y-auto text-heritage-indigo bg-heritage-surface/30">
              {children}
            </div>

            {/* Footer nút hành động tùy chọn */}
            {showFooter && (
              <div className="px-6 py-4 bg-heritage-surface/80 border-t border-heritage-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-5 py-2.5 rounded-xl border border-heritage-border text-[13px] font-semibold text-heritage-subtext hover:bg-white hover:text-heritage-indigo hover:border-heritage-indigo/30 transition-all duration-150 active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-heritage-red hover:bg-heritage-hoverRed text-white text-[13px] font-bold flex items-center gap-2 shadow-md shadow-heritage-red/25 hover:shadow-lg transition-all duration-150 disabled:opacity-50 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? 'ĐANG LƯU...' : saveLabel}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
