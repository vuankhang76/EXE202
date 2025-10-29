import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { serviceService } from "@/services/serviceService";
import type { Service } from "@/types/service";
import { ServiceDialog } from "./ServiceDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/Alert-dialog";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { setServices, setLoadingServices } from "@/stores/tenantSettingSlice";

interface ServiceManagementTabProps {
  tenantId: number;
  canEdit: boolean;
}

export function ServiceManagementTab({ tenantId, canEdit }: ServiceManagementTabProps) {
  const dispatch = useAppDispatch();
  const services = useAppSelector((state) => state.tenantSetting.services);
  const loading = useAppSelector((state) => state.tenantSetting.loadingServices);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadServices = async () => {
    dispatch(setLoadingServices(true));
    try {
      const response = await serviceService.getTenantServices(tenantId);
      if (response.success && response.data) {
        dispatch(setServices(response.data));
      } else {
        toast.error("Không thể tải danh sách dịch vụ");
      }
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Có lỗi xảy ra khi tải dịch vụ");
    } finally {
      dispatch(setLoadingServices(false));
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    setDeleting(true);
    try {
      const response = await serviceService.deleteService(serviceToDelete.serviceId);
      if (response.success) {
        toast.success("Xóa dịch vụ thành công");
        loadServices();
      } else {
        toast.error(response.message || "Không thể xóa dịch vụ");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Có lỗi xảy ra khi xóa dịch vụ");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleDialogSuccess = () => {
    loadServices();
    setDialogOpen(false);
    setSelectedService(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getServiceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      General: "Khám tổng quát",
      Specialist: "Khám chuyên khoa",
      Emergency: "Khẩn cấp",
    };
    return types[type] || type;
  };

  const getServiceTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      General: "default",
      Specialist: "secondary",
      Emergency: "destructive",
    };
    return variants[type] || "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quản lý dịch vụ</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các dịch vụ y tế của phòng khám
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleAddService}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm dịch vụ
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              Chưa có dịch vụ nào được thêm
            </p>
            {canEdit && (
              <Button onClick={handleAddService}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm dịch vụ đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.serviceId} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant={getServiceTypeBadgeVariant(service.serviceType)}>
                        {getServiceTypeLabel(service.serviceType)}
                      </Badge>
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditService(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Giá cơ bản</span>
                    <span className="text-lg font-semibold text-primary">
                      {formatPrice(service.basePrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedService}
        tenantId={tenantId}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ "{serviceToDelete?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
