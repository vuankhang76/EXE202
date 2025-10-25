import api from "@/api/axios";
import type { ApiResponse } from "@/models/ApiResponse";
import type {
  MedicalCaseRecordDto,
  MedicalCaseRecordCreateDto,
  MedicalCaseRecordUpdateDto,
  MedicalCaseRecordFilterDto,
  PaginatedMedicalCaseRecordDto,
  MedicalCaseNoteDto,
  MedicalCaseNoteCreateDto,
  MedicalRecordFileDto,
  MedicalRecordFileCreateDto,
  PatientMedicalCaseSummaryDto,
} from "@/types/medicalCaseRecord";

export const medicalCaseRecordService = {
  async getMedicalCaseRecords(
    filter: MedicalCaseRecordFilterDto
  ): Promise<ApiResponse<PaginatedMedicalCaseRecordDto>> {
    const response = await api.get<ApiResponse<PaginatedMedicalCaseRecordDto>>(
      "/MedicalCaseRecords",
      { params: filter }
    );
    return response.data;
  },

  async getMedicalCaseRecordById(
    caseId: number
  ): Promise<ApiResponse<MedicalCaseRecordDto>> {
    const response = await api.get<ApiResponse<MedicalCaseRecordDto>>(
      `/MedicalCaseRecords/${caseId}`
    );
    return response.data;
  },

  async createMedicalCaseRecord(
    dto: MedicalCaseRecordCreateDto
  ): Promise<ApiResponse<MedicalCaseRecordDto>> {
    const response = await api.post<ApiResponse<MedicalCaseRecordDto>>(
      "/MedicalCaseRecords",
      dto
    );
    return response.data;
  },

  async updateMedicalCaseRecord(
    caseId: number,
    dto: MedicalCaseRecordUpdateDto
  ): Promise<ApiResponse<MedicalCaseRecordDto>> {
    const response = await api.put<ApiResponse<MedicalCaseRecordDto>>(
      `/MedicalCaseRecords/${caseId}`,
      dto
    );
    return response.data;
  },

  async deleteMedicalCaseRecord(caseId: number): Promise<ApiResponse<boolean>> {
    const response = await api.delete<ApiResponse<boolean>>(
      `/MedicalCaseRecords/${caseId}`
    );
    return response.data;
  },

  async getPatientMedicalCaseRecords(
    patientId: number,
    tenantId?: number
  ): Promise<ApiResponse<MedicalCaseRecordDto[]>> {
    const response = await api.get<ApiResponse<MedicalCaseRecordDto[]>>(
      `/MedicalCaseRecords/patient/${patientId}`,
      { params: { tenantId } }
    );
    return response.data;
  },

  async getTenantMedicalCaseRecords(
    tenantId: number
  ): Promise<ApiResponse<MedicalCaseRecordDto[]>> {
    const response = await api.get<ApiResponse<MedicalCaseRecordDto[]>>(
      `/MedicalCaseRecords/tenant/${tenantId}`
    );
    return response.data;
  },

  async getLatestPatientMedicalCaseRecord(
    patientId: number,
    tenantId?: number
  ): Promise<ApiResponse<MedicalCaseRecordDto>> {
    const response = await api.get<ApiResponse<MedicalCaseRecordDto>>(
      `/MedicalCaseRecords/patient/${patientId}/latest`,
      { params: { tenantId } }
    );
    return response.data;
  },

  async getPatientMedicalCaseSummary(
    patientId: number,
    tenantId?: number
  ): Promise<ApiResponse<PatientMedicalCaseSummaryDto>> {
    const response = await api.get<ApiResponse<PatientMedicalCaseSummaryDto>>(
      `/MedicalCaseRecords/patient/${patientId}/summary`,
      { params: { tenantId } }
    );
    return response.data;
  },

  async searchMedicalCaseRecords(
    keyword: string,
    tenantId?: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<MedicalCaseRecordDto[]>> {
    const response = await api.get<ApiResponse<MedicalCaseRecordDto[]>>(
      `/MedicalCaseRecords/search/${keyword}`,
      { params: { tenantId, pageNumber, pageSize } }
    );
    return response.data;
  },

  async addNote(
    caseId: number,
    dto: Omit<MedicalCaseNoteCreateDto, "caseId">
  ): Promise<ApiResponse<MedicalCaseNoteDto>> {
    const response = await api.post<ApiResponse<MedicalCaseNoteDto>>(
      `/MedicalCaseRecords/${caseId}/notes`,
      dto
    );
    return response.data;
  },

  async getCaseNotes(caseId: number): Promise<ApiResponse<MedicalCaseNoteDto[]>> {
    const response = await api.get<ApiResponse<MedicalCaseNoteDto[]>>(
      `/MedicalCaseRecords/${caseId}/notes`
    );
    return response.data;
  },

  async addFile(
    caseId: number,
    dto: Omit<MedicalRecordFileCreateDto, "caseId">
  ): Promise<ApiResponse<MedicalRecordFileDto>> {
    const response = await api.post<ApiResponse<MedicalRecordFileDto>>(
      `/MedicalCaseRecords/${caseId}/files`,
      dto
    );
    return response.data;
  },

  async getCaseFiles(caseId: number): Promise<ApiResponse<MedicalRecordFileDto[]>> {
    const response = await api.get<ApiResponse<MedicalRecordFileDto[]>>(
      `/MedicalCaseRecords/${caseId}/files`
    );
    return response.data;
  },

  async deleteFile(fileId: number): Promise<ApiResponse<boolean>> {
    const response = await api.delete<ApiResponse<boolean>>(
      `/MedicalCaseRecords/files/${fileId}`
    );
    return response.data;
  },

  async uploadCaseFile(
    caseId: number,
    file: File,
    uploadedByUserId?: number,
    description?: string
  ): Promise<ApiResponse<MedicalRecordFileDto>> {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadedByUserId) {
      formData.append("uploadedByUserId", uploadedByUserId.toString());
    }
    if (description) {
      formData.append("description", description);
    }

    const response = await api.post<ApiResponse<MedicalRecordFileDto>>(
      `/MedicalCaseRecords/${caseId}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },
};
