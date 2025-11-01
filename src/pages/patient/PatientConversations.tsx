import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import conversationService from '@/services/conversationService';
import type { ConversationListDTO } from '@/types/conversation';
import ConversationListItem from '@/components/chat/ConversationListItem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientConversations() {
  const navigate = useNavigate();
  const { currentUser, userType } = useAuth();

  const [conversations, setConversations] = useState<ConversationListDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const patientId = currentUser?.userId ? parseInt(currentUser.userId) : null;

  useEffect(() => {
    if (!patientId || userType !== 'patient') {
      navigate('/login', {
        state: {
          from: '/patient/conversations',
          message: 'Vui lòng đăng nhập để tiếp tục',
        },
      });
      return;
    }

    loadConversations();
  }, [patientId]);

  const loadConversations = async () => {
    if (!patientId) return;

    setLoading(true);
    try {
      const response = await conversationService.getPatientConversations(patientId);

      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tin nhắn của tôi</h1>
              <p className="text-sm text-gray-600">
                {conversations.length} cuộc trò chuyện
              </p>
            </div>
          </div>

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có cuộc trò chuyện nào
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Hãy tìm phòng khám và bắt đầu chat để được tư vấn
                </p>
                <Button onClick={() => navigate('/')}>Tìm phòng khám</Button>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.conversationId}
                    conversation={conversation}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

