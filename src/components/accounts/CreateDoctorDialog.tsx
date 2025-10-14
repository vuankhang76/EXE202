import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Plus, Loader2 } from "lucide-react";

// Form schema for creating doctor - comprehensive version
const createDoctorSchema = z.object({
  // User fields
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneE164: z.string().regex(/^\+84\d{9,10}$/, 'Số điện thoại phải có định dạng +84xxxxxxxxx'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
  
  // Doctor fields
  specialty: z.string().min(1, 'Chuyên khoa là bắt buộc'),
  licenseNumber: z.string().min(1, 'Số giấy phép hành nghề là bắt buộc'),
  title: z.string().optional(),
  positionTitle: z.string().optional(),
  yearStarted: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 1950 && num <= new Date().getFullYear();
    }, `Năm bắt đầu phải từ 1950 đến ${new Date().getFullYear()}`),
  about: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;

interface CreateDoctorDialogProps {
  open: boolean;
  creating: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDoctorFormData) => Promise<void>;
}

export default function CreateDoctorDialog({
  open,
  creating,
  onOpenChange,
  onSubmit
}: CreateDoctorDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Thêm bác sĩ mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản và hồ sơ cho bác sĩ mới trong phòng khám
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* User Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Thông tin tài khoản</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Ví dụ: BS. Nguyễn Văn A"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="doctor@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneE164">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneE164"
                    {...register('phoneE164')}
                    placeholder="+84xxxxxxxxx"
                  />
                  {errors.phoneE164 && (
                    <p className="text-xs text-red-500">{errors.phoneE164.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Professional Information Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground">Thông tin chuyên môn</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">
                    Chuyên khoa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="specialty"
                    {...register('specialty')}
                    placeholder="Ví dụ: Nội tổng hợp"
                  />
                  {errors.specialty && (
                    <p className="text-xs text-red-500">{errors.specialty.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">
                    Số giấy phép hành nghề <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="licenseNumber"
                    {...register('licenseNumber')}
                    placeholder="Ví dụ: 12345/HN-BYT"
                  />
                  {errors.licenseNumber && (
                    <p className="text-xs text-red-500">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Học hàm, học vị</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Ví dụ: Tiến sĩ, Thạc sĩ"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionTitle">Chức danh</Label>
                  <Input
                    id="positionTitle"
                    {...register('positionTitle')}
                    placeholder="Ví dụ: Trưởng khoa"
                  />
                  {errors.positionTitle && (
                    <p className="text-xs text-red-500">{errors.positionTitle.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearStarted">Năm bắt đầu hành nghề</Label>
                <Input
                  id="yearStarted"
                  type="number"
                  {...register('yearStarted')}
                  placeholder="Ví dụ: 2015"
                  min="1950"
                  max={new Date().getFullYear()}
                />
                {errors.yearStarted && (
                  <p className="text-xs text-red-500">{errors.yearStarted.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">Giới thiệu</Label>
                <Textarea
                  id="about"
                  {...register('about')}
                  placeholder="Mô tả ngắn về kinh nghiệm và chuyên môn của bác sĩ..."
                  rows={3}
                  className="resize-none"
                />
                {errors.about && (
                  <p className="text-xs text-red-500">{errors.about.message}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={creating}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo tài khoản
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
