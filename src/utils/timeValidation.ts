/**
 * Validate time format (HH:mm)
 * Ensures time is in 24-hour format with leading zeros
 */
export function validateTimeFormat(time: string): { isValid: boolean; formatted?: string } {
  if (!time) return { isValid: false };
  
  // Remove spaces
  let cleaned = time.trim();
  
  // Try to parse different formats
  const patterns = [
    /^(\d{1,2}):(\d{2})$/, // 7:30, 07:30, 17:00
    /^(\d{2}):(\d{2})$/,   // 07:30, 17:00
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      
      // Validate values
      if (hours < 0 || hours > 23) return { isValid: false };
      if (minutes < 0 || minutes > 59) return { isValid: false };
      
      // Format with leading zeros
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      return { isValid: true, formatted };
    }
  }
  
  return { isValid: false };
}

/**
 * Normalize time input - accepts 7:30, 07:30 etc and returns 07:30
 */
export function normalizeTime(time: string): string {
  const result = validateTimeFormat(time);
  return result.formatted || time;
}

/**
 * Validate time range - ensure close time is after open time
 */
export function validateTimeRange(openTime: string, closeTime: string): boolean {
  const openResult = validateTimeFormat(openTime);
  const closeResult = validateTimeFormat(closeTime);
  
  if (!openResult.isValid || !closeResult.isValid) {
    return false;
  }
  
  const openMinutes = parseInt(openResult.formatted!.split(':')[0]) * 60 + 
                      parseInt(openResult.formatted!.split(':')[1]);
  const closeMinutes = parseInt(closeResult.formatted!.split(':')[0]) * 60 + 
                       parseInt(closeResult.formatted!.split(':')[1]);
  
  return closeMinutes > openMinutes;
}
