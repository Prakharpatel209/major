// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

export const buildImageUrl = (path?: string): string => {
  if (!path) return '';
  // Path from backend is like "/uploads/filename.ext"
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

