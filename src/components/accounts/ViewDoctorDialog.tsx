import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Award,
  Calendar,
  Shield,
  FileText,
} from "lucide-react";
import { getRoleLabel, getRoleBadgeVariant, getStatusBadgeClass } from '@/types/account';
import type { UserDto } from '@/types';

interface ViewDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: UserDto | null;
  doctorDetails?: {
    specialty?: string;
    licenseNumber?: string;
    title?: string;
    positionTitle?: string;
    yearStarted?: number;
    about?: string;
  } | null;
}

export default function ViewDoctorDialog({
  open,
  onOpenChange,
  doctor,
  doctorDetails
}: ViewDoctorDialogProps) {
  if (!doctor) return null;

  const formatPhone = (phone?: string) => {
    if (!phone) return "Chưa cập nhật";
    const digits = phone.replace(/\D/g, "");
    if (/^84\d{9}$/.test(digits)) {
      const local = "0" + digits.slice(2);
      return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Thông tin bác sĩ</DialogTitle>
          <DialogDescription>
            Chi tiết thông tin tài khoản và hồ sơ bác sĩ
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="text-sm font-medium">{doctor.fullName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vai trò</p>
                <div>
                  <Badge variant={getRoleBadgeVariant(doctor.role)}>
                    {getRoleLabel(doctor.role)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="text-sm font-medium">{doctor.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Số điện thoại
                </p>
                <p className="text-sm font-medium">{formatPhone(doctor.phoneE164)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <div>
                  <Badge variant="outline" className={getStatusBadgeClass(doctor.isActive)}>
                    {doctor.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          {doctorDetails && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Thông tin chuyên môn
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {doctorDetails.specialty && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Chuyên khoa</p>
                    <p className="text-sm font-medium">{doctorDetails.specialty}</p>
                  </div>
                )}

                {doctorDetails.licenseNumber && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Số giấy phép
                    </p>
                    <p className="text-sm font-medium">{doctorDetails.licenseNumber}</p>
                  </div>
                )}

                {doctorDetails.title && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Học hàm, học vị
                    </p>
                    <p className="text-sm font-medium">{doctorDetails.title}</p>
                  </div>
                )}

                {doctorDetails.positionTitle && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Chức danh</p>
                    <p className="text-sm font-medium">{doctorDetails.positionTitle}</p>
                  </div>
                )}

                {doctorDetails.yearStarted && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Năm bắt đầu
                    </p>
                    <p className="text-sm font-medium">{doctorDetails.yearStarted}</p>
                  </div>
                )}
              </div>

              {doctorDetails.about && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Giới thiệu
                  </p>
                  <div 
                    className="text-sm p-3 bg-muted/50 rounded-md"
                    dangerouslySetInnerHTML={{ __html: doctorDetails.about }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
