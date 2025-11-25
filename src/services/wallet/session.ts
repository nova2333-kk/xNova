/**
 * SessionManager - 会话管理服务
 *
 * 功能：
 * 1. 管理解锁后的密钥对和钱包实例
 * 2. 自动会话超时（15分钟无操作）
 * 3. 避免频繁输入密码
 */

import { KeyPair } from '@ton/crypto';
import { WalletService } from './wallet';

export interface SessionData {
  keyPair: KeyPair;
  walletService: WalletService;
  address: string;
  expiresAt: number;
}

export class SessionManager {
  private static session: SessionData | null = null;
  private static sessionTimeout: NodeJS.Timeout | null = null;
  private static readonly SESSION_DURATION = 15 * 60 * 1000; // 15分钟

  /**
   * 创建新会话
   * @param keyPair 密钥对
   * @returns 会话数据
   */
  static createSession(keyPair: KeyPair): SessionData {
    // 清除旧会话
    this.clearSession();

    // 创建钱包服务实例
    const walletService = new WalletService();
    const address = walletService.createWallet(keyPair).toString();

    // 设置会话数据
    this.session = {
      keyPair,
      walletService,
      address,
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    // 设置超时计时器
    this.resetTimeout();

    console.log('[SessionManager] Session created:', {
      address,
      expiresAt: new Date(this.session.expiresAt).toLocaleString('zh-CN'),
    });

    return this.session;
  }

  /**
   * 获取当前会话
   * @returns 会话数据或 null
   */
  static getSession(): SessionData | null {
    // 检查会话是否过期
    if (this.session && Date.now() > this.session.expiresAt) {
      console.log('[SessionManager] Session expired');
      this.clearSession();
      return null;
    }

    // 会话有效，重置超时计时器
    if (this.session) {
      this.resetTimeout();
    }

    return this.session;
  }

  /**
   * 获取密钥对
   */
  static getKeyPair(): KeyPair | null {
    const session = this.getSession();
    return session?.keyPair ?? null;
  }

  /**
   * 获取钱包服务实例
   */
  static getWalletService(): WalletService | null {
    const session = this.getSession();
    return session?.walletService ?? null;
  }

  /**
   * 获取钱包地址
   */
  static getAddress(): string | null {
    const session = this.getSession();
    return session?.address ?? null;
  }

  /**
   * 检查会话是否有效
   */
  static isSessionValid(): boolean {
    return this.getSession() !== null;
  }

  /**
   * 清除会话
   */
  static clearSession(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    if (this.session) {
      console.log('[SessionManager] Session cleared');
      this.session = null;
    }
  }

  /**
   * 重置超时计时器
   */
  private static resetTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      console.log('[SessionManager] Session timeout');
      this.clearSession();
    }, this.SESSION_DURATION);
  }

  /**
   * 获取会话剩余时间（毫秒）
   */
  static getRemainingTime(): number {
    if (!this.session) {
      return 0;
    }

    const remaining = this.session.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * 获取会话剩余时间（分钟）
   */
  static getRemainingMinutes(): number {
    return Math.floor(this.getRemainingTime() / 60000);
  }

  /**
   * 延长会话时间
   */
  static extendSession(): void {
    if (this.session) {
      this.session.expiresAt = Date.now() + this.SESSION_DURATION;
      this.resetTimeout();
      console.log('[SessionManager] Session extended');
    }
  }

  /**
   * 设置自定义会话时长
   * @param minutes 分钟数
   */
  static setSessionDuration(minutes: number): void {
    // 更新会话时长配置（注意：这是静态修改，需要重新编译）
    console.warn('[SessionManager] setSessionDuration() 仅在开发时使用');
  }
}
