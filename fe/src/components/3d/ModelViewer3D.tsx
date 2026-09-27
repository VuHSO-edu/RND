import React, { useState } from 'react';
import { Box, Sparkles, ZoomIn, Eye, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ModelViewer3DProps {
  src?: string;
  poster?: string;
  alt?: string;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  src,
  poster = '/images/luc-binh-men-ran-bat-trang.jpg',
  alt = 'Lục Bình Men Rạn Bát Tràng - Cá Chép Vượt Vũ Môn'
}) => {
  const [viewMode, setViewMode] = useState<'artwork' | '3d'>('artwork');
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="relative w-full h-[520px] bg-gradient-to-b from-[#f5f1ea] to-[#e8e0d5] rounded-2xl overflow-hidden border border-heritage-indigo/15 flex items-center justify-center shadow-inner group">
      {/* Chế độ 1: Tác phẩm Lục Bình Men Rạn Chân Thực (Độ nét cao) */}
      {viewMode === 'artwork' ? (
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={poster}
            alt={alt}
            className={`max-h-[92%] object-contain transition-transform duration-500 rounded-lg drop-shadow-2xl ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
            }`}
          />
          
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-sans flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-heritage-brass" />
            <span>{isZoomed ? 'Nhấp để thu nhỏ' : 'Nhấp vào bình để phóng to chi tiết men rạn'}</span>
          </div>
        </div>
      ) : (
        /* Chế độ 2: Không gian 3D tương tác khi có file .glb */
        <model-viewer
          src={src && !src.includes('Astronaut') ? src : undefined}
          poster={poster}
          alt={alt}
          auto-rotate
          camera-controls
          ar
          ar-modes="webxr scene-viewer quick-look"
          shadow-intensity="1.5"
          exposure="1.2"
          style={{ width: '100%', height: '100%' }}
        >
          <div slot="ar-button" className="absolute bottom-4 right-4">
            <Button variant="artisan" className="text-xs min-h-[40px] px-4 py-2 gap-2 shadow-lg">
              <Sparkles className="w-4 h-4" />
              Bật AR Xem Trong Không Gian Thật
            </Button>
          </div>
        </model-viewer>
      )}

      {/* Top Controls: Huy hiệu di sản & Nút chuyển đổi */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-heritage-indigo flex items-center gap-2 shadow-sm border border-heritage-indigo/10">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Lục Bình Men Rạn Bát Tràng (Thế kỷ XIX)</span>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setViewMode(viewMode === 'artwork' ? '3d' : 'artwork')}
          className="bg-white/90 hover:bg-white backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-heritage-indigo shadow-sm border border-heritage-indigo/10 flex items-center gap-1.5 transition-colors"
        >
          {viewMode === 'artwork' ? (
            <>
              <Box className="w-3.5 h-3.5 text-heritage-terracotta" />
              <span>Chuyển chế độ 3D</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-heritage-indigo" />
              <span>Xem Ảnh Gốc Di Sản</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Tag */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <span className="bg-heritage-paper/90 backdrop-blur px-3 py-1 rounded-md text-[11px] font-serif text-heritage-indigo border border-heritage-brass/30 shadow-sm">
          Độc Bản • Tích Cá Chép Vượt Vũ Môn
        </span>
      </div>
    </div>
  );
};
