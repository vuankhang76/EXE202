# Hệ thống Loading - Hướng dẫn sử dụng

Hệ thống loading toàn diện cho frontend, bao gồm các component, context và hook để quản lý trạng thái loading một cách hiệu quả.

## 📁 Cấu trúc Files

```
src/
├── components/
│   ├── ui/LoadingSpinner.tsx          # Loading spinner components
│   └── GlobalLoadingOverlay.tsx       # Global loading overlay
├── contexts/LoadingContext.tsx        # Loading state management
├── hooks/useApiCall.ts               # API call hooks with loading
├── api/axios.ts                      # Updated với loading interceptors
└── examples/ExampleApiUsage.tsx      # Ví dụ sử dụng
```

## 🚀 Cách sử dụng

### 1. Loading Spinner Components

```tsx
import { LoadingSpinner, ButtonLoadingSpinner, PageLoadingSpinner } from '@/components/ui/LoadingSpinner';

// Basic spinner
<LoadingSpinner size="md" variant="primary" />

// Spinner với text
<LoadingSpinner size="lg" showText text="Đang tải dữ liệu..." />

// Button spinner
<Button disabled={isLoading}>
  {isLoading && <ButtonLoadingSpinner />}
  {isLoading ? 'Đang xử lý...' : 'Xử lý'}
</Button>

// Page loading
<PageLoadingSpinner text="Đang tải trang..." />
```

### 2. Loading Context

```tsx
import { useLoading, LOADING_KEYS } from '@/contexts/LoadingContext';

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  
  const handleAction = async () => {
    startLoading(LOADING_KEYS.SAVE_DATA);
    try {
      await saveData();
    } finally {
      stopLoading(LOADING_KEYS.SAVE_DATA);
    }
  };
  
  return (
    <Button 
      onClick={handleAction}
      disabled={isLoading(LOADING_KEYS.SAVE_DATA)}
    >
      {isLoading(LOADING_KEYS.SAVE_DATA) ? 'Đang lưu...' : 'Lưu'}
    </Button>
  );
}
```

### 3. API Call Hooks

```tsx
import { useApiCall, useSaveApiCall, useAuthApiCall } from '@/hooks/useApiCall';

// Basic API call
const { data, isLoading, execute, error } = useApiCall(
  fetchUserData,
  {
    loadingKey: 'user-data',
    successMessage: 'Tải dữ liệu thành công!',
    showSuccessToast: true,
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  }
);

// Save operation với success message tự động
const { execute: saveUser } = useSaveApiCall(
  updateUserProfile,
  {
    successMessage: 'Cập nhật profile thành công!',
    onSuccess: () => {
      // Refresh data after save
      execute();
    }
  }
);

// Auth operation
const { execute: login } = useAuthApiCall(
  authService.login,
  { operation: 'LOGIN' }
);
```

### 4. Automatic Loading với Axios

Tất cả API calls qua `apiUtils` sẽ tự động hiển thị loading:

```tsx
import { apiUtils } from '@/api/axios';

// Loading sẽ tự động hiển thị
const response = await apiUtils.get('/api/users');
const result = await apiUtils.post('/api/users', userData);
```

#### Skip Global Loading

Đối với các API calls không cần hiển thị global loading (ví dụ: search/autocomplete), sử dụng flag `skipGlobalLoading`:

```tsx
// Search operations không làm chớp màn hình
const response = await apiUtils.get(
  '/api/search',
  undefined,
  { skipGlobalLoading: true }
);

// Hoặc với POST/PUT
const result = await apiUtils.post(
  '/api/search',
  searchData,
  { skipGlobalLoading: true }
);
```

**Khi nào nên skip global loading:**
- ✅ Search/autocomplete operations
- ✅ Real-time updates (polling, websocket fallbacks)
- ✅ Background sync operations
- ✅ Analytics/tracking calls
- ❌ KHÔNG skip cho: Create, Update, Delete operations
- ❌ KHÔNG skip cho: Login, authentication operations

