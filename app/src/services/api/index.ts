/**
 * API Service - 与后端服务交互
 */

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API 错误类型
export class APIError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'APIError';
  }
}

// 获取 Telegram initData
function getTelegramInitData(): string {
  // 从 Telegram WebApp 获取 initData
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
    return (window as any).Telegram.WebApp.initData;
  }

  // 开发模式：返回模拟数据
  if (import.meta.env.DEV) {
    console.warn('[API] Using mock initData for development');
    return 'mock_init_data_for_dev';
  }

  throw new Error('Telegram initData not available');
}

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    // 添加认证头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getTelegramInitData(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 解析响应
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || 'Request failed',
        data.code || 'UNKNOWN_ERROR',
        response.status
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    console.error('[API] Request failed:', error);
    throw new APIError(
      'Network request failed',
      'NETWORK_ERROR',
      0
    );
  }
}

// 用户相关 API
export const UserAPI = {
  /**
   * 获取用户信息
   */
  async getInfo() {
    return request<{
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      photo_url: string;
      created_at: string;
      updated_at: string;
    }>('/api/v1/user/info');
  },

  /**
   * 更新用户信息
   */
  async update(data: {
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  }) {
    return request('/api/v1/user/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 钱包相关 API
export const WalletAPI = {
  /**
   * 获取钱包信息
   */
  async getInfo() {
    return request<{
      id: number;
      user_id: number;
      address: string;
      public_key: string;
      created_at: string;
      updated_at: string;
    }>('/api/v1/wallet/info');
  },

  /**
   * 创建钱包
   */
  async create(data: {
    address: string;
    public_key: string;
  }) {
    return request<{
      id: number;
      user_id: number;
      address: string;
      public_key: string;
      created_at: string;
      updated_at: string;
    }>('/api/v1/wallet/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 获取钱包余额
   */
  async getBalance() {
    return request<{
      address: string;
      balance: string;
      balance_formatted: string;
    }>('/api/v1/wallet/balance');
  },
};
