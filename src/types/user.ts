import type { BaseEntity } from './common';

export interface UserDto extends BaseEntity {
  userId: number;
  fullName: string;
  email: string;
  phoneE164: string;
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
}

export interface UserWithDoctorDto extends UserDto {
  doctorInfo?: DoctorDto;
}

export interface DoctorDto extends BaseEntity {
  doctorId: number;
  userId: number;
  specialty?: string;
  licenseNumber?: string;
  qualifications?: string;
  experience?: string;
  consultationFee?: number;
  availableHours?: string;
  isActive: boolean;
  // User info
  fullName?: string;
  email?: string;
  phoneE164?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateDoctorDto {
  specialty?: string;
  licenseNumber?: string;
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
