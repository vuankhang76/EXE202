import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { AppointmentStatus, AppointmentType, getStatusLabel, getTypeLabel } from "@/types/appointment";
import { Search, Calendar as CalendarIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AppointmentFiltersProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onSearch: () => void;
  onAdvancedFilters?: () => void;
}

export default function AppointmentFilters({
  searchTerm,
  statusFilter,
  typeFilter,
  fromDate,
  toDate,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onAdvancedFilters
}: AppointmentFiltersProps) {
  return (
    <div className="flex gap-3 items-center">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* From Date */}
      <div className="w-[140px] shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="text-sm">
                {fromDate ? format(fromDate, "dd/MM/yyyy", { locale: vi }) : "Từ"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={onFromDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* To Date */}
      <div className="w-[140px] shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="text-sm">
                {toDate ? format(toDate, "dd/MM/yyyy", { locale: vi }) : "Đến"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={onToDateChange}
              
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status Filter */}
      <div className="shrink-0">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-10 truncate w-[140px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={AppointmentStatus.SCHEDULED}>
              {getStatusLabel(AppointmentStatus.SCHEDULED)}
            </SelectItem>
            <SelectItem value={AppointmentStatus.CONFIRMED}>
              {getStatusLabel(AppointmentStatus.CONFIRMED)}
            </SelectItem>
            <SelectItem value={AppointmentStatus.IN_PROGRESS}>
              {getStatusLabel(AppointmentStatus.IN_PROGRESS)}
            </SelectItem>
            <SelectItem value={AppointmentStatus.COMPLETED}>
              {getStatusLabel(AppointmentStatus.COMPLETED)}
            </SelectItem>
            <SelectItem value={AppointmentStatus.CANCELLED}>
              {getStatusLabel(AppointmentStatus.CANCELLED)}
            </SelectItem>
            <SelectItem value={AppointmentStatus.NO_SHOW}>
              {getStatusLabel(AppointmentStatus.NO_SHOW)}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter (Loại lịch hẹn) */}
      <div className="shrink-0">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="h-10 truncate w-[180px]">
            <SelectValue placeholder="Loại lịch hẹn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={AppointmentType.CLINIC}>
              {getTypeLabel(AppointmentType.CLINIC)}
            </SelectItem>
            <SelectItem value={AppointmentType.HOME}>
              {getTypeLabel(AppointmentType.HOME)}
            </SelectItem>
            <SelectItem value={AppointmentType.ONLINE}>
              {getTypeLabel(AppointmentType.ONLINE)}
            </SelectItem>
            <SelectItem value={AppointmentType.PHONE}>
              {getTypeLabel(AppointmentType.PHONE)}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Button */}
      <Button onClick={onSearch} className="h-10 px-6 shrink-0">
        Tìm
      </Button>

      {/* Advanced Filters Button */}
      {onAdvancedFilters && (
        <Button 
          variant="outline" 
          onClick={onAdvancedFilters} 
          className="h-10 px-4 shrink-0"
        >
          <Settings className="h-4 w-4 mr-2" />
          Nâng cao
        </Button>
      )}
    </div>
  );
}
