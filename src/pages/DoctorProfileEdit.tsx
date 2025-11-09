import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Phone,
  Stethoscope,
  Award,
  Calendar,
  Save,
  X,
  AlertCircle,
  Loader2,
  Shield,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import AdminLayout from '@/layout/AdminLayout';
import doctorService from '@/services/doctorService';
import tenantService from '@/services/tenantService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { DoctorSelfUpdateDto } from '@/types';
import { SPECIALTIES, ACADEMIC_TITLES, POSITION_TITLES } from '@/constants/doctorOptions';
import { DoctorProfileEditSkeleton } from '@/components/doctor/DoctorProfileEditSkeleton';
import {
  useAppDispatch,
  useDoctorProfileData,
  useDoctorProfileLoading,
  useDoctorProfileSaving,
  useDoctorProfileUploadingAvatar,
  isCacheValid,
} from '@/stores/hooks';
import {
  setLoading,
  setSaving,
  setUploadingAvatar,
  setDoctorProfileData,
  setAvatarPreview,
} from '@/stores/doctorProfileSlice';

const doctorProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(120, 'Họ tên không được vượt quá 120 ký tự'),
  phoneE164: z
    .string()
    .regex(/^\+84\d{9}$/, 'Số điện thoại phải có định dạng +84xxxxxxxxx')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  title: z.string().max(60, 'Danh xưng không được vượt quá 60 ký tự').optional(),
  positionTitle: z
    .string()
    .max(120, 'Chức vụ không được vượt quá 120 ký tự')
    .optional(),
  specialty: z
    .string()
    .max(120, 'Chuyên khoa không được vượt quá 120 ký tự')
    .optional(),
  licenseNumber: z
    .string()
    .max(60, 'Số giấy phép không được vượt quá 60 ký tự')
    .optional(),
  yearStarted: z
    .number()
    .min(1950, 'Năm bắt đầu không hợp lệ')
    .max(new Date().getFullYear(), 'Năm bắt đầu không thể lớn hơn năm hiện tại')
    .optional()
    .nullable(),
  about: z
    .string()
    .max(5000, 'Giới thiệu không được vượt quá 5,000 ký tự')
    .optional(),
});

export type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

