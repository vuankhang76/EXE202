import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import conversationService from '@/services/conversationService';
import type { ConversationDTO, MessageDTO } from '@/types/conversation';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { currentUser, userType } = useAuth();

  const [conversation, setConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const patientId = currentUser?.userId ? parseInt(currentUser.userId) : null;

  useEffect(() => {
    if (!patientId || userType !== 'patient') {
      navigate('/login', {
        state: {
          from: `/patient/chat/${conversationId}`,
          message: 'Vui lòng đăng nhập để tiếp tục',
        },
      });
      return;
    }

    if (conversationId) {
      loadConversationData();
    }
  }, [conversationId, patientId]);

  const loadConversationData = async () => {
    if (!patientId || !conversationId) return;

    setLoading(true);
    try {
      // Load conversation detail
      const convResponse = await conversationService.getPatientConversationDetail(
        patientId,
        parseInt(conversationId)
      );

      if (convResponse.success && convResponse.data) {
        setConversation(convResponse.data);
      }

      // Load messages
      const messagesResponse = await conversationService.getPatientMessages(
        patientId,
        parseInt(conversationId),
        { page: 1, pageSize: 20 }
      );

      if (messagesResponse.success && messagesResponse.data) {
        // Sort messages by time (oldest first) for proper chat display
        const sortedMessages = (messagesResponse.data.messages || []).sort((a, b) => {
          const timeA = new Date(a.sentAt || a.createdAt || '').getTime();
          const timeB = new Date(b.sentAt || b.createdAt || '').getTime();
          return timeA - timeB;
        });
        
        // Debug: Check messages with attachments
        sortedMessages.forEach(msg => {
          if (msg.attachmentUrl) {
            console.log('📎 Message with attachment:', {
              messageId: msg.messageId,
              attachmentUrl: msg.attachmentUrl,
              attachmentName: msg.attachmentName,
              content: msg.content
            });
          }
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
    if (!patientId || !conversationId || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const messagesResponse = await conversationService.getPatientMessages(
        patientId,
        parseInt(conversationId),
        { page: nextPage, pageSize: 20 }
      );

      if (messagesResponse.success && messagesResponse.data) {
        // Sort new messages and prepend to existing messages (older messages first)
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
    if (!patientId || !conversationId) {
      throw new Error('Thiếu thông tin cuộc trò chuyện');
    }

    const formData = conversationService.createPatientMessageFormData(content, file);

    const response = await conversationService.sendPatientMessage(
      patientId, 
      parseInt(conversationId),
      formData
    );

    if (response.success && response.data) {
      setMessages((prev) => [...prev, response.data!]);
      toast.success('Đã gửi tin nhắn');
    } else {
      throw new Error(response.message || 'Không thể gửi tin nhắn');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy cuộc trò chuyện</p>
            <Button onClick={() => navigate('/patient/conversations')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Chat Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/patient/conversations')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {conversation.title || conversation.tenantName || 'Cuộc trò chuyện'}
              </h1>
              <p className="text-sm text-gray-500">
                {conversation.isClosed ? 'Đã đóng' : 'Đang hoạt động'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto max-w-4xl bg-white shadow-sm flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
        <MessageList
          messages={messages}
          currentUserId={patientId || undefined}
          currentUserType="Patient"
          loading={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
        />

        {!conversation.isClosed && (
          <MessageInput onSend={handleSendMessage} disabled={conversation.isClosed} />
        )}

        {conversation.isClosed && (
          <div className="p-4 bg-gray-100 text-center text-gray-600">
            Cuộc trò chuyện đã được đóng
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

