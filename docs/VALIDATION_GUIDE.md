# 🔒 Form Validation Guide - Patient Registration

## 📋 Overview

Hệ thống validation toàn diện cho form đăng ký bệnh nhân nhanh trong `CreateAppointmentDialog`.

---

## ✅ Validation Rules

### **1. Họ và tên (Full Name)** ⭐ REQUIRED

| Rule | Validation | Error Message |
|------|------------|---------------|
| **Required** | `!fullName.trim()` | "Vui lòng nhập họ tên" |
| **Min Length** | `length < 2` | "Họ tên phải có ít nhất 2 ký tự" |
| **Max Length** | `length > 200` | "Họ tên không được vượt quá 200 ký tự" |

**Visual Feedback:**
- ✅ Character counter: `125/200`
- ✅ Red border khi có lỗi
- ✅ Error message hiển thị dưới field
- ✅ Input bị giới hạn tại 200 ký tự (`maxLength={200}`)

---

### **2. Số điện thoại (Phone Number)** ⭐ REQUIRED

| Rule | Validation | Error Message |
|------|------------|---------------|
| **Required** | `!phone.trim()` | "Vui lòng nhập số điện thoại" |
| **Format** | Regex: `^(\+84\|84\|0)[0-9]{9,10}$` | "Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx" |
| **Valid Prefix** | Check đầu số nhà mạng VN | "Đầu số điện thoại không hợp lệ" |

**Accepted Formats:**
```
✅ 0987654321
✅ +84987654321
✅ 84987654321
❌ 123456 (too short)
❌ 0111111111 (invalid prefix)
```

**Valid Vietnamese Prefixes:**

| Carrier | Prefixes |
|---------|----------|
| **Viettel** | 086, 096, 097, 098, 032-039, 062-069 |
| **Vinaphone** | 088, 089, 081-085, 091, 094 |
| **Mobifone** | 070, 076-079, 090, 093 |
| **Vietnamobile** | 056, 058, 092, 059 |
| **Gmobile** | 099 |

**Visual Feedback:**
- ✅ Red border khi có lỗi
- ✅ Error message chi tiết
- ✅ Real-time validation khi gõ

---

### **3. Giới tính (Gender)** ⚪ OPTIONAL

| Rule | Validation | Error Message |
|------|------------|---------------|
| **Valid Values** | `M`, `F`, `O` | "Giới tính không hợp lệ" |

**Options:**
- `M` = Nam
- `F` = Nữ
- `O` = Khác

---

### **4. Ngày sinh (Date of Birth)** ⚪ OPTIONAL

| Rule | Validation | Error Message |
|------|------------|---------------|
| **Not Future** | `dob > today` | "Ngày sinh không được là ngày trong tương lai" |
| **Realistic Age** | `age > 150` | "Ngày sinh không hợp lệ" |

**Visual Feedback:**
- ✅ Date picker với `max={today}`
- ✅ Red border khi có lỗi
- ✅ Error message hiển thị dưới field

**Validation Logic:**
```typescript
const dob = new Date(dateOfBirth);
const today = new Date();
const age = today.getFullYear() - dob.getFullYear();

if (dob > today) {
  error = "Ngày sinh không được là ngày tương lai";
} else if (age > 150) {
  error = "Ngày sinh không hợp lệ";
}
```

---

### **5. Địa chỉ (Address)** ⚪ OPTIONAL

| Rule | Validation | Error Message |
|------|------------|---------------|
| **Max Length** | `length > 300` | "Địa chỉ không được vượt quá 300 ký tự" |

**Visual Feedback:**
- ✅ Character counter: `150/300`
- ✅ Input bị giới hạn tại 300 ký tự (`maxLength={300}`)

---

## 🎨 UI/UX Features

### **1. Real-time Validation**

Validation chạy ngay khi user nhập (onChange event):

