import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Calendar } from '@/components/ui/Calendar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';

import patientAccountService from '@/services/patientAccountService';
import type { PatientAccountRegisterDto } from '@/types/patientAccount';

interface PatientRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function PatientRegisterForm({
  onSuccess,
  onSwitchToLogin,
}: PatientRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: '',
    address: '',
  });

  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();


  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { fullName, email, phone, password, confirmPassword, gender, dateOfBirth, address } = formData;

    if (!fullName || !email || !phone || !password || !gender || !dateOfBirth || !address || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const registerData: PatientAccountRegisterDto = {
        fullName,
        email,
        phoneE164: phone,
        password,
        confirmPassword,
        gender: gender,
        dateOfBirth: dateOfBirth,
        address: address,
      };

      const response = await patientAccountService.register(registerData);

      if (response.success) {
        toast.success('Đăng ký thành công!', {
          description: 'Vui lòng đăng nhập để tiếp tục.',
        });
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          gender: '',
          dateOfBirth: '',
          address: '',
        });
        onSuccess?.();
      } else {
        toast.error('Đăng ký thất bại', {
          description: response.message || 'Có lỗi xảy ra khi đăng ký.',
        });
      }
    } catch (error: any) {
      toast.error('Đăng ký thất bại', {
        description: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" className='mb-2'>
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className='mb-2'>
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className='mb-2'>
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0xxxxxxxxx"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="gender" className='mb-2'>Giới tính</Label>
            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
              <SelectTrigger className='w-full !h-12'>
                <SelectValue placeholder="Chọn giới tính"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Nam</SelectItem>
                <SelectItem value="F">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Ngày sinh</Label>
            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal !h-12"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {selectedDate
                    ? format(selectedDate, 'dd/MM/yyyy', { locale: vi })
                    : 'Chọn ngày sinh'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-2 w-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setOpenCalendar(false);
                    handleChange('dateOfBirth', date ? date.toISOString().split('T')[0] : '');
                  }}
                  captionLayout="dropdown-years"
                  startMonth={new Date(1950, 0, 1)}
                  endMonth={new Date(new Date().getFullYear() - 5, 11, 31)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="address" className="mb-2">
              Địa chỉ
            </Label>
            <Input
              id="address"
              placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className='mb-2'>
            Mật khẩu <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <Label htmlFor="confirmPassword" className='mb-2'>
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full font-medium mt-4" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            'Đăng ký'
          )}
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}
    </div>
  );
}
