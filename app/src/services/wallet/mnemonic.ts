/**
 * MnemonicService - 助记词管理服务
 *
 * 功能：
 * 1. 生成安全的助记词（12或24个单词）
 * 2. 验证助记词的有效性
 * 3. 从助记词派生 TON 密钥对
 * 4. 从助记词派生钱包地址
 */

import * as bip39 from 'bip39';
import { mnemonicToWalletKey } from '@ton/crypto';
import { KeyPair } from '@ton/crypto';

export interface MnemonicInfo {
  mnemonic: string;
  wordCount: number;
  language: string;
}

export interface KeyPairWithMnemonic {
  publicKey: Buffer;
  secretKey: Buffer;
  mnemonic: string;
}

export class MnemonicService {
  /**
   * 生成助记词
   * @param wordCount 单词数量，支持 12 或 24（推荐 24）
   * @returns 助记词字符串，单词之间用空格分隔
   *
   * @example
   * const mnemonic = MnemonicService.generateMnemonic(24);
   * console.log(mnemonic);
   * // 输出: "abandon abandon abandon ... art art"
   */
  static generateMnemonic(wordCount: 12 | 24 = 24): string {
    // 计算熵的位数：12词=128位，24词=256位
    const strength = wordCount === 24 ? 256 : 128;

    // 使用 bip39 生成助记词
    const mnemonic = bip39.generateMnemonic(strength);

    return mnemonic;
  }

  /**
   * 生成助记词（带详细信息）
   * @param wordCount 单词数量
   * @returns 包含助记词和元信息的对象
   */
  static generateMnemonicWithInfo(wordCount: 12 | 24 = 24): MnemonicInfo {
    const mnemonic = this.generateMnemonic(wordCount);

    return {
      mnemonic,
      wordCount: mnemonic.split(' ').length,
      language: 'english'
    };
  }

  /**
   * 验证助记词是否有效
   * @param mnemonic 助记词字符串
   * @returns 如果有效返回 true，否则返回 false
   *
   * @example
   * const isValid = MnemonicService.validateMnemonic(mnemonic);
   * if (!isValid) {
   *   throw new Error('Invalid mnemonic');
   * }
   */
  static validateMnemonic(mnemonic: string): boolean {
    // 去除首尾空格并转为小写
    const normalizedMnemonic = mnemonic.trim().toLowerCase();

    // 使用 bip39 验证
    return bip39.validateMnemonic(normalizedMnemonic);
  }

  /**
   * 规范化助记词（去除多余空格、转小写）
   * @param mnemonic 原始助记词
   * @returns 规范化后的助记词
   */
  static normalizeMnemonic(mnemonic: string): string {
    return mnemonic
      .trim()
      .toLowerCase()
      .split(/\s+/) // 按空白字符分割
      .join(' ');   // 用单个空格连接
  }

  /**
   * 从助记词派生 TON 密钥对
   * @param mnemonic 助记词
   * @param password 可选的密码（用于额外保护）
   * @returns TON 密钥对 { publicKey, secretKey }
   *
   * @example
   * const keyPair = await MnemonicService.deriveKeyPair(mnemonic);
   * console.log('Public Key:', keyPair.publicKey.toString('hex'));
   */
  static async deriveKeyPair(
    mnemonic: string,
    password?: string
  ): Promise<KeyPair> {
    // 验证助记词
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // 规范化助记词
    const normalizedMnemonic = this.normalizeMnemonic(mnemonic);

    // 将助记词分割为单词数组
    const words = normalizedMnemonic.split(' ');

    // 使用 TON 的官方方法派生密钥对
    const keyPair = await mnemonicToWalletKey(words, password);

    return keyPair;
  }

  /**
   * 从助记词派生密钥对（带助记词返回）
   * @param mnemonic 助记词
   * @param password 可选的密码
   * @returns 包含密钥对和助记词的对象
   */
  static async deriveKeyPairWithMnemonic(
    mnemonic: string,
    password?: string
  ): Promise<KeyPairWithMnemonic> {
    const keyPair = await this.deriveKeyPair(mnemonic, password);
    const normalizedMnemonic = this.normalizeMnemonic(mnemonic);

    return {
      publicKey: keyPair.publicKey,
      secretKey: keyPair.secretKey,
      mnemonic: normalizedMnemonic
    };
  }

  /**
   * 获取助记词的单词列表
   * @param mnemonic 助记词字符串
   * @returns 单词数组
   */
  static getWords(mnemonic: string): string[] {
    return this.normalizeMnemonic(mnemonic).split(' ');
  }

  /**
   * 从单词数组重建助记词
   * @param words 单词数组
   * @returns 助记词字符串
   */
  static fromWords(words: string[]): string {
    return words.join(' ').toLowerCase();
  }

  /**
   * 验证助记词的单词数量
   * @param mnemonic 助记词
   * @returns 如果单词数量有效（12或24）返回 true
   */
  static hasValidWordCount(mnemonic: string): boolean {
    const wordCount = this.getWords(mnemonic).length;
    return wordCount === 12 || wordCount === 24;
  }

  /**
   * 获取助记词的单词数量
   * @param mnemonic 助记词
   * @returns 单词数量
   */
  static getWordCount(mnemonic: string): number {
    return this.getWords(mnemonic).length;
  }

  /**
   * 检查单词是否在 BIP39 词库中
   * @param word 要检查的单词
   * @returns 如果在词库中返回 true
   */
  static isValidWord(word: string): boolean {
    const wordlist = bip39.wordlists.english;
    return wordlist.includes(word.toLowerCase());
  }

  /**
   * 获取 BIP39 英文词库
   * @returns 包含 2048 个单词的数组
   */
  static getWordlist(): string[] {
    return bip39.wordlists.english;
  }

  /**
   * 根据前缀搜索单词（用于自动补全）
   * @param prefix 单词前缀
   * @param limit 返回结果的最大数量
   * @returns 匹配的单词数组
   *
   * @example
   * const words = MnemonicService.searchWords('aba', 5);
   * // ['abandon', 'ability', ...]
   */
  static searchWords(prefix: string, limit: number = 10): string[] {
    if (!prefix) return [];

    const wordlist = this.getWordlist();
    const lowerPrefix = prefix.toLowerCase();

    return wordlist
      .filter(word => word.startsWith(lowerPrefix))
      .slice(0, limit);
  }

  /**
   * 创建完整的钱包（生成助记词 + 派生密钥对）
   * @param wordCount 助记词单词数量
   * @param password 可选的密码
   * @returns 包含助记词和密钥对的对象
   *
   * @example
   * const wallet = await MnemonicService.createWallet(24);
   * console.log('Mnemonic:', wallet.mnemonic);
   * console.log('Public Key:', wallet.publicKey.toString('hex'));
   */
  static async createWallet(
    wordCount: 12 | 24 = 24,
    password?: string
  ): Promise<KeyPairWithMnemonic> {
    // 生成助记词
    const mnemonic = this.generateMnemonic(wordCount);

    // 派生密钥对
    return await this.deriveKeyPairWithMnemonic(mnemonic, password);
  }

  /**
   * 恢复钱包（从助记词派生密钥对）
   * @param mnemonic 助记词
   * @param password 可选的密码
   * @returns 包含助记词和密钥对的对象
   *
   * @example
   * const wallet = await MnemonicService.restoreWallet(mnemonic);
   * console.log('Wallet restored successfully');
   */
  static async restoreWallet(
    mnemonic: string,
    password?: string
  ): Promise<KeyPairWithMnemonic> {
    return await this.deriveKeyPairWithMnemonic(mnemonic, password);
  }
}
