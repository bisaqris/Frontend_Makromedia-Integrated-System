import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, setUser, clearAuth } from './auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiEnvelope {
  statusCode: number;
  message: string;
  data: unknown;
  meta?: unknown;
}

const isApiEnvelope = (value: unknown): value is ApiEnvelope =>
  typeof value === 'object' &&
  value !== null &&
  'statusCode' in value &&
  'message' in value &&
  'data' in value;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('makromedia:api-online'));
    }
    if (isApiEnvelope(response.data)) {
      const { data, meta } = response.data;
      response.data =
        meta === undefined
          ? data
          : { data, meta };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      typeof window !== 'undefined' &&
      (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')
    ) {
      window.dispatchEvent(new CustomEvent('makromedia:api-offline'));
    }

    if (error.response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/logout');

      if (isAuthEndpoint) {
        if (!requestUrl.includes('/auth/login')) {
          clearAuth();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuth();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        clearAuth();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const rawData = refreshResponse.data;
        interface RefreshPayload {
          accessToken?: string;
          refreshToken?: string;
          user?: import('@/types/user').User;
        }
        const payload = isApiEnvelope(rawData)
          ? (rawData.data as RefreshPayload)
          : (rawData as RefreshPayload);
        const newAccessToken = payload?.accessToken;
        const newRefreshToken = payload?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh token gagal: accessToken kosong.');
        }

        setToken(newAccessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }
        if (payload?.user) {
          setUser(payload.user);
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuth();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
