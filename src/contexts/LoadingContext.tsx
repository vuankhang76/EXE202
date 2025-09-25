import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setLoadingCallback } from '@/api/axios';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loading: LoadingState;
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  clearAllLoading: () => void;
  globalLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loading, setLoadingState] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  useEffect(() => {
    setLoadingCallback((isLoading: boolean) => {
      setLoading('axios_global', isLoading);
    });
  }, [setLoading]);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loading[key] || false;
    }
    // If no key provided, check if any loading is active
    return Object.values(loading).some(isLoading => isLoading);
  }, [loading]);

  const clearAllLoading = useCallback(() => {
    setLoadingState({});
  }, []);

  const globalLoading = Object.values(loading).some(isLoading => isLoading);

  const value: LoadingContextType = {
    loading,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    clearAllLoading,
    globalLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// Pre-defined loading keys for common operations
export const LOADING_KEYS = {
  // Authentication
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REQUEST_OTP: 'auth.request_otp',
  VERIFY_OTP: 'auth.verify_otp',
  VALIDATE_TOKEN: 'auth.validate_token',
  
  // API calls
  GET_USER_PROFILE: 'api.get_user_profile',
  UPDATE_USER_PROFILE: 'api.update_user_profile',
  
  // File operations
  UPLOAD_FILE: 'file.upload',
  DOWNLOAD_FILE: 'file.download',
  
  // Generic operations
  SAVE_DATA: 'generic.save',
  LOAD_DATA: 'generic.load',
  DELETE_DATA: 'generic.delete',
  
  // Custom operations - can be extended
  CUSTOM: (operation: string) => `custom.${operation}`,
} as const;

export default LoadingContext;
