import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Info } from "lucide-react";
import type { BookingConfig } from "@/services/tenantSettingService";

interface BookingSettingsFormProps {
  config: BookingConfig;
  onChange: (config: BookingConfig) => void;
  canEdit: boolean;
}

export function BookingSettingsForm({
  config,
  onChange,
  canEdit,
}: BookingSettingsFormProps) {
  // -----------------------
  // Handlers
  // -----------------------
  const handleNumberChange = (field: keyof BookingConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0) {
      onChange({ ...config, [field]: numValue });
    }
  };

  const handleBooleanChange = (field: keyof BookingConfig, value: boolean) => {
    onChange({ ...config, [field]: value });
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Các cài đặt này áp dụng cho tất cả bệnh nhân khi đặt lịch tại phòng
          khám của bạn.
        </AlertDescription>
      </Alert>

      {/* Grid Inputs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Max Advance Booking Days */}
        <div className="space-y-2">
          <Label htmlFor="maxAdvanceBookingDays">
            Số ngày đặt trước tối đa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="maxAdvanceBookingDays"
            type="number"
            min="1"
            max="365"
            value={config.maxAdvanceBookingDays}
            onChange={(e) =>
              handleNumberChange("maxAdvanceBookingDays", e.target.value)
            }
            disabled={!canEdit}
          />
          <p className="text-sm text-muted-foreground">
            Bệnh nhân có thể đặt lịch trong vòng {config.maxAdvanceBookingDays}{" "}
            ngày tới
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultSlotDurationMinutes">
            Thời lượng khung giờ mặc định (phút){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="defaultSlotDurationMinutes"
            type="number"
            min="5"
            max="180"
            step="5"
            value={config.defaultSlotDurationMinutes}
            onChange={(e) =>
              handleNumberChange(
                "defaultSlotDurationMinutes",
                e.target.value
              )
            }
            disabled={!canEdit}
          />
          <p className="text-sm text-muted-foreground">
            Mỗi ca khám kéo dài {config.defaultSlotDurationMinutes} phút
          </p>
        </div>

        {/* Min Advance Booking Hours */}
        <div className="space-y-2">
          <Label htmlFor="minAdvanceBookingHours">
            Thời gian đặt trước tối thiểu (giờ){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="minAdvanceBookingHours"
            type="number"
            min="0"
            max="72"
            value={config.minAdvanceBookingHours}
            onChange={(e) =>
              handleNumberChange("minAdvanceBookingHours", e.target.value)
            }
            disabled={!canEdit}
          />
          <p className="text-sm text-muted-foreground">
            Phải đặt trước ít nhất {config.minAdvanceBookingHours} giờ
          </p>
        </div>

        {/* Max Cancellation Hours */}
        <div className="space-y-2">
          <Label htmlFor="maxCancellationHours">
            Thời hạn hủy lịch (giờ) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="maxCancellationHours"
            type="number"
            min="0"
            max="168"
            value={config.maxCancellationHours}
            onChange={(e) =>
              handleNumberChange("maxCancellationHours", e.target.value)
            }
            disabled={!canEdit}
          />
          <p className="text-sm text-muted-foreground">
            Có thể hủy lịch trước {config.maxCancellationHours} giờ
          </p>
        </div>
      </div>

      {/* Allow Weekend Booking */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="allowWeekendBooking" className="text-base">
            Cho phép đặt lịch cuối tuần
          </Label>
          <p className="text-sm text-muted-foreground">
            Bệnh nhân có thể đặt lịch vào Thứ 7 và Chủ nhật
          </p>
        </div>
        <Switch
          id="allowWeekendBooking"
          checked={config.allowWeekendBooking}
          onCheckedChange={(checked: boolean) =>
            handleBooleanChange("allowWeekendBooking", checked)
          }
          disabled={!canEdit}
        />
      </div>

      {/* Permission Alert */}
      {!canEdit && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Chỉ quản trị viên hoặc chủ sở hữu mới có thể chỉnh sửa cài đặt này
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
