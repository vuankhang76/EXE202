import { useMemo } from 'react';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { AlertCircle, Clock } from 'lucide-react';

interface AppointmentSchedulerProps {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  doctorSearch: {
    selectedDoctorId: string;
  };
  availableTimeSlots: string[];
  loadingTimeSlots: boolean;
  checkingAvailability: boolean;
  availabilityMessage: { type: 'success' | 'error' | 'info', message: string } | null;
  slotDurationMinutes: number;
  onDateChange: (dateStr: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function AppointmentScheduler({
  appointmentDate,
  startTime,
  endTime,
  doctorSearch,
  availableTimeSlots,
  loadingTimeSlots,
  checkingAvailability,
  availabilityMessage,
  slotDurationMinutes,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange
}: AppointmentSchedulerProps) {
  
  const getDisplayDate = () => {
    if (appointmentDate) {
      const date = new Date(appointmentDate);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    return '';
  };

  const generateTimeOptions = (isEndTime: boolean = false) => {
    const options = [];
    const now = new Date();
    const selectedDate = appointmentDate ? new Date(appointmentDate) : null;
    const isToday =
      selectedDate &&
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    let minHour = 8;
    let minMinute = 0;
  
    if (isEndTime && startTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      minHour = startHour;
      minMinute = startMin + slotDurationMinutes;
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = minMinute % 60;
      }
    }
  
    const availableTimes = new Set(
      availableTimeSlots.map(slot => {
        const date = new Date(slot);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      })
    );
  
    const workingHours = [
      { start: 8 * 60, end: 12 * 60 },
      { start: 13 * 60 + 30, end: 17 * 60 + 30 },
    ];
  
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
        const totalMinutes = hour * 60 + minute;
  
        const isInWorkingHours = workingHours.some(
          period => totalMinutes >= period.start && totalMinutes < period.end
        );
        if (!isInWorkingHours) continue;
  
        if (isToday) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) continue;
        }
  
        if (isEndTime) {
          if (hour < minHour || (hour === minHour && minute < minMinute)) continue;
        }
  
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
  
        let isAvailable = false;
        if (!isEndTime) {
          if (availableTimeSlots.length > 0) {
            if (availableTimes.has(timeStr)) {
              isAvailable = true;
            } else {
              const timesSorted = Array.from(availableTimes)
                .map(t => {
                  const [h, m] = t.split(':').map(Number);
                  return h * 60 + m;
                })
                .sort((a, b) => a - b);
              const [hour, min] = timeStr.split(':').map(Number);
              const total = hour * 60 + min;
              for (let i = 0; i < timesSorted.length - 1; i++) {
                if (total > timesSorted[i] && total < timesSorted[i + 1]) {
                  isAvailable = true;
                  break;
                }
              }
            }
          }
        } else if (startTime) {
          const startTimeAvailable = availableTimes.has(startTime);
          
          if (startTimeAvailable) {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = hour * 60 + minute;
            const durationMinutes = endMinutes - startMinutes;
  
            if (durationMinutes > 0 && durationMinutes <= 180) {
              const slotsNeeded = Math.ceil(durationMinutes / slotDurationMinutes);
              let allSlotsAvailable = true;
  
              for (let i = 0; i < slotsNeeded; i++) {
                const slotMinutes = startMinutes + i * slotDurationMinutes;
                const slotHour = Math.floor(slotMinutes / 60);
                const slotMin = slotMinutes % 60;
                const slotTimeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
  
                if (!availableTimes.has(slotTimeStr)) {
                  allSlotsAvailable = false;
                  break;
                }
              }
  
              isAvailable = allSlotsAvailable;
            }
          }
        }
  
        const label = isAvailable ? `${displayTime} ✓` : displayTime;
        options.push({ value: timeStr, label });
      }
    }
  
    return options;
  };

  const timeOptions = useMemo(() => generateTimeOptions(), [appointmentDate, availableTimeSlots, slotDurationMinutes]);
  const endTimeOptions = useMemo(() => generateTimeOptions(true), [appointmentDate, startTime, availableTimeSlots, slotDurationMinutes]);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="appointmentDate">Ngày hẹn *</Label>
        <SimpleDatePicker
          value={getDisplayDate()}
          onChange={onDateChange}
          placeholder="Chọn ngày"
          minDate={new Date()}
          className="w-full"
          disabled={!doctorSearch.selectedDoctorId || doctorSearch.selectedDoctorId === 'search'}
        />
      </div>

      {(loadingTimeSlots || checkingAvailability || availabilityMessage?.type) && (
        <Alert variant={availabilityMessage?.type === 'error' ? 'destructive' : availabilityMessage?.type === 'success' ? 'success' : 'default'} className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {loadingTimeSlots ? (
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3 animate-spin" />
                Đang tải khung giờ trống...
              </span>
            ) : checkingAvailability ? (
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3 animate-spin" />
                Đang kiểm tra lịch bác sĩ...
              </span>
            ) : availabilityMessage?.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Giờ bắt đầu *</Label>
          <Select
            value={startTime}
            onValueChange={onStartTimeChange}
            disabled={!appointmentDate || !doctorSearch.selectedDoctorId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn giờ bắt đầu" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Giờ kết thúc *</Label>
          <Select
            value={endTime}
            onValueChange={onEndTimeChange}
            disabled={!appointmentDate || !startTime || !doctorSearch.selectedDoctorId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn giờ kết thúc" />
            </SelectTrigger>
            <SelectContent>
              {endTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
