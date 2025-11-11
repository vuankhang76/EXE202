import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, FileText, User, Heart, Home, MessageCircle, Building2, Wallet, Edit, Save, X, ArrowLeft, Loader2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import appointmentService from '@/services/appointmentService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import patientService from '@/services/patientService';
import conversationService from '@/services/conversationService';
import chatHubService from '@/services/chatHubService';
import { medicalCaseRecordService } from '@/services/medicalCaseRecordService';
import type { AppointmentDto } from '@/types/appointment';
import type { PaymentTransactionDto } from '@/types/paymentTransaction';
import type { PatientDto, PatientUpdateDto } from '@/types/patient';
import type { ConversationListDTO, ConversationDTO, MessageDTO } from '@/types/conversation';
import type { MedicalCaseRecordDto } from '@/types/medicalCaseRecord';
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
  const location = useLocation();
  const { currentUser, token } = useAuth();
  
  // Determine initial tab based on current URL path
  const getInitialTab = (): TabType => {
    const path = location.pathname;
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/conversations')) return 'conversations';
    if (path.includes('/profile')) return 'profile';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentDto[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentDto[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<Record<number, PaymentTransactionDto>>({});
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<PatientUpdateDto>({});
  const [saving, setSaving] = useState(false);
  const [conversations, setConversations] = useState<ConversationListDTO[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [appointmentMedicalRecord, setAppointmentMedicalRecord] = useState<MedicalCaseRecordDto | null>(null);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(false);
  const [, setSignalRReady] = useState(false);
  const signalRInitialized = useRef(false);
  const conversationListenersSetup = useRef<number | null>(null);

  useEffect(() => {
    loadAppointments();
    loadPatientData();
    loadConversations();

    if (token && !signalRInitialized.current) {
      signalRInitialized.current = true;
      initializeSignalR(token);
    }

    return () => {
      chatHubService.stop();
      signalRInitialized.current = false;
    };
  }, [token, currentUser?.userId]);

  const initializeSignalR = async (token: string) => {
    try {
      await chatHubService.start(token);
      setSignalRReady(true);
    } catch (error) {
      // Ignore abort errors from React cleanup (expected in dev mode)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAbortError = errorMessage.includes('stopped during negotiation') || 
                          errorMessage.includes('connection was stopped');
      
      if (isAbortError) {
        return;
      }
      
      console.error('SignalR initialization failed:', error);
      setSignalRReady(false);
      toast.error('Không thể kết nối real-time. Vui lòng tải lại trang.');
    }
  };

  // Remove polling - no longer needed
  // useEffect(() => {
  //   if (activeTab !== 'conversations') return;
  //   const intervalId = setInterval(() => {
  //     refreshConversations();
  //   }, 10000);
  //   return () => clearInterval(intervalId);
  // }, [activeTab]);

  // Update activeTab when URL changes
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (selectedConversationId) {
      loadChatData(selectedConversationId);
      setupConversationSignalRWithRetry(selectedConversationId);
    }

    return () => {
      if (selectedConversationId) {
        chatHubService.leaveConversation(selectedConversationId);
        chatHubService.offAllListeners();
        conversationListenersSetup.current = null;
      }
    };
  }, [selectedConversationId]);

  const setupConversationSignalRWithRetry = async (conversationId: number, maxRetries = 15) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (chatHubService.isConnected()) {
        await setupConversationSignalR(conversationId);
        return;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.error('Failed to connect to SignalR after maximum retries');
  };

  const setupConversationSignalR = async (conversationId: number) => {
    if (conversationListenersSetup.current === conversationId) {
      return;
    }

    try {
      chatHubService.offAllListeners();
      await chatHubService.joinConversation(conversationId);
      
      conversationListenersSetup.current = conversationId;

      chatHubService.onReceiveMessage((message: MessageDTO) => {
        const isFromMe = currentUser?.userId && message.senderPatientId === parseInt(currentUser.userId);
        if (!isFromMe) {
          setMessages(prev => [...prev, message]);
        }
      });

      chatHubService.onMessagesRead(() => {
        loadConversations();
      });
    } catch (error) {
      console.error('Failed to setup conversation SignalR:', error);
      conversationListenersSetup.current = null;
    }
  };

  const parseLocalDateTime = (dateTimeString: string): Date => {
    const parts = dateTimeString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      const [, y, m, d, h, min, s] = parts;
      return new Date(+y, +m - 1, +d, +h, +min, +s);
    }
    return new Date(dateTimeString);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(parseLocalDateTime(dateString));
  };

  const formatTime = (dateString: string) => {
    return parseLocalDateTime(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
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

  const getGenderLabel = (gender?: string) => {
    if (!gender) return 'N/A';
    return gender === 'F' ? 'Nữ' : gender === 'M' ? 'Nam' : gender;
  };

  const renderDoctorAvatar = (doctorName: string, avatarUrl?: string) => {
    const initial = doctorName.charAt(0).toUpperCase();
    
    if (avatarUrl) {
      return (
        <>
          <img
            src={avatarUrl}
            alt={doctorName}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl hidden">
            {initial}
          </div>
        </>
      );
    }
    
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
        {initial}
      </div>
    );
  };

  const renderInfoItem = (icon: React.ReactNode, label: string, value: string, colSpan?: number) => (
    <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${colSpan ? `col-span-${colSpan}` : ''}`}>
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );

  const loadAppointments = async () => {
    if (!currentUser?.userId) return;
    
    try {
      setLoading(true);
      const patientId = parseInt(currentUser.userId);
      const response = await appointmentService.getPatientAppointments(patientId);
      if (response.success && response.data) {
        const allApts = response.data
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        
        setAllAppointments(allApts);
        
        const now = new Date();
        const confirmedAppointments = allApts.filter(apt => 
          apt.status === 'Confirmed' && new Date(apt.startAt) >= now
        );
        const upcoming = confirmedAppointments.slice(0, 3);
        setUpcomingAppointments(upcoming);

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
        setEditFormData({
          fullName: response.data.fullName,
          gender: response.data.gender || '',
          dateOfBirth: response.data.dateOfBirth || '',
          address: response.data.address || '',
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin bệnh nhân');
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      if (patientData) {
        setEditFormData({
          fullName: patientData.fullName,
          gender: patientData.gender || '',
          dateOfBirth: patientData.dateOfBirth || '',
          address: patientData.address || '',
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
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const loadMedicalRecordForAppointment = async (appointmentId: number) => {
    if (!currentUser?.userId) return;
    
    try {
      setLoadingMedicalRecord(true);
      const patientId = parseInt(currentUser.userId);
      
      // Lấy tất cả medical records của bệnh nhân
      const response = await medicalCaseRecordService.getPatientMedicalCaseRecords(patientId);
      
      if (response.success && response.data) {
        // Tìm medical record tương ứng với appointment
        const record = response.data.find(r => r.appointmentId === appointmentId);
        setAppointmentMedicalRecord(record || null);
      } else {
        setAppointmentMedicalRecord(null);
      }
    } catch (error) {
      console.error('Error loading medical record:', error);
      setAppointmentMedicalRecord(null);
    } finally {
      setLoadingMedicalRecord(false);
    }
  };

  const handleSelectAppointment = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    loadMedicalRecordForAppointment(appointmentId);
  };

  const loadConversations = async () => {
    if (!currentUser?.userId) return;
    
    try {
      const patientId = parseInt(currentUser.userId);
      const response = await conversationService.getPatientConversations(patientId);
      
      if (response.success && response.data) {
        const sorted = response.data.sort((a, b) => {
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
        setConversations(sorted);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadChatData = async (conversationId: number) => {
    if (!currentUser?.userId) return;

    const patientId = parseInt(currentUser.userId);
    setMessagesLoading(true);
    try {
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
        // Backend already returns messages in ascending order (old to new)
        setMessages(messagesResponse.data.messages || []);
        setHasMore(messagesResponse.data.hasMore || false);
        setPage(1);
      }
    } catch (error: any) {
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
        // Backend returns in ascending order, prepend old messages to beginning
        const olderMessages = messagesResponse.data.messages || [];
        setMessages((prev) => [...olderMessages, ...prev]);
        setHasMore(messagesResponse.data.hasMore || false);
        setPage(nextPage);
      }
    } catch (error) {
      toast.error('Không thể tải thêm tin nhắn');
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
    { id: 'overview' as TabType, icon: Home, label: 'Tổng quan', description: 'Xem tổng quan', path: '/patient/dashboard' },
    { id: 'appointments' as TabType, icon: Calendar, label: 'Lịch hẹn', description: 'Quản lý lịch hẹn', path: '/patient/appointments' },
    { id: 'conversations' as TabType, icon: MessageCircle, label: 'Hội thoại', description: 'Chat với bác sĩ', path: '/patient/conversations' },
    { id: 'profile' as TabType, icon: User, label: 'Hồ sơ', description: 'Thông tin cá nhân', path: '/patient/profile' },
  ];

  const renderOverviewContent = () => (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 ">
          Xin chào, {currentUser?.fullName}! 👋
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    <div className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Lịch hẹn của tôi</h2>
        </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      ) : allAppointments.length === 0 ? (
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
        <div className="flex h-full gap-4">
          <Card className="w-[400px] flex flex-col border-gray-200 overflow-hidden !gap-0 !py-0">
            <CardContent className="flex-1 overflow-y-auto p-2 min-h-0">
              <div className="space-y-2">
                {allAppointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    onClick={() => handleSelectAppointment(appointment.appointmentId)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedAppointmentId === appointment.appointmentId
                        ? 'bg-red-50 border-red-200 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {/* Tenant Logo */}
                      {appointment.tenantLogoUrl ? (
                        <img
                          src={appointment.tenantLogoUrl}
                          alt={appointment.tenantName}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold text-sm ${appointment.tenantLogoUrl ? 'hidden' : ''}`}>
                        {appointment.tenantName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{appointment.tenantName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        {appointment.doctorName && (
                          <p className="text-xs text-gray-600">{appointment.doctorName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 ml-[52px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(appointment.startAt), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(appointment.startAt), 'HH:mm', { locale: vi })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Appointment Details */}
          {!selectedAppointmentId ? (
            <Card className="flex-1 flex items-center justify-center border-gray-200">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chi tiết lịch hẹn
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Chọn một lịch hẹn bên trái để xem thông tin chi tiết
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              {(() => {
                const appointment = allAppointments.find(a => a.appointmentId === selectedAppointmentId);
                if (!appointment) return null;

                return (
                  <>
                    {/* Appointment Info Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Tenant Logo */}
                            {appointment.tenantLogoUrl ? (
                              <img
                                src={appointment.tenantLogoUrl}
                                alt={appointment.tenantName}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 ${appointment.tenantLogoUrl ? 'hidden' : ''}`}>
                              {appointment.tenantName?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">{appointment.tenantName}</h3>
                              <p className="text-sm text-gray-600">{getTypeLabel(appointment.type)}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Calendar className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Ngày khám</p>
                                <p className="font-medium text-gray-900">{formatDate(appointment.startAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Clock className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Giờ khám</p>
                                <p className="font-medium text-gray-900">
                                  {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {paymentTransactions[appointment.appointmentId] && (
                            <div className="flex items-center gap-2 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                              <Wallet className="w-5 h-5 text-amber-600" />
                              <div className="flex-1">
                                <div className="text-sm text-amber-800 font-medium">Thông tin thanh toán</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-lg font-bold text-amber-900">
                                    {formatCurrency(paymentTransactions[appointment.appointmentId]?.amount || 0)}
                                  </span>
                                  <span className="text-sm text-amber-700">
                                    • {getPaymentMethodLabel(paymentTransactions[appointment.appointmentId]?.method || '')}
                                  </span>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                                paymentTransactions[appointment.appointmentId]?.status || 'PENDING'
                              )}`}>
                                {getPaymentStatusLabel(paymentTransactions[appointment.appointmentId]?.status || 'PENDING')}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {appointment.doctorName && (
                      <Card className="border-gray-200">
                        <CardHeader className="border-b border-gray-200 !p-0 !px-4 !pb-4">
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-red-500" />
                            Thông tin bác sĩ
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start gap-4">
                            {renderDoctorAvatar(appointment.doctorName, appointment.doctorAvatarUrl)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-900">{appointment.doctorName}</h4>
                              {appointment.doctorSpecialty && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Chuyên khoa: <span className="font-medium">{appointment.doctorSpecialty}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="border-gray-200 ">
                      <CardHeader className="border-b border-gray-200 !p-0 !px-4 !pb-4">
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          Thông tin bệnh nhân
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {renderInfoItem(
                            <User className="w-5 h-5 text-gray-500" />,
                            'Họ và tên',
                            currentUser?.fullName || 'N/A'
                          )}
                          {renderInfoItem(
                            <FileText className="w-5 h-5 text-gray-500" />,
                            'Số điện thoại',
                            currentUser?.phoneE164 || 'N/A'
                          )}
                          {renderInfoItem(
                            <FileText className="w-5 h-5 text-gray-500" />,
                            'Giới tính',
                            getGenderLabel(patientData?.gender)
                          )}
                          {renderInfoItem(
                            <FileText className="w-5 h-5 text-gray-500" />,
                            'Ngày sinh',
                            patientData?.dateOfBirth ? format(new Date(patientData.dateOfBirth), 'dd/MM/yyyy', { locale: vi }) : 'N/A'
                          )}
                          {currentUser?.email && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-2">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{currentUser.email}</p>
                              </div>
                            </div>
                          )}
                          {patientData?.address && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-2">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Địa chỉ</p>
                                <p className="font-medium text-gray-900">{patientData.address}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardHeader className="border-b border-gray-200 !p-0 !px-4 !pb-4">
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-red-500" />
                          Kết quả khám bệnh
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingMedicalRecord ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Đang tải kết quả...</p>
                          </div>
                        ) : appointmentMedicalRecord ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                              <div>
                                <p className="text-sm text-gray-500">Trạng thái hồ sơ</p>
                                <p className="font-medium text-gray-900 mt-1">
                                  {appointmentMedicalRecord.status === 'Ongoing' ? 'Đang điều trị' : 
                                   appointmentMedicalRecord.status === 'Completed' ? 'Hoàn thành' : 
                                   appointmentMedicalRecord.status}
                                </p>
                              </div>
                              <Badge variant={appointmentMedicalRecord.status === 'Completed' ? 'default' : 'secondary'}>
                                {appointmentMedicalRecord.status === 'Ongoing' ? 'Đang điều trị' : 
                                 appointmentMedicalRecord.status === 'Completed' ? 'Hoàn thành' : 
                                 appointmentMedicalRecord.status}
                              </Badge>
                            </div>

                            {appointmentMedicalRecord.diagnosis && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-medium text-blue-900 mb-2">Chẩn đoán</p>
                                <p className="text-sm text-blue-800">{appointmentMedicalRecord.diagnosis}</p>
                              </div>
                            )}

                            {appointmentMedicalRecord.chiefComplaint && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Triệu chứng chính</p>
                                <p className="text-sm text-gray-600">{appointmentMedicalRecord.chiefComplaint}</p>
                              </div>
                            )}

                            {appointmentMedicalRecord.physicalExam && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Khám lâm sàng</p>
                                <p className="text-sm text-gray-600">{appointmentMedicalRecord.physicalExam}</p>
                              </div>
                            )}

                            {appointmentMedicalRecord.treatmentPlan && (
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-medium text-green-900 mb-2">Phương án điều trị</p>
                                <p className="text-sm text-green-800">{appointmentMedicalRecord.treatmentPlan}</p>
                              </div>
                            )}

                            {appointmentMedicalRecord.progressNotes && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Ghi chú tiến triển</p>
                                <p className="text-sm text-gray-600">{appointmentMedicalRecord.progressNotes}</p>
                              </div>
                            )}

                            <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                              Cập nhật lần cuối: {appointmentMedicalRecord.updatedAt 
                                ? format(new Date(appointmentMedicalRecord.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                                : format(new Date(appointmentMedicalRecord.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Chưa có kết quả khám bệnh</p>
                            <p className="text-gray-400 text-xs mt-1">
                              Kết quả sẽ được cập nhật sau khi bác sĩ hoàn thành khám
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderConversationsContent = () => (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {loading ? (
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
          <Card className="w-[350px] flex flex-col border-gray-200 overflow-hidden !py-2 gap-2">
            <CardHeader className="pt-3">
              <CardTitle className="text-xl">Đoạn chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto !px-3">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có cuộc hội thoại nào
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.conversationId}
                      onClick={() => setSelectedConversationId(conv.conversationId)}
                      className={`flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border ${
                        selectedConversationId === conv.conversationId 
                          ? 'bg-red-50 border-red-300' 
                          : ''
                      }`}
                    >
                      {/* Tenant Logo/Avatar */}
                      {conv.tenantThumbnailUrl ? (
                        <img
                          src={conv.tenantThumbnailUrl}
                          alt={conv.tenantName || 'Phòng khám'}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ${conv.tenantThumbnailUrl ? 'hidden' : ''}`}>
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.tenantName || 'Phòng khám'}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conv.lastMessagePreview || 'Chưa có tin nhắn'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(conv.lastMessageAt)}
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
              <CardContent className="text-center p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-3xl mx-auto">
                    <MessageCircle className="w-12 h-12 text-blue-500" />
                  </div>
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
            <Card className="flex-1 flex flex-col border-gray-200 overflow-hidden !py-0 gap-0">
              <CardHeader className="border-b border-gray-200 !pt-4 !py-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedConversationId(null)}
                    className=""
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  
                  {/* Tenant Logo/Avatar */}
                  {(() => {
                    const conv = conversations.find(c => c.conversationId === selectedConversationId);
                    const thumbnailUrl = conv?.tenantThumbnailUrl;
                    const tenantName = selectedConversation?.tenantName || 'C';
                    
                    if (thumbnailUrl) {
                      return (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt={tenantName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold hidden">
                            {tenantName.charAt(0).toUpperCase()}
                          </div>
                        </>
                      );
                    }
                    
                    return (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold">
                        {tenantName.charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                  
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
        <CardContent>
          {isEditMode ? (
            <div className="space-y-6">
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
                    <SelectItem value="M">Nam</SelectItem>
                    <SelectItem value="F">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email
                </Label>
                <Input
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Email từ tài khoản người dùng, không thể thay đổi</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Số điện thoại
                </Label>
                <Input
                  value={patientData?.primaryPhoneE164 || currentUser?.phoneE164 || ''}
                  disabled
                  className="w-full bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Số điện thoại chính không thể thay đổi</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium text-gray-900">{patientData?.fullName || currentUser?.fullName || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p className="font-medium text-gray-900">
                    {patientData?.gender === 'M' ? 'Nam' : patientData?.gender === 'F' ? 'Nữ' : patientData?.gender === 'Other' ? 'Khác' : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="font-medium text-gray-900">{formatDateDisplay(patientData?.dateOfBirth)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium text-gray-900">{patientData?.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{currentUser?.email || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Số điện thoại chính</p>
                  <p className="font-medium text-gray-900">{ currentUser?.phoneE164 || 'Chưa cập nhật'}</p>
                </div>
              </div>

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
            <aside className="w-64">
              <Card className="border-gray-200 sticky top-24 py-2">
                <CardContent className='px-2'>
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            navigate(item.path);
                          }}
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

            <main className={`flex-1 min-w-0 ${activeTab === 'conversations' ? 'flex flex-col min-h-0' : ''}`}>
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

