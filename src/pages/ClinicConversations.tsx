import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import conversationService from '@/services/conversationService';
import type { ConversationListDTO } from '@/types/conversation';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateConversationDialog from '@/components/chat/CreateConversationDialog';

export default function ClinicConversations() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [filter]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const isClosed = filter === 'closed' ? true : filter === 'active' ? false : undefined;
      const response = await conversationService.getConversations(undefined, isClosed);

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

  const formatTime = (date?: string) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  const handleConversationClick = (conversationId: number) => {
    navigate(`/clinic/chat/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tin nhắn từ bệnh nhân</h1>
            <p className="text-sm text-gray-600 mt-1">
              {conversations.length} cuộc trò chuyện
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Đang hoạt động
              </Button>
              <Button
                variant={filter === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('closed')}
              >
                Đã đóng
              </Button>
            </div>

            {/* New Conversation Button */}
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
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
              <p className="text-gray-600 text-center">
                {filter === 'closed' 
                  ? 'Chưa có cuộc trò chuyện đã đóng'
                  : 'Bệnh nhân sẽ bắt đầu chat khi họ cần tư vấn'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => handleConversationClick(conversation.conversationId)}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.patientName || 'Bệnh nhân'}
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
                    <div className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded flex-shrink-0">
                      Đã đóng
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Conversation Dialog */}
      <CreateConversationDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

