import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('patient' | 'tenant')[];
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { currentUser, token, userType, isInitialized } = useAuth();

  // Chờ AuthContext load xong từ localStorage
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!currentUser || !token) {
    return <Navigate to="/" replace />;
  }

  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">
            {userType === 'patient' 
              ? 'Trang này dành cho đối tác. Vui lòng quay lại trang chủ.'
              : 'Trang này dành cho bệnh nhân. Vui lòng quay lại trang chủ.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
