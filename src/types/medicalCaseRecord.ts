export interface MedicalCaseRecordDto {
  caseId: number;
  tenantId: number;
  patientId: number;
  doctorId?: number;
  appointmentId?: number;
  diagnosis?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  physicalExam?: string;
  labResults?: string;
  treatmentPlan?: string;
  progressNotes?: string;
  dischargeSummary?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  patientName?: string;
  doctorName?: string;
  tenantName?: string;
  appointmentStartAt?: string;
  appointmentEndAt?: string;
  notes?: MedicalCaseNoteDto[];
  files?: MedicalRecordFileDto[];
}

export interface MedicalCaseRecordCreateDto {
  tenantId: number;
  patientId: number;
  doctorId?: number;
  appointmentId?: number;
  diagnosis?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  physicalExam?: string;
  labResults?: string;
  treatmentPlan?: string;
  progressNotes?: string;
  dischargeSummary?: string;
  status?: string;
}

export interface MedicalCaseRecordUpdateDto {
  diagnosis?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  physicalExam?: string;
  labResults?: string;
  treatmentPlan?: string;
  progressNotes?: string;
  dischargeSummary?: string;
  status?: string;
}

export interface MedicalCaseRecordFilterDto {
  tenantId?: number;
  patientId?: number;
  doctorId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface MedicalCaseNoteDto {
  noteId: number;
  caseId: number;
  authorUserId?: number;
  noteType?: string;
  noteContent: string;
  createdAt: string;
  authorUserName?: string;
}

export interface MedicalCaseNoteCreateDto {
  caseId: number;
  authorUserId?: number;
  noteType?: string;
  noteContent: string;
}

export interface MedicalRecordFileDto {
  fileId: number;
  caseId: number;
  fileUrl: string;
  fileType?: string;
  description?: string;
  uploadedAt: string;
  uploadedByUserId?: number;
  uploadedByUserName?: string;
}

export interface MedicalRecordFileCreateDto {
  caseId: number;
  fileUrl: string;
  fileType?: string;
  description?: string;
  uploadedByUserId?: number;
}

export interface PatientMedicalCaseSummaryDto {
  patientId: number;
  patientName?: string;
  totalCases: number;
  ongoingCases: number;
  completedCases: number;
  lastCaseDate?: string;
  recentCases?: MedicalCaseRecordDto[];
}

export interface PaginatedMedicalCaseRecordDto {
  data: MedicalCaseRecordDto[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}
