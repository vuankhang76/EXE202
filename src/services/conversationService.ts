import { 
  type ConversationDTO,
  type CreateConversationDTO,
  type ConversationListDTO,
  type UpdateConversationStatusDTO,
  type MessageDTO,
  type SendMessageDTO,
  type MessageQueryDTO,
  type MessageListResponseDTO,
  type ChatStatsDTO,
  type ApiResponse
} from '@/types';

import { apiUtils } from '@/api/axios';

class ConversationService {
  private readonly baseUrl = '/conversations';

  // Create conversation
  async createConversation(data: CreateConversationDTO): Promise<ApiResponse<ConversationDTO>> {
    const response = await apiUtils.post<ApiResponse<ConversationDTO>>(this.baseUrl, data);
    return response.data;
  }

  // Get conversations
  async getConversations(patientId?: number, isClosed?: boolean): Promise<ApiResponse<ConversationListDTO[]>> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (isClosed !== undefined) params.isClosed = isClosed;

    const response = await apiUtils.get<ApiResponse<ConversationListDTO[]>>(this.baseUrl, { params });
    return response.data;
  }

  // Get conversation by ID
  async getConversationById(conversationId: number): Promise<ApiResponse<ConversationDTO>> {
    const response = await apiUtils.get<ApiResponse<ConversationDTO>>(`${this.baseUrl}/${conversationId}`);
    return response.data;
  }

  // Update conversation status
  async updateConversationStatus(
    conversationId: number,
    data: UpdateConversationStatusDTO
  ): Promise<ApiResponse<ConversationDTO>> {
    const response = await apiUtils.put<ApiResponse<ConversationDTO>>(`${this.baseUrl}/${conversationId}/status`, data);
    return response.data;
  }

  // Delete conversation
  async deleteConversation(conversationId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${conversationId}`);
    return response.data;
  }

  // Send message (staff)
  async sendMessage(conversationId: number, data: FormData): Promise<ApiResponse<MessageDTO>> {
    const response = await apiUtils.post<ApiResponse<MessageDTO>>(`${this.baseUrl}/${conversationId}/messages`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get messages
  async getMessages(conversationId: number, query: MessageQueryDTO): Promise<ApiResponse<MessageListResponseDTO>> {
    const response = await apiUtils.get<ApiResponse<MessageListResponseDTO>>(`${this.baseUrl}/${conversationId}/messages`, { params: query });
    return response.data;
  }

  // Delete message
  async deleteMessage(messageId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/messages/${messageId}`);
    return response.data;
  }

  // Get chat stats
  async getChatStats(fromDate?: string, toDate?: string): Promise<ApiResponse<ChatStatsDTO>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<ChatStatsDTO>>(`${this.baseUrl}/stats`, { params });
    return response.data;
  }

  // Patient APIs
  // Send patient message
  async sendPatientMessage(patientId: number, data: FormData): Promise<ApiResponse<MessageDTO>> {
    const response = await apiUtils.post<ApiResponse<MessageDTO>>(`${this.baseUrl}/patient/${patientId}/messages`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get patient conversations
  async getPatientConversations(patientId: number): Promise<ApiResponse<ConversationListDTO[]>> {
    const response = await apiUtils.get<ApiResponse<ConversationListDTO[]>>(`${this.baseUrl}/patient/${patientId}`);
    return response.data;
  }

  // Get patient messages
  async getPatientMessages(
    patientId: number,
    conversationId: number,
    query: MessageQueryDTO
  ): Promise<ApiResponse<MessageListResponseDTO>> {
    const response = await apiUtils.get<ApiResponse<MessageListResponseDTO>>(
      `${this.baseUrl}/patient/${patientId}/conversations/${conversationId}/messages`,
      { params: query }
    );
    return response.data;
  }

  // Helper methods for creating FormData
  createMessageFormData(content?: string, attachment?: File): FormData {
    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (attachment) {
      formData.append('attachment', attachment);
    }
    return formData;
  }

  createPatientMessageFormData(conversationId: number, content?: string, attachment?: File): FormData {
    const formData = new FormData();
    formData.append('conversationId', conversationId.toString());
    if (content) {
      formData.append('content', content);
    }
    if (attachment) {
      formData.append('attachment', attachment);
    }
    return formData;
  }
}

export default new ConversationService();
