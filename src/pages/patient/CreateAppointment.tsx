import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DoctorSelector from '@/components/appointments/DoctorSelector';
import TimeSlotPicker from '@/components/appointments/TimeSlotPicker';
import BookingConfirmation from '@/components/appointments/BookingConfirmation';
import { useAuth } from '@/contexts/AuthContext';
import tenantService from '@/services/tenantService';
import appointmentService from '@/services/appointmentService';
import type { TenantDto, DoctorDto } from '@/types';
import type { AppointmentCreateDto } from '@/types/appointment';
import { AppointmentType } from '@/types/appointment';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { } = useAuth();

  const [clinic, setClinic] = useState<TenantDto | null>(null);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>(AppointmentType.CLINIC);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Get initial data from navigation state
  const { clinicId, doctorId, patientId: initialPatientId } = (location.state as any) || {};
  const [patientId] = useState<number | null>(initialPatientId || null);

  useEffect(() => {
    if (clinicId) {
      loadClinicData();
    }
  }, [clinicId]);

  useEffect(() => {
    if (doctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d.doctorId === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [doctorId, doctors]);

  const loadClinicData = async () => {
    try {
      const [clinicResponse, doctorsResponse] = await Promise.all([
        tenantService.getTenantById(clinicId),
        tenantService.getTenantDoctors(clinicId, 1, 50)
      ]);

      if (clinicResponse.success && clinicResponse.data) {
        setClinic(clinicResponse.data);
      }

      if (doctorsResponse.success && doctorsResponse.data) {
        const verifiedDoctors = doctorsResponse.data.data.filter(d => d.isVerified);
        setDoctors(verifiedDoctors);
      }
    } catch (error) {
      console.error('Error loading clinic data:', error);
    }
  };

  const handleDoctorSelect = (doctor: DoctorDto) => {
    setSelectedDoctor(doctor);
    setStartTime('');
    setEndTime('');
  };

  const handleTimeSlotSelect = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setStartTime('');
    setEndTime('');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // 90 days from now
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !startTime || !endTime || !patientId || !clinic) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const appointmentData: AppointmentCreateDto = {
        tenantId: clinic.tenantId,
        patientId: patientId,
        doctorId: selectedDoctor.doctorId,
        startAt: startTime,
        endAt: endTime,
        type: appointmentType,
        address: appointmentType === AppointmentType.CLINIC ? clinic.address : undefined,
        channel: appointmentType === AppointmentType.ONLINE ? 'Video Call' : undefined
      };

      const response = await appointmentService.createAppointment(appointmentData);

      if (response.success) {
        alert('Đặt lịch thành công!');
        navigate('/patient/appointments');
      } else {
        alert(response.message || 'Đặt lịch thất bại');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Đã xảy ra lỗi khi đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = selectedDoctor && startTime && endTime && patientId;

  if (!clinic) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Đang tải thông tin...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-red-500" />
              Đặt lịch khám
            </h1>
            <p className="text-gray-600 mt-2">
              Chọn bác sĩ và thời gian phù hợp với bạn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clinic Info Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {clinic.thumbnailUrl && (
                      <img
                        src={clinic.thumbnailUrl}
                        alt={clinic.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {clinic.name}
                      </h2>
                      {clinic.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {clinic.address}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Selection */}
              <DoctorSelector
                doctors={doctors}
                selectedDoctorId={selectedDoctor?.doctorId}
                onDoctorSelect={handleDoctorSelect}
              />

              {/* Date Selection */}
              {selectedDoctor && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-red-500" />
                      Chọn ngày khám
                    </h3>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-base cursor-pointer"
                        style={{
                          colorScheme: 'light'
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Bạn có thể đặt lịch từ hôm nay đến {new Date(getMaxDate()).toLocaleDateString('vi-VN')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Time Slot Selection */}
              {selectedDoctor && selectedDate && (
                <TimeSlotPicker
                  doctorId={selectedDoctor.doctorId}
                  selectedDate={selectedDate}
                  onTimeSlotSelect={handleTimeSlotSelect}
                  selectedTime={startTime}
                />
              )}

              {/* Appointment Type */}
              {startTime && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Hình thức khám
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setAppointmentType(AppointmentType.CLINIC)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          appointmentType === AppointmentType.CLINIC
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          Khám tại phòng khám
                        </p>
                      </button>
                      <button
                        onClick={() => setAppointmentType(AppointmentType.ONLINE)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          appointmentType === AppointmentType.ONLINE
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          Khám online
                        </p>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {startTime && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Ghi chú (tùy chọn)
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Mô tả triệu chứng hoặc lý do khám..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Confirmation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {selectedDoctor && startTime && endTime && (
                  <>
                    <BookingConfirmation
                      clinic={clinic}
                      doctor={selectedDoctor}
                      appointmentDate={selectedDate}
                      startTime={startTime}
                      endTime={endTime}
                      appointmentType={appointmentType}
                      notes={notes}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || loading}
                      className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white"
                      size="lg"
                    >
                      {loading ? (
                        <>Đang xử lý...</>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Xác nhận đặt lịch
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
