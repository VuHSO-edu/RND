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
  headerGradient?: string;
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
  headerGradient,
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

  const defaultGradient = headerGradient || 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600';

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
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

          {/* Modal Container Trẻ Trung, Hiện Đại, Bo Góc 3xl */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-6`}
          >
            {/* Header 56px Chuẩn BHTT Hiện Đại Năng Động */}
            <div className={`min-h-[56px] px-6 py-3.5 ${defaultGradient} text-white flex items-center justify-between shrink-0 shadow-sm border-b border-white/10`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold tracking-wide text-white drop-shadow-xs flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 uppercase tracking-widest text-amber-300">
                      BHTT
                    </span>
                    <span className="text-white/40">•</span>
                    <span>{title}</span>
                  </h3>
                  {subtitle && (
                    <p className="text-[11px] text-white/80 mt-0.5 font-sans font-normal line-clamp-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-95"
                title="Đóng hộp thoại (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung Form cuộn mềm mại với nền tinh gọn */}
            <div className="p-6 max-h-[75vh] overflow-y-auto text-slate-800 bg-white">
              {children}
            </div>

            {/* Footer nút hành động năng động */}
            {showFooter && (
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saveLoading}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" />
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
