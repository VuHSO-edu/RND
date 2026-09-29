/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          paper: '#FDFBF7',      // Nền giấy Dó cổ truyền
          surface: '#F5EFE6',    // Nền bề mặt thẻ card, modal
          border: '#E8DEC8',     // Viền mảnh ánh đồng tinh tế
          red: '#8B1E1E',        // Đỏ son / Chu sa (Màu nhấn CTA chính)
          hoverRed: '#731818',   // Đỏ son hover
          gold: '#C59A3F',       // Vàng đồng hoàng gia (Huy hiệu, điểm nhấn)
          hoverGold: '#B08832',  // Vàng đồng hover
          indigo: '#1C2D37',     // Chàm sẫm Thăng Long (Chữ chính & Header thay đen tuyền)
          subtext: '#687782',    // Xám tro dùng cho văn bản phụ
          success: '#2D6A4F',    // Xanh ngọc bích Celadon (Chứng thực, thành công)
          // Giữ các biến màu cũ để đảm bảo tính tương thích ngược:
          terracotta: '#C53030', // Đỏ gạch son đất nung
          celadon: '#2C7A7B',    // Xanh men ngọc
          brass: '#D69E2E',      // Vàng đồng cổ
          gray: '#F0F2F5',       // Xám nhạt nền form chuẩn
          dark: '#1C2D37'        // Đen trầm chàm
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Merriweather', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Merriweather', 'serif'],
      },
      boxShadow: {
        'heritage-card': '0 4px 20px -2px rgba(28, 45, 55, 0.06), 0 2px 6px -1px rgba(28, 45, 55, 0.03)',
        'heritage-modal': '0 25px 50px -12px rgba(28, 45, 55, 0.35)',
      },
      zIndex: {
        'modal-backdrop': '9990',
        'modal': '9999',
        'toast': '10000',
      }
    },
  },
  plugins: [],
}
