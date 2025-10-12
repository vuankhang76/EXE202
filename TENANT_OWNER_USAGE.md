# 🏥 Tenant Owner Management - Frontend Guide

## 📋 Tổng quan

Hướng dẫn sử dụng các component để quản lý Owner (Chủ sở hữu) cho Tenant trong frontend.

---

## 🎨 Components

### 1. **OwnerSelector** 
Dropdown để chọn owner từ danh sách users

#### Props:
```typescript
interface OwnerSelectorProps {
  tenantId: number;                    // ID của tenant
  currentOwnerId?: number | null;      // Owner hiện tại
  currentOwnerName?: string | null;    // Tên owner hiện tại
  onOwnerChange?: (ownerId: number | null) => void;  // Callback khi đổi owner
  disabled?: boolean;                  // Vô hiệu hóa
}
```

#### Usage:
```tsx
import { OwnerSelector } from '@/components/tenant';

<OwnerSelector
  tenantId={1}
  currentOwnerId={tenant.ownerUserId}
  currentOwnerName={tenant.ownerName}
  onOwnerChange={(ownerId) => setSelectedOwner(ownerId)}
/>
```

#### Features:
- ✅ Tự động load danh sách users của tenant
- ✅ Lọc chỉ users có `Role = 'Tenant'`
- ✅ Search theo tên hoặc email
- ✅ Hiển thị avatar và thông tin user
- ✅ Có nút xóa (clear) owner

---

### 2. **EditTenantOwnerDialog**
Modal/Dialog để chỉnh sửa owner

#### Props:
```typescript
interface EditTenantOwnerDialogProps {
  open: boolean;                       // Trạng thái mở/đóng
  onOpenChange: (open: boolean) => void;  // Handler mở/đóng
  tenant: TenantDto | null;            // Thông tin tenant
  onSuccess?: () => void;              // Callback khi cập nhật thành công
}
```

#### Usage:
```tsx
import { EditTenantOwnerDialog } from '@/components/tenant';

const [dialogOpen, setDialogOpen] = useState(false);

<EditTenantOwnerDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  tenant={currentTenant}
  onSuccess={() => {
    loadTenant(); // Reload data
    toast.success('Cập nhật thành công!');
  }}
/>
```

#### Features:
- ✅ Hiển thị owner hiện tại
- ✅ Sử dụng `OwnerSelector` để chọn owner mới
- ✅ Warning khi xóa owner
- ✅ Loading state khi đang save
- ✅ Toast notifications
- ✅ Auto close khi thành công

---

### 3. **TenantOwnerCard**
Card hiển thị thông tin owner + nút chỉnh sửa

#### Props:
```typescript
interface TenantOwnerCardProps {
  tenant: TenantDto;                   // Thông tin tenant
  onUpdate?: () => void;               // Callback khi cập nhật
  canEdit?: boolean;                   // Có thể chỉnh sửa không
}
```

#### Usage:
```tsx
import { TenantOwnerCard } from '@/components/tenant';

<TenantOwnerCard
  tenant={tenant}
  onUpdate={loadTenant}
  canEdit={hasPermission('edit_tenant')}
/>
```

#### Features:
- ✅ Hiển thị avatar và thông tin owner
- ✅ Badge "Chủ sở hữu"
- ✅ Hiển thị email/phone nếu có
- ✅ Nút "Chỉnh sửa" mở dialog
- ✅ State "Chưa có owner" với CTA
- ✅ Integrated với `EditTenantOwnerDialog`

---

## 📄 Page Example: TenantSettings

Full page để quản lý tenant settings bao gồm owner.

### Route:
```tsx
// In App.tsx or routes config
<Route path="/tenant/:tenantId/settings" element={<TenantSettings />} />
```

### Usage:
```tsx
import { useNavigate } from 'react-router-dom';

// Navigate to settings page
navigate(`/tenant/${tenantId}/settings`);
```

### Features:
- ✅ Form chỉnh sửa thông tin cơ bản
- ✅ Cấu hình giờ làm việc
- ✅ `TenantOwnerCard` trong sidebar
- ✅ Save all changes
- ✅ Loading & error states

---

## 🔄 Data Flow

### Load Owner Info:
```
1. Component mount
   ↓
2. Load tenant data (GET /api/tenants/:id)
   ↓
3. Tenant data có ownerUserId + ownerName
   ↓
4. Display trong UI
```

### Update Owner:
```
1. User click "Chỉnh sửa"
   ↓
2. Dialog mở → Load users list (GET /api/users/tenant/:tenantId)
   ↓
3. Filter users với Role = 'Tenant'
   ↓
4. User chọn owner mới
   ↓
5. Click "Lưu" → API call (PUT /api/tenants/:id)
   {
     ownerUserId: newOwnerId
   }
   ↓
6. Success → Reload data → Toast notification
```

