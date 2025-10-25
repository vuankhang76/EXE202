import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, ArrowLeft, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreateAppointmentSkeleton from "@/components/appointments/CreateAppointmentSkeleton";
import CalendarDatePicker from "@/components/appointments/CalendarDatePicker";
import { ServiceSelector } from "@/components/appointments/ServiceSelector";
import DoctorSelector from "@/components/appointments/DoctorSelector";
import GeneralTimeSlotPicker from "@/components/appointments/GeneralTimeSlotPicker";
import { useAuth } from "@/contexts/AuthContext";
import tenantService from '@/services/tenantService';
import { serviceService } from '@/services/serviceService';
import { tenantSettingService } from '@/services/tenantSettingService';
import type { TenantDto, DoctorDto } from '@/types';
import type { Service } from '@/types/service';
import { AppointmentType } from "@/types/appointment";
import { toast } from "sonner";

export default function CreateAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const {} = useAuth();
  const [clinic, setClinic] = useState<TenantDto | null>(null);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<DoctorDto[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [maxBookingDate, setMaxBookingDate] = useState<Date | null>(null);
  const [maxBookingDays, setMaxBookingDays] = useState<number | null>(null);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number | null>(null);
  const [allowWeekendBooking, setAllowWeekendBooking] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isServiceCollapsed, setIsServiceCollapsed] = useState(false);
  const [isDateCollapsed, setIsDateCollapsed] = useState(false);
  const [isTimeCollapsed, setIsTimeCollapsed] = useState(false);
  const [isDoctorCollapsed, setIsDoctorCollapsed] = useState(false);

  const {
    clinicId,
    doctorId,
    patientId: initialPatientId,
  } = (location.state as any) || {};
  const [patientId] = useState<number | null>(initialPatientId || null);

  useEffect(() => {
    if (clinicId) {
      loadClinicData();
      loadMaxBookingDate();
    }
  }, [clinicId]);



  useEffect(() => {
    if (doctorId && doctors.length > 0) {
      const doctor = doctors.find((d) => d.doctorId === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [doctorId, doctors]);

  const loadClinicData = async () => {
    setLoading(true);
    try {
      const response = await tenantService.getTenantById(clinicId);
      if (response.success && response.data) {
        setClinic(response.data);

        const doctorsResponse = await tenantService.getTenantDoctors(
          clinicId,
          1,
          50
        );
        if (doctorsResponse.success && doctorsResponse.data) {
          const verifiedDoctors = doctorsResponse.data.data.filter(
            (d) => d.isVerified
          );
          setDoctors(verifiedDoctors);
        }
      }
    } catch (error) {
      console.error("Error loading clinic data:", error);
      toast.error("Không thể tải thông tin phòng khám");
    } finally {
      setLoading(false);
    }
  };

  const loadMaxBookingDate = async () => {
    if (!clinicId) return;
    try {
      const config = await tenantSettingService.getBookingConfig(clinicId);
      if (config.success && config.data) {
        const maxDays = config.data.maxAdvanceBookingDays;
        setMaxBookingDays(maxDays);
        setSlotDurationMinutes(config.data.defaultSlotDurationMinutes);
        setAllowWeekendBooking(config.data.allowWeekendBooking);
        
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + maxDays);
        setMaxBookingDate(maxDate);
      } else {
        toast.error("Không thể tải cấu hình đặt lịch của phòng khám");
      }
    } catch (error) {
      console.error("Error loading booking config:", error);
      toast.error("Lỗi khi tải cấu hình đặt lịch. Vui lòng thử lại sau.");
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setStartTime("");
    setEndTime("");
    setAppointmentType(null);
    setIsServiceCollapsed(true);
    setIsDateCollapsed(false);

    if (clinic) {
      loadAvailableDates();
    }
  };

  const loadAvailableDates = async () => {
    if (!clinic) return;

    setLoadingDates(true);
    try {
      const { startDate, endDate } = await tenantSettingService.getBookingDateRange(clinic.tenantId);
      const response = await serviceService.getAvailableDates(
        clinic.tenantId,
        startDate,
        endDate
      );

      if (response.success && response.data) {
        setAvailableDates(response.data);
      }
    } catch (error) {
      console.error("Error loading available dates:", error);
    } finally {
      setLoadingDates(false);
    }
  };

  const handleDoctorSelect = (doctor: DoctorDto) => {
    setSelectedDoctor(doctor);
    if (!appointmentType) {
      setAppointmentType(AppointmentType.CLINIC);
    }
    
    setIsDoctorCollapsed(true);
  };

  const handleTimeSlotSelect = async (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);

    setSelectedDoctor(null);
    setAppointmentType(null);
    setIsTimeCollapsed(true);
    setIsDoctorCollapsed(false);

    if (clinic) {
      await filterAvailableDoctors(start);
    }
  };

  const filterAvailableDoctors = async (startTime: string) => {
    setLoadingDoctors(true);
    try {
      const timeMatch = startTime.match(/T(\d{2}:\d{2})/);
      if (!timeMatch) return;

      const timeSlot = timeMatch[1];

      const dateMatch = startTime.match(/^(\d{4}-\d{2}-\d{2})/);
      const dateStr = dateMatch ? dateMatch[1] : undefined;

      const date = new Date(startTime);
      let dayOfWeek = date.getDay();
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

      const response = await serviceService.getAvailableDoctors(
        clinic!.tenantId,
        dayOfWeek,
        timeSlot,
        dateStr,
        slotDurationMinutes || 30 // Pass slot duration to API
      );

      if (response.success && response.data) {
        const filtered = doctors.filter((d) =>
          response.data!.includes(d.doctorId)
        );
        setAvailableDoctors(filtered);

        if (
          selectedDoctor &&
          !filtered.find((d) => d.doctorId === selectedDoctor.doctorId)
        ) {
          setSelectedDoctor(null);
        }
      } else {
        setAvailableDoctors(doctors);
      }
    } catch (error) {
      console.error("Error filtering available doctors:", error);
      setAvailableDoctors(doctors);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (date: Date) => {
    const dateStr = getDateString(date);

    if (allowWeekendBooking === false) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        toast.error("Phòng khám không cho phép đặt lịch vào cuối tuần (Thứ 7 và Chủ nhật).");
        return;
      }
    }

    if (availableDates.length > 0 && !availableDates.includes(dateStr)) {
      toast.error("Ngày này không có lịch trống. Vui lòng chọn ngày khác.");
      return;
    }

    setSelectedDate(date);
    setStartTime("");
    setEndTime("");
    setSelectedDoctor(null);
    setAppointmentType(null);
    
    setIsDateCollapsed(true);
    setIsTimeCollapsed(false);
  };

  const handleSubmit = async () => {
    if (
      !selectedDoctor ||
      !startTime ||
      !endTime ||
      !patientId ||
      !clinic ||
      !selectedService ||
      !appointmentType
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    navigate('/patient/payment', {
      state: {
        appointmentData: {
          tenantId: clinic.tenantId,
          patientId: patientId,
          doctorId: selectedDoctor.doctorId,
          startAt: startTime,
          endAt: endTime,
          type: appointmentType,
          serviceId: selectedService.serviceId,
          address: appointmentType === AppointmentType.CLINIC ? clinic.address : undefined,
          channel: "Web",
        },
        tenantId: clinic.tenantId,
        patientId: patientId,
        amount: selectedService.basePrice,
        clinic: clinic,
        doctor: selectedDoctor,
        service: selectedService,
        appointmentDate: selectedDate?.toLocaleDateString('vi-VN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        appointmentTime: `${new Date(startTime).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${new Date(endTime).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        appointmentType: appointmentType === AppointmentType.CLINIC ? '🏥 Khám tại phòng khám' : '💻 Khám online'
      }
    });
  };

  const canSubmit =
    selectedDoctor && startTime && endTime && patientId && selectedService;

  if (loading || !clinic) {
    return (
      <>
        <Header />
        <CreateAppointmentSkeleton />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm">
                      1
                    </span>
                    Chọn loại dịch vụ
                    {selectedService && isServiceCollapsed && (
                      <span className="ml-2 text-green-600 text-sm">✓</span>
                    )}
                  </h3>
                  {selectedService && isServiceCollapsed && (
                    <button
                      onClick={() => setIsServiceCollapsed(false)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Thay đổi
                    </button>
                  )}
                </div>
                
                <div className="transition-all duration-300">
                  {isServiceCollapsed && selectedService ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Dịch vụ đã chọn:</p>
                      <p className="font-medium text-gray-900 mt-1">{selectedService.name}</p>
                      <p className="text-sm text-red-600 font-semibold mt-1">
                        {selectedService.basePrice.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  ) : (
                    <div className="">
                      <ServiceSelector
                        tenantId={clinic.tenantId}
                        selectedServiceId={selectedService?.serviceId}
                        onServiceSelect={handleServiceSelect}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedService && (
                <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm">
                        2
                      </span>
                      <Calendar className="w-5 h-5 text-red-500" />
                      Chọn ngày khám
                      {selectedDate && isDateCollapsed && (
                        <span className="ml-2 text-green-600 text-sm">✓</span>
                      )}
                    </h3>
                    {selectedDate && isDateCollapsed && (
                      <button
                        onClick={() => setIsDateCollapsed(false)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Thay đổi
                      </button>
                    )}
                  </div>
                  
                  <div className="transition-all duration-300">
                    {isDateCollapsed && selectedDate ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Ngày đã chọn:</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {selectedDate.toLocaleDateString("vi-VN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    ) : loadingDates ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Đang tải ngày khả dụng...</p>
                      </div>
                    ) : (
                      <div className="">
                        {allowWeekendBooking === false && (
                          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-700">
                              ⚠️ <strong>Lưu ý:</strong> Phòng khám không cho phép đặt lịch vào <strong>Thứ 7</strong> và <strong>Chủ nhật</strong>
                            </p>
                          </div>
                        )}
                        
                        <CalendarDatePicker
                          selectedDate={selectedDate}
                          onDateSelect={handleDateChange}
                          minDate={new Date()}
                          maxDate={maxBookingDate || undefined}
                          availableDates={availableDates}
                        />
                        
                        {availableDates.length > 0 && maxBookingDays && (
                          <p className="text-sm text-green-600 mt-4 text-center">
                            ✓ Có {availableDates.length} ngày có lịch trống trong{" "}
                            {maxBookingDays} ngày tới
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedService && selectedDate && (
                <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm">
                        3
                      </span>
                      Chọn giờ khám
                      {startTime && isTimeCollapsed && (
                        <span className="ml-2 text-green-600 text-sm">✓</span>
                      )}
                    </h3>
                    {startTime && isTimeCollapsed && (
                      <button
                        onClick={() => setIsTimeCollapsed(false)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Thay đổi
                      </button>
                    )}
                  </div>
                  
                  <div className="transition-all duration-300">
                    {isTimeCollapsed && startTime ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Giờ đã chọn:</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {new Date(startTime).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(endTime).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className="">
                        <p className="text-sm text-gray-600 mb-4">
                          Chọn khung giờ phù hợp. Các bác sĩ có lịch sẽ hiển thị sau khi bạn chọn giờ.
                        </p>
                        <GeneralTimeSlotPicker
                          selectedDate={selectedDate}
                          onTimeSlotSelect={handleTimeSlotSelect}
                          selectedTime={startTime}
                          slotDurationMinutes={slotDurationMinutes || undefined}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedService && selectedDate && startTime && (
                <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm">
                        4
                      </span>
                      Chọn bác sĩ
                      {selectedDoctor && isDoctorCollapsed && (
                        <span className="ml-2 text-green-600 text-sm">✓</span>
                      )}
                    </h3>
                    {selectedDoctor && isDoctorCollapsed && (
                      <button
                        onClick={() => setIsDoctorCollapsed(false)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Thay đổi
                      </button>
                    )}
                  </div>
                  
                  <div className="transition-all duration-300">
                    {isDoctorCollapsed && selectedDoctor ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Bác sĩ đã chọn:</p>
                        <div className="flex items-center gap-3 mt-2">
                          {selectedDoctor.avatarUrl && (
                            <img
                              src={selectedDoctor.avatarUrl}
                              alt={selectedDoctor.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedDoctor.fullName}
                            </p>
                            {selectedDoctor.specialty && (
                              <p className="text-sm text-gray-600">
                                {selectedDoctor.specialty}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : loadingDoctors ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Đang tải danh sách bác sĩ...</p>
                      </div>
                    ) : availableDoctors.length > 0 ? (
                      <div className="">
                        <p className="text-sm text-gray-600 mb-4">
                          {availableDoctors.length} bác sĩ có lịch làm việc vào
                          thời gian bạn chọn
                        </p>
                        <DoctorSelector
                          doctors={availableDoctors}
                          selectedDoctorId={selectedDoctor?.doctorId}
                          onDoctorSelect={handleDoctorSelect}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          Không có bác sĩ nào làm việc vào khung giờ này.
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Vui lòng chọn khung giờ khác.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedService &&
                selectedDate &&
                startTime &&
                selectedDoctor && (
                  <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm">
                        5
                      </span>
                      Hình thức khám
                      {appointmentType && (
                        <span className="ml-2 text-green-600 text-sm">✓</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          setAppointmentType(AppointmentType.CLINIC)
                        }
                        className={`p-4 border-2 rounded-lg transition-all ${
                          appointmentType === AppointmentType.CLINIC
                            ? "border-red-500 bg-red-50 shadow-sm"
                            : "border-gray-200 hover:border-red-300 hover:shadow-sm"
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          🏥 Khám tại phòng khám
                        </p>
                      </button>
                      <button
                        onClick={() =>
                          setAppointmentType(AppointmentType.ONLINE)
                        }
                        className={`p-4 border-2 rounded-lg transition-all ${
                          appointmentType === AppointmentType.ONLINE
                            ? "border-red-500 bg-red-50 shadow-sm"
                            : "border-gray-200 hover:border-red-300 hover:shadow-sm"
                        }`}
                      >
                        <p className="font-medium text-gray-900">💻 Khám online</p>
                      </button>
                    </div>
                  </div>
                )}

              {selectedService &&
                selectedDate &&
                startTime &&
                selectedDoctor && (
                  <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      📝 Ghi chú (tùy chọn)
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Mô tả triệu chứng hoặc lý do khám..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-shadow"
                    />
                  </div>
                )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Thông tin đặt lịch
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Phòng khám</p>
                    <div className="flex items-center gap-4">
                      <div>
                        {clinic.thumbnailUrl && (
                          <img
                            src={clinic.thumbnailUrl}
                            alt={clinic.name}
                            className="w-12 h-12 rounded-lg object-cover mb-2"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {clinic.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {clinic.address}
                        </p>
                      </div>
                    </div>

                    {selectedService && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Dịch vụ</p>
                        <p className="font-medium text-gray-900">
                          {selectedService.name}
                        </p>
                        <p className="text-sm text-red-600 font-semibold mt-1">
                          {selectedService.basePrice.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    )}

                    {selectedService && selectedDate && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Ngày khám</p>
                        <p className="font-medium text-gray-900">
                          {selectedDate.toLocaleDateString("vi-VN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    {selectedService && selectedDate && startTime && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Giờ khám</p>
                        <p className="font-medium text-gray-900">
                          {new Date(startTime).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(endTime).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    {selectedDoctor && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Bác sĩ</p>
                        <div className="flex items-center gap-3 mt-2">
                          {selectedDoctor.avatarUrl && (
                            <img
                              src={selectedDoctor.avatarUrl}
                              alt={selectedDoctor.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedDoctor.fullName}
                            </p>
                            {selectedDoctor.specialty && (
                              <p className="text-sm text-gray-600">
                                {selectedDoctor.specialty}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDoctor && appointmentType && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Hình thức</p>
                        <p className="font-medium text-gray-900">
                          {appointmentType === AppointmentType.CLINIC
                            ? "🏥 Khám tại phòng khám"
                            : "💻 Khám online"}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedDoctor && startTime && endTime && appointmentType && (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Tiếp tục thanh toán
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
