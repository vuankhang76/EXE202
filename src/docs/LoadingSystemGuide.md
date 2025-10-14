# Loading System Guide

## Tổng quan

Dự án sử dụng hệ thống loading nhiều cấp độ với skeleton screens để cải thiện trải nghiệm người dùng.

**QUAN TRỌNG:** GlobalLoadingOverlay đã bị TẮT vì ảnh hưởng xấu đến UX. Sử dụng skeleton loading thay thế.

## Tại sao KHÔNG dùng GlobalLoadingOverlay?

❌ **Vấn đề:**
- Chặn toàn bộ UI → User không thể tương tác
- Che mất context → User không biết đang ở đâu
- Tạo cảm giác "lag" → Poor perceived performance
- Gây khó chịu khi loading nhiều lần

✅ **Giải pháp:**
- Skeleton screens → Show structure immediately
- Component-level loading → Only affected parts show loading
- Progressive loading → Load and show incrementally
- Non-blocking UI → Users can still interact

## Các loại Loading

### 1. Global Loading (axios.ts)
- **Mục đích**: Loading tự động cho tất cả API calls
- **Cách hoạt động**: Interceptor tự động track số lượng requests đang chạy
- **Vô hiệu hóa**: Thêm `skipGlobalLoading: true` vào config

```typescript
await apiUtils.get('/api/endpoint', null, { skipGlobalLoading: true });
```

### 2. Component-Level Loading States
- **Table Loading**: Sử dụng `TableSkeleton`
- **Stats Loading**: Sử dụng `StatsGridSkeleton`
- **Dialog Loading**: Sử dụng `DialogContentSkeleton`
- **Form Loading**: Sử dụng `FormSkeleton`

### 3. Loading Context
```typescript
import { useLoading, LOADING_KEYS } from '@/contexts/LoadingContext';

const { isLoading, startLoading, stopLoading } = useLoading();

// Bắt đầu loading
startLoading(LOADING_KEYS.SAVE_DATA);

// Kiểm tra trạng thái
if (isLoading(LOADING_KEYS.SAVE_DATA)) {
  // Show loading UI
}

// Kết thúc loading
stopLoading(LOADING_KEYS.SAVE_DATA);
```

## Skeleton Components

### TableSkeleton
```typescript
import { TableSkeleton } from "@/components/ui/TableSkeleton";

<TableSkeleton rows={10} columns={6} showHeader={true} />
```

### StatsGridSkeleton
```typescript
import { StatsGridSkeleton } from "@/components/ui/StatCardSkeleton";

<StatsGridSkeleton count={3} />
```

### DialogContentSkeleton
```typescript
import { DialogContentSkeleton } from "@/components/ui/DialogContentSkeleton";

{loading ? <DialogContentSkeleton /> : <YourContent />}
```

### FormSkeleton
```typescript
import { FormSkeleton } from "@/components/ui/DialogContentSkeleton";

{loading ? <FormSkeleton fields={6} /> : <YourForm />}
```

## Best Practices

### 1. Sử dụng Skeleton thay vì Spinner
❌ **Không nên:**
```typescript
{loading && <Loader2 className="animate-spin" />}
{!loading && <Table />}
```

✅ **Nên:**
```typescript
{loading ? <TableSkeleton /> : <Table />}
```

### 2. Hiển thị ngay lập tức, load background
❌ **Không nên:**
```typescript
const handleClick = async () => {
  setLoading(true);
  const data = await fetchData();
  setData(data);
  setDialog(true);  // Mở sau khi load xong
  setLoading(false);
};
```

✅ **Nên:**
```typescript
const handleClick = async () => {
  setDialog(true);  // Mở ngay
  setLoadingDetails(true);
  const data = await fetchData();
  setData(data);
  setLoadingDetails(false);
};

// Trong dialog
{loadingDetails ? <DialogContentSkeleton /> : <Content data={data} />}
```

### 3. Loading State riêng cho từng phần
```typescript
const [loadingUsers, setLoadingUsers] = useState(false);
const [loadingStats, setLoadingStats] = useState(false);
const [loadingDetails, setLoadingDetails] = useState(false);
```

### 4. Accessibility
Tất cả loading components đã có ARIA attributes:
```typescript
<div role="status" aria-live="polite" aria-busy="true">
  <LoadingSpinner />
</div>
```

## Ví dụ thực tế

### Table với Skeleton
```typescript
export function AccountTable({ users, loading }) {
  if (loading) {
    return <TableSkeleton rows={10} columns={6} />;
  }
  
  return <Table data={users} />;
}
```

### Dialog với Skeleton
```typescript
export function ViewDialog({ open, data, loading }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        {loading ? (
          <DialogContentSkeleton />
        ) : (
          <div>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Stats với Skeleton
```typescript
export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  return (
    <div>
      {loading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid data={stats} />
      )}
    </div>
  );
}
```

## Performance Tips

1. **Skeleton phải match với component thực**
   - Cùng số cột/hàng
   - Cùng layout structure
   - Cùng spacing

2. **Không animate quá nhiều**
   - Skeleton có `animate-pulse` mặc định
   - Tránh thêm animations khác

3. **Reuse Skeleton components**
   - Tạo skeleton cho các patterns chung
   - Tránh tạo skeleton inline

4. **Loading states độc lập**
   - Mỗi section có loading state riêng
   - Cho phép load song song

## Troubleshooting

### Skeleton không hiển thị
- Kiểm tra `loading` state có được set đúng không
- Kiểm tra conditional rendering logic

### Loading quá lâu
- Kiểm tra API có skipGlobalLoading không
- Kiểm tra có leak loading state không (không stopLoading)

### Multiple loaders chồng lên nhau
- Tắt global loading cho requests cụ thể
- Sử dụng loading keys riêng biệt

### Skeleton không giống với content
- Review lại structure
- Đảm bảo cùng grid/layout
