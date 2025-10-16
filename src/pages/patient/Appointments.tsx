import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import appointmentService from '@/services/appointmentService';
import type { AppointmentDto } from '@/types/appointment';
import { getStatusLabel, getStatusColor, getTypeLabel } from '@/types/appointment';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (currentUser?.userId) {
      loadAppointments();
    }
  }, [currentUser, filter]);

  const loadAppointments = async () => {
    if (!currentUser?.userId) return;

    setLoading(true);
    try {
      const patientId = parseInt(currentUser.userId);
      const response = await appointmentService.getPatientAppointments(patientId);

      if (response.success && response.data) {
        let filteredAppointments = response.data;

        const now = new Date();
        if (filter === 'upcoming') {
          filteredAppointments = response.data.filter(
            (apt) => new Date(apt.startAt) >= now && apt.status !== 'Cancelled' && apt.status !== 'Completed'
          );
        } else if (filter === 'past') {
          filteredAppointments = response.data.filter(
            (apt) => new Date(apt.startAt) < now || apt.status === 'Cancelled' || apt.status === 'Completed'
          );
        }

        // Sort by date (newest first for past, soonest first for upcoming)
        filteredAppointments.sort((a, b) => {
          const dateA = new Date(a.startAt).getTime();
          const dateB = new Date(b.startAt).getTime();
          return filter === 'past' ? dateB - dateA : dateA - dateB;
        });

        setAppointments(filteredAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
      return;
    }

    try {
      const response = await appointmentService.cancelAppointment(appointmentId, 'Bệnh nhân hủy lịch');
      if (response.success) {
        alert('Hủy lịch hẹn thành công');
        loadAppointments();
      } else {
        alert(response.message || 'Không thể hủy lịch hẹn');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Đã xảy ra lỗi khi hủy lịch hẹn');
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
              <Button
                onClick={() => navigate('/')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Đặt lịch mới
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-2 px-4 rounded-md transition-all ${
                  filter === 'all'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`flex-1 py-2 px-4 rounded-md transition-all ${
                  filter === 'upcoming'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sắp tới
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`flex-1 py-2 px-4 rounded-md transition-all ${
                  filter === 'past'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Đã qua
              </button>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có lịch hẹn nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có lịch hẹn {filter === 'upcoming' ? 'sắp tới' : filter === 'past' ? 'trong quá khứ' : 'nào'}
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Đặt lịch khám ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card
                  key={appointment.appointmentId}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/patient/appointments/${appointment.appointmentId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Clinic & Doctor */}
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {appointment.tenantName}
                            </h3>
                            {appointment.doctorName && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <User className="w-4 h-4" />
                                {appointment.doctorName}
                                {appointment.doctorSpecialty && ` - ${appointment.doctorSpecialty}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(appointment.startAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                              {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                            </span>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {getTypeLabel(appointment.type)}
                          </span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>

                        {appointment.status === 'Scheduled' || appointment.status === 'Confirmed' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelAppointment(appointment.appointmentId);
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
                              navigate(`/patient/appointments/${appointment.appointmentId}`);
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
