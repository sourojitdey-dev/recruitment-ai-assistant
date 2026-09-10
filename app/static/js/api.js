/* ==========================================================================
   Recruitment AI Assistant - API Client
   ========================================================================== */

const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers || {};

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to JSON
  if (!(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized token expiry
  if (response.status === 401) {
    const currentHash = window.location.hash;
    if (
      currentHash !== '#/login' &&
      currentHash !== '#/' &&
      !currentHash.startsWith('#/register') &&
      currentHash !== '#/forgot-password'
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
  }

  let data = null;
  if (response.status !== 204 && response.status !== 205) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = await response.text();
      } catch {
        data = null;
      }
    }
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (data && typeof data === 'object') {
      errorMsg = data.detail || data.message || JSON.stringify(data);
    } else if (typeof data === 'string' && data.length > 0) {
      errorMsg = data;
    }
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const api = {
  get: (endpoint, params = null) => {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${query}`;
    }
    return request(url, { method: 'GET' });
  },

  post: (endpoint, data, isForm = false) => {
    let body = data;
    if (isForm && !(data instanceof FormData) && !(data instanceof URLSearchParams)) {
      body = new URLSearchParams(data);
    } else if (!isForm && !(data instanceof FormData)) {
      body = JSON.stringify(data);
    }
    return request(endpoint, {
      method: 'POST',
      body,
    });
  },

  put: (endpoint, data) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint) => {
    return request(endpoint, {
      method: 'DELETE',
    });
  },
};

export default api;

