import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GeneralTimeSlotPickerProps {
  selectedDate: Date;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
  selectedTime?: string;
  slotDurationMinutes?: number; // Duration from TenantSettings
}

export default function GeneralTimeSlotPicker({
  selectedDate,
  onTimeSlotSelect,
  selectedTime,
  slotDurationMinutes = 30 // Default fallback
}: GeneralTimeSlotPickerProps) {
  
  // Generate time slots from 8:00 to 17:00, using slot duration from TenantSettings
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const startHour = 8;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [slotDurationMinutes]);

  const formattedSlots = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const isToday = today.getTime() === selectedDay.getTime();
    
    return timeSlots.map((slot) => {
      const [hour, minute] = slot.split(':').map(Number);
      const slotTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute);
      
      const isPast = isToday && slotTime <= now;
      
      return {
        time: slot,
        displayTime: slotTime.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        isPast,
        fullTime: slotTime
      };
    }).filter(slot => !slot.isPast);
  }, [timeSlots, selectedDate]);

  const handleTimeSlotClick = (timeSlot: string) => {
    const [hour, minute] = timeSlot.split(':').map(Number);
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    
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

  const formatTimeISO = (time: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return `${dateStr}T${time}:00`;
  };

  const isSelected = (slot: string) => {
    if (!selectedTime) return false;
    const slotISO = formatTimeISO(slot);
    return selectedTime.startsWith(slotISO.slice(0, 16));
  };

  if (formattedSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có lịch trống cho ngày này
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {formattedSlots.map((slot) => (
        <Button
          key={slot.time}
          variant={isSelected(slot.time) ? 'default' : 'outline'}
          onClick={() => handleTimeSlotClick(slot.time)}
          className={`
            h-12 text-sm font-medium transition-all
            ${isSelected(slot.time) 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
            }
          `}
        >
          <Clock className="w-4 h-4 mr-1" />
          {slot.displayTime}
        </Button>
      ))}
    </div>
  );
}
