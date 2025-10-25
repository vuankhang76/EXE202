import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import tenantService from "@/services/tenantService";
import userService from "@/services/userService";
import { toast } from "sonner";
import type { TenantDto, TenantUpdateDto, UserDto } from "@/types";

interface EditTenantDialogProps {
  tenant: TenantDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditTenantDialog({
  tenant,
  open,
  onOpenChange,
  onSuccess,
}: EditTenantDialogProps) {
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState<TenantUpdateDto>({});

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        description: tenant.description,
        status: tenant.status,
        weekdayOpen: tenant.weekdayOpen,
        weekdayClose: tenant.weekdayClose,
        weekendOpen: tenant.weekendOpen,
        weekendClose: tenant.weekendClose,
        ownerUserId: tenant.ownerUserId,
      });
    }
  }, [tenant]);

  // Load ClinicAdmin users from this tenant only when editing
  useEffect(() => {
    const loadUsers = async () => {
      if (open && tenant) {
        setLoadingUsers(true);
        try {
          // Get users from this tenant
          const response = await userService.getUsers(tenant.tenantId, 1, 1000);
          if (response.success && response.data) {
            // Filter only ClinicAdmin users
            const admins = (response.data.data || []).filter(
              (u: UserDto) => u.role === 'ClinicAdmin'
            );
            setUsers(admins);
          }
        } catch (error) {
          console.error("Error loading users:", error);
        } finally {
          setLoadingUsers(false);
        }
      }
    };
    loadUsers();
  }, [open, tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) return;

    setSaving(true);
    try {
      const response = await tenantService.updateTenant(tenant.tenantId, formData);

      if (response.success) {
        toast.success("Cập nhật phòng khám thành công");
        onSuccess();
      } else {
        toast.error("Cập nhật phòng khám thất bại", {
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error("Error updating tenant:", error);
      toast.error("Cập nhật phòng khám thất bại", {
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phòng khám</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin phòng khám {tenant.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label>Mã phòng khám</Label>
              <Input value={tenant.code} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên phòng khám</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoạt động</SelectItem>
                  <SelectItem value="0">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Owner User */}
            <div className="space-y-2">
              <Label htmlFor="ownerUserId">Người sở hữu (Owner)</Label>
              <Select
                value={formData.ownerUserId?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, ownerUserId: value === "none" ? undefined : parseInt(value) })
                }
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn owner cho tenant (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không chọn --</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.userId} value={user.userId.toString()}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Chỉ hiển thị ClinicAdmin của tenant này. Hiện tại: {tenant?.ownerName || "Chưa có"}
              </p>
            </div>

            {/* Working Hours */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Giờ làm việc</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekdayOpen" className="text-sm">
                    Giờ mở cửa (T2-T6)
                  </Label>
                  <Input
                    id="weekdayOpen"
                    type="time"
                    value={formData.weekdayOpen || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weekdayOpen: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekdayClose" className="text-sm">
                    Giờ đóng cửa (T2-T6)
                  </Label>
                  <Input
                    id="weekdayClose"
                    type="time"
                    value={formData.weekdayClose || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weekdayClose: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekendOpen" className="text-sm">
                    Giờ mở cửa (T7-CN)
                  </Label>
                  <Input
                    id="weekendOpen"
                    type="time"
                    value={formData.weekendOpen || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weekendOpen: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekendClose" className="text-sm">
                    Giờ đóng cửa (T7-CN)
                  </Label>
                  <Input
                    id="weekendClose"
                    type="time"
                    value={formData.weekendClose || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weekendClose: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

