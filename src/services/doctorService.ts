import { 
  type DoctorEditDto,
  type DoctorSelfUpdateDto,
  type DoctorAdminUpdateDto,
  type DoctorDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class DoctorService {
  private readonly baseUrl = '/doctors';

  // Get doctor profile for current user
  async getMyProfile(userId: number): Promise<ApiResponse<DoctorEditDto>> {
    const response = await apiUtils.get<ApiResponse<DoctorEditDto>>(
      `${this.baseUrl}/me?userId=${userId}`
    );
    return response.data;
  }

  // Update doctor profile (self)
  async updateMyProfile(userId: number, data: DoctorSelfUpdateDto): Promise<ApiResponse<DoctorEditDto>> {
    const response = await apiUtils.put<ApiResponse<DoctorEditDto>>(
      `${this.baseUrl}/me?userId=${userId}`,
      data
    );
    return response.data;
  }

  // Admin: Get doctor by ID
  async getDoctorById(doctorId: number): Promise<ApiResponse<DoctorEditDto>> {
    const response = await apiUtils.get<ApiResponse<DoctorEditDto>>(
      `${this.baseUrl}/${doctorId}`
    );
    return response.data;
  }

  // Admin: Update doctor
  async updateDoctorByAdmin(doctorId: number, data: DoctorAdminUpdateDto): Promise<ApiResponse<DoctorEditDto>> {
    const response = await apiUtils.put<ApiResponse<DoctorEditDto>>(
      `${this.baseUrl}/${doctorId}`,
      data
    );
    return response.data;
  }

  // Get all doctors (for public display)
  async getAllDoctors(
    pageNumber: number = 1,
    pageSize: number = 50,
    searchTerm?: string
  ): Promise<ApiResponse<PagedResult<DoctorDto>>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await apiUtils.get<ApiResponse<PagedResult<DoctorDto>>>(
      `${this.baseUrl}?${params}`,
      undefined,
      { skipGlobalLoading: true }
    );
    return response.data;
  }
}

export default new DoctorService();
