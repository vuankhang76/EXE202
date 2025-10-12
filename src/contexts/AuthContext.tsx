import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '@/services/authService';
import patientAccountService from '@/services/patientAccountService';
import { toast } from 'sonner';
import type { AuthUser } from '@/types/auth';

type UserType = 'patient' | 'tenant';

interface LoginParams {
  email?: string;
  phone?: string;
  password: string;
  userType: UserType;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  userType: UserType | null;
  login: (params: LoginParams) => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const patientUser = patientAccountService.getUser();
    if (patientUser) return { ...patientUser, userId: String(patientUser.userId) };
    return authService.getUser();
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return patientAccountService.getToken() || authService.getToken();
  });
  
  const [userType, setUserType] = useState<UserType | null>(() => {
    if (patientAccountService.getToken()) return 'patient';
    if (authService.getToken()) return 'tenant';
    return null;
  });

  const login = async ({ email, phone, password, userType }: LoginParams) => {
    try {
      let result;
      if (userType === 'patient') {
        result = email 
          ? await patientAccountService.login({ email, password })
          : await patientAccountService.loginByPhone({ phoneE164: phone!, password });
      } else {
        result = await authService.staffLogin(email!, password);
      }

      if (!result.success || !result.data) {
        const errorMessage = result.message || 'Đăng nhập thất bại';
        toast.error('Đăng nhập thất bại', {
          description: errorMessage
        });
        throw new Error(errorMessage);
      }

      const { token: authToken, user } = result.data;
      
      if (userType === 'patient') {
        patientAccountService.saveAuth(authToken, user);
      } else {
        authService.saveToken(authToken);
        authService.saveUser(user);
      }

      setToken(authToken);
      setCurrentUser({ ...user, userId: String(user.userId) });
      setUserType(userType);

      toast.success(`Chào mừng ${user.fullName}!`, { description: 'Đăng nhập thành công' });
    } catch (err: any) {
      // Chỉ hiển thị toast nếu chưa có toast từ API interceptor
      if (!err.toastShown) {
        let errorTitle = 'Đăng nhập thất bại';
        let errorDescription = 'Vui lòng kiểm tra lại thông tin đăng nhập';

        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || err.response.data?.Message;

          if (status === 401) {
            errorTitle = 'Sai thông tin đăng nhập';
            errorDescription = message || 'Email/Số điện thoại hoặc mật khẩu không đúng';
          } else if (status === 404) {
            errorTitle = 'Tài khoản không tồn tại';
            errorDescription = message || 'Không tìm thấy tài khoản với thông tin này';
          } else if (status === 403) {
            errorTitle = 'Tài khoản bị khóa';
            errorDescription = message || 'Tài khoản của bạn đã bị vô hiệu hóa';
          } else if (status >= 500) {
            errorTitle = 'Lỗi hệ thống';
            errorDescription = 'Vui lòng thử lại sau';
          } else if (message) {
            errorDescription = message;
          }
        } else if (err.message && !err.message.includes('Đăng nhập thất bại')) {
          errorDescription = err.message;
        }

        toast.error(errorTitle, {
          description: errorDescription
        });
      }
      
      throw err;
    }
  };

  const requestOtp = async (phone: string) => {
    try {
      const result = await authService.requestStaffOtp(phone);
      if (!result.success) throw new Error(result.message || 'Không thể gửi OTP');
      toast.success('Mã OTP đã được gửi!', { description: `Kiểm tra tin nhắn tại ${phone}` });
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi gửi OTP');
      throw err;
    }
  };

  const verifyOtp = async (phone: string, otpCode: string) => {
    try {
      const result = await authService.verifyStaffOtp(phone, otpCode);
      if (!result.success) throw new Error(result.message || 'Xác thực OTP thất bại');

      const { token: authToken, user } = result.data!;
      authService.saveToken(authToken);
      authService.saveUser(user);
      setToken(authToken);
      setCurrentUser(user);
      setUserType('tenant');

      toast.success(`Chào mừng ${user.fullName}!`, { description: 'Xác thực OTP thành công' });
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi xác thực OTP');
      throw err;
    }
  };

  const validateToken = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const result = await authService.validateToken(token);
      return result.success;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      if (userType === 'patient') {
        patientAccountService.removeAuth();
      } else if (userType === 'tenant') {
        await authService.logout();
        authService.removeToken();
        authService.removeUser();
      }
    } catch (error) {
    } finally {
      setToken(null);
      setCurrentUser(null);
      setUserType(null);
      toast.success('Đăng xuất thành công');
    }
  };

  useEffect(() => {
    const check = async () => {
      if (token) {
        const valid = await validateToken();
        if (!valid) {
          await logout();
        }
      }
    };
    const timeout = setTimeout(check, 1000);
    return () => clearTimeout(timeout);
  }, [token]);

  return (
    <AuthContext.Provider value={{ currentUser, token, userType, login, requestOtp, verifyOtp, logout, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
}