```typescript
const updatePatientField = (field: keyof typeof newPatientData, value: any) => {
  setNewPatientData({ ...newPatientData, [field]: value });
  validateField(field, value);
};

// Usage
<Input
  value={newPatientData.fullName}
  onChange={(e) => updatePatientField('fullName', e.target.value)}
/>
```

### **2. Visual Error Indicators**

**Border Color:**
```typescript
className={`h-9 ${registrationErrors.fullName ? 'border-red-500' : ''}`}
```

**Error Message:**
```tsx
{registrationErrors.fullName && (
  <p className="text-xs text-red-500 mt-1">
    {registrationErrors.fullName}
  </p>
)}
```

### **3. Character Counters**

```tsx
<div className="flex items-center justify-between">
  <Label>Họ và tên *</Label>
  <span className="text-xs text-gray-400">
    {newPatientData.fullName.length}/200
  </span>
</div>
```

### **4. Disabled Submit Button**

Nút "Đăng ký" bị disable khi:
- Đang submit (`isRegistering`)
- Có lỗi validation bất kỳ

```typescript
disabled={
  isRegistering || 
  !!registrationErrors.fullName || 
  !!registrationErrors.phone || 
  !!registrationErrors.dateOfBirth
}
```

### **5. Input Restrictions**

```tsx
// Max length hard limit
<Input maxLength={200} />

// Date max = today
<Input 
  type="date" 
  max={new Date().toISOString().split('T')[0]} 
/>
```

---

## 🔧 Technical Implementation

### **State Management**

```typescript
// Error state
const [registrationErrors, setRegistrationErrors] = useState({
  fullName: '',
  phone: '',
  dateOfBirth: ''
});

// Patient data
const [newPatientData, setNewPatientData] = useState<PatientRegistrationDto>({
  fullName: '',
  primaryPhoneE164: '',
  gender: '',
  dateOfBirth: undefined,
  address: ''
});
```

### **Validation Function**

```typescript
const validateField = (field: keyof typeof newPatientData, value: any) => {
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
      
    // ... other fields
  }
  
  setRegistrationErrors(errors);
};
```

### **Submit Validation**

Full validation chạy khi submit:

```typescript
const handleQuickRegister = async () => {
  // 1. Full Name validation
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

  // 2. Phone validation
  if (!newPatientData.primaryPhoneE164.trim()) {
    toast.error('Vui lòng nhập số điện thoại');
    return;
  }

  const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
  if (!phoneRegex.test(newPatientData.primaryPhoneE164.trim())) {
    toast.error('Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx');
    return;
  }

  // 3. Phone prefix validation (Vietnamese carriers)
  const cleanPhone = newPatientData.primaryPhoneE164.trim();
  const validPrefixes = ['090', '091', '092', ...];
  
  const phonePrefix = cleanPhone.startsWith('+84') 
    ? '0' + cleanPhone.substring(3, 5)
    : cleanPhone.startsWith('84')
    ? '0' + cleanPhone.substring(2, 4)
    : cleanPhone.substring(0, 3);
  
  if (!validPrefixes.includes(phonePrefix)) {
    toast.error('Đầu số điện thoại không hợp lệ');
    return;
  }

  // 4. Gender validation (if provided)
  if (newPatientData.gender && !['M', 'F', 'O'].includes(newPatientData.gender)) {
    toast.error('Giới tính không hợp lệ');
    return;
  }

  // 5. Date of Birth validation (if provided)
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

  // 6. Address validation (if provided)
  if (newPatientData.address && newPatientData.address.length > 300) {
    toast.error('Địa chỉ không được vượt quá 300 ký tự');
    return;
  }

  // All validations passed → Proceed with registration
  setIsRegistering(true);
  // ... API calls
};
```

---

## 🧪 Test Cases

### **Test 1: Empty Required Fields**
```
Input: Họ tên = "", SĐT = ""
Expected: 
  ✅ Red border on both fields
  ✅ Error messages displayed
  ✅ Submit button disabled
  ✅ Toast error when try to submit
```

