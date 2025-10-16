# 🧪 Hướng Dẫn Test MVP Đặt Lịch

## Checklist Test Nhanh

### ✅ Pre-requisites
- [ ] Backend API đang chạy
- [ ] Database có data mẫu: clinics, doctors, patients
- [ ] Patient account đã đăng ký

### 📋 Test Cases

#### 1. Test Create Appointment Flow

**Steps:**
1. Đăng nhập với patient account
2. Vào trang Home (`/`)
3. Click vào một clinic card
4. Click button "Đặt lịch khám"
5. Verify redirect to `/patient/appointments/create`
6. Verify clinic info hiển thị đúng
7. Select một doctor từ list
8. Verify time slot picker xuất hiện
9. Select một ngày
10. Verify time slots load về
11. Select một time slot
12. Verify appointment type options xuất hiện
13. Select appointment type (Clinic/Online)
14. (Optional) Add notes
15. Verify confirmation sidebar hiển thị đủ thông tin
16. Click "Xác nhận đặt lịch"
17. Verify success message
18. Verify redirect to `/patient/appointments`

**Expected Results:**
- ✅ Tất cả steps chạy mượt mà
- ✅ Loading states hiển thị properly
- ✅ Data hiển thị chính xác
- ✅ Appointment được tạo trong database

#### 2. Test View Appointments

**Steps:**
1. Navigate to `/patient/appointments`
2. Verify appointments list hiển thị
3. Click "Sắp tới" tab
4. Verify chỉ upcoming appointments hiển thị
5. Click "Đã qua" tab
6. Verify chỉ past appointments hiển thị
7. Click "Tất cả" tab
8. Verify all appointments hiển thị

**Expected Results:**
- ✅ Filters hoạt động đúng
- ✅ Data sorted correctly
- ✅ Status badges hiển thị đúng màu

#### 3. Test Cancel Appointment

**Steps:**
1. From appointments list
2. Find appointment với status "Scheduled" hoặc "Confirmed"
3. Click "Hủy lịch" button
4. Confirm cancellation
5. Verify success message
6. Verify appointment status updated

**Expected Results:**
- ✅ Appointment status = "Cancelled"
- ✅ UI updated immediately
- ✅ Can no longer cancel

#### 4. Test Edge Cases

##### Empty States:
- [ ] No doctors in clinic → Shows proper message
- [ ] No time slots available → Shows proper message
- [ ] No appointments → Shows empty state with CTA

##### Error Handling:
- [ ] Network error → Shows error message with retry
- [ ] Invalid date range → Validation prevents
- [ ] Required fields missing → Cannot submit

##### Responsive:
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768-1024px)
- [ ] Test on desktop (> 1024px)

### 🔍 Manual Testing Script

```bash
# 1. Start backend
cd SavePlus_API
dotnet run

# 2. Start frontend
cd EXE202-FE
npm run dev

# 3. Open browser
# http://localhost:5173

# 4. Test flow
# - Login as patient
# - Navigate to clinic
# - Book appointment
# - View appointments
# - Cancel appointment
```

### 📊 API Endpoints to Test

```bash
# Get tenant doctors
GET /api/tenants/{id}/doctors

# Get available time slots
GET /api/appointments/doctor/{doctorId}/timeslots?date=2025-10-17&durationMinutes=30

# Create appointment
POST /api/appointments
{
  "tenantId": 1,
  "patientId": 1,
  "doctorId": 1,
  "startAt": "2025-10-17T09:00:00",
  "endAt": "2025-10-17T09:30:00",
  "type": "Clinic"
}

# Get patient appointments
GET /api/appointments/patient/{patientId}

# Cancel appointment
DELETE /api/appointments/{id}?reason=Patient%20cancelled
```

### 🐛 Common Issues & Fixes

**Issue**: Time slots không load
- Check doctor có lịch làm việc không
- Check date có trong range không (0-90 days)
- Check backend logs

**Issue**: Cannot create appointment
- Verify patientId được truyền đúng
- Check required fields
- Check backend validation

**Issue**: Navigation không hoạt động
- Check routes trong App.tsx
- Verify protected route logic
- Check auth state

### ✨ Success Criteria

- [ ] User có thể đặt lịch end-to-end
- [ ] User có thể xem danh sách lịch hẹn
- [ ] User có thể filter lịch hẹn
- [ ] User có thể hủy lịch hẹn
- [ ] UI responsive trên mọi devices
- [ ] No console errors
- [ ] Loading states work properly
- [ ] Error handling graceful

### 📝 Test Report Template

```markdown
## Test Report - Booking Feature

**Date**: YYYY-MM-DD
**Tester**: Your Name
**Environment**: Dev/Staging/Prod

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Create Appointment | ✅/❌ | |
| View Appointments | ✅/❌ | |
| Filter Appointments | ✅/❌ | |
| Cancel Appointment | ✅/❌ | |
| Responsive Design | ✅/❌ | |

### Issues Found

1. **Issue Title**
   - Description: ...
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...
   - Severity: High/Medium/Low

### Screenshots

[Attach screenshots here]

### Recommendations

- ...
```

## 🎯 Quick Smoke Test (5 phút)

1. Login as patient ✅
2. Go to clinic detail ✅
3. Click "Đặt lịch" ✅
4. Select doctor, date, time ✅
5. Confirm booking ✅
6. See appointment in list ✅

Nếu tất cả đều ✅ → MVP đạt yêu cầu!
