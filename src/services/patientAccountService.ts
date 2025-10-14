import { 
  type PatientAccountRegisterDto,
  type PatientAccountLoginDto,
  type PatientAccountLoginByPhoneDto,
  type PatientAccountResponseDto,
  type PatientAccountUpdateDto,
  type PatientAccountChangePasswordDto,
  type PatientAccountForgotPasswordDto,
  type PatientAccountResetPasswordDto,
  type PatientAccountVerifyOtpDto,
  type PatientAuthResponseDto
} from '@/types/patientAccount';

import { type ApiResponse } from '@/models/ApiResponse';
import { apiUtils } from '@/api/axios';

class PatientAccountService {
  private readonly baseUrl = '/patientaccounts';

  /**
   * Đăng ký tài khoản Patient mới
   */
  async register(data: PatientAccountRegisterDto): Promise<ApiResponse<PatientAccountResponseDto>> {
    const response = await apiUtils.post<ApiResponse<PatientAccountResponseDto>>(
      `${this.baseUrl}/register`,
      data
    );
    return response.data;
  }

  /**
   * Đăng nhập bằng Email/Password
   */
  async login(data: PatientAccountLoginDto): Promise<ApiResponse<PatientAuthResponseDto>> {
    const response = await apiUtils.post<ApiResponse<PatientAuthResponseDto>>(
      `${this.baseUrl}/login`,
      data
    );
    return response.data;
  }

  /**
   * Đăng nhập bằng Phone/Password
   */
  async loginByPhone(data: PatientAccountLoginByPhoneDto): Promise<ApiResponse<PatientAuthResponseDto>> {
    const response = await apiUtils.post<ApiResponse<PatientAuthResponseDto>>(
      `${this.baseUrl}/login-by-phone`,
      data
    );
    return response.data;
  }

  /**
   * Lấy thông tin tài khoản theo AccountId
   */
  async getByAccountId(accountId: number): Promise<ApiResponse<PatientAccountResponseDto>> {
    const response = await apiUtils.get<ApiResponse<PatientAccountResponseDto>>(
      `${this.baseUrl}/${accountId}`
    );
    return response.data;
  }

  /**
   * Lấy thông tin tài khoản theo PatientId
   */
  async getByPatientId(patientId: number): Promise<ApiResponse<PatientAccountResponseDto>> {
    const response = await apiUtils.get<ApiResponse<PatientAccountResponseDto>>(
      `${this.baseUrl}/by-patient/${patientId}`
    );
    return response.data;
  }

  /**
   * Lấy thông tin tài khoản theo Email
   */
  async getByEmail(email: string): Promise<ApiResponse<PatientAccountResponseDto>> {
    const response = await apiUtils.get<ApiResponse<PatientAccountResponseDto>>(
      `${this.baseUrl}/by-email/${encodeURIComponent(email)}`
    );
    return response.data;
  }

  /**
   * Cập nhật thông tin tài khoản
   */
  async update(accountId: number, data: PatientAccountUpdateDto): Promise<ApiResponse<PatientAccountResponseDto>> {
    const response = await apiUtils.put<ApiResponse<PatientAccountResponseDto>>(
      `${this.baseUrl}/${accountId}`,
      data
    );
    return response.data;
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(accountId: number, data: PatientAccountChangePasswordDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/change-password`,
      data
    );
    return response.data;
  }

  /**
   * Quên mật khẩu - Gửi OTP
   */
  async forgotPassword(data: PatientAccountForgotPasswordDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/forgot-password`,
      data
    );
    return response.data;
  }

  /**
   * Reset mật khẩu với OTP
   */
  async resetPassword(data: PatientAccountResetPasswordDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/reset-password`,
      data
    );
    return response.data;
  }

  /**
   * Request OTP để verify email
   */
  async requestEmailVerification(accountId: number): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/verify-email/request`,
      {}
    );
    return response.data;
  }

  /**
   * Verify email với OTP
   */
  async verifyEmail(accountId: number, data: PatientAccountVerifyOtpDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/verify-email`,
      data
    );
    return response.data;
  }

  /**
   * Request OTP để verify phone
   */
  async requestPhoneVerification(accountId: number): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/verify-phone/request`,
      {}
    );
    return response.data;
  }

  /**
   * Verify phone với OTP
   */
  async verifyPhone(accountId: number, data: PatientAccountVerifyOtpDto): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/verify-phone`,
      data
    );
    return response.data;
  }

  /**
   * Vô hiệu hóa tài khoản
   */
  async deactivateAccount(accountId: number): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/deactivate`,
      {}
    );
    return response.data;
  }

  /**
   * Kích hoạt tài khoản
   */
  async activateAccount(accountId: number): Promise<ApiResponse<any>> {
    const response = await apiUtils.post<ApiResponse<any>>(
      `${this.baseUrl}/${accountId}/activate`,
      {}
    );
    return response.data;
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   */
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.get<ApiResponse<boolean>>(
      `${this.baseUrl}/check-email/${encodeURIComponent(email)}`
    );
    return response.data;
  }

  /**
   * Kiểm tra phone đã tồn tại chưa
   */
  async checkPhoneExists(phone: string): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.get<ApiResponse<boolean>>(
      `${this.baseUrl}/check-phone/${encodeURIComponent(phone)}`
    );
    return response.data;
  }

  /**
   * Save token and user to localStorage
   */
  saveAuth(token: string, user: any): void {
    localStorage.setItem('patient_token', token);
    localStorage.setItem('patient_user', JSON.stringify(user));
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('patient_token');
  }

  /**
   * Get user from localStorage
   */
  getUser(): any | null {
    const userData = localStorage.getItem('patient_user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Remove auth data from localStorage
   */
  removeAuth(): void {
    localStorage.removeItem('patient_token');
    localStorage.removeItem('patient_user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new PatientAccountService();


