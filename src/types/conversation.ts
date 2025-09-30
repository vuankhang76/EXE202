import type { BaseEntity, BaseQueryDto } from './common';

export interface ConversationDTO extends BaseEntity {
  conversationId: number;
  tenantId: number;
  patientId: number;
  title: string;
  isClosed: boolean;
  closedAt?: string;
  lastMessageAt?: string;
  messageCount: number;
  unreadCount: number;
  // Additional info
  patientName?: string;
  tenantName?: string;
  lastMessage?: MessageDTO;
}

export interface CreateConversationDTO {
  patientId: number;
  title: string;
}

export interface ConversationListDTO {
  conversationId: number;
  tenantId: number;
  patientId: number;
  title: string;
  isClosed: boolean;
  lastMessageAt?: string;
  messageCount: number;
  unreadCount: number;
  patientName?: string;
  lastMessagePreview?: string;
}

export interface UpdateConversationStatusDTO {
  isClosed: boolean;
  reason?: string;
}

export interface MessageDTO extends BaseEntity {
  messageId: number;
  conversationId: number;
  senderType: 'User' | 'Patient';
  senderUserId?: number;
  senderPatientId?: number;
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isRead: boolean;
  readAt?: string;
  // Additional info
  senderName?: string;
}

export interface SendMessageDTO {
  conversationId: number;
  content?: string;
  attachment?: File;
}

export interface MessageQueryDTO extends BaseQueryDto {
  beforeMessageId?: number;
  afterMessageId?: number;
}

export interface MessageListResponseDTO {
  messages: MessageDTO[];
  totalCount: number;
  hasMore: boolean;
  oldestMessageId?: number;
  newestMessageId?: number;
}

export interface ChatStatsDTO {
  totalConversations: number;
  activeConversations: number;
  closedConversations: number;
  totalMessages: number;
  averageResponseTime?: number;
  busyHours: Record<string, number>;
}
