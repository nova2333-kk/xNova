/**
 * SecureStorage - 加密存储服务
 *
 * 功能：
 * 1. 使用 AES-256 加密助记词
 * 2. 使用 PBKDF2 从用户密码派生加密密钥
 * 3. 安全地保存和读取加密的钱包数据
 * 4. 管理加密盐值
 */

import CryptoJS from 'crypto-js';
import type { EncryptedWalletData } from './types';

export class SecureStorage {
  // LocalStorage 键名
  private static readonly WALLET_KEY = 'xnova_encrypted_wallet';
  private static readonly SALT_KEY = 'xnova_salt';

  // 加密配置
  private static readonly PBKDF2_ITERATIONS = 10000; // PBKDF2 迭代次数
  private static readonly KEY_SIZE = 256 / 32; // 256 位密钥
  private static readonly CURRENT_VERSION = 1; // 数据格式版本号

  /**
   * 使用用户密码加密助记词
   * @param mnemonic 明文助记词
   * @param password 用户密码
   * @returns 加密后的助记词字符串
   *
   * @example
   * const encrypted = SecureStorage.encryptMnemonic(mnemonic, password);
   * console.log('Encrypted:', encrypted);
   */
  static encryptMnemonic(mnemonic: string, password: string): string {
    if (!mnemonic || !password) {
      throw new Error('Mnemonic and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // 获取或生成盐值
    let salt = localStorage.getItem(this.SALT_KEY);
    if (!salt) {
      // 首次创建时生成新的盐值（128位）
      salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      localStorage.setItem(this.SALT_KEY, salt);
    }

    // 使用 PBKDF2 从密码派生加密密钥（salt 在此处保证不为 null）
    const key = CryptoJS.PBKDF2(password, salt as string, {
      keySize: this.KEY_SIZE,
      iterations: this.PBKDF2_ITERATIONS
    });

    // 使用 AES-256 加密助记词
    const encrypted = CryptoJS.AES.encrypt(mnemonic, key.toString());

    return encrypted.toString();
  }

  /**
   * 使用用户密码解密助记词
   * @param encryptedMnemonic 加密的助记词
   * @param password 用户密码
   * @returns 明文助记词
   *
   * @example
   * try {
   *   const mnemonic = SecureStorage.decryptMnemonic(encrypted, password);
   *   console.log('Decrypted:', mnemonic);
   * } catch (error) {
   *   console.error('Wrong password or corrupted data');
   * }
   */
  static decryptMnemonic(encryptedMnemonic: string, password: string): string {
    if (!encryptedMnemonic || !password) {
      throw new Error('Encrypted mnemonic and password are required');
    }

    // 获取盐值
    const salt = localStorage.getItem(this.SALT_KEY);
    if (!salt) {
      throw new Error('Salt not found. Wallet data may be corrupted.');
    }

    // 使用 PBKDF2 派生解密密钥
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE,
      iterations: this.PBKDF2_ITERATIONS
    });

    try {
      // 使用 AES-256 解密
      const decrypted = CryptoJS.AES.decrypt(encryptedMnemonic, key.toString());
      const mnemonicStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!mnemonicStr) {
        throw new Error('Decryption failed');
      }

      return mnemonicStr;
    } catch (error) {
      throw new Error('Failed to decrypt mnemonic. Wrong password or corrupted data.');
    }
  }

  /**
   * 保存加密的钱包数据
   * @param mnemonic 明文助记词
   * @param password 用户密码
   *
   * @example
   * SecureStorage.saveWallet(mnemonic, password);
   * console.log('Wallet saved successfully');
   */
  static saveWallet(mnemonic: string, password: string): void {
    const encryptedMnemonic = this.encryptMnemonic(mnemonic, password);
    const salt = localStorage.getItem(this.SALT_KEY);

    if (!salt) {
      throw new Error('Salt generation failed');
    }

    const walletData: EncryptedWalletData = {
      encryptedMnemonic,
      salt,
      version: this.CURRENT_VERSION,
      createdAt: Date.now()
    };

    // 保存为 JSON 字符串
    localStorage.setItem(this.WALLET_KEY, JSON.stringify(walletData));
  }

  /**
   * 获取加密的钱包数据
   * @returns 加密的钱包数据对象，如果不存在返回 null
   *
   * @example
   * const wallet = SecureStorage.getWallet();
   * if (wallet) {
   *   console.log('Wallet created at:', new Date(wallet.createdAt));
   * }
   */
  static getWallet(): EncryptedWalletData | null {
    const dataStr = localStorage.getItem(this.WALLET_KEY);

    if (!dataStr) {
      return null;
    }

    try {
      const data = JSON.parse(dataStr) as EncryptedWalletData;

      // 验证数据完整性
      if (!data.encryptedMnemonic || !data.salt || !data.version || !data.createdAt) {
        throw new Error('Invalid wallet data structure');
      }

      return data;
    } catch (error) {
      console.error('Failed to parse wallet data:', error);
      return null;
    }
  }

  /**
   * 检查是否存在钱包
   * @returns 如果存在钱包返回 true
   *
   * @example
   * if (SecureStorage.hasWallet()) {
   *   console.log('Wallet exists');
   * }
   */
  static hasWallet(): boolean {
    return this.getWallet() !== null;
  }

  /**
   * 验证密码是否正确
   * @param password 用户密码
   * @returns 如果密码正确返回 true
   *
   * @example
   * if (SecureStorage.verifyPassword(password)) {
   *   console.log('Password is correct');
   * } else {
   *   console.log('Wrong password');
   * }
   */
  static verifyPassword(password: string): boolean {
    const walletData = this.getWallet();

    if (!walletData) {
      return false;
    }

    try {
      const decrypted = this.decryptMnemonic(walletData.encryptedMnemonic, password);
      return decrypted.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 解锁钱包（解密助记词）
   * @param password 用户密码
   * @returns 明文助记词
   *
   * @example
   * try {
   *   const mnemonic = SecureStorage.unlockWallet(password);
   *   console.log('Wallet unlocked');
   * } catch (error) {
   *   console.error('Failed to unlock wallet');
   * }
   */
  static unlockWallet(password: string): string {
    const walletData = this.getWallet();

    if (!walletData) {
      throw new Error('No wallet found');
    }

    return this.decryptMnemonic(walletData.encryptedMnemonic, password);
  }

  /**
   * 删除钱包（危险操作）
   * ⚠️ 这将永久删除所有钱包数据，无法恢复！
   *
   * @example
   * if (confirm('Are you sure?')) {
   *   SecureStorage.deleteWallet();
   * }
   */
  static deleteWallet(): void {
    localStorage.removeItem(this.WALLET_KEY);
    localStorage.removeItem(this.SALT_KEY);
  }

  /**
   * 更改钱包密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   *
   * @example
   * try {
   *   SecureStorage.changePassword(oldPassword, newPassword);
   *   console.log('Password changed successfully');
   * } catch (error) {
   *   console.error('Failed to change password');
   * }
   */
  static changePassword(oldPassword: string, newPassword: string): void {
    if (!oldPassword || !newPassword) {
      throw new Error('Old and new passwords are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // 1. 使用旧密码解锁钱包
    const mnemonic = this.unlockWallet(oldPassword);

    // 2. 删除旧数据
    this.deleteWallet();

    // 3. 使用新密码保存
    this.saveWallet(mnemonic, newPassword);
  }

  /**
   * 导出钱包数据（用于备份）
   * @returns 钱包数据的 JSON 字符串
   *
   * @example
   * const backupData = SecureStorage.exportWallet();
   * // 用户可以保存这个字符串作为备份
   */
  static exportWallet(): string {
    const walletData = this.getWallet();

    if (!walletData) {
      throw new Error('No wallet found');
    }

    return JSON.stringify(walletData, null, 2);
  }

  /**
   * 导入钱包数据（用于恢复）
   * @param backupData 钱包备份数据的 JSON 字符串
   *
   * @example
   * try {
   *   SecureStorage.importWallet(backupData);
   *   console.log('Wallet imported successfully');
   * } catch (error) {
   *   console.error('Failed to import wallet');
   * }
   */
  static importWallet(backupData: string): void {
    try {
      const data = JSON.parse(backupData) as EncryptedWalletData;

      // 验证数据完整性
      if (!data.encryptedMnemonic || !data.salt || !data.version || !data.createdAt) {
        throw new Error('Invalid backup data structure');
      }

      // 保存钱包数据
      localStorage.setItem(this.WALLET_KEY, JSON.stringify(data));
      localStorage.setItem(this.SALT_KEY, data.salt);
    } catch (error) {
      throw new Error('Failed to import wallet: Invalid backup data');
    }
  }

  /**
   * 获取钱包创建时间
   * @returns 创建时间的时间戳，如果不存在返回 null
   *
   * @example
   * const timestamp = SecureStorage.getWalletCreatedAt();
   * if (timestamp) {
   *   console.log('Created at:', new Date(timestamp));
   * }
   */
  static getWalletCreatedAt(): number | null {
    const walletData = this.getWallet();
    return walletData?.createdAt ?? null;
  }

  /**
   * 获取钱包数据版本
   * @returns 版本号，如果不存在返回 null
   */
  static getWalletVersion(): number | null {
    const walletData = this.getWallet();
    return walletData?.version ?? null;
  }

  /**
   * 清除所有钱包相关的 LocalStorage 数据
   * ⚠️ 危险操作：这将删除所有钱包数据
   */
  static clearAll(): void {
    this.deleteWallet();
  }
}
