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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import userService from "@/services/userService";
import { toast } from "sonner";
import type { UserDto, UserUpdateDto, TenantDto } from "@/types";

interface EditAdminDialogProps {
  admin: UserDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tenants: TenantDto[];
}

export default function EditAdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
  tenants,
}: EditAdminDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneE164: "",
    isActive: true,
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        fullName: admin.fullName,
        email: admin.email,
        phoneE164: admin.phoneE164 || "",
        isActive: admin.isActive,
      });
    }
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admin) return;

    setSaving(true);
    try {
      const updateData: UserUpdateDto = {
        fullName: formData.fullName,
        email: formData.email,
        phoneE164: formData.phoneE164 || undefined,
        isActive: formData.isActive,
      };

      const response = await userService.updateUser(admin.userId, updateData);

      if (response.success) {
        toast.success("Cập nhật tài khoản thành công");
        onSuccess();
      } else {
        toast.error("Cập nhật tài khoản thất bại", {
          description: response.message,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật tài khoản thất bại", {
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return null;

  const getTenantName = (tenantId?: number) => {
    if (!tenantId) return "-";
    const tenant = tenants.find((t) => t.tenantId === tenantId);
    return tenant?.name || "-";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài khoản Admin</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài khoản {admin.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Input
                value={admin.role === "SystemAdmin" ? "System Admin" : "Clinic Admin"}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Phòng khám</Label>
              <Input
                value={getTenantName(admin.tenantId)}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneE164">Số điện thoại</Label>
              <Input
                id="phoneE164"
                value={formData.phoneE164}
                onChange={(e) =>
                  setFormData({ ...formData, phoneE164: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
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

