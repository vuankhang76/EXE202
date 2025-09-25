import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading, LOADING_KEYS } from '@/contexts/LoadingContext';
import { useNavigate } from 'react-router-dom';

interface OtpFormProps {
  phoneNumber: string;
  onBack: () => void;
}

export default function OtpForm({ phoneNumber, onBack }: OtpFormProps) {
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const { verifyStaffOtp, requestStaffOtp } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setErrors({ otp: 'Vui lòng nhập mã OTP' });
      return;
    }

    if (otpCode.length !== 6) {
      setErrors({ otp: 'Mã OTP phải có 6 chữ số' });
      return;
    }

    startLoading(LOADING_KEYS.VERIFY_OTP);
    setErrors({});

    try {
      await verifyStaffOtp(phoneNumber, otpCode);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({
        general: error.message || 'Có lỗi xảy ra khi xác thực OTP'
      });
    } finally {
      stopLoading(LOADING_KEYS.VERIFY_OTP);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    startLoading(LOADING_KEYS.REQUEST_OTP);
    setErrors({});

    try {
      await requestStaffOtp(phoneNumber);
      
      setCountdown(300);
      setCanResend(false);
      setErrors({});
    } catch (error: any) {
      setErrors({
        general: error.message || 'Có lỗi xảy ra khi gửi lại OTP'
      });
    } finally {
      stopLoading(LOADING_KEYS.REQUEST_OTP);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtpCode(value);
      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Xác thực OTP
        </h3>
        <p className="text-muted-foreground">
          Mã OTP đã được gửi đến số điện thoại
        </p>
        <p className="font-medium text-foreground">{phoneNumber}</p>
      </div>

      {errors.general && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-medium text-foreground">
            Mã OTP (6 chữ số)
          </label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otpCode}
            onChange={handleOtpChange}
            className={`text-center text-lg tracking-widest ${errors.otp ? 'border-destructive' : ''}`}
            maxLength={6}
            autoComplete="one-time-code"
          />
          {errors.otp && (
            <p className="text-sm text-destructive">{errors.otp}</p>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {countdown > 0 ? (
            <p>Mã OTP sẽ hết hạn sau: <span className="font-medium">{formatTime(countdown)}</span></p>
          ) : (
            <p className="text-destructive">Mã OTP đã hết hạn</p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading(LOADING_KEYS.VERIFY_OTP) || otpCode.length !== 6}
          >
            {isLoading(LOADING_KEYS.VERIFY_OTP) ? (
              <>
                <ButtonLoadingSpinner />
                Đang xác thực...
              </>
            ) : (
              'Xác thực OTP'
            )}
          </Button>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isLoading(LOADING_KEYS.VERIFY_OTP) || isLoading(LOADING_KEYS.REQUEST_OTP)}
            >
              Quay lại
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOtp}
              className="flex-1"
              disabled={isLoading(LOADING_KEYS.REQUEST_OTP) || !canResend}
            >
              {isLoading(LOADING_KEYS.REQUEST_OTP) ? (
                <>
                  <ButtonLoadingSpinner />
                  Đang gửi...
                </>
              ) : (
                'Gửi lại OTP'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
