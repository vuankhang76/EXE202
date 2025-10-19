# Payment Methods Update Guide

## Thay đổi quan trọng

### ❌ Giá trị CŨ (UPPERCASE với underscore):
```typescript
PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
  { value: 'MOMO', label: 'MoMo' },
  // ...
]

PAYMENT_STATUS = [
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  // ...
]
```

### ✅ Giá trị MỚI (PascalCase, match với backend):
```typescript
PAYMENT_METHODS = [
  { value: 'Cash', label: 'Tiền mặt', category: 'cash' },
  { value: 'BankTransfer', label: 'Chuyển khoản', category: 'bank' },
  { value: 'MoMo', label: 'MoMo', category: 'ewallet' },
  { value: 'ZaloPay', label: 'ZaloPay', category: 'ewallet' },
  { value: 'VNPay', label: 'VNPay', category: 'ewallet' },
  { value: 'Card', label: 'Thẻ', category: 'card' },
]

PAYMENT_STATUS = [
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Failed', label: 'Thất bại' },
  { value: 'Refunded', label: 'Đã hoàn tiền' },
]
```

## Cấu trúc mới

### Payment Method Categories

Mỗi payment method có thêm trường `category` để filter theo cấu hình tenant:

- **`cash`**: Tiền mặt (luôn bật)
- **`bank`**: Chuyển khoản ngân hàng (theo config `Payment.BankTransferEnabled`)
- **`ewallet`**: Ví điện tử - MoMo, ZaloPay, VNPay (theo config `Payment.EWalletEnabled`)
- **`card`**: Thẻ tín dụng/ghi nợ (luôn bật)

### Helper Function Mới

```typescript
getAvailablePaymentMethods(config?: {
  cashEnabled?: boolean;
  bankTransferEnabled?: boolean;
  eWalletEnabled?: boolean;
})
```

**Sử dụng**:

```typescript
import { getAvailablePaymentMethods } from '@/types/paymentTransaction';

// Lấy payment config từ tenant settings
const paymentConfig = await tenantSettingService.getPaymentConfig(tenantId);

// Filter payment methods theo config
const availableMethods = getAvailablePaymentMethods({
  cashEnabled: paymentConfig.data.cashEnabled,
  bankTransferEnabled: paymentConfig.data.bankTransferEnabled,
  eWalletEnabled: paymentConfig.data.eWalletEnabled,
});

// Hiển thị trong Select/Dropdown
<Select>
  {availableMethods.map(method => (
    <SelectItem key={method.value} value={method.value}>
      {method.label}
    </SelectItem>
  ))}
</Select>
```

## Migration Checklist

### Backend (Đã match)
- ✅ Method values: `Cash`, `BankTransfer`, `MoMo`, `ZaloPay`, `VNPay`, `Card`
- ✅ Status values: `Pending`, `Completed`, `Failed`, `Refunded`
- ✅ TenantSettings có `Payment.BankTransferEnabled` và `Payment.EWalletEnabled`

### Frontend (Cần update)
1. ✅ Update `PAYMENT_METHODS` constants
2. ✅ Update `PAYMENT_STATUS` constants  
3. ✅ Add `getAvailablePaymentMethods()` helper
4. ⚠️ **CẦN LÀM**: Update các components đang dùng payment methods:
   - Payment form components
   - Payment transaction list
   - Payment filters
   - Reports/Statistics

## Các file cần kiểm tra và update

### 1. Payment Forms
```bash
src/components/payments/**/*.tsx
src/pages/payments/**/*.tsx
```

**Cần đổi**:
```typescript
// CŨ
method: 'CASH' // ❌

// MỚI  
method: 'Cash' // ✅
```

### 2. Payment Filters
```bash
src/components/filters/PaymentFilter.tsx
```

**Cần đổi**:
```typescript
// CŨ
<SelectItem value="PENDING">Chờ xử lý</SelectItem> // ❌

// MỚI
<SelectItem value="Pending">Chờ xử lý</SelectItem> // ✅
```

### 3. API Services
```bash
src/services/paymentService.ts
```

Không cần đổi code, nhưng cần test lại với values mới.

### 4. Payment Statistics/Reports
```bash
src/pages/dashboard/PaymentReports.tsx
```

**Cần kiểm tra**:
- Các biểu đồ theo method
- Filters theo status
- Group by logic

## Testing Checklist

### Unit Tests
- [ ] Test `getAvailablePaymentMethods()` với các config khác nhau
- [ ] Test `getPaymentMethodLabel()` với values mới
- [ ] Test `getPaymentStatusLabel()` với values mới

