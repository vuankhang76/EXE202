export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  let digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('84')) {
    digits = '0' + digits.substring(2);
  }
  
  if (digits.length === 10) {
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }
  
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
};

export const convertToE164Format = (phone: string): string => {
  if (!phone) return '';
  
  let digits = phone.replace(/\D/g, '');
  
  if (!digits) return '';
  
  if (digits.startsWith('0')) {
    digits = '84' + digits.substring(1);
  }
  
  if (!digits.startsWith('84')) {
    digits = '84' + digits;
  }
  
  return '+' + digits;
};

export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  let digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('84')) {
    digits = '0' + digits.substring(2);
  }
  
  return digits;
};
