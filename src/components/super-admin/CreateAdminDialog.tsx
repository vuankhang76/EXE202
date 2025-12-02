import { useState } from "react";
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
import type { UserCreateDto, TenantDto } from "@/types";

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tenants: TenantDto[];
}

export default function CreateAdminDialog({
  open,
  onOpenChange,
  onSuccess,
  tenants,
}: CreateAdminDialogProps) {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneE164: "",
    password: "",
    role: "ClinicAdmin",
    tenantId: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.role === "ClinicAdmin" && !formData.tenantId) {
      toast.error("Vui lòng chọn phòng khám cho Clinic Admin");
      return;
    }

    setCreating(true);
    try {
      const userData: UserCreateDto = {
        fullName: formData.fullName,
        email: formData.email,
        phoneE164: formData.phoneE164 ? normalizePhoneNumber(formData.phoneE164) : "",
        password: formData.password,
        role: formData.role,
        tenantId: formData.role === "ClinicAdmin" && formData.tenantId 
          ? parseInt(formData.tenantId) 
          : undefined, // SystemAdmin không cần tenantId
      };

      const response = await userService.createUser(userData);

      if (response.success) {
        toast.success("Tạo tài khoản admin thành công");
        onOpenChange(false);
        onSuccess();
        setFormData({
          fullName: "",
          email: "",
          phoneE164: "",
          password: "",
          role: "ClinicAdmin",
          tenantId: "",
        });
      } else {
        toast.error("Tạo tài khoản thất bại", {
          description: response.message,
        });
      }
    } catch (error: any) {
      toast.error("Tạo tài khoản thất bại", {
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản Admin mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin tài khoản quản trị viên mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value, tenantId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ClinicAdmin">Clinic Admin</SelectItem>
                  <SelectItem value="SystemAdmin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "ClinicAdmin" && (
              <div className="space-y-2">
                <Label htmlFor="tenantId">
                  Phòng khám <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tenantId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng khám" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem
                        key={tenant.tenantId}
                        value={tenant.tenantId.toString()}
                      >
                        {tenant.name} ({tenant.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneE164">Số điện thoại</Label>
              <Input
                id="phoneE164"
                placeholder="0912345678"
                value={formData.phoneE164}
                onChange={(e) =>
                  setFormData({ ...formData, phoneE164: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

