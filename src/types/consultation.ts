import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

export interface ConsultationDto extends BaseEntity {
  consultationId: number;
  tenantId: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  consultationDate: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  treatment?: string;
  notes?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: string;
  // Additional info
  patientName?: string;
  doctorName?: string;
  tenantName?: string;
}

export interface ConsultationCreateDto {
  tenantId: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  consultationDate: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  treatment?: string;
  notes?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: string;
}

export interface ConsultationUpdateDto {
  consultationDate?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  treatment?: string;
  notes?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: string;
}

export interface ConsultationFilterDto extends BaseQueryDto, DateRangeFilter {
  tenantId?: number;
  patientId?: number;
  doctorId?: number;
  diagnosisCode?: string;
}

export interface ConsultationReportDto {
  totalConsultations: number;
  diagnosisCodes: Record<string, number>;
  fromDate?: string;
  toDate?: string;
}
