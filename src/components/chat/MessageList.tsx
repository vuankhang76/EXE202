import { useRef } from 'react';
import type { MessageDTO } from '@/types/conversation';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageDTO[];
  currentUserId?: number;
  currentUserType: 'User' | 'Patient';
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function MessageList({
  messages,
  currentUserId,
  currentUserType,
  loading,
  hasMore,
  onLoadMore,
}: MessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!messagesContainerRef.current || !hasMore || loading) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0) {
      onLoadMore?.();
    }
  };

  const isOwnMessage = (message: MessageDTO) => {
    if (currentUserType === 'Patient') {
      if (message.isFromPatient !== undefined) {
        return message.isFromPatient;
      }
      return message.senderType === 'Patient' && message.senderPatientId === currentUserId;
    } else {
      if (message.isFromPatient !== undefined) {
        return !message.isFromPatient;
      }
      return message.senderType === 'User' && message.senderUserId === currentUserId;
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Chưa có tin nhắn nào</p>
          <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="message-list-container flex-1 overflow-y-auto p-4 space-y-2"
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Tải tin nhắn cũ hơn
            </button>
          )}
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.messageId}
          message={message}
          isOwn={isOwnMessage(message)}
        />
      ))}
    </div>
  );
}

