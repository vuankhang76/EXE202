# 🚀 Quick Start: Tenant Owner Management

## 📦 Installation

Tất cả dependencies đã có sẵn. Không cần cài thêm gì.

---

## 🎯 Quick Examples

### 1. Hiển thị Owner trong Tenant Detail

```tsx
import { TenantOwnerCard } from '@/components/tenant';

function TenantDetailPage() {
  const [tenant, setTenant] = useState<TenantDto | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main info */}
      <div className="lg:col-span-2">
        {/* Tenant details */}
      </div>
      
      {/* Sidebar */}
      <div>
        <TenantOwnerCard
          tenant={tenant}
          onUpdate={() => loadTenant()}
          canEdit={true}
        />
      </div>
    </div>
  );
}
```

### 2. Chọn Owner khi tạo Tenant mới

```tsx
import { OwnerSelector } from '@/components/tenant';

function CreateTenantForm() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    ownerUserId: null
  });

  return (
    <form>
      {/* Other fields */}
      
      <div>
        <Label>Chủ sở hữu</Label>
        <OwnerSelector
          tenantId={newTenantId}
          onOwnerChange={(ownerId) => 
            setFormData(prev => ({ ...prev, ownerUserId: ownerId }))
          }
        />
      </div>
      
      <Button type="submit">Tạo phòng khám</Button>
    </form>
  );
}
```

### 3. Standalone Dialog để đổi Owner

```tsx
import { EditTenantOwnerDialog } from '@/components/tenant';

function TenantActions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Đổi chủ sở hữu
      </Button>
      
      <EditTenantOwnerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={currentTenant}
        onSuccess={() => {
          toast.success('Đã cập nhật chủ sở hữu!');
          reloadData();
        }}
      />
    </>
  );
}
```

---

## 🔧 API Endpoints Used

```typescript
// Get tenant with owner info
GET /api/tenants/:id
Response: {
  tenantId: 1,
  name: "Phòng khám ABC",
  ownerUserId: 5,
  ownerName: "Nguyễn Văn A"
}

// Get users for selector
GET /api/users/tenant/:tenantId?role=Tenant
Response: {
  data: [
    { userId: 5, fullName: "Nguyễn Văn A", role: "Tenant" }
  ]
}

// Update owner
PUT /api/tenants/:id
Body: {
  ownerUserId: 5
}
```

---

## 🎨 Components at a Glance

| Component | Purpose | When to use |
|-----------|---------|-------------|
| `OwnerSelector` | Dropdown chọn owner | Forms, inline editing |
| `EditTenantOwnerDialog` | Modal chỉnh sửa owner | Full editing experience |
| `TenantOwnerCard` | Card hiển thị + edit | Tenant detail pages |

---

## ✅ Features Included

- [x] Chọn owner từ dropdown với search
- [x] Hiển thị avatar và thông tin user
- [x] Lọc chỉ users có `Role = 'Tenant'`
- [x] Xóa owner (set null)
- [x] Warning khi xóa owner
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Permission checks
- [x] Responsive design
- [x] Empty states

---

## 🚨 Important Notes

### Database Constraints
1. **Owner phải thuộc tenant** → FK constraint
2. **Mỗi user chỉ làm owner cho 1 tenant** → Unique constraint
3. **Owner phải có Role = 'Tenant'** → Trigger check
4. **Owner có thể NULL** → Tenant không bắt buộc có owner

### Frontend Validation
- Component tự động filter users với `Role = 'Tenant'`
- Hiển thị error message từ backend khi vi phạm constraints
- Disable save button khi không có thay đổi

---

## 📱 Full Page Example

Sử dụng page có sẵn:

```tsx
// In App.tsx or routing config
import TenantSettings from '@/pages/dashboard/TenantSettings';

<Route 
  path="/tenant/:tenantId/settings" 
  element={<TenantSettings />} 
/>

// Navigate to page
navigate(`/tenant/${tenantId}/settings`);
```

Page này bao gồm:
- ✅ Form chỉnh sửa thông tin tenant
- ✅ Cấu hình giờ làm việc
- ✅ `TenantOwnerCard` để quản lý owner
- ✅ Save tất cả thay đổi cùng lúc

---

## 🎯 Common Use Cases

### Update owner:
```tsx
<TenantOwnerCard tenant={tenant} onUpdate={reload} />
// → Click "Chỉnh sửa" → Chọn owner mới → Lưu
```

### Remove owner:
```tsx
<TenantOwnerCard tenant={tenant} onUpdate={reload} />
// → Click "Chỉnh sửa" → Click X to clear → Lưu
```

### Assign first owner:
```tsx
<TenantOwnerCard tenant={tenantWithoutOwner} onUpdate={reload} />
// → Click "Gán chủ sở hữu" → Chọn user → Lưu
```

---

## 🐛 Troubleshooting

**Owner selector trống?**
- Kiểm tra tenant có users với `Role = 'Tenant'` chưa
- Kiểm tra API `/api/users/tenant/:tenantId`

**Không save được owner?**
- Kiểm tra user có thuộc tenant không
- Kiểm tra user đã là owner của tenant khác chưa
- Xem console để biết lỗi cụ thể

**Owner name không hiển thị?**
- Backend phải Include `OwnerUser` khi query tenant
- Kiểm tra `MapToTenantDto` có map `OwnerName` không

---

## 📚 Next Steps

1. ✅ Integrate vào tenant detail page
2. ✅ Add route cho `TenantSettings`
3. ✅ Customize UI theo design system
4. ✅ Add permission checks
5. ✅ Test với real data

---

Happy coding! 🎉

