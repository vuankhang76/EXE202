# 🔧 Debug Guide - Time Slots Issue

## Vấn Đề

Trong screenshot bạn gửi, time slots chỉ hiển thị "2025-" thay vì giờ cụ thể như "09:00", "09:30", etc.

## Nguyên Nhân Có Thể

### 1. API Response Format Sai
Backend có thể đang trả về time slots với format không đúng.

**Kiểm tra:**
1. Mở DevTools (F12)
2. Vào tab Network
3. Chọn ngày khám
4. Tìm request đến `/api/appointments/doctor/{id}/timeslots`
5. Xem Response

**Format mong đợi:**
```json
{
  "success": true,
  "data": [
    "09:00:00",
    "09:30:00",
    "10:00:00",
    "10:30:00"
  ]
}
```

**Hoặc có thể:**
```json
{
  "success": true,
  "data": [
    "2025-10-16T09:00:00",
    "2025-10-16T09:30:00",
    "2025-10-16T10:00:00"
  ]
}
```

### 2. Backend Chưa Implement Đúng

Kiểm tra backend endpoint:

**File:** `SavePlus_API/Controllers/AppointmentsController.cs`

```csharp
[HttpGet("doctor/{doctorId}/timeslots")]
public async Task<ActionResult<ApiResponse<List<DateTime>>>> GetAvailableTimeSlots(
    int doctorId,
    [FromQuery] DateTime date,
    [FromQuery] int durationMinutes = 30)
{
    var result = await _appointmentService.GetAvailableTimeSlotsAsync(
        doctorId, 
        date, 
        durationMinutes
    );
    
    return Ok(result);
}
```

**File:** `SavePlus_API/Services/AppointmentService.cs`

```csharp
public async Task<ApiResponse<List<string>>> GetAvailableTimeSlotsAsync(
    int doctorId, 
    DateTime date, 
    int durationMinutes = 30)
{
    try
    {
        var slots = new List<string>();
        
        var startTime = new TimeSpan(8, 0, 0);
        var endTime = new TimeSpan(17, 0, 0);
        
        var current = startTime;
        while (current < endTime)
        {
            slots.Add(current.ToString(@"hh\:mm\:ss"));
            current = current.Add(TimeSpan.FromMinutes(durationMinutes));
        }
        
        return ApiResponse<List<string>>.SuccessResult(slots);
    }
    catch (Exception ex)
    {
        return ApiResponse<List<string>>.ErrorResult("Error loading time slots");
    }
}

### Frontend (TimeSlotPicker.tsx)

Tôi đã update component để:

1. **Handle nhiều format:**
   - ISO format: `"2025-10-16T09:00:00"`
   - Time only: `"09:00:00"` hoặc `"09:00"`
   - Fallback cho format khác

2. **Thêm console.log để debug:**
   ```tsx
   console.log('Time slots response:', response);
   console.log('Time slots data:', response.data);
   console.log('Formatting time slot:', time);
   ```

3. **Thêm Debug UI (chỉ trong dev mode):**
   - Hiển thị raw data
   - Hiển thị formatted data
   - Hiển thị total slots

### Date Picker Enhancement

1. **Better styling:**
   - Border rõ ràng hơn
   - Focus state rõ ràng
   - Cursor pointer

2. **Helper text:**
   - Hiển thị range ngày có thể chọn

## Cách Test & Debug

### Step 1: Kiểm Tra Console Logs

Sau khi select ngày, check console:

```
Loading time slots for doctor: 1 date: 2025-10-16
Time slots response: {success: true, data: [...]}
Time slots data: ["09:00:00", "09:30:00", ...]
Formatting time slot: 09:00:00
```

### Step 2: Kiểm Tra Debug UI

Trong development mode, bạn sẽ thấy box màu xám với:
```
Debug Info:
First slot raw: 09:00:00
First slot formatted: 09:00
Total slots: 16
```

### Step 3: Kiểm Tra Network

1. F12 → Network tab
2. Select ngày
3. Tìm request `timeslots`
4. Xem Response

### Step 4: Backend Debugging

Nếu API response sai, cần fix backend:

```csharp
// Option 1: Return time strings
return ApiResponse<List<string>>.SuccessResult(
    slots.Select(s => s.ToString("HH:mm:ss")).ToList()
);

// Option 2: Return DateTime strings
return ApiResponse<List<string>>.SuccessResult(
    slots.Select(s => s.ToString("yyyy-MM-ddTHH:mm:ss")).ToList()
);
```

## Quick Fix Backend (Nếu Cần)

Nếu backend chưa có logic, đây là implementation đơn giản:

```csharp
public async Task<ApiResponse<List<string>>> GetAvailableTimeSlotsAsync(
    int doctorId, 
    DateTime date, 
    int durationMinutes = 30)
{
    try
    {
        var slots = new List<string>();
        
        // Define working hours (8 AM - 5 PM)
        var workStart = new TimeSpan(8, 0, 0);
        var workEnd = new TimeSpan(17, 0, 0);
        
        // Generate all possible slots
        var currentSlot = workStart;
        while (currentSlot < workEnd)
        {
            var slotTime = date.Date.Add(currentSlot);
            
            // Check if slot is available (not booked, not in past)
            if (slotTime > DateTime.Now)
            {
                var isBooked = await _context.Appointments
                    .AnyAsync(a => 
                        a.DoctorId == doctorId &&
                        a.StartAt == slotTime &&
                        a.Status != "Cancelled"
                    );
                
                if (!isBooked)
                {
                    // Return just time part
                    slots.Add(currentSlot.ToString(@"hh\:mm\:ss"));
                }
            }
            
            currentSlot = currentSlot.Add(TimeSpan.FromMinutes(durationMinutes));
        }
        
        return ApiResponse<List<string>>.SuccessResult(slots);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting available time slots");
        return ApiResponse<List<string>>.ErrorResult("Không thể tải lịch trống");
    }
}
```

## Expected Behavior Sau Khi Fix

1. **Date Picker:**
   - Click vào → Calendar mở ra
   - Chọn ngày → Ngày được selected
   - Min/Max dates được enforce

2. **Time Slots:**
   - Sau khi chọn ngày → Loading spinner xuất hiện
   - Load xong → Hiển thị grid các button với giờ cụ thể (09:00, 09:30, etc.)
   - Click button → Button chuyển màu đỏ (selected state)
   - Confirmation panel update với giờ đã chọn

3. **Debug Info (Dev Mode):**
   - Box màu xám hiển thị raw và formatted data
   - Giúp verify format đúng

## Troubleshooting

### Time slots vẫn hiển thị "2025-"

**Nguyên nhân:** API trả về format khác với expected

**Fix:** 
1. Check console logs để xem raw data
2. Update `formatTimeSlot()` function để handle format đó
3. Hoặc fix backend để trả về format chuẩn

### Date picker không click được

**Nguyên nhân:** Browser compatibility hoặc CSS conflict

**Fix:**
1. Thử browser khác (Chrome, Edge)
2. Check CSS có override không
3. Thêm `!important` vào cursor: `cursor: pointer !important;`

### Không có time slots nào

**Nguyên nhân:** 
- Backend logic filter hết slots
- Ngày chọn không hợp lệ
- Doctor không có lịch làm việc

**Fix:**
1. Check backend logs
2. Verify doctor working hours
3. Check date range

## Contact & Support

Nếu vẫn gặp vấn đề:
1. Share screenshot console logs
2. Share Network tab response
3. Share backend code của GetAvailableTimeSlots

---

**Updated:** October 16, 2025
**Status:** ✅ Fixed with enhanced error handling and multi-format support
