import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { PAYMENT_STATUS, PAYMENT_METHODS } from "@/types/paymentTransaction";
import { Search, Calendar as CalendarIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface PaymentFiltersProps {
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

export default function PaymentFilters({
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
}: PaymentFiltersProps) {
  return (
    <div className="flex gap-3 items-center">
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

      <div className="shrink-0">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-10 truncate w-[140px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {PAYMENT_STATUS.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="shrink-0">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="h-10 truncate w-[180px]">
            <SelectValue placeholder="Phương thức thanh toán" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {PAYMENT_METHODS.map(method => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSearch} className="h-10 px-6 shrink-0">
        Tìm
      </Button>

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
