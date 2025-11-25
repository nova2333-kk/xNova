/**
 * TON 钱包服务 - 类型定义
 */

import { KeyPair } from '@ton/crypto';

/**
 * 助记词信息
 */
export interface MnemonicInfo {
  mnemonic: string;
  wordCount: number;
  language: string;
}

/**
 * 密钥对（带助记词）
 */
export interface KeyPairWithMnemonic extends KeyPair {
  mnemonic: string;
}

/**
 * 钱包信息
 */
export interface WalletInfo {
  address: string;
  publicKey: string;
  balance?: string;
  isActive: boolean;
}

/**
 * 加密的钱包数据
 */
export interface EncryptedWalletData {
  encryptedMnemonic: string;
  salt: string;
  version: number;
  createdAt: number;
}

/**
 * 交易信息
 */
export interface TransactionInfo {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  fee: string;
  comment?: string;
  success: boolean;
}

/**
 * 交易请求
 */
export interface TransactionRequest {
  to: string;
  amount: bigint;
  comment?: string;
}

/**
 * 会话信息
 */
export interface SessionInfo {
  keyPair: KeyPair;
  address: string;
  expiresAt: number;
}