### **Test 2: Invalid Phone Format**
```
Input: SĐT = "123456"
Expected:
  ✅ Red border
  ✅ "Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx"
  ✅ Submit button disabled
```

### **Test 3: Invalid Phone Prefix**
```
Input: SĐT = "0111111111"
Expected:
  ✅ Format validation passes
  ✅ Prefix validation fails on submit
  ✅ Toast: "Đầu số điện thoại không hợp lệ"
```

### **Test 4: Future Date of Birth**
```
Input: Ngày sinh = "2026-01-01"
Expected:
  ✅ Red border
  ✅ "Ngày sinh không được là ngày trong tương lai"
  ✅ Submit button disabled
```

### **Test 5: Name Too Long**
```
Input: Họ tên = "A" x 201
Expected:
  ✅ Input stops at 200 characters (maxLength)
  ✅ Counter shows "200/200"
  ✅ No error (can't exceed due to maxLength)
```

### **Test 6: Valid Input**
```
Input:
  Họ tên = "Nguyễn Văn A"
  SĐT = "0987654321"
  Giới tính = "M"
  Ngày sinh = "2000-01-01"
  Địa chỉ = "123 ABC"
Expected:
  ✅ No errors
  ✅ Submit button enabled
  ✅ Can submit successfully
```

### **Test 7: Real-time Validation**
```
1. Type invalid phone: "123"
   ✅ Error appears immediately
2. Complete phone: "0987654321"
   ✅ Error disappears
3. Submit button enables
```

### **Test 8: Character Counter**
```
1. Type "Nguyễn Văn A" (12 chars)
   ✅ Counter shows "12/200"
2. Type 200 characters
   ✅ Counter shows "200/200"
   ✅ Can't type more
```

---

## 🎯 Best Practices

### **1. Immediate Feedback**
- ✅ Validate onChange, not just onSubmit
- ✅ Show errors as soon as user leaves field
- ✅ Clear errors when user corrects input

### **2. Clear Error Messages**
- ✅ Be specific: "Họ tên phải có ít nhất 2 ký tự"
- ❌ Avoid generic: "Invalid input"
- ✅ Suggest solution: "Định dạng: 0xxxxxxxxx"

### **3. Visual Hierarchy**
- ✅ Required fields marked with `*`
- ✅ Error messages in red, below field
- ✅ Character counters in gray, right side

### **4. Prevent Invalid Input**
- ✅ Use `maxLength` for text inputs
- ✅ Use `max` for date inputs
- ✅ Use `type="tel"` for phone inputs (mobile)

### **5. Disable Submit When Invalid**
- ✅ Prevent submission of invalid data
- ✅ Show loading state during submission
- ✅ Prevent double submission

---

## 📊 Validation Summary Table

| Field | Required | Min | Max | Format | Real-time | Submit-time | Character Counter |
|-------|----------|-----|-----|--------|-----------|-------------|-------------------|
| Họ tên | ✅ | 2 | 200 | Text | ✅ | ✅ | ✅ |
| SĐT | ✅ | 10 | 12 | Regex + Prefix | ✅ | ✅ | ❌ |
| Giới tính | ❌ | - | - | M/F/O | ❌ | ✅ | ❌ |
| Ngày sinh | ❌ | - | Today | Date | ✅ | ✅ | ❌ |
| Địa chỉ | ❌ | - | 300 | Text | ❌ | ✅ | ✅ |

---

## 🚀 Future Enhancements

- [ ] Email validation (nếu thêm field email)
- [ ] CCCD/CMND format validation
- [ ] Province/City dropdown validation
- [ ] Phone number formatting (auto add spaces)
- [ ] Name capitalization (auto capitalize first letters)
- [ ] Duplicate phone check (real-time API call)
- [ ] Password strength meter (nếu có authentication)
- [ ] Accessibility: ARIA labels for screen readers

---

**Version:** 1.0  
**Last Updated:** October 17, 2025  
**Status:** ✅ Complete & Tested
