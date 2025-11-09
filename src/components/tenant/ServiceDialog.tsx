import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { serviceService } from "@/services/serviceService";
import type { Service, ServiceCreateDto, ServiceUpdateDto } from "@/types/service";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  tenantId: number;
  onSuccess: () => void;
}

const SERVICE_TYPES = [
  { value: "General", label: "Khám tổng quát" },
  { value: "Specialist", label: "Khám chuyên khoa" },
  { value: "Emergency", label: "Khẩn cấp" },
];

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  tenantId,
  onSuccess,
}: ServiceDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    serviceType: "General",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        basePrice: service.basePrice.toString(),
        serviceType: service.serviceType,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "200000",
        serviceType: "General",
      });
    }
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên dịch vụ");
      return;
    }

    const price = parseFloat(formData.basePrice);
    if (isNaN(price) || price < 0) {
      toast.error("Giá không hợp lệ");
      return;
    }

    if (formData.description && formData.description.length > 1000) {
      toast.error("Mô tả không được vượt quá 1000 ký tự");
      return;
    }

    setSaving(true);
    try {
      if (service) {
        // Update existing service
        const updateDto: ServiceUpdateDto = {
          name: formData.name,
          description: formData.description || undefined,
          basePrice: price,
          serviceType: formData.serviceType,
        };

        const response = await serviceService.updateService(service.serviceId, updateDto);
        if (response.success) {
          toast.success("Cập nhật dịch vụ thành công");
          onSuccess();
        } else {
          toast.error(response.message || "Không thể cập nhật dịch vụ");
        }
      } else {
        // Create new service
        const createDto: ServiceCreateDto = {
          tenantId,
          name: formData.name,
          description: formData.description || undefined,
          basePrice: price,
          serviceType: formData.serviceType,
        };

        const response = await serviceService.createService(createDto);
        if (response.success) {
          toast.success("Thêm dịch vụ thành công");
          onSuccess();
        } else {
          toast.error(response.message || "Không thể thêm dịch vụ");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {service ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
            </DialogTitle>
            <DialogDescription>
              {service
                ? "Cập nhật thông tin dịch vụ y tế"
                : "Thêm dịch vụ y tế mới cho phòng khám"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên dịch vụ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Khám nội tổng quát"
                maxLength={200}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="serviceType">
                Loại dịch vụ <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceType: value })
                }
              >
                <SelectTrigger id="serviceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="basePrice">
                Giá cơ bản (VNĐ) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                placeholder="200000"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả chi tiết về dịch vụ..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : service ? (
                "Cập nhật"
              ) : (
                "Thêm dịch vụ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
