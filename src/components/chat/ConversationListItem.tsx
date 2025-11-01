import type { ConversationListDTO } from '@/types/conversation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationListItemProps {
  conversation: ConversationListDTO;
}

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
  const navigate = useNavigate();

  const formatTime = (date?: string) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  const handleClick = () => {
    navigate(`/patient/chat/${conversation.conversationId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <MessageCircle className="w-6 h-6 text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.title || conversation.patientName || 'Cuộc trò chuyện'}
          </h3>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 truncate mb-1">
          {conversation.lastMessagePreview || 'Chưa có tin nhắn'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatTime(conversation.lastMessageAt)}</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {conversation.messageCount}
          </span>
        </div>
      </div>

      {conversation.isClosed && (
        <div className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
          Đã đóng
        </div>
      )}
    </div>
  );
}

