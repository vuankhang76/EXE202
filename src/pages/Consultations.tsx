import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "@/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Video, Phone, ArrowRight, Loader2 } from "lucide-react"
import conversationService from "@/services/conversationService"
import type { ConversationListDTO } from "@/types/conversation"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export default function Consultations() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    totalConversations: 0,
    closedConversations: 0,
  })
  const [recentConversations, setRecentConversations] = useState<ConversationListDTO[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await conversationService.getChatStats()
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Load recent conversations
      const conversationsResponse = await conversationService.getConversations(undefined, false)
      if (conversationsResponse.success && conversationsResponse.data) {
        setRecentConversations(conversationsResponse.data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date?: string) => {
    if (!date) return ''
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  return (
    <AdminLayout breadcrumbTitle="Giao tiếp và tư vấn từ xa">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giao tiếp và tư vấn từ xa</h1>
          <p className="text-muted-foreground">
            Quản lý cuộc hội thoại và tư vấn trực tuyến
          </p>
        </div>
        <Button onClick={() => navigate('/clinic/conversations')}>
          Xem tất cả tin nhắn
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/clinic/conversations')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tin nhắn mới
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Tin nhắn chưa đọc
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cuộc trò chuyện
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalConversations}</div>
                <p className="text-xs text-muted-foreground">
                  Đang hoạt động
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng tin nhắn
                </CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Tin nhắn đã gửi
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cuộc hội thoại gần đây</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/clinic/conversations')}>
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có cuộc hội thoại nào
                </div>
              ) : (
                <div className="space-y-3">
                  {recentConversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => navigate(`/clinic/chat/${conversation.conversationId}`)}
                      className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
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
        </>
      )}
    </AdminLayout>
  )
}
