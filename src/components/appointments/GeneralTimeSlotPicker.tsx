import { useMemo } from "react";
import { Clock, Sun, Moon } from "lucide-react";

interface GeneralTimeSlotPickerProps {
  selectedDate: Date;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
  selectedTime?: string;
  slotDurationMinutes?: number;
}

interface TimeSlot {
  time: string;
  endTime: string;
  displayTime: string;
  displayRange: string;
  isPast: boolean;
  session: "morning" | "afternoon";
  fullTime: Date;
}

export default function GeneralTimeSlotPicker({
  selectedDate,
  onTimeSlotSelect,
  selectedTime,
  slotDurationMinutes = 30,
}: GeneralTimeSlotPickerProps) {
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 17;

    const now = new Date();
    const isToday =
      now.toDateString() === selectedDate.toDateString();

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
        const start = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          hour,
          minute
        );
        const end = new Date(start.getTime() + slotDurationMinutes * 60000);

        const isPast = isToday && start <= now;
        const session = hour < 12 ? "morning" : "afternoon";

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
          endTime: `${end
            .getHours()
            .toString()
            .padStart(2, "0")}:${end
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          displayTime: start.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          displayRange: `${start.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })} - ${end.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}`,
          isPast,
          session,
          fullTime: start,
        });
      }
    }

    return slots.filter((slot) => !slot.isPast);
  };

  const allSlots = useMemo(() => generateTimeSlots(), [selectedDate, slotDurationMinutes]);

  const morningSlots = allSlots.filter((s) => s.session === "morning");
  const afternoonSlots = allSlots.filter((s) => s.session === "afternoon");

  const handleSelect = (slot: TimeSlot) => {
    // Use local date parts to avoid timezone conversion
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const startISO = `${dateStr}T${slot.time}:00`;
    const endISO = `${dateStr}T${slot.endTime}:00`;
    
    console.log('Selected slot:', { dateStr, startISO, endISO });
    onTimeSlotSelect(startISO, endISO);
  };

  const isSelected = (slot: TimeSlot) => {
    if (!selectedTime) return false;
    return selectedTime.includes(`T${slot.time}:`);
  };

  const renderSession = (slots: TimeSlot[], session: "morning" | "afternoon") => {
    const sessionLabel = session === "morning" ? "Buổi sáng" : "Buổi chiều";
    const sessionIcon =
      session === "morning" ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      );

    if (slots.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {sessionIcon}
          <h4 className="font-semibold text-gray-900">{sessionLabel}</h4>
          <span className="text-xs text-gray-500">({slots.length} khung giờ)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.displayRange}
              onClick={() => handleSelect(slot)}
              disabled={slot.isPast}
              className={`
                p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 
                flex flex-col items-center gap-1
                ${
                  isSelected(slot)
                    ? "bg-red-500 border-red-500 text-white shadow-md"
                    : "bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50"
                }
                ${slot.isPast ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              <span>{slot.displayRange}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (allSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        Không có khung giờ trống cho ngày này
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderSession(morningSlots, "morning")}
      {renderSession(afternoonSlots, "afternoon")}
    </div>
  );
}
