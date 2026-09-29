import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export const AppGlobalSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-heritage-paper flex flex-col items-center justify-center p-6 text-heritage-indigo select-none">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-pulse">
        {/* Biểu tượng Họa tiết Trống đồng / Men lam Di sản */}
        <div className="relative w-16 h-16 rounded-2xl bg-heritage-surface border-2 border-heritage-border flex items-center justify-center shadow-heritage-card">
          <Loader2 className="w-8 h-8 text-heritage-red animate-spin" />
          <Sparkles className="w-4 h-4 text-heritage-gold absolute top-1 right-1" />
        </div>

        <div>
          <h3 className="font-heading text-lg font-bold tracking-wide uppercase text-heritage-indigo">
            NỀN TẢNG DI SẢN LÀNG NGHỀ
          </h3>
          <p className="text-xs text-heritage-subtext mt-1 font-sans">
            Đang tải dữ liệu và xác thực danh tính an toàn...
          </p>
        </div>

        {/* Thanh tiến độ mờ */}
        <div className="w-40 h-1.5 bg-heritage-border/40 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-heritage-red to-heritage-gold rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