---

## 🎯 Use Cases

### 1. Gán owner cho tenant mới
```tsx
// Trong form tạo tenant
import { OwnerSelector } from '@/components/tenant';

const [formData, setFormData] = useState({
  name: '',
  code: '',
  ownerUserId: null
});

<OwnerSelector
  tenantId={tenantId}
  onOwnerChange={(ownerId) => 
    setFormData(prev => ({ ...prev, ownerUserId: ownerId }))
  }
/>
```

### 2. Đổi owner trong tenant settings
```tsx
<TenantOwnerCard
  tenant={tenant}
  onUpdate={reloadTenantData}
  canEdit={true}
/>
```

### 3. Hiển thị owner trong tenant list
```tsx
{tenants.map(tenant => (
  <Card key={tenant.tenantId}>
    <CardHeader>
      <CardTitle>{tenant.name}</CardTitle>
      {tenant.ownerName && (
        <Badge variant="outline">
          <User className="h-3 w-3 mr-1" />
          {tenant.ownerName}
        </Badge>
      )}
    </CardHeader>
  </Card>
))}
```

### 4. Xóa owner
```tsx
// Trong EditTenantOwnerDialog, click nút X trong OwnerSelector
// hoặc chọn null
onOwnerChange(null); // Set owner = null

// API call
await tenantService.updateTenant(tenantId, {
  ownerUserId: null
});
```

---

## ⚠️ Error Handling

### 1. Owner không thuộc tenant
```tsx
// Backend sẽ trả về error từ FK constraint
{
  "success": false,
  "message": "OwnerUserId phải thuộc tenant này"
}

// Frontend hiển thị toast
toast.error('Lỗi', {
  description: 'Người dùng không thuộc phòng khám này'
});
```

### 2. User đã là owner của tenant khác
```tsx
{
  "success": false,
  "message": "User này đã là owner của tenant khác"
}

toast.error('Không thể gán owner', {
  description: 'Người dùng này đang quản lý phòng khám khác'
});
```

### 3. Owner không có Role = 'Tenant'
```tsx
// Frontend đã filter trước
// Nhưng nếu vẫn có lỗi:
{
  "success": false,
  "message": "OwnerUserId phải là user với Role = 'Tenant'"
}

toast.error('Lỗi phân quyền', {
  description: 'Chỉ user với vai trò Tenant mới có thể làm chủ sở hữu'
});
```

---

## 🔐 Permissions

Kiểm tra quyền trước khi cho phép chỉnh sửa:

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { currentUser } = useAuth();

const canEditOwner = 
  currentUser?.role === 'Admin' || 
  currentUser?.userId === tenant.ownerUserId;

<TenantOwnerCard
  tenant={tenant}
  canEdit={canEditOwner}
/>
```

---

## 🎨 UI/UX Best Practices

### 1. Visual Hierarchy
- Owner badge với màu vàng (crown icon) → Nổi bật
- Avatar lớn để dễ nhận diện
- Thông tin phụ (email, phone) nhỏ hơn

### 2. Feedback
- Loading state khi đang save
- Success toast khi hoàn thành
- Error toast với message rõ ràng
- Disable buttons khi đang process

### 3. Empty States
- Message rõ ràng khi chưa có owner
- CTA button để gán owner
- Icon minh họa

### 4. Confirmation
- Warning khi xóa owner
- Highlight thay đổi trong dialog
- Disable save nếu không có thay đổi

---

## 📱 Responsive Design

```tsx
// Card layout
<div className="grid gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div>
    <TenantOwnerCard tenant={tenant} />
  </div>
</div>

// Mobile: stack vertically
// Desktop: sidebar layout
```

---

## 🧪 Testing Checklist

- [ ] Load owner info correctly
- [ ] OwnerSelector shows only Tenant role users
- [ ] Search trong OwnerSelector hoạt động
- [ ] Update owner thành công
- [ ] Remove owner (set null) thành công
- [ ] Toast notifications hiển thị
- [ ] Error handling cho các constraints
- [ ] Loading states
- [ ] Permission checks
- [ ] Responsive layout

---

## 📚 Related Files

### Components:
- `src/components/tenant/OwnerSelector.tsx`
- `src/components/tenant/EditTenantOwnerDialog.tsx`
- `src/components/tenant/TenantOwnerCard.tsx`

### Pages:
- `src/pages/dashboard/TenantSettings.tsx`

### Services:
- `src/services/tenantService.ts`
- `src/services/userService.ts`

### Types:
- `src/types/tenant.ts` (TenantDto, TenantUpdateDto)
- `src/types/user.ts` (UserDto)

---

**Last Updated**: 2024-12-19
**Version**: 1.0.0

