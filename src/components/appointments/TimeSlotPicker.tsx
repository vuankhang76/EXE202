import { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import appointmentService from '@/services/appointmentService';

interface TimeSlotPickerProps {
  doctorId: number;
  selectedDate: Date;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
  selectedTime?: string;
  slotDurationMinutes?: number; // Duration from TenantSettings
}

export default function TimeSlotPicker({
  doctorId,
  selectedDate,
  onTimeSlotSelect,
  selectedTime,
  slotDurationMinutes = 30 // Default fallback
}: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (doctorId && selectedDate) {
      loadTimeSlots();
    }
  }, [doctorId, selectedDate]);

  const loadTimeSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const response = await appointmentService.getAvailableTimeSlots(
        doctorId,
        dateStr,
        slotDurationMinutes, // Use duration from TenantSettings
        true
      );
      if (response.success && response.data) {
        setTimeSlots(response.data);
      } else {
        setError(response.message || 'Không thể tải lịch trống');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải lịch trống');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    let year: number, month: number, day: number, hour: number, minute: number;
    if (timeSlot.includes('T')) {
      const [datePart, timePart] = timeSlot.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [h, min] = timePart.split(':').map(Number);
      
      year = y;
      month = m - 1
      day = d;
      hour = h;
      minute = min;
    } else if (timeSlot.includes(':')) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [y, m, d] = dateStr.split('-').map(Number);
      const [h, min] = timeSlot.split(':').map(Number);
      
      year = y;
      month = m - 1;
      day = d;
      hour = h;
      minute = min;
    } else {
      return;
    }
        const startTime = new Date(year, month, day, hour, minute, 0);
    const endTime = new Date(year, month, day, hour, minute + slotDurationMinutes, 0);

    const formatLocalISO = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startISO = formatLocalISO(startTime);
    const endISO = formatLocalISO(endTime);

    onTimeSlotSelect(startISO, endISO);
  };

  const formattedSlots = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const isToday = today.getTime() === selectedDay.getTime();
    
    return timeSlots.map((slot) => {
      let slotTime: Date;
      
      if (slot.includes('T')) {
        const [datePart, timePart] = slot.split('T');
        const [y, m, d] = datePart.split('-').map(Number);
        const [h, min] = timePart.split(':').map(Number);
        slotTime = new Date(y, m - 1, d, h, min, 0);
      } else if (slot.includes(':')) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const [y, m, d] = dateStr.split('-').map(Number);
        const [h, min] = slot.split(':').map(Number);
        slotTime = new Date(y, m - 1, d, h, min, 0);
      } else {
        return { time: slot, isPast: false };
      }
      
      let formattedTime: string;
      if (slot.includes('T')) {
        const [, timePart] = slot.split('T');
        formattedTime = timePart.substring(0, 5);
      } else if (slot.includes(':')) {
        formattedTime = slot.substring(0, 5);
      } else {
        formattedTime = slot;
      }
      
      const isPast = isToday && slotTime < now;
      
      return {
        time: formattedTime,
        isPast: isPast
      };
    });
  }, [timeSlots, selectedDate]);

  const isTimeSlotSelected = useCallback((index: number) => {
    if (!selectedTime || !timeSlots[index]) return false;
    
    try {
      const selected = new Date(selectedTime);
      const selectedFormatted = `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`;
      
      return formattedSlots[index]?.time === selectedFormatted;
    } catch (error) {
      return false;
    }
  }, [selectedTime, timeSlots, formattedSlots]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-500 mr-2" />
            <span className="text-gray-600">Đang tải lịch trống...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadTimeSlots} variant="outline" size="sm">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Không có lịch trống cho ngày này
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng chọn ngày khác
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlotsCount = formattedSlots.filter(slot => !slot.isPast).length;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          Chọn giờ khám ({availableSlotsCount} khung giờ)
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {timeSlots.map((slot, index) => {
            const slotData = formattedSlots[index];
            const isSelected = isTimeSlotSelected(index);
            const isPast = slotData?.isPast || false;
            
            if (isPast) {
              return null;
            }
            
            return (
              <Button
                key={`${slot}-${index}`}
                variant={isSelected ? 'default' : 'outline'}
                className={`${
                  isSelected
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                    : 'hover:border-red-500 hover:text-red-500 border-gray-300'
                }`}
                onClick={() => handleTimeSlotClick(slot)}
              >
                {slotData?.time}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
