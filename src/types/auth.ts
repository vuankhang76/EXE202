export interface OtpRequestDto {
  phoneNumber: string;
  purpose: string;
}

export interface OtpVerifyDto {
  phoneNumber: string;
  otpCode: string;
  purpose: string;
}

export interface StaffLoginDto {
  email: string;
  password: string;
}

export interface UserInfoDto {
  userId: string;
  fullName: string;
  email?: string;
  phoneE164?: string;
  role?: string;
  tenantId?: string;
  tenantName?: string;
}

export interface AuthResponseDto {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: UserInfoDto;
}

export interface AuthUser {
  userId: string;
  fullName: string;
  email?: string;
  phoneE164?: string;
  role?: string;
  tenantId?: string;
  tenantName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Password reset DTOs
export interface ForgotPasswordRequestDto {
  email?: string;
  phoneNumber?: string;
}

export interface ResetPasswordDto {
  email?: string;
  phoneNumber?: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthChangePasswordDto {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}