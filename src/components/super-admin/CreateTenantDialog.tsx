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
import type { TenantCreateDto, UserDto } from "@/types";

interface CreateTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateTenantDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTenantDialogProps) {
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState<TenantCreateDto>({
    code: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    weekdayOpen: "",
    weekdayClose: "",
    weekendOpen: "",
    weekendClose: "",
    ownerUserId: undefined,
  });

  // Load ALL ClinicAdmin users in system when creating new tenant
  useEffect(() => {
    const loadUsers = async () => {
      if (open) {
        setLoadingUsers(true);
        try {
          // Get all users without tenant filter to show all ClinicAdmins
          const response = await userService.getUsers(undefined, 1, 1000);
          if (response.success && response.data) {
            // Filter only ClinicAdmin users (from all tenants or no tenant)
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
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    setCreating(true);
    try {
      const response = await tenantService.createTenant(formData);

      if (response.success) {
        toast.success("Tạo phòng khám thành công");
        onOpenChange(false);
        onSuccess();
        // Reset form
        setFormData({
          code: "",
          name: "",
          email: "",
          phone: "",
          address: "",
          description: "",
          weekdayOpen: "",
          weekdayClose: "",
          weekendOpen: "",
          weekendClose: "",
          ownerUserId: undefined,
        });
      } else {
        toast.error("Tạo phòng khám thất bại", {
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      toast.error("Tạo phòng khám thất bại", {
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo phòng khám mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin phòng khám/bệnh viện mới vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã phòng khám <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="VD: PK001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên phòng khám <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Phòng khám Đa khoa ABC"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@clinic.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="+84912345678"
                  value={formData.phone}
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
                placeholder="Số nhà, đường, quận, thành phố"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về phòng khám..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
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
                      {user.fullName} ({user.email}) {user.tenantName ? `- ${user.tenantName}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Chọn ClinicAdmin từ bất kỳ tenant nào hoặc chưa có tenant. Owner sẽ được chuyển sang tenant này sau khi tạo.
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
                    value={formData.weekdayOpen}
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
                    value={formData.weekdayClose}
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
                    value={formData.weekendOpen}
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
                    value={formData.weekendClose}
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
              disabled={creating}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo phòng khám"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

