/**
 * Format phone number to display format
 * Input: +84981692645 or 0981692645
 * Output: 098 169 2645
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If starts with 84, replace with 0
  if (digits.startsWith('84')) {
    digits = '0' + digits.substring(2);
  }
  
  // Format as: 0XX XXX XXXX
  if (digits.length === 10) {
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }
  
  // If length is different, just add spaces every 3 digits
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
};
