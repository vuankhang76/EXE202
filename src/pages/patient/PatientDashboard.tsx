import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, User, Heart, Home, MessageCircle, Building2, Wallet, Edit, Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import appointmentService from '@/services/appointmentService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import patientService from '@/services/patientService';
import conversationService from '@/services/conversationService';
import type { AppointmentDto } from '@/types/appointment';
import type { PaymentTransactionDto } from '@/types/paymentTransaction';
import type { PatientDto, PatientUpdateDto } from '@/types/patient';
import type { ConversationListDTO, ConversationDTO, MessageDTO } from '@/types/conversation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  getStatusLabel,
  getStatusColor,
  getTypeLabel
} from '@/types/appointment';
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  formatCurrency
} from '@/types/paymentTransaction';

type TabType = 'overview' | 'appointments' | 'profile' | 'conversations';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentDto[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<Record<number, PaymentTransactionDto>>({});
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<PatientUpdateDto>({});
  const [saving, setSaving] = useState(false);
  const [conversations, setConversations] = useState<ConversationListDTO[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadAppointments();
    loadPatientData();
    loadConversations();
  }, [currentUser]);

  useEffect(() => {
    if (selectedConversationId) {
      loadChatData(selectedConversationId);
    }
  }, [selectedConversationId]);

  const parseLocalDateTime = (dateTimeString: string): Date => {
    const parts = dateTimeString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      const [, y, m, d, h, min, s] = parts;
      return new Date(+y, +m - 1, +d, +h, +min, +s);
    }
    return new Date(dateTimeString);
  };

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(parseLocalDateTime(dateString));

  const formatTime = (dateString: string) =>
    parseLocalDateTime(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

  const loadAppointments = async () => {
    if (!currentUser?.userId) return;
    
    try {
      setLoading(true);
      const patientId = parseInt(currentUser.userId);
      const response = await appointmentService.getPatientAppointments(patientId);
      if (response.success && response.data) {
        const upcoming = response.data
          .filter(apt => apt.status === 'Scheduled' || apt.status === 'Confirmed')
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
          .slice(0, 5);
        setUpcomingAppointments(upcoming);

        // Load payment transactions
        const payRes = await paymentTransactionService.getPatientPaymentTransactions(patientId);
        if (payRes.success && payRes.data) {
          const paymentMap: Record<number, PaymentTransactionDto> = {};
          for (const p of payRes.data) {
            if (p.appointmentId && (!paymentMap[p.appointmentId] || p.paymentId > paymentMap[p.appointmentId].paymentId))
              paymentMap[p.appointmentId] = p;
          }
          setPaymentTransactions(paymentMap);
        }
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async () => {
    if (!currentUser?.userId) return;
    
    try {
      const patientId = parseInt(currentUser.userId);
      const response = await patientService.getPatientById(patientId);
      if (response.success && response.data) {
        setPatientData(response.data);
        // Initialize edit form with current data
        setEditFormData({
          fullName: response.data.fullName,
          gender: response.data.gender || '',
          dateOfBirth: response.data.dateOfBirth || '',
          address: response.data.address || '',
          email: response.data.email || '',
          secondaryPhoneE164: response.data.secondaryPhoneE164 || '',
        });
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Không thể tải thông tin bệnh nhân');
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset form data
      if (patientData) {
        setEditFormData({
          fullName: patientData.fullName,
          gender: patientData.gender || '',
          dateOfBirth: patientData.dateOfBirth || '',
          address: patientData.address || '',
          email: patientData.email || '',
          secondaryPhoneE164: patientData.secondaryPhoneE164 || '',
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.userId) return;
    
    try {
      setSaving(true);
      const patientId = parseInt(currentUser.userId);
      const response = await patientService.updatePatient(patientId, editFormData);
      
      if (response.success && response.data) {
        setPatientData(response.data);
        setIsEditMode(false);
        toast.success('Cập nhật thông tin thành công!');
      } else {
        toast.error('Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const loadConversations = async () => {
    if (!currentUser?.userId) return;
    
    try {
      setConversationsLoading(true);
      const patientId = parseInt(currentUser.userId);
      const response = await conversationService.getPatientConversations(patientId);
      
      if (response.success && response.data) {
        // Sort by lastMessageAt descending
        const sorted = response.data.sort((a, b) => {
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
        setConversations(sorted);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadChatData = async (conversationId: number) => {
    if (!currentUser?.userId) return;

    const patientId = parseInt(currentUser.userId);
    setMessagesLoading(true);
    try {
      // Load conversation detail
      const convResponse = await conversationService.getPatientConversationDetail(
        patientId,
        conversationId
      );

      if (convResponse.success && convResponse.data) {
        setSelectedConversation(convResponse.data);
      }

      // Load messages
      const messagesResponse = await conversationService.getPatientMessages(
        patientId,
        conversationId,
        { pageNumber: 1, pageSize: 20 }
      );

      if (messagesResponse.success && messagesResponse.data) {
        // Sort messages by time (oldest first) for proper chat display
        const sortedMessages = (messagesResponse.data.messages || []).sort((a, b) => {
          const timeA = new Date(a.sentAt || a.createdAt || '').getTime();
          const timeB = new Date(b.sentAt || b.createdAt || '').getTime();
          return timeA - timeB;
        });
        
        setMessages(sortedMessages);
        setHasMore(messagesResponse.data.hasMore || false);
        setPage(1);
      }
    } catch (error: any) {
      console.error('Error loading chat:', error);
      toast.error('Không thể tải cuộc trò chuyện');
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!currentUser?.userId || !selectedConversationId || loadingMore) return;

    const patientId = parseInt(currentUser.userId);
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const messagesResponse = await conversationService.getPatientMessages(
        patientId,
        selectedConversationId,
        { pageNumber: nextPage, pageSize: 20 }
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
    if (!currentUser?.userId || !selectedConversationId) {
      throw new Error('Thiếu thông tin cuộc trò chuyện');
    }

    const patientId = parseInt(currentUser.userId);
    const formData = conversationService.createPatientMessageFormData(content, file);

    const response = await conversationService.sendPatientMessage(
      patientId, 
      selectedConversationId,
      formData
    );

    if (response.success && response.data) {
      setMessages((prev) => [...prev, response.data!]);
      toast.success('Đã gửi tin nhắn');
    } else {
      throw new Error(response.message || 'Không thể gửi tin nhắn');
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
      
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'Scheduled': { label: 'Đã đặt', variant: 'secondary' },
      'Confirmed': { label: 'Đã xác nhận', variant: 'default' },
      'InProgress': { label: 'Đang khám', variant: 'default' },
      'Completed': { label: 'Hoàn thành', variant: 'outline' },
      'Cancelled': { label: 'Đã hủy', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const sidebarItems = [
    { id: 'overview' as TabType, icon: Home, label: 'Tổng quan', description: 'Xem tổng quan' },
    { id: 'appointments' as TabType, icon: Calendar, label: 'Lịch hẹn', description: 'Quản lý lịch hẹn' },
    { id: 'conversations' as TabType, icon: MessageCircle, label: 'Hội thoại', description: 'Chat với bác sĩ' },
    { id: 'profile' as TabType, icon: User, label: 'Hồ sơ', description: 'Thông tin cá nhân' },
  ];

  const renderOverviewContent = () => (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 ">
          Xin chào, {currentUser?.fullName}! 👋
        </h1>
      </div>

      {/* Main Content Grid - 3 columns on large screens, 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Lịch hẹn sắp tới
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('appointments')}
                className="text-red-500 hover:text-red-600"
              >
                Xem tất cả
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Bạn chưa có lịch hẹn nào</p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Đặt lịch ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{appointment.tenantName}</h4>
                        {appointment.doctorName && (
                          <p className="text-sm text-gray-600">Bác sĩ: {appointment.doctorName}</p>
                        )}
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(appointment.startAt), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(appointment.startAt), 'HH:mm', { locale: vi })}</span>
                      </div>
                    </div>
                    {appointment.type && (
                      <p className="text-sm text-gray-500 mt-2">Loại: {appointment.type}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium text-gray-900">{currentUser?.fullName}</p>
                </div>
              </div>
              {currentUser?.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{currentUser.email}</p>
                  </div>
                </div>
              )}
              {currentUser?.phoneE164 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{currentUser.phoneE164}</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveTab('profile')}
              >
                Xem chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderAppointmentsContent = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Lịch hẹn của tôi</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      ) : upcomingAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch hẹn nào</h3>
            <p className="text-gray-600 mb-6">Bạn chưa có lịch hẹn sắp tới</p>
            <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white">
              Đặt lịch khám ngay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {upcomingAppointments.map((a) => (
            <Card
              key={a.appointmentId}
              onClick={() => navigate('/patient/appointments')}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-red-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{a.tenantName}</h3>
                        {a.doctorName && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <User className="w-4 h-4" />
                            {a.doctorName}
                            {a.doctorSpecialty && ` - ${a.doctorSpecialty}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(a.startAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {formatTime(a.startAt)} - {formatTime(a.endAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">{getTypeLabel(a.type)}</div>

                    {paymentTransactions[a.appointmentId] && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-md">
                        <Wallet className="w-4 h-4 text-amber-500" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Thanh toán</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(paymentTransactions[a.appointmentId]?.amount || 0)}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {getPaymentMethodLabel(paymentTransactions[a.appointmentId]?.method || '')}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            paymentTransactions[a.appointmentId]?.status || 'PENDING'
                          )}`}
                        >
                          {getPaymentStatusLabel(paymentTransactions[a.appointmentId]?.status || 'PENDING')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(a.status)}`}
                    >
                      {getStatusLabel(a.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderConversationsContent = () => (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {conversationsLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      ) : conversations.length === 0 ? (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có cuộc trò chuyện nào</h3>
            <p className="text-gray-600 mb-6">Hãy tìm phòng khám và bắt đầu chat để được tư vấn</p>
            <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white">
              Tìm phòng khám
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-full gap-4">
          {/* Left: Conversations List - Messenger Style */}
          <Card className="w-[350px] flex-shrink-0 flex flex-col border-gray-200 overflow-hidden">
            <CardHeader className="border-b border-gray-200 flex-shrink-0">
              <CardTitle className="text-xl font-bold">Chat</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {conversations.length} cuộc trò chuyện
              </p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 min-h-0">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.conversationId}
                    onClick={() => setSelectedConversationId(conv.conversationId)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversationId === conv.conversationId
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {conv.tenantName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">
                          {conv.tenantName || conv.title}
                        </h4>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimeAgo(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessagePreview || 'Chưa có tin nhắn'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Chat Box */}
          {!selectedConversationId ? (
            <Card className="flex-1 flex items-center justify-center border-gray-200 gap-0">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tin nhắn của bạn
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Chọn một cuộc trò chuyện bên trái để bắt đầu nhắn tin với phòng khám
                </p>
              </CardContent>
            </Card>
          ) : messagesLoading ? (
            <Card className="flex-1 flex items-center justify-center border-gray-200">
              <CardContent className="text-center p-12">
                <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải tin nhắn...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex flex-col border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedConversationId(null)}
                    className="flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {selectedConversation?.tenantName?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {selectedConversation?.title || selectedConversation?.tenantName || 'Cuộc trò chuyện'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation?.isClosed ? 'Đã đóng' : 'Đang hoạt động'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <MessageList
                  messages={messages}
                  currentUserId={currentUser?.userId ? parseInt(currentUser.userId) : undefined}
                  currentUserType="Patient"
                  loading={loadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMoreMessages}
                />

                {!selectedConversation?.isClosed && (
                  <MessageInput onSend={handleSendMessage} disabled={selectedConversation?.isClosed || false} />
                )}

                {selectedConversation?.isClosed && (
                  <div className="p-4 bg-gray-100 text-center text-gray-600 border-t flex-shrink-0">
                    Cuộc trò chuyện đã được đóng
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderProfileContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
        {!isEditMode ? (
          <Button
            onClick={handleEditToggle}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleEditToggle}
              variant="outline"
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        )}
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-6">
          {isEditMode ? (
            <div className="space-y-6">
              {/* Họ và tên */}
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full"
                />
              </div>

              {/* Giới tính */}
              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2 block">
                  Giới tính
                </Label>
                <Select
                  value={editFormData.gender || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Nam</SelectItem>
                    <SelectItem value="Female">Nữ</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ngày sinh */}
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 mb-2 block">
                  Ngày sinh
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                  Địa chỉ
                </Label>
                <Input
                  id="address"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Nhập email"
                  className="w-full"
                />
              </div>

              {/* Số điện thoại chính (read-only) */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Số điện thoại chính
                </Label>
                <Input
                  value={patientData?.primaryPhoneE164 || currentUser?.phoneE164 || ''}
                  disabled
                  className="w-full bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Số điện thoại chính không thể thay đổi</p>
              </div>

              {/* Số điện thoại phụ */}
              <div>
                <Label htmlFor="secondaryPhone" className="text-sm font-medium text-gray-700 mb-2 block">
                  Số điện thoại phụ
                </Label>
                <Input
                  id="secondaryPhone"
                  type="tel"
                  value={editFormData.secondaryPhoneE164 || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, secondaryPhoneE164: e.target.value })}
                  placeholder="+84 xxx xxx xxx"
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Họ và tên */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium text-gray-900">{patientData?.fullName || currentUser?.fullName || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Giới tính */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p className="font-medium text-gray-900">
                    {patientData?.gender === 'Male' ? 'Nam' : patientData?.gender === 'Female' ? 'Nữ' : patientData?.gender === 'Other' ? 'Khác' : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* Ngày sinh */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="font-medium text-gray-900">{formatDateDisplay(patientData?.dateOfBirth)}</p>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium text-gray-900">{patientData?.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{patientData?.email || currentUser?.email || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Số điện thoại chính */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Số điện thoại chính</p>
                  <p className="font-medium text-gray-900">{patientData?.primaryPhoneE164 || currentUser?.phoneE164 || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Số điện thoại phụ */}
              {patientData?.secondaryPhoneE164 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Số điện thoại phụ</p>
                    <p className="font-medium text-gray-900">{patientData.secondaryPhoneE164}</p>
                  </div>
                </div>
              )}

              {/* Ngày tạo tài khoản */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                  <p className="font-medium text-gray-900">
                    {patientData?.createdAt ? format(new Date(patientData.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      case 'appointments':
        return renderAppointmentsContent();
      case 'conversations':
        return renderConversationsContent();
      case 'profile':
        return renderProfileContent();
      default:
        return renderOverviewContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className={`flex-1 ${activeTab === 'conversations' ? 'flex flex-col' : 'overflow-auto'}`}>
        <div className={`container mx-auto px-4 ${activeTab === 'conversations' ? 'flex-1 flex flex-col py-4' : 'py-8'}`}>
          <div className={`flex gap-6 ${activeTab === 'conversations' ? 'flex-1 min-h-0' : ''}`}>
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <Card className="border-gray-200 sticky top-24">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-red-50 text-red-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 ${activeTab === 'conversations' ? 'flex flex-col min-h-0' : ''}`}>
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

