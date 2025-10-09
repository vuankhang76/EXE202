import { 
  type OtpRequestDto, 
  type OtpVerifyDto, 
  type StaffLoginDto, 
  type AuthResponseDto,
  type ForgotPasswordRequestDto,
  type ResetPasswordDto,
  type AuthChangePasswordDto
} from '@/types/auth';

import { type ApiResponse } from '@/models/ApiResponse';
import { apiUtils } from '@/api/axios';

class AuthService {
  async requestOtp(phoneNumber: string, purpose: string = 'login'): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/request-otp', {
      phoneNumber,
      purpose
    } as OtpRequestDto);

    return response.data;
  }

  async verifyOtp(phoneNumber: string, otpCode: string, purpose: string = 'login'): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiUtils.post<ApiResponse<AuthResponseDto>>('/auth/verify-otp', {
      phoneNumber,
      otpCode,
      purpose
    } as OtpVerifyDto);

    return response.data;
  }

  async requestStaffOtp(phoneNumber: string, purpose: string = 'login'): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/staff/request-otp', {
      phoneNumber,
      purpose
    } as OtpRequestDto);

    return response.data;
  }

  async verifyStaffOtp(phoneNumber: string, otpCode: string, purpose: string = 'login'): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiUtils.post<ApiResponse<AuthResponseDto>>('/auth/staff/verify-otp', {
      phoneNumber,
      otpCode,
      purpose
    } as OtpVerifyDto);

    return response.data;
  }

  async staffLogin(email: string, password: string): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiUtils.post<ApiResponse<AuthResponseDto>>('/auth/staff/login', {
      email,
      password
    } as StaffLoginDto);

    return response.data;
  }

  async validateToken(token: string): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/validate-token', token);

    return response.data;
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/logout', {});

    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequestDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/forgot-password', data);

    return response.data;
  }

  async resetPassword(data: ResetPasswordDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/reset-password', data);

    return response.data;
  }

  async changePassword(data: AuthChangePasswordDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>('/auth/change-password', data);

    return response.data;
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  saveUser(user: any): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  getUser(): any | null {
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
  }

  removeUser(): void {
    localStorage.removeItem('auth_user');
  }
}

export default new AuthService();
