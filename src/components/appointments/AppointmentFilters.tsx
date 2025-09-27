import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Search, X } from "lucide-react";
import { AppointmentStatus, getStatusLabel } from "@/types/appointment";

interface AppointmentFiltersProps {
  searchTerm: string;
  statusFilter: string;
  debouncedSearchTerm: string;
  isProcessing: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function AppointmentFilters({
  searchTerm,
  statusFilter,
  debouncedSearchTerm,
  isProcessing,
  onSearchChange,
  onStatusFilterChange,
  onClearFilters
}: AppointmentFiltersProps) {
  return (
    <Card className="gap-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-lg">Bộ lọc và tìm kiếm</CardTitle>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner size="sm" />
              Đang xử lý...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Row */}
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-20 h-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {debouncedSearchTerm !== searchTerm && searchTerm && (
                  <LoadingSpinner size="sm" />
                )}
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="!h-10">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Tất cả trạng thái
                  </div>
                </SelectItem>
                <SelectItem value={AppointmentStatus.PENDING}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {getStatusLabel(AppointmentStatus.PENDING)}
                  </div>
                </SelectItem>
                    <SelectItem value={AppointmentStatus.CONFIRMED}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {getStatusLabel(AppointmentStatus.CONFIRMED)}
                      </div>
                    </SelectItem>
                    <SelectItem value={AppointmentStatus.BOOKED}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {getStatusLabel(AppointmentStatus.BOOKED)}
                      </div>
                    </SelectItem>
                <SelectItem value={AppointmentStatus.IN_PROGRESS}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    {getStatusLabel(AppointmentStatus.IN_PROGRESS)}
                  </div>
                </SelectItem>
                <SelectItem value={AppointmentStatus.COMPLETED}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {getStatusLabel(AppointmentStatus.COMPLETED)}
                  </div>
                </SelectItem>
                <SelectItem value={AppointmentStatus.CANCELLED}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {getStatusLabel(AppointmentStatus.CANCELLED)}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || (statusFilter && statusFilter !== 'all')) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearFilters}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
