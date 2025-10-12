import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

export interface MedicalRecordDto extends BaseEntity {
  recordId: number;
  tenantId: number;
  patientId: number;
  createdByUserId: number;
  recordType?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  patientName?: string;
  createdByUserName?: string;
  tenantName?: string;
}

export interface MedicalRecordCreateDto {
  tenantId: number;
  patientId: number;
  recordType?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface MedicalRecordUpdateDto {
  recordType?: string;
  title?: string;
  description?: string;
}

export interface MedicalRecordFilterDto extends BaseQueryDto, DateRangeFilter {
  tenantId?: number;
  patientId?: number;
  createdByUserId?: number;
  recordType?: string;
}

export interface MedicalRecordUploadDto {
  tenantId: number;
  patientId: number;
  recordType?: string;
  title: string;
  description?: string;
  file: File;
}

export interface MedicalRecordReportDto {
  totalRecords: number;
  recordTypes: Record<string, number>;
  recordsByMonth: Record<string, number>;
  fromDate?: string;
  toDate?: string;
}

export interface PatientMedicalRecordSummaryDto {
  patientId: number;
  patientName: string;
  totalRecords: number;
  recordTypes: Record<string, number>;
  latestRecord?: MedicalRecordDto;
  recentRecords: MedicalRecordDto[];
}

export const MedicalRecordTypes = {
  LabResult: 'LabResult',
  Imaging: 'Imaging',
  Prescription: 'Prescription',
  Consultation: 'Consultation',
  Discharge: 'Discharge',
  Vaccination: 'Vaccination',
  Insurance: 'Insurance',
  Other: 'Other'
} as const;

export type MedicalRecordType = typeof MedicalRecordTypes[keyof typeof MedicalRecordTypes];
