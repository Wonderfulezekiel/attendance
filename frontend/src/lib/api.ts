const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Track auth failure to prevent cascading 401 requests
let authFailed = false;

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If auth has already failed and this isn't a login/register request, throw immediately
    if (authFailed && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      throw new Error('Session expired. Please log in again.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid - set the flag to stop cascading requests
      authFailed = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redirect to login after a short delay (allows current call stack to finish)
        setTimeout(() => {
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
        }, 100);
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.fetch(endpoint);
  },

  post(endpoint: string, body: unknown) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint: string, body: unknown) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  },

  // Call this on successful login to reset the auth failure flag
  resetAuthState() {
    authFailed = false;
  },
};
