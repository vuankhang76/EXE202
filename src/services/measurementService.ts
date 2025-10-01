import { 
  type MeasurementDto,
  type MeasurementCreateDto,
  type MeasurementUpdateDto,
  type MeasurementQueryDto,
  type MeasurementStatsDto,
  type QuickMeasurementDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class MeasurementService {
  private readonly baseUrl = '/measurements';

  // Create measurement
  async createMeasurement(data: MeasurementCreateDto): Promise<ApiResponse<MeasurementDto>> {
    const response = await apiUtils.post<ApiResponse<MeasurementDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get measurement by ID
  async getMeasurementById(id: number): Promise<ApiResponse<MeasurementDto>> {
    const response = await apiUtils.get<ApiResponse<MeasurementDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update measurement
  async updateMeasurement(id: number, data: MeasurementUpdateDto): Promise<ApiResponse<MeasurementDto>> {
    const response = await apiUtils.put<ApiResponse<MeasurementDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete measurement
  async deleteMeasurement(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get measurements with pagination and filter
  async getMeasurements(query: MeasurementQueryDto): Promise<ApiResponse<PagedResult<MeasurementDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<MeasurementDto>>>(this.baseUrl, { params: query });
    return response.data;
  }

  // Get patient measurements
  async getPatientMeasurements(
    patientId: number,
    type?: string,
    fromDate?: string,
    toDate?: string,
    limit?: number
  ): Promise<ApiResponse<MeasurementDto[]>> {
    const params: any = {};
    if (type) params.type = type;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (limit) params.limit = limit;

    const response = await apiUtils.get<ApiResponse<MeasurementDto[]>>(`${this.baseUrl}/patient/${patientId}`, { params });
    return response.data;
  }

  // Get recent measurements for patient
  async getRecentMeasurements(patientId: number, days: number = 7): Promise<ApiResponse<MeasurementDto[]>> {
    const response = await apiUtils.get<ApiResponse<MeasurementDto[]>>(`${this.baseUrl}/patient/${patientId}/recent`, {
      params: { days }
    });
    return response.data;
  }

  // Get measurement stats for patient
  async getMeasurementStats(
    patientId: number,
    type?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<MeasurementStatsDto[]>> {
    const params: any = {};
    if (type) params.type = type;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<MeasurementStatsDto[]>>(`${this.baseUrl}/patient/${patientId}/stats`, { params });
    return response.data;
  }

  // Get measurement stats by type
  async getMeasurementStatsByType(
    patientId: number,
    type: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<MeasurementStatsDto>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<MeasurementStatsDto>>(`${this.baseUrl}/patient/${patientId}/stats/${type}`, { params });
    return response.data;
  }

  // Get available measurement types
  async getAvailableMeasurementTypes(patientId?: number): Promise<ApiResponse<object>> {
    const params = patientId ? { patientId } : {};
    const response = await apiUtils.get<ApiResponse<object>>(`${this.baseUrl}/types`, { params });
    return response.data;
  }

  // Create quick measurement
  async createQuickMeasurement(data: QuickMeasurementDto): Promise<ApiResponse<MeasurementDto>> {
    const response = await apiUtils.post<ApiResponse<MeasurementDto>>(`${this.baseUrl}/quick`, data);
    return response.data;
  }
}

export default new MeasurementService();
