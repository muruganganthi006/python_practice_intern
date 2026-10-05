const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed';
  }

  const maybeDetail = (payload as { detail?: unknown }).detail;

  if (typeof maybeDetail === 'string') {
    return maybeDetail;
  }

  if (Array.isArray(maybeDetail) && maybeDetail.length > 0) {
    const firstError = maybeDetail[0];

    if (firstError && typeof firstError === 'object') {
      const msg = (firstError as { msg?: string }).msg;
      const loc = (firstError as { loc?: unknown[] }).loc;

      if (typeof msg === 'string' && msg.length > 0) {
        return msg.replace(/^Value error,\s*/i, '');
      }

      if (Array.isArray(loc) && loc.length > 0) {
        return `Validation error at ${loc.join('.')}.`;
      }
    }
  }

  return 'Request failed';
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  getAuthHeaders() {
    const token = localStorage.getItem('govia_access_token');

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  },

  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers || {});

    const authHeaders = this.getAuthHeaders();

    Object.entries(authHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(getErrorMessage(payload));
    }

    return response.json() as Promise<T>;
  },
};