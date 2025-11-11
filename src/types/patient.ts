import type { BaseEntity } from './common';

export interface PatientDto extends BaseEntity {
  patientId: number;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  primaryPhoneE164: string;
  email?: string;
  address?: string;
  emergencyPhoneE164?: string;
  isActive: boolean;
}

export interface PatientRegistrationDto {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  primaryPhoneE164: string;
  secondaryPhoneE164?: string;
  email?: string;
  address?: string;
  emergencyPhoneE164?: string;
  preferredLanguage?: string;
}

export interface PatientUpdateDto {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  address?: string;
  emergencyPhoneE164?: string;
}

export interface PatientLoginDto {
  phoneNumber: string;
  verificationCode?: string;
}

export interface ClinicPatientDto extends BaseEntity {
  tenantId: number;
  patientId: number;
  mrn?: string;
  primaryDoctorId?: number;
  status: number;
  enrolledAt: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  primaryPhoneE164?: string;
  email?: string;
  tenantName?: string;
  primaryDoctorName?: string;
}

export interface EnrollPatientDto {
  mrn?: string;
  primaryDoctorId?: number;
}

export interface UpdateClinicPatientDto {
  mrn?: string;
  primaryDoctorId?: number;
  status?: number;
}

export interface PatientSearchDto {
  patientId: number;
  fullName: string;
  primaryPhoneE164: string;
  mrn?: string;
  dateOfBirth?: string;
}
