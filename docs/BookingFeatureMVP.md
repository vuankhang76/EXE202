# 📅 MVP Tính Năng Đặt Lịch Khám - SavePlus

## 🎯 Tổng Quan

MVP này cung cấp đầy đủ tính năng đặt lịch khám cho bệnh nhân, bao gồm:
- Chọn phòng khám
- Chọn bác sĩ
- Chọn ngày giờ khám (với time slots động)
- Xác nhận và quản lý lịch hẹn

## 📂 Cấu Trúc Files Đã Tạo

### Components

#### 1. **TimeSlotPicker.tsx** (`src/components/appointments/`)
- Component để chọn khung giờ trống
- Tự động load time slots từ API dựa trên doctorId và ngày được chọn
- Hiển thị loading state và error handling
- Features:
  - Grid layout responsive (3-5 slots/row)
  - Highlight slot đã chọn
  - Tự động tính toán endTime (30 phút sau startTime)
  - Real-time availability check

```tsx
<TimeSlotPicker
  doctorId={selectedDoctor.doctorId}
  selectedDate={selectedDate}
  onTimeSlotSelect={(start, end) => {...}}
  selectedTime={startTime}
/>
```

#### 2. **DoctorSelector.tsx** (`src/components/appointments/`)
- Component để chọn bác sĩ
- Hiển thị avatar, chuyên khoa, kinh nghiệm
- Visual feedback khi chọn (border + ring)
- Responsive grid (1 col mobile, 2 cols desktop)

```tsx
<DoctorSelector
  doctors={doctors}
  selectedDoctorId={selectedDoctor?.doctorId}
  onDoctorSelect={handleDoctorSelect}
/>
```

#### 3. **BookingConfirmation.tsx** (`src/components/appointments/`)
- Preview chi tiết thông tin đặt lịch
- Hiển thị đầy đủ: phòng khám, bác sĩ, ngày giờ, loại hình khám
- Icons màu sắc phân biệt từng section
- Warning/notice về việc đến khám

```tsx
<BookingConfirmation
  clinic={clinic}
  doctor={selectedDoctor}
  appointmentDate={selectedDate}
  startTime={startTime}
  endTime={endTime}
  appointmentType={appointmentType}
  notes={notes}
/>
```

### Pages

#### 4. **CreateAppointment.tsx** (`src/pages/patient/`)
**Flow đặt lịch hoàn chỉnh:**

1. **Step 1**: Hiển thị thông tin phòng khám
2. **Step 2**: Chọn bác sĩ từ danh sách
3. **Step 3**: Chọn ngày khám (date picker with validation)
4. **Step 4**: Chọn giờ khám (time slots tự động load)
5. **Step 5**: Chọn hình thức khám (Clinic/Online)
6. **Step 6**: Thêm ghi chú (optional)
7. **Step 7**: Xác nhận đặt lịch

**Features:**
- 2-column layout (form + confirmation sidebar)
- Sticky confirmation panel
- Progressive disclosure (chỉ hiện step tiếp theo khi hoàn thành step trước)
- Loading states cho mọi async operation
- Error handling và validation
- Navigation state để truyền dữ liệu từ clinic detail

**API Calls:**
- `tenantService.getTenantById()` - Load clinic info
- `tenantService.getTenantDoctors()` - Load doctors
- `appointmentService.getAvailableTimeSlots()` - Load time slots
- `appointmentService.createAppointment()` - Create appointment

#### 5. **Appointments.tsx** (`src/pages/patient/`)
**Quản lý lịch hẹn của bệnh nhân:**

- Tab filters: Tất cả / Sắp tới / Đã qua
- Sort theo ngày (sắp tới: sớm nhất → muộn nhất, đã qua: mới nhất → cũ nhất)
- Status badges với màu sắc
- Actions: Cancel appointment (cho status Scheduled/Confirmed)
- Click vào card để xem chi tiết

**API Calls:**
- `appointmentService.getPatientAppointments()` - Load appointments
- `appointmentService.cancelAppointment()` - Cancel appointment

## 🔄 User Flow

### Flow 1: Đặt Lịch Từ Trang Clinic Detail

```
Clinic Detail Page
  ↓ Click "Đặt lịch khám"
  ↓ Check authentication
  ↓ Navigate to /patient/appointments/create
  ↓ Pass: clinicId, doctorId (first), patientId

Create Appointment Page
  ↓ Load clinic & doctors
  ↓ Select doctor (or pre-selected)
  ↓ Select date
  ↓ Load time slots
  ↓ Select time slot
  ↓ Select appointment type
  ↓ Add notes (optional)
  ↓ Confirm booking
  ↓ Navigate to /patient/appointments
```

### Flow 2: Xem & Quản Lý Lịch Hẹn

```
Patient Dashboard
  ↓ Navigate to "Lịch hẹn"

Appointments Page
  ↓ Filter: Tất cả/Sắp tới/Đã qua
  ↓ View appointment cards
  ↓ Actions:
      - Cancel (if status allows)
      - View details
```

## 🎨 UI/UX Highlights

