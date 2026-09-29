import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  }
});

// Request Interceptor: Luôn đính kèm Token và DevRole
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const devRole = localStorage.getItem('devRole');
  if (devRole) {
    config.headers['X-Dev-Role'] = devRole;
  }
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
});

// Response Interceptor: Xử lý tập trung mã lỗi 401 & 403
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    // 1. Lỗi 401 (Hết phiên làm việc / Token hết hạn):
    // Thay vì xóa sạch dữ liệu và văng ra ngoài, kích hoạt trạng thái Session Expired
    // để mở Modal Đăng Nhập Nhanh, bảo toàn form đang nhập dở
    if (status === 401) {
      console.warn('[Security] Token đã hết hạn. Kích hoạt đăng nhập nhanh bảo toàn dữ liệu.');
      useAuthStore.getState().setSessionExpired(true);
    }

    // 2. Lỗi 403 (Cố tình can thiệp quyền Client-side hoặc truy cập trái phép):
    // Ngay lập tức kích hoạt cờ Forbidden, chuyển hướng người dùng về màn hình 403
    // Ngăn chặn triệt để lỗi trắng trang khi giao diện render mà API trả về từ chối
    if (status === 403) {
      console.error('[Security Trap] Phát hiện truy cập không có thẩm quyền (403 Forbidden).');
      useAuthStore.getState().setForbidden(true);
    }

    return Promise.reject(error.response?.data || error.message || 'Lỗi kết nối máy chủ');
  }
);
