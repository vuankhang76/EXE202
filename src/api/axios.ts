import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { type ApiResponse} from '@/models/ApiResponse';
import { toast } from 'sonner';

// Extend AxiosRequestConfig để thêm skipGlobalLoading flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalLoading?: boolean;
  }
}

let activeRequestsCount = 0;
let loadingChangeCallback: ((isLoading: boolean) => void) | null = null;

export const setLoadingCallback = (callback: (isLoading: boolean) => void) => {
  loadingChangeCallback = callback;
};

const updateLoadingState = () => {
  const isLoading = activeRequestsCount > 0;
  if (loadingChangeCallback) {
    loadingChangeCallback(isLoading);
  }
};

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Chỉ tăng counter nếu không skip global loading
    if (!config.skipGlobalLoading) {
      activeRequestsCount++;
      updateLoadingState();
    }
    
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    updateLoadingState();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>): AxiosResponse<T> => {
    // Chỉ giảm counter nếu request không skip global loading
    if (!response.config.skipGlobalLoading) {
      activeRequestsCount = Math.max(0, activeRequestsCount - 1);
      updateLoadingState();
    }
    
    return response as AxiosResponse<T>;
  },
  (error) => {
    // Chỉ giảm counter nếu request không skip global loading
    if (!error.config?.skipGlobalLoading) {
      activeRequestsCount = Math.max(0, activeRequestsCount - 1);
      updateLoadingState();
    }
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          toast.error(error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Yêu cầu không hợp lệ');
          break;
        case 401:
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
          break;
        case 403:
          toast.error('Bạn không có quyền thực hiện thao tác này');
          break;
        case 404:
          toast.error('Không tìm thấy tài nguyên yêu cầu');
          break;
        case 500:
          toast.error(error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau');
          break;
        default:
          toast.error(error.response?.data?.message || 'Có lỗi không mong muốn xảy ra');
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng');
    } else {
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
    }
    
    return Promise.reject(error);
  }
);


export const apiUtils = {
  /**
   * Generic GET request
   * @param url - API endpoint
   * @param params - Query parameters
   * @param config - Additional axios config
   */
  async get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const response = await api.get(url, { ...config, params });
    return response as AxiosResponse<T>;
  },

  /**
   * Generic POST request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional axios config
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const response = await api.post(url, data, config);
    return response as AxiosResponse<T>;
  },

  /**
   * Generic PUT request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional axios config
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>  {
    const response = await api.put(url, data, config);
    return response  as AxiosResponse<T>
  },

  /**
   * Generic DELETE request
   * @param url - API endpoint
   * @param config - Additional axios config
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>  {
    const response = await api.delete(url, config);
    return response as AxiosResponse<T>
  },

  /**
   * Generic PATCH request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional axios config
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  /**
   * Upload file(s)
   * @param url - API endpoint
   * @param files - File or array of files to upload
   * @param config - Additional axios config
   */
  async uploadFiles<T>(url: string, files: File | File[], config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    } else {
      formData.append('file', files);
    }

    const response = await api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};


export default api;