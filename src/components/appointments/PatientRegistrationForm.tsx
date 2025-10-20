import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import type { PatientRegistrationDto } from '@/types';

interface PatientRegistrationFormProps {
  data: PatientRegistrationDto;
  errors: {
    fullName: string;
    phone: string;
    dateOfBirth: string;
  };
  isRegistering: boolean;
  onFieldChange: (field: keyof PatientRegistrationDto, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PatientRegistrationForm({
  data,
  errors,
  isRegistering,
  onFieldChange,
  onSubmit,
  onCancel
}: PatientRegistrationFormProps) {
  return (
    <div className="mt-3 p-4 border rounded-lg bg-blue-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-blue-900">Đăng ký bệnh nhân mới</h4>
        <Button 
          type="button"
          variant="ghost" 
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0"
        >
          ✕
        </Button>
      </div>
      
      {/* Full Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="newPatientName" className="text-xs">Họ và tên *</Label>
          <span className="text-xs text-gray-400">{data.fullName.length}/200</span>
        </div>
        <Input
          id="newPatientName"
          placeholder="Nguyễn Văn A"
          value={data.fullName}
          onChange={(e) => onFieldChange('fullName', e.target.value)}
          className={`h-9 ${errors.fullName ? 'border-red-500' : ''}`}
          maxLength={200}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="newPatientPhone" className="text-xs">Số điện thoại *</Label>
        <Input
          id="newPatientPhone"
          placeholder="+84xxxxxxxxx hoặc 0xxxxxxxxx"
          value={data.primaryPhoneE164}
          onChange={(e) => onFieldChange('primaryPhoneE164', e.target.value)}
          className={`h-9 ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone ? (
          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Sẽ tự động chuyển sang định dạng +84...
          </p>
        )}
      </div>

      {/* Gender & Date of Birth */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="newPatientGender" className="text-xs">Giới tính</Label>
          <Select
            value={data.gender}
            onValueChange={(value) => onFieldChange('gender', value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Nam</SelectItem>
              <SelectItem value="F">Nữ</SelectItem>
              <SelectItem value="O">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPatientDob" className="text-xs">Ngày sinh</Label>
          <Input
            id="newPatientDob"
            type="date"
            value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const dateValue = e.target.value ? new Date(e.target.value).toISOString().split('T')[0] : undefined;
              onFieldChange('dateOfBirth', dateValue);
            }}
            className={`h-9 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="newPatientAddress" className="text-xs">Địa chỉ</Label>
          <span className="text-xs text-gray-400">{data.address?.length || 0}/300</span>
        </div>
        <Input
          id="newPatientAddress"
          placeholder="123 Đường ABC, Quận XYZ"
          value={data.address}
          onChange={(e) => onFieldChange('address', e.target.value)}
          className="h-9"
          maxLength={300}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button 
          type="button"
          onClick={onSubmit} 
          disabled={isRegistering || !!errors.fullName || !!errors.phone || !!errors.dateOfBirth}
          className="flex-1 h-9"
        >
          {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isRegistering}
          className="h-9"
        >
          Hủy
        </Button>
      </div>
    </div>
  );
}
