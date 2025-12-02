// Simple API service - no code generation needed

const API_BASE = '/umbraco/api/v1';

// Configuration that can be set from the entrypoint
let apiConfig = {
  token: undefined as (() => Promise<string | undefined>) | undefined,
  baseUrl: '',
  credentials: 'same-origin' as RequestCredentials,
};

export function setApiConfig(config: {
  token?: () => Promise<string | undefined>;
  baseUrl?: string;
  credentials?: RequestCredentials;
}) {
  apiConfig = { ...apiConfig, ...config };
}

async function apiGet<T>(endpoint: string): Promise<{ data?: T; error?: Error }> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (apiConfig.token) {
      const token = await apiConfig.token();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const baseUrl = apiConfig.baseUrl || '';
    const response = await fetch(`${baseUrl}${API_BASE}/${endpoint}`, {
      method: 'GET',
      credentials: apiConfig.credentials,
      headers,
    });

    if (!response.ok) {
      return { error: new Error(`HTTP ${response.status}: ${response.statusText}`) };
    }

    // Handle both JSON and plain text responses
    const contentType = response.headers.get('content-type') || '';
    let data: T;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as T;
    }
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// Types (only what we actually use)
export interface UserGroup {
  name: string;
}

export interface UserModel {
  name?: string;
  email: string;
  groups: UserGroup[];
}

// Import order types
import type { OrderListResponse, OrderDetailDto, OrderListParams } from '../orders/types.js';

// Helper to build query string from params
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}

// API methods
export const MerchelloApi = {
  ping: () => apiGet<string>('ping'),
  whatsMyName: () => apiGet<string>('whatsMyName'),
  whatsTheTimeMrWolf: () => apiGet<string>('whatsTheTimeMrWolf'),
  whoAmI: () => apiGet<UserModel>('whoAmI'),

  // Orders API
  getOrders: (params?: OrderListParams) => {
    const queryString = buildQueryString(params as Record<string, unknown>);
    return apiGet<OrderListResponse>(`orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrder: (id: string) => apiGet<OrderDetailDto>(`orders/${id}`),
};
