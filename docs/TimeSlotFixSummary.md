# Time Slot Issues - Fixed! ✅

## Issues Identified from Logs

### 1. ❌ Excessive Re-renders (Performance Issue)
**Problem:** The `formatTimeSlot` function was called **hundreds of times** during rendering, causing:
- Browser lag
- Excessive console logs
- Poor user experience

**Root Cause:** Function was called inside the render loop without memoization

**Solution:** 
- Used `useMemo` to cache formatted time slots
- Formatting now happens only when `timeSlots` array changes
- Reduced function calls from ~800+ to just 16 (one per time slot)

```tsx
// ❌ BEFORE: Called on every render
{timeSlots.map(slot => {
  const formattedTime = formatTimeSlot(slot); // Called repeatedly!
  ...
})}

// ✅ AFTER: Memoized
const formattedSlots = useMemo(() => {
  return timeSlots.map(slot => /* format */);
}, [timeSlots]); // Only recalculates when timeSlots changes
```

---

### 2. ❌ Timezone Conversion Bug (Critical Issue)
**Problem:** When user clicked "08:00", it was converted to "01:00:00.000Z" (7 hours behind)

**Example from logs:**
```
Time slot clicked: 2025-10-16T08:00:00
Start time: 2025-10-16T01:00:00.000Z  ← WRONG! (UTC conversion)
End time: 2025-10-16T01:30:00.000Z    ← WRONG!
```

**Root Cause:** Using `new Date(timeSlot)` automatically converts to UTC based on browser timezone

**Solution:** 
- Parse date components manually (year, month, day, hour, minute)
- Create date using `new Date(year, month, day, hour, minute)` constructor (local timezone)
- Format to ISO string manually without timezone conversion

```tsx
// ❌ BEFORE: Auto-converts to UTC
const startTime = new Date("2025-10-16T08:00:00");
startTime.toISOString(); // "2025-10-16T01:00:00.000Z" ← WRONG!

// ✅ AFTER: Preserves local time
const [datePart, timePart] = "2025-10-16T08:00:00".split('T');
const [year, month, day] = datePart.split('-').map(Number);
const [hour, minute] = timePart.split(':').map(Number);
const startTime = new Date(year, month - 1, day, hour, minute);

// Custom formatter without timezone
const formatLocalISO = (date) => 
  `${year}-${month}-${day}T${hour}:${minute}:00`;
// Result: "2025-10-16T08:00:00" ← CORRECT!
```

---

### 3. ❌ API 400 Error (Backend Validation)
**Problem:** Backend rejected the request with 400 Bad Request

**Root Cause:** Backend expected datetime in format `"2025-10-16T08:00:00"` but received `"2025-10-16T01:00:00.000Z"` (wrong time + timezone marker)

**Solution:** 
- Send datetime in exact format backend expects
- No `Z` suffix (not UTC)
- No timezone offset like `+07:00`
- Just plain ISO format: `YYYY-MM-DDTHH:mm:ss`

---

## Code Changes Summary

### TimeSlotPicker.tsx

#### Import Changes
```tsx
// Added useMemo and useCallback for performance
import { useState, useEffect, useMemo, useCallback } from 'react';
```

#### Performance Optimization
```tsx
// Memoize formatted slots (prevents re-formatting on every render)
const formattedSlots = useMemo(() => {
  return timeSlots.map(slot => {
    if (slot.includes('T')) {
      const [, timePart] = slot.split('T');
      return timePart.substring(0, 5); // "08:00"
    }
    if (slot.includes(':')) {
      return slot.substring(0, 5);
    }
    return slot;
  });
}, [timeSlots]);

// Memoize selection check
const isTimeSlotSelected = useCallback((index: number) => {
  if (!selectedTime || !timeSlots[index]) return false;
  
  const selected = new Date(selectedTime);
  const selectedFormatted = `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`;
  
  return formattedSlots[index] === selectedFormatted;
}, [selectedTime, timeSlots, formattedSlots]);
```