### Design System
- **Primary Color**: Red-500 (#EF4444)
- **Icons**: Lucide React
- **Components**: Shadcn/ui based
- **Responsive**: Mobile-first approach

### User Experience
1. **Progressive Disclosure**: Chỉ hiển thị options khi cần
2. **Visual Feedback**: 
   - Loading states cho tất cả async operations
   - Selected states rõ ràng
   - Status badges với màu sắc
3. **Error Handling**: 
   - Graceful degradation
   - Clear error messages
   - Retry options
4. **Validation**:
   - Date range validation (0-90 days from now)
   - Required field checks
   - Real-time availability check

## 🔌 API Integration

### Appointment Service Methods Used:

```typescript
// Get available time slots for a doctor on a specific date
getAvailableTimeSlots(doctorId, date, durationMinutes)

// Create new appointment
createAppointment(appointmentData)

// Get patient's appointments
getPatientAppointments(patientId, tenantId?)

// Cancel appointment
cancelAppointment(appointmentId, reason)
```

### Data Flow:

```
Frontend State → AppointmentCreateDto → API → Database
                                      ↓
                                 AppointmentDto
```

## 📱 Responsive Breakpoints

- **Mobile** (< 768px): 1 column, vertical layout
- **Tablet** (768px - 1024px): 2 columns where applicable
- **Desktop** (> 1024px): Full layout with sidebar

## ✅ Checklist Hoàn Thành

- [x] TimeSlotPicker component với real-time availability
- [x] DoctorSelector component
- [x] BookingConfirmation component
- [x] CreateAppointment page với full flow
- [x] Appointments management page
- [x] Routes configuration trong App.tsx
- [x] Integration với AuthContext
- [x] Error handling và validation
- [x] Loading states
- [x] Responsive design
- [x] Type safety (TypeScript)

## 🚀 Cách Sử Dụng

### 1. Đăng Nhập Với Tài Khoản Patient

```tsx
// Đảm bảo có patientId trong state khi navigate
const patientIdNum = currentUser.userId ? parseInt(currentUser.userId) : null;

navigate('/patient/appointments/create', {
  state: {
    clinicId: parseInt(id!),
    doctorId: selectedDoctor.doctorId,
    patientId: patientIdNum
  }
});
```

### 2. Flow Đặt Lịch

```tsx
// User clicks "Đặt lịch khám" từ ClinicIntroBooking component
<ClinicIntroBooking 
  clinic={clinic} 
  onBookAppointment={handleBookAppointment} 
/>

// handleBookAppointment kiểm tra auth và navigate
const handleBookAppointment = () => {
  if (!currentUser || userType !== 'patient') {
    navigate('/patient/auth', { state: { ... } });
    return;
  }
  navigate('/patient/appointments/create', { state: { ... } });
};
```

### 3. API Configuration

Backend endpoints cần có:
- `GET /api/appointments/doctor/{doctorId}/timeslots?date={date}&durationMinutes={minutes}`
- `POST /api/appointments`
- `GET /api/appointments/patient/{patientId}`
- `DELETE /api/appointments/{id}?reason={reason}`

## 🔧 Customization

### Thay đổi thời gian slot
```tsx
// Trong TimeSlotPicker.tsx
const response = await appointmentService.getAvailableTimeSlots(
  doctorId,
  dateStr,
  30, // Đổi từ 30 thành 15, 45, 60... phút
  true
);
```

### Thêm appointment types
```tsx
// Trong appointment.ts types
export const AppointmentType = {
  HOME: 'Home',
  CLINIC: 'Clinic',
  ONLINE: 'Online',
  PHONE: 'Phone',
  // ADD NEW TYPES HERE
} as const;
```

## 📊 Performance Optimization

1. **Lazy Loading**: Components được lazy load
2. **Skip Global Loading**: Time slots load without global spinner
3. **Debouncing**: (Có thể thêm cho search)
4. **Caching**: Auth context caching

## 🐛 Known Issues & Solutions

### Issue 1: PatientId từ UserId
**Problem**: Backend không có endpoint `getPatientByUserId`
**Solution**: Truyền patientId qua navigation state khi đăng nhập

### Issue 2: Time Zone
**Problem**: Date/time có thể bị lệch do timezone
**Solution**: Sử dụng ISO strings và convert properly

## 🎓 Best Practices Áp Dụng

1. **Component Composition**: Tách nhỏ components, single responsibility
2. **Type Safety**: Full TypeScript types
3. **Error Boundaries**: Graceful error handling
4. **Loading States**: User feedback cho async operations
5. **Accessibility**: Semantic HTML, proper ARIA labels
6. **Mobile First**: Responsive design from ground up
7. **Code Reusability**: Shared utilities (formatDate, getStatusColor...)

## 📝 Next Steps (Optional Enhancements)

- [ ] Appointment detail page
- [ ] Reschedule appointment
- [ ] Add calendar view
- [ ] Email/SMS notifications
- [ ] Payment integration
- [ ] Rating & reviews after appointment
- [ ] Video call integration for online appointments
- [ ] Prescription management
- [ ] Medical records integration

## 👨‍💻 Developer Notes

- Tất cả components đều có proper TypeScript typing
- Error handling được implement ở mọi async operation
- Loading states được handle properly
- Navigation state được sử dụng để truyền data giữa pages
- Components có thể reuse trong các flows khác

---

**Developed by**: Senior Developer Team
**Date**: 2025
**Version**: 1.0.0 MVP
