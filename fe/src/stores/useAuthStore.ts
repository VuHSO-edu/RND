import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { authApi, AuthUserData, LoginPayload, RegisterPayload } from '../services/authApi';

interface AuthState {
  user: AuthUserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isLoading: boolean;
  error: string | null;

  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  switchDevRole: (role: string) => void;
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
    isAuthModalOpen: false,
    authModalMode: 'login',
    isLoading: false,
    error: null,

    setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => {
      set((state) => {
        state.isAuthModalOpen = open;
        if (mode) {
          state.authModalMode = mode;
        }
        state.error = null;
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
      });
    },

    switchDevRole: (role: string) => {
      set((state) => {
        if (!state.user) {
          state.user = {
            token: 'dev-token',
            tokenType: 'Bearer',
            userId: 3,
            email: 'admin.battrang@heritage.vn',
            phone: '0912345678',
            fullName: 'Nguyễn Văn Hùng (Quản lý Làng)',
            role,
            status: 'ACTIVE',
            villageId: 7,
            villageName: 'Bat Trang New'
          };
          state.token = 'dev-token';
          state.isAuthenticated = true;
        } else {
          state.user.role = role;
        }
        localStorage.setItem('devRole', role);
        if (state.user) {
          localStorage.setItem('auth_user', JSON.stringify(state.user));
        }
      });
    }
  }))
);
