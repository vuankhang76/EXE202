import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Loader2, Save, AlertCircle, Building2, Calendar } from "lucide-react";
import AdminLayout from "@/layout/AdminLayout";
import tenantService from "@/services/tenantService";
import { tenantSettingService, type BookingConfig } from "@/services/tenantSettingService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { TenantDto, TenantUpdateDto } from "@/types";
import { TenantSettingsSkeleton } from "@/components/tenant/TenantSettingsSkeleton";
import { ClinicInfoTab } from "@/components/tenant/ClinicInfoTab";
import { BookingSettingsForm } from "@/components/tenant/BookingSettingsForm";
import { normalizeTime, validateTimeRange } from "@/utils/timeValidation";

export default function TenantSettings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [formData, setFormData] = useState<TenantUpdateDto>({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Booking settings state
  const [bookingConfig, setBookingConfig] = useState<BookingConfig>({
    maxAdvanceBookingDays: 90,
    defaultSlotDurationMinutes: 30,
    minAdvanceBookingHours: 1,
    maxCancellationHours: 24,
    allowWeekendBooking: true,
  });
    
  // Active tab
  const [activeTab, setActiveTab] = useState("clinic");

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const isOwner =
    tenant?.ownerUserId &&
    Number(currentUser?.userId) === Number(tenant.ownerUserId);
  const canEdit = Boolean(isAdmin || isOwner);

  useEffect(() => {
    if (currentUser?.tenantId) {
      loadTenant();
      loadBookingConfig();
    }
  }, [currentUser?.tenantId]);

  const loadTenant = async () => {
    if (!currentUser?.tenantId) return;

    setLoading(true);
    try {
      const response = await tenantService.getTenantById(
        parseInt(currentUser.tenantId)
      );
      if (response.success && response.data) {
        setTenant(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          description: response.data.description,
          weekdayOpen: response.data.weekdayOpen,
          weekdayClose: response.data.weekdayClose,
          weekendOpen: response.data.weekendOpen,
          weekendClose: response.data.weekendClose,
        });
      } else {
        toast.error("Không thể tải thông tin phòng khám");
        navigate("/clinic/dashboard");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadBookingConfig = async () => {
    if (!currentUser?.tenantId) return;

    try {
      const response = await tenantSettingService.getBookingConfig(
        parseInt(currentUser.tenantId)
      );
      if (response.success && response.data) {
        setBookingConfig(response.data);
      }
    } catch (error) {
      console.error("Error loading booking config:", error);
    }
  };

  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return phone;

    const cleaned = phone.replace(/[\s\-\(\)]/g, "");

    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }

    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }

    return cleaned;
  };

  const handleInputChange = (field: keyof TenantUpdateDto, value: string) => {
    if (field === "phone") {
      value = normalizePhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingThumbnail(true);
    try {
      const response = await tenantService.uploadImage(
        file,
        "tenants/thumbnails"
      );
      if (response.success && response.data) {
        setThumbnailPreview(response.data);
        setFormData((prev) => ({ ...prev, thumbnailUrl: response.data }));
        toast.success('Đã chọn ảnh đại diện. Bấm "Lưu thay đổi" để hoàn tất.');
      } else {
        toast.error("Upload thất bại", {
          description: response.message || "Có lỗi xảy ra",
        });
      }
    } catch (error: any) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Upload thất bại", {
        description: error.message || "Không thể upload ảnh",
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 10MB");
      return;
    }

    setUploadingCover(true);
    try {
      const response = await tenantService.uploadImage(file, "tenants/covers");
      if (response.success && response.data) {
        setCoverPreview(response.data);
        setFormData((prev) => ({ ...prev, coverImageUrl: response.data }));
        toast.success('Đã chọn ảnh bìa. Bấm "Lưu thay đổi" để hoàn tất.');
      } else {
        toast.error("Upload thất bại", {
          description: response.message || "Có lỗi xảy ra",
        });
      }
    } catch (error: any) {
      toast.error("Upload thất bại", {
        description: error.message || "Không thể upload ảnh",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveClinic = async () => {
    if (!currentUser?.tenantId) {
      return;
    }

    if (!canEdit) {
      toast.error("Không có quyền", {
        description: "Chỉ quản trị viên hoặc chủ sở hữu mới có thể chỉnh sửa",
      });
      return;
    }

    if (formData.description && formData.description.length > 5000) {
      toast.error("Mô tả quá dài", {
        description: `Mô tả không được vượt quá 5,000 ký tự (hiện tại: ${formData.description.length})`,
      });
      return;
    }

    // Validate time format
    const timeFields = ['weekdayOpen', 'weekdayClose', 'weekendOpen', 'weekendClose'] as const;
    for (const field of timeFields) {
      const value = formData[field];
      if (value && value.trim()) {
        const normalized = normalizeTime(value);
        if (!normalized) {
          toast.error("Format giờ không hợp lệ", {
            description: `${field}: Định dạng phải là HH:mm (ví dụ: 07:30)`,
          });
          return;
        }
        formData[field] = normalized;
      }
    }

    // Validate time range
    if (formData.weekdayOpen && formData.weekdayClose) {
      if (!validateTimeRange(formData.weekdayOpen, formData.weekdayClose)) {
        toast.error("Giờ không hợp lệ", {
          description: "Giờ đóng cửa (weekday) phải sau giờ mở cửa",
        });
        return;
      }
    }

    if (formData.weekendOpen && formData.weekendClose) {
      if (!validateTimeRange(formData.weekendOpen, formData.weekendClose)) {
        toast.error("Giờ không hợp lệ", {
          description: "Giờ đóng cửa (weekend) phải sau giờ mở cửa",
        });
        return;
      }
    }
    
    setSaving(true);
    try {
      const response = await tenantService.updateTenant(
        parseInt(currentUser.tenantId),
        formData
      );

      if (response.success) {
        toast.success("Cập nhật thành công", {
          description: "Thông tin phòng khám đã được cập nhật",
        });
        setThumbnailPreview(null);
        setCoverPreview(null);
        loadTenant();
      } else {
        const errorMessage =
          response.errors && response.errors.length > 0
            ? response.errors.join(", ")
            : response.message || "Có lỗi xảy ra";

        toast.error("Cập nhật thất bại", {
          description: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Error updating tenant:", error);

      if (!error.toastShown) {
        const errorMessage =
          error.response?.data?.errors?.length > 0
            ? error.response.data.errors.join(", ")
            : error.response?.data?.message ||
              error.message ||
              "Không thể cập nhật thông tin";

        toast.error("Cập nhật thất bại", {
          description: errorMessage,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBooking = async () => {
    if (!currentUser?.tenantId) {
      return;
    }

    if (!canEdit) {
      toast.error("Không có quyền", {
        description: "Chỉ quản trị viên hoặc chủ sở hữu mới có thể chỉnh sửa",
      });
      return;
    }
    
    setSavingBooking(true);
    try {
      const tenantId = parseInt(currentUser.tenantId);
      const settingsToUpdate: Record<string, string> = {
        "Booking.MaxAdvanceBookingDays": bookingConfig.maxAdvanceBookingDays.toString(),
        "Booking.DefaultSlotDurationMinutes": bookingConfig.defaultSlotDurationMinutes.toString(),
        "Booking.MinAdvanceBookingHours": bookingConfig.minAdvanceBookingHours.toString(),
        "Booking.MaxCancellationHours": bookingConfig.maxCancellationHours.toString(),
        "Booking.AllowWeekendBooking": bookingConfig.allowWeekendBooking.toString(),
      };
      
      console.log('Sending booking settings:', settingsToUpdate);
      
      const response = await tenantSettingService.updateSettings(
        tenantId,
        settingsToUpdate
      );
      
      console.log('Response:', response);

      if (response.success) {
        toast.success("Cập nhật thành công", {
          description: "Cài đặt lịch khám đã được cập nhật",
        });
        loadBookingConfig();
      } else {
        const errorMessage =
          response.errors && response.errors.length > 0
            ? response.errors.join(", ")
            : response.message || "Có lỗi xảy ra";

        toast.error("Cập nhật thất bại", {
          description: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Error updating booking settings:", error);
      console.error("Error response data:", error.response?.data);
      
      if (error.response?.status === 500) {
        try {
          console.log('Attempting to initialize default settings...');
          const tenantId = parseInt(currentUser.tenantId!);
          await tenantSettingService.initializeSettings(tenantId);
          
          const settingsToUpdate: Record<string, string> = {
            "Booking.MaxAdvanceBookingDays": bookingConfig.maxAdvanceBookingDays.toString(),
            "Booking.DefaultSlotDurationMinutes": bookingConfig.defaultSlotDurationMinutes.toString(),
            "Booking.MinAdvanceBookingHours": bookingConfig.minAdvanceBookingHours.toString(),
            "Booking.MaxCancellationHours": bookingConfig.maxCancellationHours.toString(),
            "Booking.AllowWeekendBooking": bookingConfig.allowWeekendBooking.toString(),
          };
          
          const retryResponse = await tenantSettingService.updateSettings(tenantId, settingsToUpdate);
          
          if (retryResponse.success) {
            toast.success("Cập nhật thành công", {
              description: "Đã khởi tạo cài đặt và cập nhật thành công",
            });
            loadBookingConfig();
            return;
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      
      toast.error("Cập nhật thất bại", {
        description: error.response?.data?.message || error.message || "Không thể cập nhật cài đặt lịch khám. Vui lòng kiểm tra console để biết thêm chi tiết.",
      });
    } finally {
      setSavingBooking(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout breadcrumbTitle="Cài đặt phòng khám">
        <TenantSettingsSkeleton />
      </AdminLayout>
    );
  }

  if (!loading && !tenant) {
    return (
      <AdminLayout breadcrumbTitle="Cài đặt phòng khám">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không tìm thấy thông tin phòng khám
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Cài đặt phòng khám"
      actions={
        canEdit && (
          <Button 
            onClick={activeTab === "clinic" ? handleSaveClinic : handleSaveBooking} 
            disabled={activeTab === "clinic" ? saving : savingBooking}
          >
            {(activeTab === "clinic" ? saving : savingBooking) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Lưu thay đổi
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {!canEdit && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="inline">
              Bạn chỉ có quyền xem thông tin. Chỉ{" "}
              <span className="font-semibold">Quản trị viên</span> hoặc{" "}
              <span className="font-semibold">Chủ sở hữu</span> mới có thể chỉnh
              sửa.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="clinic">
              <Building2 className="h-4 w-4" />
              Thông tin phòng khám
            </TabsTrigger>
            <TabsTrigger value="booking">
              <Calendar className="h-4 w-4" />
              Cài đặt lịch khám
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="mt-6">
            <ClinicInfoTab
              tenant={tenant!}
              formData={formData}
              canEdit={canEdit}
              bookingConfig={bookingConfig}
              thumbnailPreview={thumbnailPreview}
              coverPreview={coverPreview}
              uploadingThumbnail={uploadingThumbnail}
              uploadingCover={uploadingCover}
              handleInputChange={handleInputChange}
              handleThumbnailUpload={handleThumbnailUpload}
              handleCoverUpload={handleCoverUpload}
            />
          </TabsContent>

          <TabsContent value="booking" className="mt-6">
            <div className="space-y-6">
              <BookingSettingsForm
                config={bookingConfig}
                onChange={setBookingConfig}
                canEdit={canEdit}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
