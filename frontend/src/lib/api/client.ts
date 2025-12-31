import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 定義基本的 API 回應結構
interface ApiResponse<T = any> {
    data: T;
    message?: string;
}

// 創建 axios 實例
const getBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return url.endsWith('/api/v1') ? url : `${url}/api/v1`;
};

// 創建 axios 實例
const axiosInstance: AxiosInstance = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 請求攔截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 未來可以在這裡加入 Auth Token
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 響應攔截器
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        // 統一錯誤處理
        let message = '發生未知錯誤';

        if (error.response) {
            // 伺服器回應了錯誤狀態碼
            let data = error.response.data as any;

            // Handle Blob error response
            if (data instanceof Blob && data.type === 'application/json') {
                try {
                    const text = await data.text();
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse Blob error:', e);
                }
            }

            message = data.detail || data.message || `請求失敗 (${error.response.status})`;
        } else if (error.request) {
            // 請求發出但沒有收到回應
            message = '無法連接到伺服器，請檢查網絡連接';
        } else {
            // 請求配置錯誤
            message = error.message;
        }

        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

// 封裝通用的請求方法
export const apiClient = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.get<T>(url, config).then(res => res.data),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        axiosInstance.post<T>(url, data, config).then(res => res.data),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        axiosInstance.put<T>(url, data, config).then(res => res.data),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.delete<T>(url, config).then(res => res.data),

    // 暴露原始實例以供特殊需求使用
    instance: axiosInstance
};

export default apiClient;
