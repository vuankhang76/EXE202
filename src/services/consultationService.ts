import { 
  type ConsultationDto,
  type ConsultationCreateDto,
  type ConsultationUpdateDto,
  type ConsultationFilterDto,
  type ConsultationReportDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class ConsultationService {
  private readonly baseUrl = '/consultations';

  // Create consultation
  async createConsultation(data: ConsultationCreateDto): Promise<ApiResponse<ConsultationDto>> {
    const response = await apiUtils.post<ApiResponse<ConsultationDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get consultation by ID
  async getConsultationById(id: number): Promise<ApiResponse<ConsultationDto>> {
    const response = await apiUtils.get<ApiResponse<ConsultationDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update consultation
  async updateConsultation(id: number, data: ConsultationUpdateDto): Promise<ApiResponse<ConsultationDto>> {
    const response = await apiUtils.put<ApiResponse<ConsultationDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete consultation
  async deleteConsultation(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get consultations with filter and pagination
  async getConsultations(filter: ConsultationFilterDto): Promise<ApiResponse<PagedResult<ConsultationDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<ConsultationDto>>>(this.baseUrl, { params: filter });
    return response.data;
  }

  // Get consultation by appointment ID
  async getConsultationByAppointmentId(appointmentId: number): Promise<ApiResponse<ConsultationDto>> {
    const response = await apiUtils.get<ApiResponse<ConsultationDto>>(`${this.baseUrl}/appointment/${appointmentId}`);
    return response.data;
  }

  // Get patient consultations
  async getPatientConsultations(patientId: number, tenantId?: number): Promise<ApiResponse<ConsultationDto[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<ConsultationDto[]>>(`${this.baseUrl}/patient/${patientId}`, { params });
    return response.data;
  }

  // Get doctor consultations
  async getDoctorConsultations(
    doctorId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<ConsultationDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<ConsultationDto[]>>(`${this.baseUrl}/doctor/${doctorId}`, { params });
    return response.data;
  }

  // Get tenant consultations
  async getTenantConsultations(
    tenantId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<ConsultationDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<ConsultationDto[]>>(`${this.baseUrl}/tenant/${tenantId}`, { params });
    return response.data;
  }

  // Get consultation report
  async getConsultationReport(
    tenantId?: number,
    doctorId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<ConsultationReportDto>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (doctorId) params.doctorId = doctorId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<ConsultationReportDto>>(`${this.baseUrl}/reports`, { params });
    return response.data;
  }

  // Search consultations
  async searchConsultations(
    keyword: string,
    tenantId?: number,
    pageNumber: number = 1,
    pageSize: number = 8
  ): Promise<ApiResponse<ConsultationDto[]>> {
    const params: any = { keyword, pageNumber, pageSize };
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.get<ApiResponse<ConsultationDto[]>>(`${this.baseUrl}/search`, { params });
    return response.data;
  }

  // Get consultation statistics
  async getConsultationStatistics(
    tenantId?: number,
    doctorId?: number,
    fromDate?: string,
    toDate?: string,
    groupBy: string = 'day'
  ): Promise<ApiResponse<object>> {
    const params: any = { groupBy };
    if (tenantId) params.tenantId = tenantId;
    if (doctorId) params.doctorId = doctorId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<object>>(`${this.baseUrl}/statistics`, { params });
    return response.data;
  }

  // Get patient latest consultation
  async getPatientLatestConsultation(patientId: number, tenantId?: number): Promise<ApiResponse<ConsultationDto>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<ConsultationDto>>(`${this.baseUrl}/patient/${patientId}/latest`, { params });
    return response.data;
  }

  // Get used diagnosis codes
  async getUsedDiagnosisCodes(tenantId?: number): Promise<ApiResponse<string[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<string[]>>(`${this.baseUrl}/diagnosis-codes`, { params });
    return response.data;
  }
}

export default new ConsultationService();
