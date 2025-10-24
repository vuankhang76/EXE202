import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, ArrowLeft, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreateAppointmentSkeleton from "@/components/appointments/CreateAppointmentSkeleton";
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
  const [maxBookingDays, setMaxBookingDays] = useState<number>(90);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(30);
  const [allowWeekendBooking, setAllowWeekendBooking] = useState<boolean>(true); // Default allow weekend
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
        
        // Load slot duration
        setSlotDurationMinutes(config.data.defaultSlotDurationMinutes);
        
        // Load weekend booking setting
        setAllowWeekendBooking(config.data.allowWeekendBooking);
        
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + maxDays);
        setMaxBookingDate(maxDate);
      }
    } catch (error) {
      console.error("Error loading max booking date:", error);
      // Fallback to defaults
      setMaxBookingDays(90);
      setSlotDurationMinutes(30);
      setAllowWeekendBooking(true);
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 90);
      setMaxBookingDate(fallback);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setStartTime("");
    setEndTime("");
    setAppointmentType(null);
    
    // Collapse service step when selected
    setIsServiceCollapsed(true);
    // Expand date step
    setIsDateCollapsed(false);

    if (clinic) {
      loadAvailableDates();
    }
  };

  const loadAvailableDates = async () => {
    if (!clinic) return;

    setLoadingDates(true);
    try {
      // Get booking date range from tenant settings (stored in database)
      const { startDate, endDate } = await tenantSettingService.getBookingDateRange(clinic.tenantId);

      const response = await serviceService.getAvailableDates(
        clinic.tenantId,
        startDate,
        endDate
      );

      if (response.success && response.data) {
        let dates = response.data;
        
        // Filter out weekends if weekend booking is not allowed
        if (!allowWeekendBooking) {
          dates = dates.filter(dateStr => {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday (0) and Saturday (6)
          });
        }
        
        setAvailableDates(dates);
      }
    } catch (error) {
      console.error("Error loading available dates:", error);
    } finally {
      setLoadingDates(false);
    }
  };

  const handleDoctorSelect = (doctor: DoctorDto) => {
    setSelectedDoctor(doctor);
    // Set default appointment type when doctor is selected for the first time
    if (!appointmentType) {
      setAppointmentType(AppointmentType.CLINIC);
    }
    
    // Collapse doctor step when selected
    setIsDoctorCollapsed(true);
  };

  const handleTimeSlotSelect = async (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);

    // Reset doctor and appointment settings when time changes
    setSelectedDoctor(null);
    setAppointmentType(null);
    
    // Collapse time step when selected
    setIsTimeCollapsed(true);
    // Expand doctor step
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
        dateStr
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const dateStr = e.target.value;

    // Check if weekend booking is disabled
    if (!allowWeekendBooking) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
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
    
    // Collapse date step when selected
    setIsDateCollapsed(true);
    // Expand time step
    setIsTimeCollapsed(false);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    if (maxBookingDate) {
      return maxBookingDate.toISOString().split("T")[0];
    }
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 90);
    return fallback.toISOString().split("T")[0];
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

    const now = new Date();
    const appointmentStart = new Date(startTime);

    if (appointmentStart < now) {
      toast.error(
        "Không thể đặt lịch vào thời gian trong quá khứ. Vui lòng chọn thời gian trong tương lai."
      );
      return;
    }

    // Navigate to payment page with appointment data
    // Appointment will be created AFTER successful payment
    navigate('/patient/payment', {
      state: {
        // Appointment data to create after payment
        appointmentData: {
          tenantId: clinic.tenantId,
          patientId: patientId,
          doctorId: selectedDoctor.doctorId,
          startAt: startTime,
          endAt: endTime,
          type: appointmentType,
          serviceId: selectedService.serviceId,
          address: appointmentType === AppointmentType.CLINIC ? clinic.address : undefined,
          channel: "Web", // User is booking via web
        },
        // Display data for payment page
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
              {/* Step 1: Service Selection */}
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
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-gray-600">Dịch vụ đã chọn:</p>
                      <p className="font-medium text-gray-900 mt-1">{selectedService.name}</p>
                      <p className="text-sm text-red-600 font-semibold mt-1">
                        {selectedService.basePrice.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
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
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Weekend booking warning */}
                        {!allowWeekendBooking && (
                          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-700">
                              ⚠️ <strong>Lưu ý:</strong> Phòng khám không cho phép đặt lịch vào <strong>Thứ 7</strong> và <strong>Chủ nhật</strong>
                            </p>
                          </div>
                        )}
                        
                        <div className="relative">
                          <input
                            type="date"
                            value={
                              selectedDate?.toISOString().split("T")[0] || ""
                            }
                            onChange={handleDateChange}
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-base cursor-pointer"
                            style={{
                              colorScheme: "light",
                            }}
                          />
                        </div>
                        {availableDates.length > 0 && (
                          <p className="text-sm text-green-600 mt-1">
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
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
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
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-gray-600 mb-4">
                          Chọn khung giờ phù hợp. Các bác sĩ có lịch sẽ hiển thị sau khi bạn chọn giờ.
                        </p>
                        <GeneralTimeSlotPicker
                          selectedDate={selectedDate}
                          onTimeSlotSelect={handleTimeSlotSelect}
                          selectedTime={startTime}
                          slotDurationMinutes={slotDurationMinutes}
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
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
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
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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

              {/* Step 5: Appointment Type - Only show when doctor is selected */}
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

              {/* Step 6: Notes - Only show when appointment type is selected */}
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

                    {/* Show time when selected */}
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
