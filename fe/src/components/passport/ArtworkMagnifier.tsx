import React, { useState, useRef } from 'react';
import { ZoomIn, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ArtworkMagnifierProps {
  mainImage: string;
  artworkName: string;
}

export const ArtworkMagnifier: React.FC<ArtworkMagnifierProps> = ({
  mainImage,
  artworkName
}) => {
  const [activeImage, setActiveImage] = useState(mainImage);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const galleryImages = [
    { src: mainImage, label: 'Toàn cảnh Lục Bình trên đôn gỗ' },
    { src: mainImage, label: 'Cận cảnh tích Cá Chép Vượt Vũ Môn' },
    { src: mainImage, label: 'Chi tiết men rạn ngà cổ truyền' },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const { top, left, width, height } = imgRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    if (x < 0 || y < 0 || x > width || y > height) {
      setShowMagnifier(false);
      return;
    }

    setShowMagnifier(true);
    setCursorPosition({ x, y });

    // Tính % vị trí zoom
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    setMagnifierPosition({ x: xPercent, y: yPercent });
  };

  return (
    <div className="space-y-4">
      {/* Khung ảnh chính có kính lúp soi chi tiết men rạn */}
      <div 
        className="relative h-[500px] w-full bg-gradient-to-b from-[#f9f7f2] via-[#efeae0] to-[#e4dcce] rounded-2xl overflow-hidden border border-heritage-brass/30 shadow-md flex items-center justify-center cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowMagnifier(false)}
      >
        <img
          ref={imgRef}
          src={activeImage}
          alt={artworkName}
          className="max-h-[92%] object-contain rounded-lg drop-shadow-2xl select-none"
        />

        {/* Kính lúp phóng đại (Magnifier Lens 2.5x) */}
        {showMagnifier && (
          <div
            className="absolute pointer-events-none w-48 h-48 rounded-full border-4 border-heritage-brass/80 shadow-2xl overflow-hidden z-20 bg-no-repeat"
            style={{
              top: `${cursorPosition.y - 96}px`,
              left: `${cursorPosition.x - 96}px`,
              backgroundImage: `url(${activeImage})`,
              backgroundSize: '350%',
              backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
            }}
          />
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Ảnh Di Sản Độ Nét Cao</span>
        </div>

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-heritage-indigo font-medium flex items-center gap-1.5 shadow-sm border border-heritage-indigo/10">
          <ZoomIn className="w-3.5 h-3.5 text-heritage-terracotta" />
          <span>Rê chuột trên ảnh để soi kính lúp từng đường rạn men tro</span>
        </div>
      </div>

      {/* Thư viện các góc chụp tác phẩm */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {galleryImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img.src)}
            className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all text-left ${
              activeImage === img.src
                ? 'bg-white border-heritage-terracotta ring-2 ring-heritage-terracotta/20 shadow-sm'
                : 'bg-white/60 hover:bg-white border-gray-200'
            }`}
          >
            <img src={img.src} alt={img.label} className="w-10 h-10 object-cover rounded-lg border" />
            <span className="font-medium text-gray-700 max-w-[140px] truncate">{img.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
