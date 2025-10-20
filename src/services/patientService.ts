import { 
  type PatientDto, 
  type PatientRegistrationDto, 
  type PatientUpdateDto,
  type PatientLoginDto,
  type ClinicPatientDto,
  type EnrollPatientDto,
  type ApiResponse,
  type PagedResult,
  type AuthResponseDto
} from '@/types';

import { apiUtils } from '@/api/axios';

class PatientService {
  // Patient registration
  async registerPatient(data: PatientRegistrationDto): Promise<ApiResponse<PatientDto>> {
    const response = await apiUtils.post<ApiResponse<PatientDto>>('/patients/register', data);
    return response.data;
  }

  // Get patient by ID
  async getPatientById(id: number): Promise<ApiResponse<PatientDto>> {
    const response = await apiUtils.get<ApiResponse<PatientDto>>(`/patients/${id}`);
    return response.data;
  }

  // Get patient by phone number
  async getPatientByPhone(phoneNumber: string): Promise<ApiResponse<PatientDto>> {
    const response = await apiUtils.get<ApiResponse<PatientDto>>(`/patients/phone/${phoneNumber}`);
    return response.data;
  }

  // Update patient
  async updatePatient(id: number, data: PatientUpdateDto): Promise<ApiResponse<PatientDto>> {
    const response = await apiUtils.put<ApiResponse<PatientDto>>(`/patients/${id}`, data);
    return response.data;
  }

  // Get patients with pagination and search
  async getPatients(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string): Promise<ApiResponse<PagedResult<PatientDto>>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await apiUtils.get<ApiResponse<PagedResult<PatientDto>>>(`/patients?${params}`);
    return response.data;
  }

  // Enroll patient to clinic
  async enrollPatientToClinic(patientId: number, tenantId: number, data?: EnrollPatientDto): Promise<ApiResponse<ClinicPatientDto>> {
    const response = await apiUtils.post<ApiResponse<ClinicPatientDto>>(`/patients/${patientId}/enroll/${tenantId}`, data || {});
    return response.data;
  }

  // Find patient in all clinics
  async findPatientInClinics(phoneNumber: string): Promise<ApiResponse<ClinicPatientDto[]>> {
    const response = await apiUtils.get<ApiResponse<ClinicPatientDto[]>>(`/patients/search/clinics/${phoneNumber}`);
    return response.data;
  }

  // Patient login (legacy method from controller)
  async authenticatePatient(phoneNumber: string, verificationCode: string): Promise<ApiResponse<AuthResponseDto>> {
    const response = await apiUtils.post<ApiResponse<AuthResponseDto>>('/patients/login', {
      phoneNumber,
      verificationCode
    } as PatientLoginDto);
    return response.data;
  }
}

export default new PatientService();