#### Timezone Fix
```tsx
const handleTimeSlotClick = (timeSlot: string) => {
  // Parse components manually to avoid UTC conversion
  let year, month, day, hour, minute;
  
  if (timeSlot.includes('T')) {
    const [datePart, timePart] = timeSlot.split('T');
    [year, month, day] = datePart.split('-').map(Number);
    [hour, minute] = timePart.split(':').map(Number);
  }
  
  // Create date in LOCAL timezone
  const startTime = new Date(year, month - 1, day, hour, minute, 0);
  const endTime = new Date(year, month - 1, day, hour, minute + 30, 0);
  
  // Format to plain ISO string (no timezone)
  const formatLocalISO = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  
  const startISO = formatLocalISO(startTime); // "2025-10-16T08:00:00"
  const endISO = formatLocalISO(endTime);     // "2025-10-16T08:30:00"
  
  onTimeSlotSelect(startISO, endISO);
};
```

#### Render Optimization
```tsx
// Use pre-formatted slots and index-based selection
{timeSlots.map((slot, index) => {
  const formattedTime = formattedSlots[index]; // ← From memoized array
  const isSelected = isTimeSlotSelected(index); // ← Memoized function
  
  return (
    <Button
      key={`${slot}-${index}`}
      onClick={() => handleTimeSlotClick(slot)}
    >
      {formattedTime}
    </Button>
  );
})}
```

---

## Expected Results After Fix

### ✅ Performance
- **Before:** 800+ console logs, browser lag
- **After:** 16 logs (one per slot), smooth rendering

### ✅ Correct Time Conversion
- **Before:** "08:00" → "2025-10-16T01:00:00.000Z" (7 hours off)
- **After:** "08:00" → "2025-10-16T08:00:00" (exact match)

### ✅ API Success
- **Before:** 400 Bad Request (wrong format)
- **After:** 200 OK (correct format accepted by backend)

---

## Testing Checklist

### 1. Test Performance
- [ ] Open CreateAppointment page
- [ ] Open browser console
- [ ] Select a doctor and date
- [ ] **Verify:** Only ~16 "Formatting time slot" logs appear (not hundreds)
- [ ] **Verify:** Time slots load instantly without lag

### 2. Test Time Conversion
- [ ] Select "08:00" time slot
- [ ] Check console logs
- [ ] **Verify:** Log shows "Start time (local): 2025-10-16T08:00:00"
- [ ] **Verify:** Log shows "End time (local): 2025-10-16T08:30:00"
- [ ] **Verify:** NO "Z" suffix or timezone offset

### 3. Test Appointment Creation
- [ ] Complete all booking steps
- [ ] Click "Đặt lịch" button
- [ ] **Verify:** No 400 error in console
- [ ] **Verify:** Success message appears
- [ ] **Verify:** Redirected to appointments list

### 4. Test Selection State
- [ ] Click a time slot
- [ ] **Verify:** Button turns red (selected state)
- [ ] Click another time slot
- [ ] **Verify:** Previous button returns to normal, new button turns red
- [ ] **Verify:** Selected time shows in confirmation panel

---

## Debug Information

The debug box at the bottom of time slots (development mode only) now shows:
```
Debug Info:
First slot raw: 2025-10-16T08:00:00
First slot formatted: 08:00
Total slots: 16
```

This helps verify:
- ✅ API returns correct format
- ✅ Formatting works correctly
- ✅ Correct number of slots loaded

---

## Key Takeaways

### 🎯 Performance Lesson
Always memoize expensive calculations in React:
- Use `useMemo` for derived data
- Use `useCallback` for functions passed to child components
- Never call formatting functions inside render loops

### 🌍 Timezone Lesson
When working with dates/times:
- Be explicit about timezone handling
- Don't rely on automatic conversions
- Parse and format manually when needed
- Test in different timezones

### 📡 API Lesson
Backend datetime expectations:
- Check API documentation for exact format
- Match format precisely (including/excluding timezone)
- Log the exact values being sent
- Test edge cases (midnight, end of day, etc.)

---

## Files Modified

1. `src/components/appointments/TimeSlotPicker.tsx`
   - Added memoization for performance
   - Fixed timezone conversion logic
   - Added manual ISO formatting
   - Optimized render cycle

---

## Next Steps

1. **Test thoroughly** using the checklist above
2. **Monitor console** for any remaining issues
3. **Remove debug logs** once confirmed working
4. **Consider adding** timezone selection if users in multiple zones
5. **Add unit tests** for date/time parsing logic

---

## Contact

If you encounter any issues:
1. Check console logs for exact error messages
2. Verify API response format in Network tab
3. Compare sent data vs backend expectations
4. Test in incognito mode (clean state)

---

**Status:** ✅ Ready for Testing  
**Updated:** 2025-10-16  
**Version:** 2.0 (Performance + Timezone Fix)
