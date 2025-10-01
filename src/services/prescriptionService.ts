import { 
  type PrescriptionDto,
  type PrescriptionCreateDto,
  type PrescriptionUpdateDto,
  type PrescriptionItemDto,
  type PrescriptionItemCreateDto,
  type PrescriptionItemUpdateDto,
  type PrescriptionQueryDto,
  type QuickPrescriptionDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class PrescriptionService {
  private readonly baseUrl = '/prescriptions';

  // Create prescription
  async createPrescription(data: PrescriptionCreateDto): Promise<ApiResponse<PrescriptionDto>> {
    const response = await apiUtils.post<ApiResponse<PrescriptionDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get prescription by ID
  async getPrescriptionById(id: number): Promise<ApiResponse<PrescriptionDto>> {
    const response = await apiUtils.get<ApiResponse<PrescriptionDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update prescription
  async updatePrescription(id: number, data: PrescriptionUpdateDto): Promise<ApiResponse<PrescriptionDto>> {
    const response = await apiUtils.put<ApiResponse<PrescriptionDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete prescription
  async deletePrescription(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get prescriptions with pagination and filter
  async getPrescriptions(query: PrescriptionQueryDto): Promise<ApiResponse<PagedResult<PrescriptionDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<PrescriptionDto>>>(this.baseUrl, { params: query });
    return response.data;
  }

  // Get patient prescriptions
  async getPatientPrescriptions(
    patientId: number,
    status?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<PrescriptionDto[]>> {
    const params: any = {};
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<PrescriptionDto[]>>(`${this.baseUrl}/patient/${patientId}`, { params });
    return response.data;
  }

  // Get active prescriptions for patient
  async getActivePrescriptionsForPatient(patientId: number): Promise<ApiResponse<PrescriptionDto[]>> {
    const response = await apiUtils.get<ApiResponse<PrescriptionDto[]>>(`${this.baseUrl}/patient/${patientId}/active`);
    return response.data;
  }

  // Get doctor prescriptions
  async getDoctorPrescriptions(
    doctorId: number,
    status?: string,
    fromDate?: string,
    toDate?: string,
    limit?: number
  ): Promise<ApiResponse<PrescriptionDto[]>> {
    const params: any = {};
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (limit) params.limit = limit;

    const response = await apiUtils.get<ApiResponse<PrescriptionDto[]>>(`${this.baseUrl}/doctor/${doctorId}`, { params });
    return response.data;
  }

  // Prescription Items Management
  // Create prescription item
  async createPrescriptionItem(
    prescriptionId: number,
    data: PrescriptionItemCreateDto
  ): Promise<ApiResponse<PrescriptionItemDto>> {
    const response = await apiUtils.post<ApiResponse<PrescriptionItemDto>>(`${this.baseUrl}/${prescriptionId}/items`, data);
    return response.data;
  }

  // Update prescription item
  async updatePrescriptionItem(itemId: number, data: PrescriptionItemUpdateDto): Promise<ApiResponse<PrescriptionItemDto>> {
    const response = await apiUtils.put<ApiResponse<PrescriptionItemDto>>(`${this.baseUrl}/items/${itemId}`, data);
    return response.data;
  }

  // Delete prescription item
  async deletePrescriptionItem(itemId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/items/${itemId}`);
    return response.data;
  }

  // Get prescription items
  async getPrescriptionItems(prescriptionId: number): Promise<ApiResponse<PrescriptionItemDto[]>> {
    const response = await apiUtils.get<ApiResponse<PrescriptionItemDto[]>>(`${this.baseUrl}/${prescriptionId}/items`);
    return response.data;
  }

  // Get most prescribed drugs
  async getMostPrescribedDrugs(doctorId?: number, limit: number = 20): Promise<ApiResponse<string[]>> {
    const params: any = { limit };
    if (doctorId) params.doctorId = doctorId;

    const response = await apiUtils.get<ApiResponse<string[]>>(`${this.baseUrl}/popular-drugs`, { params });
    return response.data;
  }

  // Get prescription metadata
  async getPrescriptionMetadata(): Promise<ApiResponse<object>> {
    const response = await apiUtils.get<ApiResponse<object>>(`${this.baseUrl}/metadata`);
    return response.data;
  }

  // Check if doctor can prescribe
  async canDoctorPrescribe(doctorId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.get<ApiResponse<boolean>>(`${this.baseUrl}/doctor/${doctorId}/can-prescribe`);
    return response.data;
  }

  // Create quick prescription
  async createQuickPrescription(data: QuickPrescriptionDto): Promise<ApiResponse<PrescriptionDto>> {
    const response = await apiUtils.post<ApiResponse<PrescriptionDto>>(`${this.baseUrl}/quick`, data);
    return response.data;
  }
}

export default new PrescriptionService();
