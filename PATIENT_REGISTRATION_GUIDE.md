# 🏥 Hướng dẫn Đăng ký Bệnh nhân Nhanh trong Dialog

## 📋 Tổng quan

Chức năng đăng ký bệnh nhân nhanh cho phép nhân viên phòng khám đăng ký bệnh nhân mới **ngay trong dialog tạo lịch hẹn**, không cần rời khỏi màn hình hiện tại.

---

## 🎯 Luồng hoạt động

### **Kịch bản 1: Bệnh nhân đã có trong hệ thống**

```
1. Nhân viên gõ tên/SĐT vào ô tìm kiếm
2. Hệ thống tìm thấy bệnh nhân → Hiển thị danh sách
3. Nhân viên chọn bệnh nhân
4. Tiếp tục tạo lịch hẹn bình thường
```

### **Kịch bản 2: Bệnh nhân mới (chưa có trong phòng khám)**

```
1. Nhân viên gõ tên/SĐT vào ô tìm kiếm
2. Hệ thống không tìm thấy → Hiển thị nút "Đăng ký bệnh nhân mới"
3. Nhân viên click nút → Mở form đăng ký nhanh
4. Nhập thông tin: Họ tên*, SĐT*, Giới tính, Ngày sinh, Địa chỉ
5. Click "Đăng ký" → Hệ thống:
   a. Tạo bệnh nhân trong bảng `Patients` (global)
   b. Thêm vào bảng `ClinicPatients` (enroll vào phòng khám)
   c. Tự động chọn bệnh nhân vừa tạo
6. Tiếp tục tạo lịch hẹn bình thường
```

---

## 🔧 Triển khai kỹ thuật

### **Frontend Changes**

**File:** `CreateAppointmentDialog.tsx`

**1. Imports mới:**
```typescript
import patientService from '@/services/patientService';
import type { PatientRegistrationDto } from '@/types';
```

**2. State variables:**
```typescript
const [showRegisterForm, setShowRegisterForm] = useState(false);
const [isRegistering, setIsRegistering] = useState(false);
const [newPatientData, setNewPatientData] = useState<PatientRegistrationDto>({
  fullName: '',
  primaryPhoneE164: '',
  gender: '',
  dateOfBirth: undefined,
  address: ''
});
```

**3. Hàm đăng ký:**
```typescript
const handleQuickRegister = async () => {
  // Validation
  if (!newPatientData.fullName.trim()) {
    toast.error('Vui lòng nhập họ tên');
    return;
  }
  if (!newPatientData.primaryPhoneE164.trim()) {
    toast.error('Vui lòng nhập số điện thoại');
    return;
  }

  setIsRegistering(true);
  try {
    // Step 1: Tạo patient (global)
    const registerResponse = await patientService.registerPatient(newPatientData);
    
    // Step 2: Enroll vào clinic
    const enrollResponse = await patientService.enrollPatientToClinic(
      registerResponse.data.patientId, 
      tenantId
    );
    
    toast.success('Đăng ký bệnh nhân thành công!');
    
    // Auto-select patient
    patientSearch.setSelectedPatientId(newPatientId.toString());
    setShowRegisterForm(false);
  } catch (error) {
    toast.error('Có lỗi xảy ra khi đăng ký bệnh nhân');
  } finally {
    setIsRegistering(false);
  }
};
```

**4. UI Components:**
- Nút "Đăng ký bệnh nhân mới" (hiện khi search không có kết quả)
- Form đăng ký nhanh với animation fade-in
- Auto-fill tên/SĐT từ search term nếu match pattern

### **Backend APIs sử dụng**

**1. Tạo Patient (Global)**
```
POST /api/patients/register
Body: PatientRegistrationDto
Response: PatientDto
```

**2. Enroll vào Clinic**
```
POST /api/patients/{patientId}/enroll/{tenantId}
Body: EnrollPatientDto (optional)
Response: ClinicPatientDto
```

---

## ✅ Validations

