import { 
  type MedicalRecordDto,
  type MedicalRecordCreateDto,
  type MedicalRecordUpdateDto,
  type MedicalRecordFilterDto,
  type MedicalRecordUploadDto,
  type MedicalRecordReportDto,
  type PatientMedicalRecordSummaryDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class MedicalRecordService {
  private readonly baseUrl = '/medicalrecords';

  // Create medical record
  async createMedicalRecord(data: MedicalRecordCreateDto): Promise<ApiResponse<MedicalRecordDto>> {
    const response = await apiUtils.post<ApiResponse<MedicalRecordDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get medical record by ID
  async getMedicalRecordById(id: number): Promise<ApiResponse<MedicalRecordDto>> {
    const response = await apiUtils.get<ApiResponse<MedicalRecordDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update medical record
  async updateMedicalRecord(id: number, data: MedicalRecordUpdateDto): Promise<ApiResponse<MedicalRecordDto>> {
    const response = await apiUtils.put<ApiResponse<MedicalRecordDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete medical record
  async deleteMedicalRecord(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get medical records with filter and pagination
  async getMedicalRecords(filter: MedicalRecordFilterDto): Promise<ApiResponse<PagedResult<MedicalRecordDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<MedicalRecordDto>>>(this.baseUrl, { params: filter });
    return response.data;
  }

  // Get patient medical records
  async getPatientMedicalRecords(patientId: number, tenantId?: number): Promise<ApiResponse<MedicalRecordDto[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<MedicalRecordDto[]>>(`${this.baseUrl}/patient/${patientId}`, { params });
    return response.data;
  }

  // Get tenant medical records
  async getTenantMedicalRecords(
    tenantId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<MedicalRecordDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<MedicalRecordDto[]>>(`${this.baseUrl}/tenant/${tenantId}`, { params });
    return response.data;
  }

  // Get medical records by type
  async getMedicalRecordsByType(
    recordType: string,
    tenantId?: number,
    patientId?: number
  ): Promise<ApiResponse<MedicalRecordDto[]>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (patientId) params.patientId = patientId;

    const response = await apiUtils.get<ApiResponse<MedicalRecordDto[]>>(`${this.baseUrl}/type/${recordType}`, { params });
    return response.data;
  }

  // Get medical record report
  async getMedicalRecordReport(
    tenantId?: number,
    patientId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<MedicalRecordReportDto>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (patientId) params.patientId = patientId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<MedicalRecordReportDto>>(`${this.baseUrl}/reports`, { params });
    return response.data;
  }

  // Search medical records
  async searchMedicalRecords(
    keyword: string,
    tenantId?: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<MedicalRecordDto[]>> {
    const params: any = { keyword, pageNumber, pageSize };
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.get<ApiResponse<MedicalRecordDto[]>>(`${this.baseUrl}/search`, { params });
    return response.data;
  }

  // Upload medical record
  async uploadMedicalRecord(data: MedicalRecordUploadDto): Promise<ApiResponse<MedicalRecordDto>> {
    const formData = new FormData();
    formData.append('tenantId', data.tenantId.toString());
    formData.append('patientId', data.patientId.toString());
    formData.append('title', data.title);
    formData.append('file', data.file);
    
    if (data.recordType) formData.append('recordType', data.recordType);
    if (data.description) formData.append('description', data.description);

    const response = await apiUtils.post<ApiResponse<MedicalRecordDto>>(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async downloadMedicalRecordFile(id: number): Promise<Blob> {
    const response = await apiUtils.get<Blob>(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get patient medical record summary
  async getPatientMedicalRecordSummary(
    patientId: number,
    tenantId?: number
  ): Promise<ApiResponse<PatientMedicalRecordSummaryDto>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<PatientMedicalRecordSummaryDto>>(`${this.baseUrl}/patient/${patientId}/summary`, { params });
    return response.data;
  }

  // Get used record types
  async getUsedRecordTypes(tenantId?: number): Promise<ApiResponse<string[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<string[]>>(`${this.baseUrl}/record-types`, { params });
    return response.data;
  }

  // Check medical record access
  async checkMedicalRecordAccess(id: number, userId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.get<ApiResponse<boolean>>(`${this.baseUrl}/${id}/access-check`, {
      params: { userId }
    });
    return response.data;
  }

  // Get latest patient medical record
  async getLatestPatientMedicalRecord(
    patientId: number,
    tenantId?: number,
    recordType?: string
  ): Promise<ApiResponse<MedicalRecordDto>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (recordType) params.recordType = recordType;

    const response = await apiUtils.get<ApiResponse<MedicalRecordDto>>(`${this.baseUrl}/patient/${patientId}/latest`, { params });
    return response.data;
  }

  // Get medical record statistics
  async getMedicalRecordStatistics(
    tenantId?: number,
    fromDate?: string,
    toDate?: string,
    groupBy: string = 'month'
  ): Promise<ApiResponse<object>> {
    const params: any = { groupBy };
    if (tenantId) params.tenantId = tenantId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<object>>(`${this.baseUrl}/statistics`, { params });
    return response.data;
  }

  // Get pending review medical records
  async getPendingReviewMedicalRecords(tenantId?: number): Promise<ApiResponse<MedicalRecordDto[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<MedicalRecordDto[]>>(`${this.baseUrl}/pending-review`, { params });
    return response.data;
  }
}

export default new MedicalRecordService();
