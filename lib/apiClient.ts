import axios from 'axios';
import { getToken, clearAuth } from './auth';

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
  (error) => {
    if (typeof window !== 'undefined' && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
      window.dispatchEvent(new CustomEvent('makromedia:api-offline'));
    }
    if (error.response && error.response.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
