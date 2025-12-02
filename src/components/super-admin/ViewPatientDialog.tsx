import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PatientDto } from "@/types";

interface ViewPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientDto | null;
  loading?: boolean;
}

export default function ViewPatientDialog({
  open,
  onOpenChange,
  patient,
  loading = false,
}: ViewPatientDialogProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatGender = (gender?: string) => {
    if (!gender) return "-";
    switch (gender.toUpperCase()) {
      case "M":
        return "Nam";
      case "F":
        return "Nữ";
      case "O":
        return "Khác";
      default:
        return gender;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bệnh nhân</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : patient ? (
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div>
              <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{patient.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                  <p className="font-medium">{patient.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-medium">{formatGender(patient.gender)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-medium">
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")
                      : "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-medium">{patient.address || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin liên hệ */}
            <div>
              <h3 className="font-semibold mb-3">Thông tin liên hệ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại chính</p>
                  <p className="font-medium">{patient.primaryPhoneE164}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SĐT khẩn cấp</p>
                  <p className="font-medium">{patient.emergencyPhoneE164 || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin hệ thống */}
            <div>
              <h3 className="font-semibold mb-3">Thông tin hệ thống</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{formatDate(patient.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="font-medium">{formatDate(patient.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Không có thông tin bệnh nhân
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