### 5. Loading Keys

Sử dụng predefined loading keys:

```tsx
import { LOADING_KEYS } from '@/contexts/LoadingContext';

// Authentication keys
LOADING_KEYS.LOGIN
LOADING_KEYS.LOGOUT
LOADING_KEYS.REQUEST_OTP
LOADING_KEYS.VERIFY_OTP

// API keys
LOADING_KEYS.GET_USER_PROFILE
LOADING_KEYS.UPDATE_USER_PROFILE

// Generic keys
LOADING_KEYS.SAVE_DATA
LOADING_KEYS.LOAD_DATA
LOADING_KEYS.DELETE_DATA

// Custom keys
LOADING_KEYS.CUSTOM('my-operation')
```

## 🎨 Styling Options

### Loading Spinner Sizes
- `sm`: 16x16px
- `md`: 24x24px (default)
- `lg`: 32x32px
- `xl`: 48x48px

### Loading Spinner Variants
- `default`: Muted foreground color
- `primary`: Primary theme color
- `white`: White color (for dark backgrounds)

## 📝 Best Practices

### 1. Sử dụng Loading Keys
```tsx
// ✅ Good - Sử dụng predefined keys
startLoading(LOADING_KEYS.SAVE_DATA);

// ❌ Bad - Magic strings
startLoading('saving');
```

### 2. Cleanup Loading States
```tsx
// ✅ Good - Luôn cleanup trong finally
try {
  startLoading(key);
  await apiCall();
} finally {
  stopLoading(key);
}

// ❌ Bad - Có thể leak loading state
startLoading(key);
await apiCall();
stopLoading(key);
```

### 3. Specific Loading States
```tsx
// ✅ Good - Specific loading cho từng action
const isLoginLoading = isLoading(LOADING_KEYS.LOGIN);
const isOtpLoading = isLoading(LOADING_KEYS.REQUEST_OTP);

// ❌ Bad - Generic loading cho tất cả
const isLoading = isLoading();
```

### 4. User Feedback
```tsx
// ✅ Good - Descriptive loading text
<LoadingSpinner showText text="Đang xác thực thông tin..." />

// ❌ Bad - Generic text
<LoadingSpinner showText text="Loading..." />
```

## 🔧 Advanced Usage

### Custom Loading Hook
```tsx
function useCustomLoading() {
  const { startLoading, stopLoading, isLoading } = useLoading();
  
  const executeWithLoading = async (operation: () => Promise<void>, key: string) => {
    startLoading(key);
    try {
      await operation();
    } finally {
      stopLoading(key);
    }
  };
  
  return { executeWithLoading, isLoading };
}
```

### Conditional Loading Display
```tsx
function ConditionalLoading({ showGlobal = true }) {
  const { isLoading, globalLoading } = useLoading();
  
  if (showGlobal && globalLoading) {
    return <FullPageLoadingSpinner />;
  }
  
  if (isLoading('specific-operation')) {
    return <LoadingSpinner text="Đang xử lý..." />;
  }
  
  return null;
}
```

## 🐛 Troubleshooting

### Loading không hiển thị
1. Kiểm tra LoadingProvider đã được wrap ở App.tsx
2. Đảm bảo sử dụng đúng loading key
3. Kiểm tra cleanup trong finally block

### Loading không tắt
1. Đảm bảo `stopLoading()` được gọi trong finally
2. Kiểm tra error handling
3. Reset loading state nếu cần: `clearAllLoading()`

### Performance Issues
1. Sử dụng specific loading keys thay vì global
2. Tránh re-render không cần thiết
3. Debounce rapid API calls

### Global Loading chớp màn hình khi tìm kiếm
1. Sử dụng `skipGlobalLoading: true` cho search API calls
2. Ví dụ đã được implement trong `tenantService.searchPatientsInTenant()` và `userService.searchDoctorsInTenant()`
3. Component sử dụng: `CreateAppointmentDialog` với `usePatientSearch` và `useDoctorSearch` hooks
