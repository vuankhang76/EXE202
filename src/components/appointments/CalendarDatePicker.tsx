import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { vi } from "date-fns/locale";

interface CalendarDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  availableDates?: string[];
}

export default function CalendarDatePicker({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  availableDates = [],
}: CalendarDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const formatDateString = (date: Date) =>
    format(date, "yyyy-MM-dd", { locale: vi });

  const isDateAvailable = (date: Date) => {
    const dateStr = formatDateString(date);

    if (minDate) {
      const minDateStr = formatDateString(minDate);
      if (dateStr < minDateStr) return false;
    }

    if (maxDate) {
      const maxDateStr = formatDateString(maxDate);
      if (dateStr > maxDateStr) return false;
    }

    if (availableDates.length > 0) {
      return availableDates.includes(dateStr);
    }

    return true;
  };

  const handlePrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayStatus = (date: Date) => {
    const dateStr = formatDateString(date);
    
    if (!isSameMonth(date, currentMonth)) return "outOfMonth";
    
    if (selectedDate && isSameDay(date, selectedDate)) return "selected";
    
    const available = isDateAvailable(date);
    if (!available) return "disabled";
    
    if (isToday(date)) return "today";
    
    if (availableDates.length > 0 && availableDates.includes(dateStr)) {
      return "available";
    }
    
    return "normal";
  };

  return (
    <div className="w-full bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, "MMMM yyyy", { locale: vi })}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
        <Legend color="bg-gray-300" text="Ngày có thể đặt" />
        <Legend color="bg-blue-400" text="Hôm nay" />
        <Legend color="bg-red-500" text="Ngày đang chọn" />
        <Legend color="bg-red-300" text="Ngày đã đặt lịch" />
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const status = getDayStatus(date);

          let className =
            "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all border cursor-pointer ";

          switch (status) {
            case "selected":
              className +=
                "bg-red-500 text-white font-bold border-red-500 shadow-md";
              break;
            case "today":
              className +=
                "border-2 border-blue-400 text-blue-600 bg-blue-50 font-semibold";
              break;
            case "available":
              className +=
                "text-gray-700 bg-white hover:bg-red-50 hover:border-red-300 border-gray-200";
              break;
            case "disabled":
              className +=
                "text-gray-400 bg-gray-50 cursor-not-allowed border-transparent";
              break;
            case "outOfMonth":
              className +=
                "text-gray-300 bg-transparent cursor-not-allowed border-transparent";
              break;
            default:
              className +=
                "text-gray-700 bg-white hover:bg-gray-50 border-gray-200";
              break;
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() =>
                status !== "disabled" &&
                status !== "outOfMonth" &&
                onDateSelect(date)
              }
              disabled={status === "disabled" || status === "outOfMonth"}
              className={className}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>

      {/* Selected Info */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-gray-600">Ngày đã chọn:</p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {format(selectedDate, "EEEE, d MMMM yyyy", { locale: vi })}
          </p>
        </div>
      )}
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs text-gray-600">{text}</span>
    </div>
  );
}
