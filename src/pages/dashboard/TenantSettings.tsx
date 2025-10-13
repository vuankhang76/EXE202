import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { TimeInput } from '@/components/ui/TimeInput';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import AdminLayout from '@/layout/AdminLayout';
import tenantService from '@/services/tenantService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { TenantDto, TenantUpdateDto } from '@/types';
import { TenantImagesForm } from '@/components/tenant/TenantImageForm';

export default function TenantSettings() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<TenantDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<TenantUpdateDto>({});
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
    const isOwner = tenant?.ownerUserId && Number(currentUser?.userId) === Number(tenant.ownerUserId);
    const canEdit = Boolean(isAdmin || isOwner);

    useEffect(() => {
        if (currentUser?.tenantId) {
            loadTenant();
        }
    }, [currentUser?.tenantId]);

    const loadTenant = async () => {
        if (!currentUser?.tenantId) return;

        setLoading(true);
        try {
            const response = await tenantService.getTenantById(parseInt(currentUser.tenantId));
            if (response.success && response.data) {
                setTenant(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone,
                    address: response.data.address,
                    description: response.data.description,
                    weekdayOpen: response.data.weekdayOpen,
                    weekdayClose: response.data.weekdayClose,
                    weekendOpen: response.data.weekendOpen,
                    weekendClose: response.data.weekendClose
                });
            } else {
                toast.error('Không thể tải thông tin phòng khám');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error loading tenant:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const normalizePhoneNumber = (phone: string): string => {
        if (!phone) return phone;
        
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        
        if (cleaned.startsWith('0')) {
            return '+84' + cleaned.substring(1);
        }
        
        if (cleaned.startsWith('84') && !cleaned.startsWith('+84')) {
            return '+' + cleaned;
        }
        
        return cleaned;
    };

    const handleInputChange = (field: keyof TenantUpdateDto, value: string) => {
        if (field === 'phone') {
            value = normalizePhoneNumber(value);
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ chấp nhận file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setUploadingThumbnail(true);
        try {
            const response = await tenantService.uploadImage(file, 'tenants/thumbnails');
            if (response.success && response.data) {
                setThumbnailPreview(response.data);
                setFormData(prev => ({ ...prev, thumbnailUrl: response.data }));
                toast.success('Đã chọn ảnh đại diện. Bấm "Lưu thay đổi" để hoàn tất.');
            } else {
                toast.error('Upload thất bại', {
                    description: response.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            console.error('Error uploading thumbnail:', error);
            toast.error('Upload thất bại', {
                description: error.message || 'Không thể upload ảnh'
            });
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ chấp nhận file ảnh');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 10MB');
            return;
        }

        setUploadingCover(true);
        try {
            const response = await tenantService.uploadImage(file, 'tenants/covers');
            if (response.success && response.data) {
                setCoverPreview(response.data); // Chỉ set preview, chưa lưu database
                setFormData(prev => ({ ...prev, coverImageUrl: response.data })); // Thêm vào formData
                toast.success('Đã chọn ảnh bìa. Bấm "Lưu thay đổi" để hoàn tất.');
            } else {
                toast.error('Upload thất bại', {
                    description: response.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            console.error('Error uploading cover:', error);
            toast.error('Upload thất bại', {
                description: error.message || 'Không thể upload ảnh'
            });
        } finally {
            setUploadingCover(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser?.tenantId) {
            console.log('No tenantId found');
            return;
        }

        if (!canEdit) {
            toast.error('Không có quyền', {
                description: 'Chỉ quản trị viên hoặc chủ sở hữu mới có thể chỉnh sửa'
            });
            return;
        }

        console.log('Saving tenant with data:', formData);
        setSaving(true);
        try {
            const response = await tenantService.updateTenant(parseInt(currentUser.tenantId), formData);
            console.log('Update response:', response);

            if (response.success) {
                toast.success('Cập nhật thành công', {
                    description: 'Thông tin phòng khám đã được cập nhật'
                });
                setThumbnailPreview(null);
                setCoverPreview(null);
                loadTenant();
            } else {
                const errorMessage = response.errors && response.errors.length > 0
                    ? response.errors.join(', ')
                    : response.message || 'Có lỗi xảy ra';
                
                toast.error('Cập nhật thất bại', {
                    description: errorMessage
                });
            }
        } catch (error: any) {
            console.error('Error updating tenant:', error);
            
            if (!error.toastShown) {
                const errorMessage = error.response?.data?.errors?.length > 0
                    ? error.response.data.errors.join(', ')
                    : error.response?.data?.message || error.message || 'Không thể cập nhật thông tin';
                
                toast.error('Cập nhật thất bại', {
                    description: errorMessage
                });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Không tìm thấy thông tin phòng khám
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <AdminLayout breadcrumbTitle="Cài đặt phòng khám">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Cài đặt Phòng khám
                        </h1>
                        <p className="text-muted-foreground">
                            Quản lý thông tin và cài đặt phòng khám
                        </p>
                    </div>
                    {canEdit && (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Lưu thay đổi
                        </Button>
                    )}
                </div>

                {!canEdit && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Bạn chỉ có quyền xem thông tin. Chỉ <strong>Quản trị viên</strong> hoặc <strong>Chủ sở hữu</strong> mới có thể chỉnh sửa.
                        </AlertDescription>
                    </Alert>
                )}

                <TenantImagesForm
                    tenant={{
                        ...tenant,
                        thumbnailUrl: thumbnailPreview || tenant?.thumbnailUrl,
                        coverImageUrl: coverPreview || tenant?.coverImageUrl
                    }}
                    canEdit={canEdit}
                    uploadingThumbnail={uploadingThumbnail}
                    uploadingCover={uploadingCover}
                    handleThumbnailUpload={handleThumbnailUpload}
                    handleCoverUpload={handleCoverUpload}
                />

                <div className="grid gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên phòng khám *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Nhập tên phòng khám"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Mã phòng khám</Label>
                                    <Input
                                        id="code"
                                        value={tenant.code}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="email@example.com"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={formData.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Nhập địa chỉ phòng khám"
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả về phòng khám..."
                                    rows={4}
                                    disabled={!canEdit}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                <Label className="text-base mb-3 block">
                                    Ngày thường (Thứ 2 - Thứ 6)
                                </Label>
                                <Label className="text-base mb-3 block">
                                    Cuối tuần (Thứ 7 - Chủ nhật)
                                </Label>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weekdayOpen">Giờ mở cửa</Label>
                                        <TimeInput
                                            id="weekdayOpen"
                                            value={formData.weekdayOpen || ''}
                                            onChange={(value) => handleInputChange('weekdayOpen', value)}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weekdayClose">Giờ đóng cửa</Label>
                                        <TimeInput
                                            id="weekdayClose"
                                            value={formData.weekdayClose || ''}
                                            onChange={(value) => handleInputChange('weekdayClose', value)}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weekendOpen">Giờ mở cửa</Label>
                                        <TimeInput
                                            id="weekendOpen"
                                            value={formData.weekendOpen || ''}
                                            onChange={(value) => handleInputChange('weekendOpen', value)}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weekendClose">Giờ đóng cửa</Label>
                                        <TimeInput
                                            id="weekendClose"
                                            value={formData.weekendClose || ''}
                                            onChange={(value) => handleInputChange('weekendClose', value)}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

