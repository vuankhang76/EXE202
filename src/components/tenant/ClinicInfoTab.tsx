import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TimeInput } from "@/components/ui/TimeInput";
import { TenantImagesForm } from "@/components/tenant/TenantImageForm";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { isTenantOpenOnWeekend } from "@/types/tenant";
import type { TenantDto, TenantUpdateDto } from "@/types";
import type { BookingConfig } from "@/services/tenantSettingService";

interface ClinicInfoTabProps {
  tenant: TenantDto;
  formData: TenantUpdateDto;
  canEdit: boolean;
  thumbnailPreview: string | null;
  coverPreview: string | null;
  uploadingThumbnail: boolean;
  uploadingCover: boolean;
  bookingConfig?: BookingConfig;
  handleInputChange: (field: keyof TenantUpdateDto, value: string) => void;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ClinicInfoTab({
  tenant,
  formData,
  canEdit,
  thumbnailPreview,
  coverPreview,
  uploadingThumbnail,
  uploadingCover,
  bookingConfig,
  handleInputChange,
  handleThumbnailUpload,
  handleCoverUpload,
}: ClinicInfoTabProps) {
  return (
    <div className="space-y-6">
      <TenantImagesForm
        tenant={{
          ...tenant,
          thumbnailUrl: thumbnailPreview || tenant?.thumbnailUrl,
          coverImageUrl: coverPreview || tenant?.coverImageUrl,
        }}
        canEdit={canEdit}
        uploadingThumbnail={uploadingThumbnail}
        uploadingCover={uploadingCover}
        handleThumbnailUpload={handleThumbnailUpload}
        handleCoverUpload={handleCoverUpload}
      />

      <div className="grid gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên phòng khám *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên phòng khám"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Mã phòng khám</Label>
                <Input
                  id="code"
                  value={tenant?.code || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Nhập địa chỉ phòng khám"
                disabled={!canEdit}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label className="text-base mb-3 block">
                    Ngày thường (Thứ 2 - Thứ 6)
                  </Label>
                  {bookingConfig?.allowWeekendBooking && (
                    <Label className="text-base mb-3 block">
                      Cuối tuần (Thứ 7 - Chủ nhật)
                    </Label>
                  )}
                </div>
                <div className={`grid gap-4 ${bookingConfig?.allowWeekendBooking ? 'sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
                  <div className="space-y-2">
                    <Label htmlFor="weekdayOpen">Giờ mở cửa</Label>
                    <TimeInput
                      id="weekdayOpen"
                      value={formData.weekdayOpen || ""}
                      onChange={(value) =>
                        handleInputChange("weekdayOpen", value)
                      }
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekdayClose">Giờ đóng cửa</Label>
                    <TimeInput
                      id="weekdayClose"
                      value={formData.weekdayClose || ""}
                      onChange={(value) =>
                        handleInputChange("weekdayClose", value)
                      }
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                {formData.weekdayOpen && formData.weekdayClose && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Thứ 2-6: <span className="font-semibold">{formData.weekdayOpen} - {formData.weekdayClose}</span></span>
                    </div>
                    {bookingConfig?.allowWeekendBooking && formData.weekendOpen && formData.weekendClose && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>T7-CN: <span className="font-semibold">{formData.weekendOpen} - {formData.weekendClose}</span></span>
                      </div>
                    )}
                    {bookingConfig?.allowWeekendBooking && (!formData.weekendOpen || !formData.weekendClose) && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700">T7-CN: Chưa cấu hình</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <RichTextEditor
                value={formData.description || ""}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Mô tả về phòng khám..."
                disabled={!canEdit}
                maxLength={5000}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
