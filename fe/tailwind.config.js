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
          paper: '#FBF9F5',      // Màu giấy Dó ấm
          gray: '#F0F2F5',       // Xám nhạt nền form chuẩn
          indigo: '#1A365D',     // Xanh men lam cổ
          terracotta: '#C53030', // Đỏ gạch son đất nung
          celadon: '#2C7A7B',    // Xanh men ngọc
          brass: '#D69E2E',      // Vàng đồng cổ
          dark: '#1A202C'        // Đen trầm
        }
      },
      fontFamily: {
        times: ['"Times New Roman"', 'Times', 'serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
        sans: ['"Times New Roman"', 'Times', 'serif']
      }
    },
  },
  plugins: [],
}
