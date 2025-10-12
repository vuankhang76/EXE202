import { 
  type UserDto, 
  type UserCreateDto, 
  type UserUpdateDto,
  type UserWithDoctorDto,
  type ChangePasswordDto,
  type CreateDoctorDto,
  type DoctorSearchDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class UserService {
  private readonly baseUrl = '/users';

  async createUser(data: UserCreateDto): Promise<ApiResponse<UserDto>> {
    const response = await apiUtils.post<ApiResponse<UserDto>>(this.baseUrl, data);
    return response.data;
  }

  async getUserById(id: number): Promise<ApiResponse<UserDto>> {
    const response = await apiUtils.get<ApiResponse<UserDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getUserByEmail(email: string): Promise<ApiResponse<UserDto>> {
    const response = await apiUtils.get<ApiResponse<UserDto>>(`${this.baseUrl}/email/${email}`);
    return response.data;
  }

  async getUserByPhone(phoneNumber: string): Promise<ApiResponse<UserDto>> {
    const response = await apiUtils.get<ApiResponse<UserDto>>(`${this.baseUrl}/phone/${phoneNumber}`);
    return response.data;
  }

  async updateUser(id: number, data: UserUpdateDto): Promise<ApiResponse<UserDto>> {
    const response = await apiUtils.put<ApiResponse<UserDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deactivateUser(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getUsers(
    tenantId?: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string
  ): Promise<ApiResponse<PagedResult<UserDto>>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (tenantId) {
      params.append('tenantId', tenantId.toString());
    }
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await apiUtils.get<ApiResponse<PagedResult<UserDto>>>(`${this.baseUrl}?${params}`);
    return response.data;
  }

  async getUserWithDoctorInfo(id: number): Promise<ApiResponse<UserWithDoctorDto>> {
    const response = await apiUtils.get<ApiResponse<UserWithDoctorDto>>(`${this.baseUrl}/${id}/doctor-info`);
    return response.data;
  }

  async getUsersByTenant(
    tenantId: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    role?: string
  ): Promise<ApiResponse<PagedResult<UserDto>>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (role) {
      params.append('role', role);
    }

    const response = await apiUtils.get<ApiResponse<PagedResult<UserDto>>>(
      `${this.baseUrl}/tenant/${tenantId}?${params}`
    );
    return response.data;
  }

  async changePassword(id: number, data: ChangePasswordDto): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/${id}/change-password`, data);
    return response.data;
  }

  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.get<ApiResponse<boolean>>(`${this.baseUrl}/check-email/${email}`);
    return response.data;
  }

  async checkPhoneExists(phoneNumber: string): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.get<ApiResponse<boolean>>(`${this.baseUrl}/check-phone/${phoneNumber}`);
    return response.data;
  }

  async getAvailableRoles(): Promise<ApiResponse<object>> {
    const response = await apiUtils.get<ApiResponse<object>>(`${this.baseUrl}/roles`);
    return response.data;
  }

  async createDoctorRecord(userId: number, data: CreateDoctorDto): Promise<ApiResponse<object>> {
    const response = await apiUtils.post<ApiResponse<object>>(`${this.baseUrl}/${userId}/create-doctor`, data);
    return response.data;
  }

  async searchDoctorsInTenant(
    tenantId: number,
    searchTerm: string,
    limit: number = 10
  ): Promise<ApiResponse<DoctorSearchDto[]>> {
    const params = new URLSearchParams({
      searchTerm,
      limit: limit.toString()
    });

    const response = await apiUtils.get<ApiResponse<DoctorSearchDto[]>>(
      `${this.baseUrl}/tenants/${tenantId}/doctors/search?${params}`,
      undefined,
      { skipGlobalLoading: true }
    );
    return response.data;
  }
}

export default new UserService();