### Integration Tests
- [ ] Tạo payment transaction với method = `Cash`
- [ ] Tạo payment transaction với method = `BankTransfer`
- [ ] Tạo payment transaction với method = `MoMo`
- [ ] Update payment status từ `Pending` → `Completed`
- [ ] Verify payment config từ TenantSettings API

### UI Tests
- [ ] Payment form hiển thị đúng methods theo config
- [ ] Payment list hiển thị đúng labels
- [ ] Payment filters hoạt động đúng
- [ ] Payment statistics group đúng theo method/status

## API Endpoints liên quan

### Get Payment Config
```http
GET /api/tenants/{tenantId}/payment-config
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cashEnabled": true,
    "bankTransferEnabled": true,
    "eWalletEnabled": false
  }
}
```

### Create Payment Transaction
```http
POST /api/paymenttransactions
Content-Type: application/json

{
  "tenantId": 1,
  "patientId": 123,
  "appointmentId": 456,
  "amount": 500000,
  "currency": "VND",
  "method": "Cash",  // ✅ PascalCase
  "providerRef": null
}
```

### Update Payment Status
```http
PUT /api/paymenttransactions/{id}
Content-Type: application/json

{
  "status": "Completed",  // ✅ PascalCase
  "providerRef": "TXN_123456"
}
```

## Breaking Changes Warning

⚠️ **Nếu có data cũ trong database với values UPPERCASE**, cần migration:

```sql
-- Migration script (if needed)
UPDATE PaymentTransactions 
SET Method = 'Cash' WHERE Method = 'CASH';

UPDATE PaymentTransactions 
SET Method = 'BankTransfer' WHERE Method = 'BANK_TRANSFER';

UPDATE PaymentTransactions 
SET Method = 'MoMo' WHERE Method = 'MOMO';

UPDATE PaymentTransactions 
SET Method = 'ZaloPay' WHERE Method = 'ZALOPAY';

UPDATE PaymentTransactions 
SET Method = 'VNPay' WHERE Method = 'VNPAY';

UPDATE PaymentTransactions 
SET Method = 'Card' WHERE Method = 'CARD';

-- Status migration
UPDATE PaymentTransactions 
SET Status = 'Pending' WHERE Status = 'PENDING';

UPDATE PaymentTransactions 
SET Status = 'Completed' WHERE Status = 'COMPLETED';

UPDATE PaymentTransactions 
SET Status = 'Failed' WHERE Status = 'FAILED';

UPDATE PaymentTransactions 
SET Status = 'Refunded' WHERE Status = 'REFUNDED';
```

## Ví dụ sử dụng trong component

```typescript
import { useState, useEffect } from 'react';
import { tenantSettingService } from '@/services/tenantSettingService';
import { getAvailablePaymentMethods, PAYMENT_METHODS } from '@/types/paymentTransaction';

function PaymentForm({ tenantId }: { tenantId: number }) {
  const [availableMethods, setAvailableMethods] = useState(PAYMENT_METHODS);

  useEffect(() => {
    loadPaymentConfig();
  }, [tenantId]);

  const loadPaymentConfig = async () => {
    try {
      const response = await tenantSettingService.getPaymentConfig(tenantId);
      if (response.success && response.data) {
        const methods = getAvailablePaymentMethods({
          cashEnabled: response.data.cashEnabled,
          bankTransferEnabled: response.data.bankTransferEnabled,
          eWalletEnabled: response.data.eWalletEnabled,
        });
        setAvailableMethods(methods);
      }
    } catch (error) {
      console.error('Failed to load payment config:', error);
      // Use all methods as fallback
    }
  };

  return (
    <Select>
      {availableMethods.map(method => (
        <SelectItem key={method.value} value={method.value}>
          {method.label}
        </SelectItem>
      ))}
    </Select>
  );
}
```

## Lợi ích của việc thay đổi

1. **Match với backend C#**: PascalCase là convention của C#
2. **Type-safe hơn**: Dễ catch lỗi typo
3. **Readable hơn**: `BankTransfer` dễ đọc hơn `BANK_TRANSFER`
4. **Flexible**: Có thể enable/disable payment methods per tenant
5. **Extensible**: Dễ thêm payment methods mới

## Support

Nếu có lỗi sau khi update, kiểm tra:
1. Console browser có error về "Unknown payment method"?
2. API response có match với frontend constants?
3. TenantSettings đã được khởi tạo chưa?
4. Database có data cũ với format UPPERCASE?