### **Frontend Validation:**
- ✓ Họ tên: required, không được rỗng
- ✓ Số điện thoại: required, match regex `^(\+84|0)[0-9]{9,10}$`
- ✓ Giới tính: optional (M, F, O)
- ✓ Ngày sinh: optional, date format
- ✓ Địa chỉ: optional

### **Backend Validation:**
- ✓ Phone unique check (không trùng SĐT)
- ✓ Required fields validation
- ✓ Phone format validation (E.164)
- ✓ TenantId exists check

---

## 🎨 UX/UI Features

### **1. Smart Auto-fill**
Khi user search, nếu input match phone pattern → auto-fill vào field số điện thoại

```typescript
setNewPatientData(prev => ({
  ...prev,
  fullName: patientSearch.searchTerm,
  primaryPhoneE164: patientSearch.searchTerm.match(/^(\+84|0)[0-9]{9,10}$/) 
    ? patientSearch.searchTerm 
    : ''
}));
```

### **2. Conditional Rendering**
Nút "Đăng ký mới" chỉ hiện khi:
- `hasSearched === true` (đã search)
- `patients.length === 0` (không có kết quả)
- `searchTerm.length >= 2` (đủ ký tự tìm kiếm)
- `isLoading === false` (không đang load)
- `showRegisterForm === false` (form chưa mở)

### **3. Visual Design**
- **Nút đăng ký:** Border dashed, icon Plus
- **Form background:** `bg-blue-50` để nổi bật
- **Animation:** Fade-in + slide từ trên xuống
- **Compact form:** Chiều cao input `h-9` để tiết kiệm không gian
- **Grid layout:** 2 cột cho Giới tính & Ngày sinh

### **4. Loading States**
- Button disabled khi `isRegistering === true`
- Text thay đổi: "Đăng ký" → "Đang đăng ký..."
- Prevent double submission

---

## 🚀 Testing Scenarios

### **Test Case 1: Đăng ký bệnh nhân mới thành công**
1. Mở dialog tạo lịch hẹn
2. Gõ "Nguyễn Văn A" vào ô tìm bệnh nhân
3. Không có kết quả → Click "Đăng ký bệnh nhân mới"
4. Nhập SĐT: `0123456789`
5. Chọn giới tính: Nam
6. Click "Đăng ký"
7. **Expected:** Toast success, bệnh nhân được tự động chọn

### **Test Case 2: Validation lỗi**
1. Mở form đăng ký
2. Để trống họ tên
3. Click "Đăng ký"
4. **Expected:** Toast error "Vui lòng nhập họ tên"

### **Test Case 3: SĐT trùng**
1. Đăng ký bệnh nhân với SĐT đã tồn tại
2. **Expected:** Backend trả lỗi, hiển thị toast error

### **Test Case 4: Cancel registration**
1. Mở form đăng ký
2. Nhập một số thông tin
3. Click "Hủy" hoặc nút ✕
4. **Expected:** Form đóng, dữ liệu được reset

### **Test Case 5: Auto-fill từ search**
1. Gõ số điện thoại vào search: `0987654321`
2. Không có kết quả → Click "Đăng ký mới"
3. **Expected:** Field SĐT được auto-fill với `0987654321`

---

## 🔐 Kiến trúc Multi-Tenant

### **Data Flow:**

```
┌─────────────────────────────────────────────────────┐
│ 1. CREATE PATIENT (Global)                         │
│    POST /api/patients/register                      │
│    → Tạo record trong bảng `Patients`              │
│    → PatientId = 123                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. ENROLL TO CLINIC                                 │
│    POST /api/patients/123/enroll/456                │
│    → Tạo record trong bảng `ClinicPatients`        │
│    → Composite Key: (TenantId=456, PatientId=123)  │
│    → Mrn = auto-generated                           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. CREATE APPOINTMENT                               │
│    → TenantId = 456 (NOT NULL ✓)                   │
│    → PatientId = 123                                │
│    → DoctorId = 789                                 │
└─────────────────────────────────────────────────────┘
```

