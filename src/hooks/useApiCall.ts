import { useState, useCallback } from 'react';
import { useLoading, LOADING_KEYS } from '@/contexts/LoadingContext';
import { toast } from 'sonner';

interface UseApiCallOptions<T> {
  loadingKey?: string;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

interface UseApiCallReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T> {
  const {
    loadingKey = 'api_call',
    successMessage,
    errorMessage,
    showSuccessToast = false,
    showErrorToast = true,
    onSuccess,
    onError,
    onFinally
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setError(null);
      startLoading(loadingKey);

      const result = await apiFunction(...args);
      setData(result);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);

      if (showErrorToast) {
        const message = errorMessage || error.message || 'Có lỗi xảy ra';
        toast.error(message);
      }

      onError?.(error);
      return null;
    } finally {
      stopLoading(loadingKey);
      onFinally?.();
    }
  }, [apiFunction, loadingKey, successMessage, errorMessage, showSuccessToast, showErrorToast, onSuccess, onError, onFinally, startLoading, stopLoading]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    stopLoading(loadingKey);
  }, [loadingKey, stopLoading]);

  return {
    data,
    error,
    isLoading: isLoading(loadingKey),
    execute,
    reset
  };
}

export function useAuthApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: Omit<UseApiCallOptions<T>, 'loadingKey'> & { operation: keyof typeof LOADING_KEYS } = { operation: 'LOGIN' }
) {
  return useApiCall(apiFunction, {
    ...options,
    loadingKey: LOADING_KEYS[options.operation] as string
  });
}

export function useDataApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: Omit<UseApiCallOptions<T>, 'loadingKey'> = {}
) {
  return useApiCall(apiFunction, {
    ...options,
    loadingKey: LOADING_KEYS.LOAD_DATA
  });
}

export function useSaveApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: Omit<UseApiCallOptions<T>, 'loadingKey'> = {}
) {
  return useApiCall(apiFunction, {
    ...options,
    loadingKey: LOADING_KEYS.SAVE_DATA,
    showSuccessToast: true,
    successMessage: options.successMessage || 'Lưu thành công'
  });
}

export function useDeleteApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: Omit<UseApiCallOptions<T>, 'loadingKey'> = {}
) {
  return useApiCall(apiFunction, {
    ...options,
    loadingKey: LOADING_KEYS.DELETE_DATA,
    showSuccessToast: true,
    successMessage: options.successMessage || 'Xóa thành công'
  });
}

export default useApiCall;
