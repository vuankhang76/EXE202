import { 
  type DoctorEditDto,
  type DoctorSelfUpdateDto,
  type DoctorAdminUpdateDto,
  type ApiResponse
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
}

export default new DoctorService();