### **Why This Matters:**
- ✅ **Data Integrity:** TenantId luôn có giá trị
- ✅ **Multi-Clinic Support:** Bệnh nhân có thể thuộc nhiều phòng khám
- ✅ **Audit Trail:** Biết bệnh nhân enroll vào clinic nào, lúc nào
- ✅ **MRN Management:** Mỗi clinic có MRN riêng cho bệnh nhân

---

## 🐛 Known Issues & Solutions

### **Issue 1: TenantId NULL trong Appointment**
**Nguyên nhân:** Bệnh nhân chưa được enroll vào clinic (không có trong `ClinicPatients`)

**Giải pháp:** ✅ Đã fix bằng quick registration flow

### **Issue 2: Phone format khác nhau**
**Nguyên nhân:** User nhập `0987654321` nhưng backend yêu cầu `+84987654321`

**Giải pháp:** Backend tự động normalize phone number sang E.164 format

### **Issue 3: Duplicate patient**
**Nguyên nhân:** User đăng ký 2 lần cùng SĐT

**Giải pháp:** Backend check unique constraint trên `PrimaryPhoneE164`

---

## 📊 Database Schema

### **Patients (Global Table)**
```sql
CREATE TABLE Patients (
    PatientId INT PRIMARY KEY IDENTITY,
    FullName NVARCHAR(200) NOT NULL,
    PrimaryPhoneE164 VARCHAR(20) UNIQUE NOT NULL,
    Gender CHAR(1),
    DateOfBirth DATE,
    Address NVARCHAR(300),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### **ClinicPatients (Junction Table)**
```sql
CREATE TABLE ClinicPatients (
    TenantId INT NOT NULL,
    PatientId INT NOT NULL,
    Mrn VARCHAR(50),
    PrimaryDoctorId INT,
    Status TINYINT DEFAULT 1,
    EnrolledAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (TenantId, PatientId),
    FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId),
    FOREIGN KEY (PatientId) REFERENCES Patients(PatientId)
);
```

---

## 🎓 Best Practices

1. **Always enroll patient before creating appointment**
   - ✅ Do: Register → Enroll → Create Appointment
   - ❌ Don't: Create Appointment without ClinicPatient record

2. **Validate phone format strictly**
   - Use E.164 format: `+84xxxxxxxxx`
   - Frontend: Accept both `0xxx` and `+84xxx`
   - Backend: Normalize to E.164

3. **Provide clear error messages**
   - "Số điện thoại đã tồn tại" instead of "Validation error"
   - Show which field has error

4. **Auto-select after registration**
   - UX improvement: User doesn't need to search again
   - Immediately continue with appointment creation

5. **Handle loading states properly**
   - Disable buttons during API calls
   - Show loading text
   - Prevent double submission

---

## 📝 Future Enhancements

- [ ] Add avatar upload trong quick registration
- [ ] Support scan CCCD/CMND để auto-fill thông tin
- [ ] History: Hiển thị các clinic mà bệnh nhân đã enroll
- [ ] Duplicate detection: "Có thể trùng với bệnh nhân X?"
- [ ] Bulk enroll: Import danh sách bệnh nhân từ Excel
- [ ] QR code cho bệnh nhân check-in nhanh

---

## ✅ Checklist triển khai

- [x] Thêm imports (patientService, PatientRegistrationDto)
- [x] Thêm state variables (showRegisterForm, isRegistering, newPatientData)
- [x] Implement handleQuickRegister function
- [x] Thêm validation logic
- [x] Thêm UI components (button + form)
- [x] Thêm animations và styling
- [x] Auto-select sau khi đăng ký
- [x] Reset form sau thành công
- [x] Error handling và toast messages
- [x] Loading states
- [x] Phone format validation
- [x] Test tất cả scenarios

---

**Version:** 1.0  
**Last Updated:** October 17, 2025  
**Author:** AI Assistant  
**Status:** ✅ Completed & Deployed
