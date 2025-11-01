import type { BaseEntity } from './common';

export interface UserDto extends BaseEntity {
  userId: number;
  fullName: string;
  email: string;
  phoneE164: string;
  gender?: string;
  role: string;
  tenantId?: number;
  tenantName?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface UserCreateDto {
  fullName: string;
  email: string;
  phoneE164: string;
  password: string;
  role: string;
  tenantId?: number;
}

export interface UserUpdateDto {
  fullName?: string;
  email?: string;
  phoneE164?: string;
  role?: string;
  tenantId?: number;
  isActive?: boolean;
}

export interface UserWithDoctorDto extends UserDto {
  doctorInfo?: DoctorDto;
  // API also returns these fields directly when user is a doctor
  doctorId?: number;
  licenseNumber?: string;
  specialty?: string;
  avatarUrl?: string;
}

export interface DoctorDto extends BaseEntity {
  doctorId: number;
  userId: number;
  tenantId: number;
  fullName: string;
  email?: string;
  phoneE164?: string;
  specialty?: string;
  licenseNumber?: string;
  avatarUrl?: string;
  title?: string;
  positionTitle?: string;
  yearStarted?: number;
  isVerified: boolean;
  about?: string;
  isActive: boolean;
  tenantName?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateDoctorDto {
  specialty: string;
  licenseNumber: string;
  title?: string;
  positionTitle?: string;
  yearStarted?: number;
  about?: string;
}

export interface UpdateDoctorDto {
  specialty?: string;
  licenseNumber?: string;
  avatarUrl?: string;
  title?: string;
  positionTitle?: string;
  yearStarted?: number;
  isVerified?: boolean;
  about?: string;
  isActive?: boolean;
}

export interface DoctorEditDto {
  doctorId: number;
  tenantId: number;
  fullName: string;
  email: string;
  phoneE164?: string;
  avatarUrl?: string;
  title?: string;
  positionTitle?: string;
  specialty?: string;
  licenseNumber?: string;
  yearStarted?: number;
  about?: string;
  isVerified: boolean;
}

export interface DoctorSelfUpdateDto {
  fullName: string;
  phoneE164?: string;
  avatarUrl?: string;
  title?: string;
  positionTitle?: string;
  specialty?: string;
  licenseNumber?: string;
  yearStarted?: number;
  about?: string;
}

export interface DoctorAdminUpdateDto extends DoctorSelfUpdateDto {
  isVerified?: boolean;
}

export const UserRoles = {
  SystemAdmin: 'SystemAdmin',
  ClinicAdmin: 'ClinicAdmin',
  Doctor: 'Doctor',
  Nurse: 'Nurse',
  Receptionist: 'Receptionist',
  Patient: 'Patient'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export interface DoctorSearchDto {
  userId: number;
  doctorId?: number;
  fullName: string;
  licenseNumber?: string;
  specialty?: string;
  email: string;
}
