import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Service } from "@/types/service";
import { serviceService } from "@/services/serviceService";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
  tenantId: number;
  selectedServiceId?: number;
  onServiceSelect: (service: Service) => void;
}

export function ServiceSelector({ tenantId, selectedServiceId, onServiceSelect }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, [tenantId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceService.getTenantServices(tenantId);
      
      if (response.success && response.data) {
        // Only show active services
        const activeServices = response.data.filter(s => s.isActive);
        setServices(activeServices);
      } else {
        setError(response.message || "Không thể tải danh sách dịch vụ");
      }
    } catch (err: any) {
      console.error("Error loading services:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const getServiceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      General: "Khám tổng quát",
      Specialist: "Chuyên khoa",
      Emergency: "Cấp cứu",
      Checkup: "Kiểm tra sức khỏe"
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Đang tải dịch vụ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Chưa có dịch vụ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.serviceId;
          
          return (
            <Card
              key={service.serviceId}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "border-primary bg-primary/5 ring-2 ring-primary"
              )}
              onClick={() => onServiceSelect(service)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getServiceTypeLabel(service.serviceType)}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Giá khám:</span>
                    <span className="font-semibold text-primary">
                      {formatPrice(service.basePrice)}
                    </span>
                  </div>
                  {service.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
