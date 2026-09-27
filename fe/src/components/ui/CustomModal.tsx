import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{ borderRadius: '8px' }} // Bắt buộc bo góc 8px
      >
        {/* Header chiều cao cố định 56px */}
        <div 
          className="h-[56px] px-6 bg-heritage-paper border-b border-gray-200 flex items-center justify-between"
        >
          <h3 className="text-base font-sans font-bold text-heritage-indigo tracking-wide uppercase">
            {title}
          </h3>
          <button
            onClick={handleRequestClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] bg-[#f0f2f5]">
          {children}
        </div>
      </div>
    </div>
  );
};
