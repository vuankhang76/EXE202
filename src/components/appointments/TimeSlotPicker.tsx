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
}

export default function TimeSlotPicker({
  doctorId,
  selectedDate,
  onTimeSlotSelect,
  selectedTime
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
      console.log('Loading time slots for doctor:', doctorId, 'date:', dateStr);
      
      const response = await appointmentService.getAvailableTimeSlots(
        doctorId,
        dateStr,
        30, // 30 minutes duration
        true
      );

      console.log('Time slots response:', response);

      if (response.success && response.data) {
        console.log('Time slots data:', response.data);
        setTimeSlots(response.data);
      } else {
        setError(response.message || 'Không thể tải lịch trống');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải lịch trống');
      console.error('Error loading time slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    console.log('Time slot clicked:', timeSlot);
    
    // Parse the ISO datetime string from backend (e.g., "2025-10-16T09:00:00")
    // We need to preserve the local time, not convert to UTC
    
    let year: number, month: number, day: number, hour: number, minute: number;
    
    if (timeSlot.includes('T')) {
      // ISO format: "2025-10-16T09:00:00"
      const [datePart, timePart] = timeSlot.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [h, min] = timePart.split(':').map(Number);
      
      year = y;
      month = m - 1; // JavaScript months are 0-indexed
      day = d;
      hour = h;
      minute = min;
    } else if (timeSlot.includes(':')) {
      // Time only format: "09:00:00" or "09:00"
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [y, m, d] = dateStr.split('-').map(Number);
      const [h, min] = timeSlot.split(':').map(Number);
      
      year = y;
      month = m - 1;
      day = d;
      hour = h;
      minute = min;
    } else {
      console.error('Unexpected time slot format:', timeSlot);
      return;
    }
    
    // Create date in LOCAL timezone (not UTC!)
    const startTime = new Date(year, month, day, hour, minute, 0);
    const endTime = new Date(year, month, day, hour, minute + 30, 0); // Add 30 minutes

    // Format to ISO string but preserve local time
    // Backend expects: "2025-10-16T09:00:00" (no Z, no timezone offset)
    const formatLocalISO = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startISO = formatLocalISO(startTime);
    const endISO = formatLocalISO(endTime);

    console.log('Selected time:', timeSlot);
    console.log('Start time (local):', startISO);
    console.log('End time (local):', endISO);

    onTimeSlotSelect(startISO, endISO);
  };

  // Memoize formatted time slots to prevent excessive re-renders
  const formattedSlots = useMemo(() => {
    return timeSlots.map(slot => {
      // If it's ISO format with date
      if (slot.includes('T')) {
        const [, timePart] = slot.split('T');
        return timePart.substring(0, 5); // HH:mm
      }
      
      // If it's just time (HH:mm:ss or HH:mm)
      if (slot.includes(':')) {
        return slot.substring(0, 5); // HH:mm
      }
      
      // Fallback
      return slot;
    });
  }, [timeSlots]);

  const isTimeSlotSelected = useCallback((index: number) => {
    if (!selectedTime || !timeSlots[index]) return false;
    
    try {
      // Parse the selected time
      const selected = new Date(selectedTime);
      const selectedFormatted = `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`;
      
      return formattedSlots[index] === selectedFormatted;
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

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          Chọn giờ khám ({timeSlots.length} khung giờ)
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {timeSlots.map((slot, index) => {
            const formattedTime = formattedSlots[index];
            const isSelected = isTimeSlotSelected(index);
            
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
                {formattedTime}
              </Button>
            );
          })}
        </div>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && timeSlots.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p>First slot raw: {timeSlots[0]}</p>
            <p>First slot formatted: {formattedSlots[0]}</p>
            <p>Total slots: {timeSlots.length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
