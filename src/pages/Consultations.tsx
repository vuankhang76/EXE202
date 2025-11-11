import { useEffect, useState, useRef } from "react"
import AdminLayout from "@/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { MessageCircle, Loader2, ArrowLeft } from "lucide-react"
import conversationService from "@/services/conversationService"
import chatHubService from "@/services/chatHubService"
import type { ConversationListDTO, ConversationDTO, MessageDTO } from "@/types/conversation"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import MessageList from "@/components/chat/MessageList"
import MessageInput from "@/components/chat/MessageInput"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

export default function Consultations() {
  const { currentUser, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [recentConversations, setRecentConversations] = useState<ConversationListDTO[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [, setSignalRReady] = useState(false)
  const signalRInitialized = useRef(false)
  const conversationListenersSetup = useRef(false)

  useEffect(() => {
    loadData()
    
    if (token && currentUser?.tenantId && !signalRInitialized.current) {
      signalRInitialized.current = true
      initializeSignalR(token, currentUser.tenantId)
    }

    return () => {
      if (currentUser?.tenantId) {
        chatHubService.leaveTenantGroup(parseInt(currentUser.tenantId))
      }
      chatHubService.stop()
      signalRInitialized.current = false
    }
  }, [token, currentUser?.tenantId])

  const initializeSignalR = async (token: string, tenantId: string) => {
    try {
      await chatHubService.start(token)
      await chatHubService.joinTenantGroup(parseInt(tenantId))

      chatHubService.onConversationUpdated(() => {
        loadConversations()
      })

      setSignalRReady(true)
    } catch (error) {
      // Ignore abort errors from React cleanup (expected in dev mode)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAbortError = errorMessage.includes('stopped during negotiation') || 
                          errorMessage.includes('connection was stopped');
      
      if (isAbortError) {
        return;
      }
      
      console.error('SignalR initialization failed:', error)
      setSignalRReady(false)
      toast.error('Không thể kết nối real-time. Vui lòng tải lại trang.')
    }
  }

  useEffect(() => {
    if (selectedConversationId) {
      loadChatData(selectedConversationId)
      conversationListenersSetup.current = false // Reset when conversation changes
      setupConversationSignalRWithRetry(selectedConversationId)
    }

    return () => {
      if (selectedConversationId) {
        chatHubService.leaveConversation(selectedConversationId)
        chatHubService.offAllListeners()
        conversationListenersSetup.current = false
        
        if (currentUser?.tenantId) {
          chatHubService.onConversationUpdated(() => {
            loadConversations()
          })
        }
      }
    }
  }, [selectedConversationId])

  const setupConversationSignalRWithRetry = async (conversationId: number, retries = 15) => {
    // Prevent duplicate setup
    if (conversationListenersSetup.current) {
      return;
    }

    for (let i = 0; i < retries; i++) {
      if (chatHubService.isConnected()) {
        await setupConversationSignalR(conversationId)
        conversationListenersSetup.current = true
        return
      }
      
      // Wait 1 second between retries
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.error('Failed to setup conversation SignalR after', retries, 'attempts');
    toast.error('Không thể thiết lập kết nối real-time. Đang thử kết nối lại...');
  }

  const setupConversationSignalR = async (conversationId: number) => {
    try {
      await chatHubService.joinConversation(conversationId)

      chatHubService.onReceiveMessage((message: MessageDTO) => {
        // Only add message if it's not from current user (avoid duplicate from sendMessage API response)
        const isFromMe = currentUser?.userId && message.senderUserId === parseInt(currentUser.userId);
        if (!isFromMe) {
          setMessages(prev => [...prev, message])
        }
        conversationService.markMessagesAsRead(conversationId)
        loadConversations()
      })

      chatHubService.onMessagesRead(() => {
        loadConversations()
      })
    } catch (error) {
      console.error('Failed to setup conversation SignalR:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      await loadConversations()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      const conversationsResponse = await conversationService.getConversations(undefined, false)
      if (conversationsResponse.success && conversationsResponse.data) {
        setRecentConversations(conversationsResponse.data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const formatTime = (date?: string) => {
    if (!date) return ''
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  const loadChatData = async (conversationId: number) => {
    if (!currentUser?.userId) return

    setMessagesLoading(true)
    try {
      const convResponse = await conversationService.getConversationById(conversationId)

      if (convResponse.success && convResponse.data) {
        setSelectedConversation(convResponse.data)
      }

      const messagesResponse = await conversationService.getMessages(
        conversationId,
        { pageNumber: 1, pageSize: 20 }
      )

      if (messagesResponse.success && messagesResponse.data) {
        setMessages(messagesResponse.data.messages || [])
        setHasMore(messagesResponse.data.hasMore || false)
        setPage(1)
      }

      await conversationService.markMessagesAsRead(conversationId)
      
      loadConversations()
    } catch (error: any) {
      toast.error('Không thể tải cuộc trò chuyện')
    } finally {
      setMessagesLoading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!currentUser?.userId || !selectedConversationId || loadingMore) return

    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const messagesResponse = await conversationService.getMessages(
        selectedConversationId,
        { pageNumber: nextPage, pageSize: 20 }
      )

      if (messagesResponse.success && messagesResponse.data) {
        // Backend returns in ascending order, prepend old messages to beginning
        const olderMessages = messagesResponse.data.messages || []
        setMessages((prev) => [...olderMessages, ...prev])
        setHasMore(messagesResponse.data.hasMore || false)
        setPage(nextPage)
      }
    } catch (error) {
      toast.error('Không thể tải thêm tin nhắn')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSendMessage = async (content: string, file?: File) => {
    if (!currentUser?.userId || !selectedConversationId) {
      throw new Error('Thiếu thông tin cuộc trò chuyện')
    }

    const formData = conversationService.createMessageFormData(content, file)

    const response = await conversationService.sendMessage(
      selectedConversationId,
      formData
    )

    if (response.success && response.data) {
      setMessages((prev) => [...prev, response.data!])
      toast.success('Đã gửi tin nhắn')
    } else {
      throw new Error(response.message || 'Không thể gửi tin nhắn')
    }
  }

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId)
  }

  const handleBackToList = () => {
    setSelectedConversationId(null)
    setSelectedConversation(null)
    setMessages([])
  }

  return (
    <AdminLayout breadcrumbTitle="Giao tiếp và tư vấn từ xa">
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex flex-1 gap-4 min-h-0">
              <Card className="w-[350px] flex flex-col border-gray-200 overflow-hidden !py-2 gap-2">
                <CardHeader className="pt-3">
                  <CardTitle className="text-xl">Đoạn chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto !px-3">
                  {recentConversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Chưa có cuộc hội thoại nào
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentConversations.map((conversation) => (
                        <div
                          key={conversation.conversationId}
                          onClick={() => handleSelectConversation(conversation.conversationId)}
                          className={`flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border ${
                            selectedConversationId === conversation.conversationId ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                        >
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {conversation.patientName || 'Bệnh nhân'}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {conversation.lastMessagePreview || 'Chưa có tin nhắn'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {!selectedConversationId ? (
                <Card className="flex-1 flex items-center justify-center border-gray-200 gap-0">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Chọn một cuộc hội thoại
                    </h3>
                    <p className="text-gray-500">
                      Chọn một cuộc hội thoại từ danh sách bên trái để xem chi tiết
                    </p>
                  </CardContent>
                </Card>
              ) : messagesLoading ? (
                <Card className="flex-1 flex items-center justify-center border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500">Đang tải tin nhắn...</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex-1 flex flex-col border-gray-200 overflow-hidden !py-0 gap-0">
                  {/* Chat Header */}
                  <CardHeader className="border-b border-gray-200 !pt-4 !py-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToList}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {selectedConversation?.patientName?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {selectedConversation?.title || selectedConversation?.patientName || 'Cuộc trò chuyện'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation?.isClosed ? 'Đã đóng' : 'Đang hoạt động'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <MessageList
                      messages={messages}
                      currentUserId={currentUser?.userId ? parseInt(currentUser.userId) : undefined}
                      currentUserType="User"
                      loading={loadingMore}
                      hasMore={hasMore}
                      onLoadMore={loadMoreMessages}
                    />

                    {!selectedConversation?.isClosed && (
                      <MessageInput onSend={handleSendMessage} disabled={selectedConversation?.isClosed || false} />
                    )}

                    {selectedConversation?.isClosed && (
                      <div className="p-4 bg-gray-100 text-center text-gray-600 border-t">
                        Cuộc trò chuyện đã được đóng
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
        )}
      </div>
    </AdminLayout>
  )
}
