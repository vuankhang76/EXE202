import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import type { TenantDto } from "@/types";

interface ViewTenantDialogProps {
  tenant: TenantDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewTenantDialog({
  tenant,
  open,
  onOpenChange,
}: ViewTenantDialogProps) {
  if (!tenant) return null;

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return <Badge variant="success">Hoạt động</Badge>;
    }
    return <Badge variant="secondary">Không hoạt động</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin phòng khám</DialogTitle>
          <DialogDescription>
            Chi tiết thông tin về {tenant.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Mã phòng khám</p>
              <p className="mt-1 text-base font-semibold">{tenant.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Trạng thái</p>
              <p className="mt-1">{getStatusBadge(tenant.status || 0)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Tên phòng khám</p>
            <p className="mt-1 text-base">{tenant.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-base">{tenant.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
              <p className="mt-1 text-base">{tenant.phone || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
            <p className="mt-1 text-base">{tenant.address || "-"}</p>
          </div>

          {tenant.description && (
            <div>
              <p className="text-sm font-medium text-gray-500">Mô tả</p>
              <div className="mt-1 text-sm text-gray-700 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-md">
                {tenant.description}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Giờ làm việc</p>
            <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
              {tenant.weekdayOpen && tenant.weekdayClose && (
                <div className="flex justify-between">
                  <span className="font-medium">Thứ 2 - Thứ 6:</span>
                  <span>
                    {tenant.weekdayOpen} - {tenant.weekdayClose}
                  </span>
                </div>
              )}
              {tenant.weekendOpen && tenant.weekendClose && (
                <div className="flex justify-between">
                  <span className="font-medium">Thứ 7 - Chủ nhật:</span>
                  <span>
                    {tenant.weekendOpen} - {tenant.weekendClose}
                  </span>
                </div>
              )}
              {!tenant.weekdayOpen && !tenant.weekendOpen && (
                <p className="text-sm text-gray-500">Chưa cập nhật giờ làm việc</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
            <p className="mt-1 text-base">
              {tenant.createdAt
                ? new Date(tenant.createdAt).toLocaleString("vi-VN")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Người sở hữu (Owner)</p>
            <p className="mt-1 text-base">{tenant.ownerName || "Chưa thiết lập"}</p>
            {tenant.ownerUserId && (
              <p className="text-xs text-gray-500 mt-1">ID: {tenant.ownerUserId}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

