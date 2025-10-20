import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Save, Loader2 } from "lucide-react";
import { SPECIALTIES, ACADEMIC_TITLES, POSITION_TITLES } from "@/constants/doctorOptions";
import { useEffect } from 'react';

const editDoctorSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneE164: z.string().regex(/^\+84\d{9}$/, 'Số điện thoại phải có định dạng +84 và 9 số (tổng 10 số)'),
  
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
});

export type EditDoctorFormData = z.infer<typeof editDoctorSchema>;

interface EditDoctorDialogProps {
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditDoctorFormData) => Promise<void>;
  initialData?: EditDoctorFormData | null;
}

export default function EditDoctorDialog({
  open,
  saving,
  onOpenChange,
  onSubmit,
  initialData
}: EditDoctorDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<EditDoctorFormData>({
    resolver: zodResolver(editDoctorSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && initialData) {
      reset(initialData);
    }
  }, [open, initialData, reset]);

  // Normalize phone number to E.164 format (10 digits total: +84 + 9 digits)
  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Remove +84 or 84 prefix to get the base number
    let baseNumber = cleaned;
    if (baseNumber.startsWith('+84')) {
      baseNumber = baseNumber.substring(3);
    } else if (baseNumber.startsWith('84')) {
      baseNumber = baseNumber.substring(2);
    } else if (baseNumber.startsWith('0')) {
      baseNumber = baseNumber.substring(1);
    }

    // Only keep first 9 digits
    baseNumber = baseNumber.replace(/\D/g, '').substring(0, 9);

    return baseNumber ? '+84' + baseNumber : '';
  };

  // Handle phone input change with auto-formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = normalizePhoneNumber(value);
    setValue('phoneE164', formatted, { shouldDirty: true, shouldValidate: true });
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin bác sĩ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài khoản và hồ sơ bác sĩ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
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
                    disabled
                    className="bg-muted"
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
                    onChange={handlePhoneChange}
                    placeholder="+84xxxxxxxxx"
                  />
                  {errors.phoneE164 && (
                    <p className="text-xs text-red-500">{errors.phoneE164.message}</p>
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
                  <Controller
                    name="specialty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chuyên khoa" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty.value} value={specialty.value}>
                              {specialty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn học hàm, học vị" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACADEMIC_TITLES.map((title) => (
                            <SelectItem key={title.value} value={title.value}>
                              {title.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionTitle">Chức danh</Label>
                  <Controller
                    name="positionTitle"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chức danh" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITION_TITLES.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
