import { 
  type TenantDto, 
  type TenantCreateDto, 
  type TenantUpdateDto,
  type TenantStatsDto,
  type ClinicPatientDto,
  type UpdateClinicPatientDto,
  type PatientSearchDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class TenantService {
  private readonly baseUrl = '/tenants';

  // Create tenant
  async createTenant(data: TenantCreateDto): Promise<ApiResponse<TenantDto>> {
    const response = await apiUtils.post<ApiResponse<TenantDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get tenant by ID
  async getTenantById(id: number): Promise<ApiResponse<TenantDto>> {
    const response = await apiUtils.get<ApiResponse<TenantDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get tenant by code
  async getTenantByCode(code: string): Promise<ApiResponse<TenantDto>> {
    const response = await apiUtils.get<ApiResponse<TenantDto>>(`${this.baseUrl}/code/${code}`);
    return response.data;
  }

  // Update tenant
  async updateTenant(id: number, data: TenantUpdateDto): Promise<ApiResponse<TenantDto>> {
    const response = await apiUtils.put<ApiResponse<TenantDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Get tenants with pagination and search
  async getTenants(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string
  ): Promise<ApiResponse<PagedResult<TenantDto>>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await apiUtils.get<ApiResponse<PagedResult<TenantDto>>>(`${this.baseUrl}?${params}`);
    return response.data;
  }

  // Get tenant stats
  async getTenantStats(id: number): Promise<ApiResponse<TenantStatsDto>> {
    const response = await apiUtils.get<ApiResponse<TenantStatsDto>>(`${this.baseUrl}/${id}/stats`);
    return response.data;
  }

  // Get tenant patients
  async getTenantPatients(
    id: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string
  ): Promise<ApiResponse<PagedResult<ClinicPatientDto>>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await apiUtils.get<ApiResponse<PagedResult<ClinicPatientDto>>>(`${this.baseUrl}/${id}/patients?${params}`);
    return response.data;
  }

  // Get specific patient in tenant
  async getTenantPatient(tenantId: number, patientId: number): Promise<ApiResponse<ClinicPatientDto>> {
    const response = await apiUtils.get<ApiResponse<ClinicPatientDto>>(`${this.baseUrl}/${tenantId}/patients/${patientId}`);
    return response.data;
  }

  // Update patient in tenant
  async updateTenantPatient(
    tenantId: number,
    patientId: number,
    data: UpdateClinicPatientDto
  ): Promise<ApiResponse<ClinicPatientDto>> {
    const response = await apiUtils.put<ApiResponse<ClinicPatientDto>>(`${this.baseUrl}/${tenantId}/patients/${patientId}`, data);
    return response.data;
  }

  async searchPatientsInTenant(
    tenantId: number,
    searchTerm: string,
    limit: number = 10
  ): Promise<ApiResponse<PatientSearchDto[]>> {
    const params = new URLSearchParams({
      searchTerm,
      limit: limit.toString()
    });

    const response = await apiUtils.get<ApiResponse<PatientSearchDto[]>>(
      `${this.baseUrl}/${tenantId}/patients/search?${params}`,
      undefined,
      { skipGlobalLoading: true }
    );
    return response.data;
  }

  async uploadThumbnail(tenantId: number, file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiUtils.post<ApiResponse<string>>(
      `${this.baseUrl}/${tenantId}/upload-thumbnail`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadCoverImage(tenantId: number, file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiUtils.post<ApiResponse<string>>(
      `${this.baseUrl}/${tenantId}/upload-cover`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export default new TenantService();