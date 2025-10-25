import { 
  type CarePlanDto,
  type CarePlanCreateDto,
  type CarePlanUpdateDto,
  type CarePlanItemDto,
  type CarePlanItemCreateDto,
  type CarePlanItemUpdateDto,
  type CarePlanItemLogDto,
  type CarePlanItemLogCreateDto,
  type CarePlanProgressDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class CarePlanService {
  private readonly baseUrl = '/careplans';

  // Create care plan
  async createCarePlan(data: CarePlanCreateDto): Promise<ApiResponse<CarePlanDto>> {
    const response = await apiUtils.post<ApiResponse<CarePlanDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get care plan by ID
  async getCarePlanById(id: number): Promise<ApiResponse<CarePlanDto>> {
    const response = await apiUtils.get<ApiResponse<CarePlanDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateCarePlan(id: number, data: CarePlanUpdateDto): Promise<ApiResponse<CarePlanDto>> {
    const response = await apiUtils.put<ApiResponse<CarePlanDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteCarePlan(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getCarePlans(
    patientId?: number,
    status?: string,
    pageNumber: number = 1,
    pageSize: number = 8
  ): Promise<ApiResponse<PagedResult<CarePlanDto>>> {
    const params: any = { pageNumber, pageSize };
    if (patientId) params.patientId = patientId;
    if (status) params.status = status;

    const response = await apiUtils.get<ApiResponse<PagedResult<CarePlanDto>>>(this.baseUrl, { params });
    return response.data;
  }

  // Get active care plans for patient
  async getActiveCarePlansForPatient(patientId: number): Promise<ApiResponse<CarePlanDto[]>> {
    const response = await apiUtils.get<ApiResponse<CarePlanDto[]>>(`${this.baseUrl}/patient/${patientId}/active`);
    return response.data;
  }

  // Get care plan progress
  async getCarePlanProgress(id: number): Promise<ApiResponse<CarePlanProgressDto>> {
    const response = await apiUtils.get<ApiResponse<CarePlanProgressDto>>(`${this.baseUrl}/${id}/progress`);
    return response.data;
  }

  // Get patient care plan progress
  async getPatientCarePlanProgress(patientId: number): Promise<ApiResponse<CarePlanProgressDto[]>> {
    const response = await apiUtils.get<ApiResponse<CarePlanProgressDto[]>>(`${this.baseUrl}/patient/${patientId}/progress`);
    return response.data;
  }

  // Care Plan Items Management
  // Create care plan item
  async createCarePlanItem(carePlanId: number, data: CarePlanItemCreateDto): Promise<ApiResponse<CarePlanItemDto>> {
    const response = await apiUtils.post<ApiResponse<CarePlanItemDto>>(`${this.baseUrl}/${carePlanId}/items`, data);
    return response.data;
  }

  // Update care plan item
  async updateCarePlanItem(itemId: number, data: CarePlanItemUpdateDto): Promise<ApiResponse<CarePlanItemDto>> {
    const response = await apiUtils.put<ApiResponse<CarePlanItemDto>>(`${this.baseUrl}/items/${itemId}`, data);
    return response.data;
  }

  // Delete care plan item
  async deleteCarePlanItem(itemId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/items/${itemId}`);
    return response.data;
  }

  // Get care plan items
  async getCarePlanItems(carePlanId: number): Promise<ApiResponse<CarePlanItemDto[]>> {
    const response = await apiUtils.get<ApiResponse<CarePlanItemDto[]>>(`${this.baseUrl}/${carePlanId}/items`);
    return response.data;
  }

  // Care Plan Item Logs
  // Log care plan item
  async logCarePlanItem(data: CarePlanItemLogCreateDto): Promise<ApiResponse<CarePlanItemLogDto>> {
    const response = await apiUtils.post<ApiResponse<CarePlanItemLogDto>>(`${this.baseUrl}/items/log`, data);
    return response.data;
  }

  // Get care plan item logs
  async getCarePlanItemLogs(
    patientId?: number,
    carePlanId?: number,
    itemId?: number,
    fromDate?: string,
    toDate?: string,
    pageNumber: number = 1,
    pageSize: number = 8
  ): Promise<ApiResponse<PagedResult<CarePlanItemLogDto>>> {
    const params: any = { pageNumber, pageSize };
    if (patientId) params.patientId = patientId;
    if (carePlanId) params.carePlanId = carePlanId;
    if (itemId) params.itemId = itemId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<PagedResult<CarePlanItemLogDto>>>(`${this.baseUrl}/logs`, { params });
    return response.data;
  }
}

export default new CarePlanService();
