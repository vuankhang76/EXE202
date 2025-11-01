import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import conversationService from '@/services/conversationService';
import type { ConversationDTO, MessageDTO } from '@/types/conversation';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClinicChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [conversation, setConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const userId = currentUser?.userId ? parseInt(currentUser.userId) : null;

  useEffect(() => {
    if (conversationId) {
      loadConversationData();
    }
  }, [conversationId]);

  const loadConversationData = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      // Load conversation detail
      const convResponse = await conversationService.getConversationById(parseInt(conversationId));

      if (convResponse.success && convResponse.data) {
        setConversation(convResponse.data);
      }

      // Load messages
      const messagesResponse = await conversationService.getMessages(
        parseInt(conversationId),
        { page: 1, pageSize: 20 }
      );

      if (messagesResponse.success && messagesResponse.data) {
        // Sort messages by time (oldest first)
        const sortedMessages = (messagesResponse.data.messages || []).sort((a, b) => {
          const timeA = new Date(a.sentAt || a.createdAt || '').getTime();
          const timeB = new Date(b.sentAt || b.createdAt || '').getTime();
          return timeA - timeB;
        });
        setMessages(sortedMessages);
        setHasMore(messagesResponse.data.hasMore || false);
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast.error('Không thể tải cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!conversationId || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const messagesResponse = await conversationService.getMessages(
        parseInt(conversationId),
        { page: nextPage, pageSize: 20 }
      );

      if (messagesResponse.success && messagesResponse.data) {
        const sortedNewMessages = (messagesResponse.data.messages || []).sort((a, b) => {
          const timeA = new Date(a.sentAt || a.createdAt || '').getTime();
          const timeB = new Date(b.sentAt || b.createdAt || '').getTime();
          return timeA - timeB;
        });
        setMessages((prev) => [...sortedNewMessages, ...prev]);
        setHasMore(messagesResponse.data.hasMore || false);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (content: string, file?: File) => {
    if (!conversationId) {
      throw new Error('Thiếu thông tin cuộc trò chuyện');
    }

    const formData = conversationService.createMessageFormData(content, file);

    const response = await conversationService.sendMessage(parseInt(conversationId), formData);

    if (response.success && response.data) {
      setMessages((prev) => [...prev, response.data!]);
      toast.success('Đã gửi tin nhắn');
    } else {
      throw new Error(response.message || 'Không thể gửi tin nhắn');
    }
  };

  const handleToggleStatus = async () => {
    if (!conversationId || !conversation) return;

    try {
      const response = await conversationService.updateConversationStatus(
        parseInt(conversationId),
        { isClosed: !conversation.isClosed }
      );

      if (response.success && response.data) {
        setConversation(response.data);
        toast.success(response.data.isClosed ? 'Đã đóng cuộc trò chuyện' : 'Đã mở lại cuộc trò chuyện');
      }
    } catch (error: any) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy cuộc trò chuyện</p>
          <Button onClick={() => navigate('/clinic/consultations')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/clinic/consultations')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {conversation.patientName || 'Bệnh nhân'}
              </h1>
              <p className="text-sm text-gray-500">
                {conversation.messageCount} tin nhắn
                {conversation.unreadCount > 0 && ` • ${conversation.unreadCount} chưa đọc`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={conversation.isClosed ? 'outline' : 'destructive'}
              size="sm"
              onClick={handleToggleStatus}
            >
              {conversation.isClosed ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mở lại
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Đóng cuộc trò chuyện
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={userId || undefined}
          currentUserType="User"
          loading={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
        />

        {!conversation.isClosed ? (
          <MessageInput onSend={handleSendMessage} />
        ) : (
          <div className="p-4 bg-gray-100 text-center text-gray-600 border-t">
            Cuộc trò chuyện đã được đóng
          </div>
        )}
      </div>
    </div>
  );
}

