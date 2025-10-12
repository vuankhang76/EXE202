import type { BaseEntity } from './common';

// DTO cho đăng ký Patient Account
export interface PatientAccountRegisterDto {
  fullName: string;
  email: string;
  phoneE164: string;
  password: string;
  confirmPassword: string;
  gender?: string; // 'M', 'F', 'O'
  dateOfBirth?: string; // Format: YYYY-MM-DD
  address?: string;
}

// DTO cho đăng nhập bằng Email/Password
export interface PatientAccountLoginDto {
  email: string;
  password: string;
}

// DTO cho đăng nhập bằng Phone/Password
export interface PatientAccountLoginByPhoneDto {
  phoneE164: string;
  password: string;
}

// DTO cho response của PatientAccount
export interface PatientAccountResponseDto extends BaseEntity {
  accountId: number;
  patientId: number;
  email: string;
  phoneE164?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  // Patient info
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

// DTO cho cập nhật PatientAccount
export interface PatientAccountUpdateDto {
  email?: string;
  phoneE164?: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

// DTO cho đổi mật khẩu
export interface PatientAccountChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// DTO cho quên mật khẩu
export interface PatientAccountForgotPasswordDto {
  email: string;
}

// DTO cho reset mật khẩu
export interface PatientAccountResetPasswordDto {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

// DTO cho verify email/phone
export interface PatientAccountVerifyRequestDto {
  verificationType: 'email' | 'phone';
}

export interface PatientAccountVerifyOtpDto {
  verificationType: 'email' | 'phone';
  otpCode: string;
}

// Auth Response specifically for Patient
export interface PatientAuthResponseDto {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: {
    userId: number;
    fullName: string;
    email?: string;
    phoneE164?: string;
    isPatient: boolean;
  };
}


