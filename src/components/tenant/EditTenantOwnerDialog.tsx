import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loader2, AlertTriangle, User } from 'lucide-react';
import OwnerSelector from './OwnerSelector';
import tenantService from '@/services/tenantService';
import { toast } from 'sonner';
import type { TenantDto, TenantUpdateDto } from '@/types';

interface EditTenantOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantDto | null;
  onSuccess?: () => void;
}

export default function EditTenantOwnerDialog({
  open,
  onOpenChange,
  tenant,
  onSuccess
}: EditTenantOwnerDialogProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (tenant) {
      setSelectedOwnerId(tenant.ownerUserId || null);
      setHasChanges(false);
    }
  }, [tenant]);

  const handleOwnerChange = (ownerId: number | null) => {
    setSelectedOwnerId(ownerId);
    setHasChanges(ownerId !== (tenant?.ownerUserId || null));
  };

  const handleSave = async () => {
    if (!tenant) return;

    setLoading(true);
    try {
      const updateDto: TenantUpdateDto = {
        ownerUserId: selectedOwnerId ?? undefined
      };

      const response = await tenantService.updateTenant(tenant.tenantId, updateDto);

      if (response.success) {
        toast.success('Cập nhật chủ sở hữu thành công', {
          description: selectedOwnerId 
            ? 'Đã gán chủ sở hữu cho phòng khám'
            : 'Đã xóa chủ sở hữu của phòng khám'
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error('Cập nhật thất bại', {
          description: response.message || 'Có lỗi xảy ra'
        });
      }
    } catch (error: any) {
      toast.error('Cập nhật thất bại', {
        description: error.message || 'Không thể cập nhật chủ sở hữu'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chỉnh sửa chủ sở hữu
          </DialogTitle>
          <DialogDescription>
            Chọn người dùng làm chủ sở hữu cho phòng khám <strong>{tenant.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Owner Info */}
          {tenant.ownerName && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Chủ sở hữu hiện tại: <strong>{tenant.ownerName}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Owner Selector */}
          <div className="space-y-2">
            <Label htmlFor="owner">Chủ sở hữu mới</Label>
            <OwnerSelector
              tenantId={tenant.tenantId}
              currentOwnerId={selectedOwnerId}
              currentOwnerName={tenant.ownerName}
              onOwnerChange={handleOwnerChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Chỉ người dùng với vai trò "Tenant" mới có thể được chọn làm chủ sở hữu.
              Mỗi người dùng chỉ có thể làm chủ sở hữu cho một phòng khám.
            </p>
          </div>

          {/* Warning */}
          {hasChanges && selectedOwnerId === null && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Bạn đang xóa chủ sở hữu. Phòng khám sẽ không có người chịu trách nhiệm chính.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

