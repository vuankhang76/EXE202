import { useState } from 'react';
import { toast } from 'sonner';
import patientService from '@/services/patientService';
import type { PatientRegistrationDto } from '@/types';

interface ValidationErrors {
  fullName: string;
  phone: string;
  dateOfBirth: string;
}

export function usePatientRegistration(tenantId: number) {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newPatientData, setNewPatientData] = useState<PatientRegistrationDto>({
    fullName: '',
    primaryPhoneE164: '',
    gender: '',
    dateOfBirth: undefined,
    address: ''
  });
  
  const [registrationErrors, setRegistrationErrors] = useState<ValidationErrors>({
    fullName: '',
    phone: '',
    dateOfBirth: ''
  });

  const normalizePhoneToE164 = (phone: string): string => {
    const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
    
    if (cleaned.startsWith('+84')) return cleaned;
    if (cleaned.startsWith('84')) return '+' + cleaned;
    if (cleaned.startsWith('0')) return '+84' + cleaned.substring(1);
    
    return cleaned;
  };

  const validateField = (field: keyof PatientRegistrationDto, value: any) => {
    const errors = { ...registrationErrors };
    
    switch (field) {
      case 'fullName':
        if (!value || !value.trim()) {
          errors.fullName = 'Họ tên là bắt buộc';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        } else if (value.length > 200) {
          errors.fullName = 'Họ tên không được vượt quá 200 ký tự';
        } else {
          errors.fullName = '';
        }
        break;
        
      case 'primaryPhoneE164':
        if (!value || !value.trim()) {
          errors.phone = 'Số điện thoại là bắt buộc';
        } else {
          const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
          if (!phoneRegex.test(value.trim())) {
            errors.phone = 'Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx';
          } else {
            errors.phone = '';
          }
        }
        break;
        
      case 'dateOfBirth':
        if (value) {
          const dob = new Date(value);
          const today = new Date();
          if (dob > today) {
            errors.dateOfBirth = 'Ngày sinh không được là ngày tương lai';
          } else {
            const age = today.getFullYear() - dob.getFullYear();
            if (age > 150) {
              errors.dateOfBirth = 'Ngày sinh không hợp lệ';
            } else {
              errors.dateOfBirth = '';
            }
          }
        } else {
          errors.dateOfBirth = '';
        }
        break;
    }
    
    setRegistrationErrors(errors);
  };

  const updatePatientField = (field: keyof PatientRegistrationDto, value: any) => {
    setNewPatientData({ ...newPatientData, [field]: value });
    validateField(field, value);
  };

  const handleQuickRegister = async (onSuccess?: (patientId: number) => void) => {
    // Validation
    if (!newPatientData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }
    
    if (newPatientData.fullName.trim().length < 2) {
      toast.error('Họ tên phải có ít nhất 2 ký tự');
      return;
    }
    
    if (newPatientData.fullName.length > 200) {
      toast.error('Họ tên không được vượt quá 200 ký tự');
      return;
    }

    if (!newPatientData.primaryPhoneE164.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(newPatientData.primaryPhoneE164.trim())) {
      toast.error('Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx');
      return;
    }

    // Vietnamese carrier prefix validation
    const cleanPhone = newPatientData.primaryPhoneE164.trim();
    const validPrefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '099',
                          '070', '076', '077', '078', '079', '088', '089',
                          '081', '082', '083', '084', '085',
                          '032', '033', '034', '035', '036', '037', '038', '039',
                          '056', '058', '092', '059', '086', '096', '097', '098',
                          '062', '063', '064', '065', '066', '067', '068', '069'];
    
    const phonePrefix = cleanPhone.startsWith('+84') 
      ? '0' + cleanPhone.substring(3, 5)
      : cleanPhone.startsWith('84')
      ? '0' + cleanPhone.substring(2, 4)
      : cleanPhone.substring(0, 3);
    
    if (!validPrefixes.includes(phonePrefix)) {
      toast.error('Đầu số điện thoại không hợp lệ');
      return;
    }

    if (newPatientData.gender && !['M', 'F', 'O'].includes(newPatientData.gender)) {
      toast.error('Giới tính không hợp lệ');
      return;
    }

    if (newPatientData.dateOfBirth) {
      const dob = new Date(newPatientData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        toast.error('Ngày sinh không được là ngày trong tương lai');
        return;
      }
      
      if (age > 150) {
        toast.error('Ngày sinh không hợp lệ');
        return;
      }
    }

    if (newPatientData.address && newPatientData.address.length > 300) {
      toast.error('Địa chỉ không được vượt quá 300 ký tự');
      return;
    }

    setIsRegistering(true);
    try {
      const normalizedData = {
        ...newPatientData,
        primaryPhoneE164: normalizePhoneToE164(newPatientData.primaryPhoneE164)
      };

      const registerResponse = await patientService.registerPatient(normalizedData);
      
      if (!registerResponse.success || !registerResponse.data) {
        toast.error(registerResponse.message || 'Không thể đăng ký bệnh nhân');
        return;
      }

      const newPatientId = registerResponse.data.patientId;

      const enrollResponse = await patientService.enrollPatientToClinic(newPatientId, tenantId);
      
      if (!enrollResponse.success) {
        toast.error('Đăng ký thành công nhưng không thể thêm vào phòng khám');
        return;
      }

      toast.success('Đăng ký bệnh nhân thành công!');
      
      setShowRegisterForm(false);
      setNewPatientData({
        fullName: '',
        primaryPhoneE164: '',
        gender: '',
        dateOfBirth: undefined,
        address: ''
      });

      onSuccess?.(newPatientId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký bệnh nhân');
    } finally {
      setIsRegistering(false);
    }
  };

  const resetRegistrationForm = () => {
    setShowRegisterForm(false);
    setNewPatientData({
      fullName: '',
      primaryPhoneE164: '',
      gender: '',
      dateOfBirth: undefined,
      address: ''
    });
    setRegistrationErrors({
      fullName: '',
      phone: '',
      dateOfBirth: ''
    });
  };

  return {
    showRegisterForm,
    setShowRegisterForm,
    isRegistering,
    newPatientData,
    registrationErrors,
    updatePatientField,
    handleQuickRegister,
    resetRegistrationForm
  };
}
