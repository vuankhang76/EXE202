import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Building2, ChevronRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import appointmentService from '@/services/appointmentService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import { toast } from 'sonner';
import type { AppointmentDto } from '@/types/appointment';
import type { PaymentTransactionDto } from '@/types/paymentTransaction';
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

export default function PatientAppointments() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<Record<number, PaymentTransactionDto>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (currentUser?.userId) loadAppointments();
  }, [currentUser, filter]);

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
    setLoading(true);

    try {
      const patientId = +currentUser.userId;
      const response = await appointmentService.getPatientAppointments(patientId);

      if (response.success && response.data) {
        const now = new Date();
        let filtered = response.data;

        if (filter === 'upcoming') {
          filtered = filtered.filter((a) => {
            const date = parseLocalDateTime(a.startAt);
            return date >= now && !['Cancelled', 'Completed'].includes(a.status);
          });
        } else if (filter === 'past') {
          filtered = filtered.filter((a) => {
            const date = parseLocalDateTime(a.startAt);
            return date < now || ['Cancelled', 'Completed'].includes(a.status);
          });
        }

        filtered.sort((a, b) =>
          filter === 'past'
            ? parseLocalDateTime(b.startAt).getTime() - parseLocalDateTime(a.startAt).getTime()
            : parseLocalDateTime(a.startAt).getTime() - parseLocalDateTime(b.startAt).getTime()
        );

        setAppointments(filtered);

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
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;

    try {
      const res = await appointmentService.cancelAppointment(appointmentId, 'Bệnh nhân hủy lịch');
      if (res.success) {
        toast.success('Hủy lịch hẹn thành công');
        loadAppointments();
      } else {
        toast.error(res.message || 'Không thể hủy lịch hẹn');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error('Đã xảy ra lỗi khi hủy lịch hẹn');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-red-500" />
                Lịch hẹn của tôi
              </h1>
              <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white">
                Đặt lịch mới
              </Button>
            </div>

            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {['all', 'upcoming', 'past'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`flex-1 py-2 px-4 rounded-md transition-all ${
                    filter === f ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f === 'upcoming' ? 'Sắp tới' : 'Đã qua'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch hẹn nào</h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có lịch hẹn{' '}
                  {filter === 'upcoming' ? 'sắp tới' : filter === 'past' ? 'trong quá khứ' : 'nào'}
                </p>
                <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white">
                  Đặt lịch khám ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((a) => (
                <Card
                  key={a.appointmentId}
                  onClick={() => navigate(`/patient/appointments/${a.appointmentId}`)}
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

                        {['Scheduled', 'Confirmed'].includes(a.status) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelAppointment(a.appointmentId);
                            }}
                            className="text-red-600 hover:bg-red-50 border-red-300"
                          >
                            Hủy lịch
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patient/appointments/${a.appointmentId}`);
                            }}
                          >
                            Xem chi tiết
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
