import type { BaseEntity } from './common';

export interface PatientDto extends BaseEntity {
  patientId: number;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  primaryPhoneE164: string;
  secondaryPhoneE164?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhoneE164?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
  insuranceInfo?: string;
  preferredLanguage?: string;
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
  emergencyContact?: string;
  emergencyPhoneE164?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
  insuranceInfo?: string;
  preferredLanguage?: string;
}

export interface PatientUpdateDto {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  secondaryPhoneE164?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhoneE164?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
  insuranceInfo?: string;
  preferredLanguage?: string;
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
  // Patient info
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  primaryPhoneE164?: string;
  email?: string;
  // Tenant info
  tenantName?: string;
  // Doctor info
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

// DTO cho search bệnh nhân (dùng cho autocomplete)
export interface PatientSearchDto {
  patientId: number;
  fullName: string;
  primaryPhoneE164: string;
  mrn?: string;
  dateOfBirth?: string;
}