export default function DoctorProfileEdit() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    doctor,
    avatarPreview,
    lastUpdated,
    cacheExpiration,
  } = useDoctorProfileData();
  const loading = useDoctorProfileLoading();
  const saving = useDoctorProfileSaving();
  const uploadingAvatar = useDoctorProfileUploadingAvatar();

  const [manualDirty, setManualDirty] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty: formIsDirty },
  } = useForm<DoctorProfileFormData>({
    resolver: zodResolver(doctorProfileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const isDirty = formIsDirty || manualDirty;

  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    let baseNumber = cleaned;
    if (baseNumber.startsWith('+84')) {
      baseNumber = baseNumber.substring(3);
    } else if (baseNumber.startsWith('84')) {
      baseNumber = baseNumber.substring(2);
    } else if (baseNumber.startsWith('0')) {
      baseNumber = baseNumber.substring(1);
    }

    baseNumber = baseNumber.replace(/\D/g, '').substring(0, 9);

    return baseNumber ? '+84' + baseNumber : '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = normalizePhoneNumber(value);
    setValue('phoneE164', formatted, { shouldDirty: true, shouldValidate: true });
  };

  const loadDoctorProfile = useCallback(async () => {
    if (!currentUser?.userId) return;

    dispatch(setLoading(true));
    try {
      const response = await doctorService.getMyProfile(parseInt(currentUser.userId));
      if (response.success && response.data) {
        const profileData: DoctorSelfUpdateDto = {
          fullName: response.data.fullName,
          phoneE164: response.data.phoneE164 || undefined,
          avatarUrl: response.data.avatarUrl || undefined,
          title: response.data.title || undefined,
          positionTitle: response.data.positionTitle || undefined,
          specialty: response.data.specialty || undefined,
          licenseNumber: response.data.licenseNumber || undefined,
          yearStarted: response.data.yearStarted || undefined,
          about: response.data.about || undefined,
        };

        dispatch(
          setDoctorProfileData({
            doctor: response.data,
            formData: profileData,
          })
        );

        dispatch(setAvatarPreview(response.data.avatarUrl || null));

        reset({
          fullName: response.data.fullName,
          phoneE164: response.data.phoneE164 || '',
          avatarUrl: response.data.avatarUrl || '',
          title: response.data.title || '',
          positionTitle: response.data.positionTitle || '',
          specialty: response.data.specialty || '',
          licenseNumber: response.data.licenseNumber || '',
          yearStarted: response.data.yearStarted || null,
          about: response.data.about || '',
        });

        setManualDirty(false);
      } else {
        toast.error('Không thể tải thông tin', {
          description: response.message || 'Có lỗi xảy ra',
        });
        navigate('/clinic/dashboard');
      }
    } catch (error: any) {
      toast.error('Lỗi tải thông tin', {
        description: error.message || 'Không thể tải thông tin bác sĩ',
      });
    } finally {
      dispatch(setLoading(false));
    }
  }, [currentUser?.userId, dispatch, navigate, reset]);

  useEffect(() => {
    if (!currentUser?.userId) {
      navigate('/auth/login');
      return;
    }

    // Check if we have valid cached data
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      return;
    }

    // Load fresh data if cache is invalid or expired
    loadDoctorProfile();
  }, [currentUser?.userId, lastUpdated, cacheExpiration, loadDoctorProfile, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File không hợp lệ', {
        description: 'Vui lòng chọn file ảnh',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn', {
        description: 'Kích thước file không được vượt quá 5MB',
      });
      return;
    }

    dispatch(setUploadingAvatar(true));
    try {
      const response = await tenantService.uploadImage(file, 'doctors/avatars');
      if (response.success && response.data) {
        setValue('avatarUrl', response.data);
        dispatch(setAvatarPreview(response.data));
        setManualDirty(true);
        toast.success('Upload ảnh thành công');
      } else {
        toast.error('Upload thất bại', {
          description: response.message || 'Có lỗi xảy ra',
        });
      }
    } catch (error: any) {
      toast.error('Upload thất bại', {
        description: error.message || 'Không thể upload ảnh',
      });
    } finally {
      dispatch(setUploadingAvatar(false));
    }
  };

  const onSubmit = async (data: DoctorProfileFormData) => {
    if (!currentUser?.userId) return;

    dispatch(setSaving(true));
    try {
      const updateData: DoctorSelfUpdateDto = {
        fullName: data.fullName,
        phoneE164: data.phoneE164 || undefined,
        avatarUrl: data.avatarUrl || undefined,
        title: data.title || undefined,
        positionTitle: data.positionTitle || undefined,
        specialty: data.specialty || undefined,
        licenseNumber: data.licenseNumber || undefined,
        yearStarted: data.yearStarted || undefined,
        about: data.about || undefined,
      };

      const response = await doctorService.updateMyProfile(
        parseInt(currentUser.userId),
        updateData,
      );

      if (response.success) {
        toast.success('Cập nhật thành công', {
          description: 'Thông tin của bạn đã được cập nhật',
        });
        setManualDirty(false);
        loadDoctorProfile();
      } else {
        const errorMessage =
          response.errors && response.errors.length > 0
            ? response.errors.join(', ')
            : response.message || 'Có lỗi xảy ra';

        toast.error('Cập nhật thất bại', {
          description: errorMessage,
        });
      }
    } catch (error: any) {
      toast.error('Cập nhật thất bại', {
        description: error.message || 'Có lỗi xảy ra khi cập nhật',
      });
    } finally {
      dispatch(setSaving(false));
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?',
      );
      if (!confirmed) return;
    }
    navigate('/clinic/dashboard');
  };

  if (loading) {
    return (
      <AdminLayout breadcrumbTitle="Chỉnh sửa hồ sơ">
        <DoctorProfileEditSkeleton />
      </AdminLayout>
    );
  }

  if (!doctor) {
    return (
      <AdminLayout breadcrumbTitle="Chỉnh sửa hồ">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Không tìm thấy thông tin bác sĩ</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbTitle="Chỉnh sửa hồ sơ"
      actions={
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="hidden md:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium bg-amber-50 border-amber-200 text-amber-700">
              <Info className="w-3.5 h-3.5" />
              Chưa lưu
            </span>
          )}
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="w-4 h-4 mr-2" />Huỷ
          </Button>
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={saving || uploadingAvatar}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="flex w-full justify-center">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5"/>Ảnh đại diện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ImageUploadField
                  label="Ảnh đại diện"
                  imageUrl={avatarPreview}
                  onFileChange={handleAvatarUpload}
                  uploading={uploadingAvatar}
                  canEdit={true}
                  variant="circle"
                  size={172}
                  emptyText="Chưa có ảnh đại diện"
                  maxSizeText="JPG, PNG, GIF. Tối đa 5MB"
                />
                {errors.avatarUrl && (
                  <p className="text-xs text-red-500">{errors.avatarUrl.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input id="fullName" {...register('fullName')} placeholder="Nhập họ và tên" />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Chỉ đọc)</Label>
                  <Input id="email" value={doctor.email} disabled className="bg-muted" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneE164" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />Số điện thoại
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

                <div className="space-y-2">
                <Label htmlFor="yearStarted" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />Năm bắt đầu hành nghề
                </Label>
                <Input
                  id="yearStarted"
                  type="number"
                  {...register('yearStarted', { valueAsNumber: true })}
                  placeholder="2010"
                  min={1950}
                  max={new Date().getFullYear()}
                />
                {errors.yearStarted && (
                  <p className="text-xs text-red-500">{errors.yearStarted.message}</p>
                )}
              </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />Số giấy phép hành nghề
                </Label>
                <Input id="licenseNumber" {...register('licenseNumber')} placeholder="Nhập số giấy phép" />
                {errors.licenseNumber && (
                  <p className="text-xs text-red-500">{errors.licenseNumber.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5" />Nghề nghiệp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Học hàm, học vị</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger className="w-full">
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
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionTitle">Chức danh</Label>
                <Controller
                  name="positionTitle"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger className="w-full ">
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
              <div className="space-y-2">
                  <Label htmlFor="specialty" className="flex items-center gap-1">
                    <Stethoscope className="w-4 h-4" />Chuyên khoa
                  </Label>
                  <Controller
                    name="specialty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className="w-full">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Giới thiệu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RichTextEditor
                value={watch('about') || ''}
                onChange={(value) => {
                  const currentValue = watch('about') || '';
                  if (value !== currentValue) {
                    setValue('about', value);
                    setManualDirty(true);
                  }
                }}
                placeholder="Viết giới thiệu về bản thân, kinh nghiệm, thành tích..."
                disabled={saving}
                maxLength={5000}
              />
              {errors.about && (
                <p className="text-xs text-red-500 mt-2">{errors.about.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}
