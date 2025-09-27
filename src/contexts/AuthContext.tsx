import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '@/services/authService';
import type { AuthUser } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  staffLogin: (email: string, password: string) => Promise<void>;
  requestStaffOtp: (phoneNumber: string) => Promise<void>;
  verifyStaffOtp: (phoneNumber: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return authService.getUser();
  });
  const [token, setToken] = useState<string | null>(() => {
    return authService.getToken();
  });

  const staffLogin = async (email: string, password: string) => {
    try {
      const result = await authService.staffLogin(email, password);
      if (!result.success) {
        throw new Error(result.message || 'Đăng nhập thất bại');
      }

      const { token: authToken, user } = result.data!;
      
      authService.saveToken(authToken);
      authService.saveUser(user);
      setToken(authToken);
      setCurrentUser(user);
      
      toast.success(`Chào mừng ${user.fullName}!`, {
        description: 'Đăng nhập thành công'
      });
    } catch (error: any) {
      throw new Error(error.message || 'Có lỗi xảy ra khi đăng nhập');
    }
  };


  const requestStaffOtp = async (phoneNumber: string) => {
    try {
      const result = await authService.requestStaffOtp(phoneNumber);
      if (!result.success) {
        throw new Error(result.message || 'Không thể gửi OTP');
      }
      
      toast.success('Mã OTP đã được gửi!', {
        description: `Kiểm tra tin nhắn tại số ${phoneNumber}`
      });
    } catch (error: any) {
      throw new Error(error.message || 'Có lỗi xảy ra khi gửi OTP');
    }
  };

  const verifyStaffOtp = async (phoneNumber: string, otpCode: string) => {
    try {
      const result = await authService.verifyStaffOtp(phoneNumber, otpCode);
      if (!result.success) {
        throw new Error(result.message || 'Xác thực OTP thất bại');
      }

      const { token: authToken, user } = result.data!;
      
      authService.saveToken(authToken);
      authService.saveUser(user);
      setToken(authToken);
      setCurrentUser(user);
      
      toast.success(`Chào mừng ${user.fullName}!`, {
        description: 'Xác thực OTP thành công'
      });
    } catch (error: any) {
      throw new Error(error.message || 'Có lỗi xảy ra khi xác thực OTP');
    }
  };

  const validateToken = async (): Promise<boolean> => {
    try {
      const currentToken = token || authService.getToken();
      if (!currentToken) return false;

      const result = await authService.validateToken(currentToken);
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      authService.removeToken();
      authService.removeUser();
      setToken(null);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const backgroundValidation = async () => {
      if (token) {
        const isValid = await validateToken();
        if (!isValid) {
          authService.removeToken();
          authService.removeUser();
          setToken(null);
          setCurrentUser(null);
        }
      }
    };

    const timeoutId = setTimeout(backgroundValidation, 1000);
    return () => clearTimeout(timeoutId);
  }, [token]);

  const value: AuthContextType = {
    currentUser,
    token,
    staffLogin,
    requestStaffOtp,
    verifyStaffOtp,
    logout,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
