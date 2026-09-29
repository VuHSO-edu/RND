import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { authApi, AuthUserData, LoginPayload, RegisterPayload } from '../services/authApi';

interface AuthState {
  user: AuthUserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean; // Tránh lỗi Flash of Unauthorized Screen khi F5
  isSessionExpired: boolean; // Hết hạn phiên (401) khác với không có quyền (403)
  isForbidden: boolean; // Lỗi 403 khi cố tình can thiệp quyền
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isLoading: boolean;
  error: string | null;

  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  setSessionExpired: (expired: boolean) => void;
  setForbidden: (forbidden: boolean) => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  switchDevRole: (role: string) => void;
  initAuthRehydration: () => void;
}

const getStoredUser = (): AuthUserData | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: getStoredUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isAuthLoading: false,
    isSessionExpired: false,
    isForbidden: false,
    isAuthModalOpen: false,
    authModalMode: 'login',
    isLoading: false,
    error: null,

    initAuthRehydration: () => {
      // Rehydrate trạng thái xác thực từ localStorage khi người dùng F5
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('devRole');
      const storedUser = getStoredUser();

      // Nếu có devRole nhưng thông tin user chưa khớp hoặc bị lệch profile, tự động đồng bộ
      if (storedRole && (!storedUser || storedUser.role !== storedRole)) {
        get().switchDevRole(storedRole);
        return;
      }

      if (storedToken && storedUser) {
        set((state) => {
          state.token = storedToken;
          state.user = storedUser;
          state.isAuthenticated = true;
          state.isAuthLoading = false;
        });
      } else if (storedRole) {
        get().switchDevRole(storedRole);
      } else {
        set((state) => {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          state.isAuthLoading = false;
        });
      }
    },

    setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => {
      set((state) => {
        state.isAuthModalOpen = open;
        if (mode) {
          state.authModalMode = mode;
        }
        state.error = null;
      });
    },

    setSessionExpired: (expired: boolean) => {
      set((state) => {
        state.isSessionExpired = expired;
        if (expired) {
          state.isAuthModalOpen = true; // Mở modal đăng nhập nhanh ngay trên màn hình hiện tại
          state.authModalMode = 'login';
        }
      });
    },

    setForbidden: (forbidden: boolean) => {
      set((state) => {
        state.isForbidden = forbidden;
      });
    },

    login: async (payload: LoginPayload) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const response: any = await authApi.login(payload);
        const data: AuthUserData = response.data || response;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('devRole', data.role);
        localStorage.setItem('auth_user', JSON.stringify(data));

        set((state) => {
          state.user = data;
          state.token = data.token;
          state.isAuthenticated = true;
          state.isAuthModalOpen = false;
          state.isSessionExpired = false;
          state.isForbidden = false;
          state.isLoading = false;
        });
      } catch (err: any) {
        set((state) => {
          state.isLoading = false;
          state.error = err.message || 'Đăng nhập không thành công';
        });
        throw err;
      }
    },

    register: async (payload: RegisterPayload) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const response: any = await authApi.register(payload);
        const data: AuthUserData = response.data || response;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('devRole', data.role);
        localStorage.setItem('auth_user', JSON.stringify(data));

        set((state) => {
          state.user = data;
          state.token = data.token;
          state.isAuthenticated = true;
          state.isAuthModalOpen = false;
          state.isLoading = false;
        });
      } catch (err: any) {
        set((state) => {
          state.isLoading = false;
          state.error = err.message || 'Đăng ký không thành công';
        });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('devRole');
      localStorage.removeItem('auth_user');

      set((state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isSessionExpired = false;
        state.isForbidden = false;
      });
    },

    switchDevRole: (role: string) => {
      set((state) => {
        const roleProfiles: Record<string, { fullName: string; villageName: string; villageId: number; artisanId?: number }> = {
          ARTISAN: { fullName: 'Nghệ Nhân Ưu Tú Trần Độ', villageName: 'Làng Gốm Bát Tràng', villageId: 1, artisanId: 1 },
          VILLAGE_ADMIN: { fullName: 'Nguyễn Văn Hùng (Trưởng Ban Quản Lý)', villageName: 'Làng Gốm Bát Tràng', villageId: 1 },
          SUPER_ADMIN: { fullName: 'Cục Di Sản Văn Hóa Quốc Gia', villageName: 'Toàn Quốc', villageId: 0 },
          CUSTOMER: { fullName: 'Lê Minh Anh (Du khách)', villageName: 'Việt Nam', villageId: 0 }
        };

        const profile = roleProfiles[role] || { fullName: 'Người Dùng Di Sản', villageName: 'Việt Nam', villageId: 1 };

        state.user = {
          token: 'dev-token',
          tokenType: 'Bearer',
          userId: role === 'ARTISAN' ? 1 : role === 'VILLAGE_ADMIN' ? 2 : role === 'SUPER_ADMIN' ? 99 : 3,
          email: `${role.toLowerCase()}@heritage.vn`,
          phone: '0912345678',
          fullName: profile.fullName,
          role,
          status: 'ACTIVE',
          villageId: profile.villageId,
          villageName: profile.villageName,
          artisanId: profile.artisanId
        };
        state.token = 'dev-token';
        state.isAuthenticated = true;
        localStorage.setItem('devRole', role);
        localStorage.setItem('auth_user', JSON.stringify(state.user));
        state.isForbidden = false;
      });
    }
  }))
);
