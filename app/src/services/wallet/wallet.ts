/**
 * WalletService - TON 钱包服务
 *
 * 功能：
 * 1. 从密钥对创建 TON 钱包实例
 * 2. 获取钱包地址
 * 3. 查询链上余额
 * 4. 格式化余额显示
 */

import { TonClient, WalletContractV4, Address } from '@ton/ton';
import { KeyPair } from '@ton/crypto';

export class WalletService {
  private client: TonClient;
  private wallet: WalletContractV4 | null = null;
  private address: Address | null = null;

  constructor() {
    // 连接到 TON 主网
    // 注意：testnet 使用 'https://testnet.toncenter.com/api/v2/jsonRPC'
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: import.meta.env.VITE_TON_API_KEY || '', // 从环境变量读取 API Key
    });

    console.log('[WalletService] Initialized with endpoint:', 'https://toncenter.com/api/v2/jsonRPC');
  }

  /**
   * 从密钥对创建钱包实例
   * @param keyPair TON 密钥对
   * @returns 钱包地址
   */
  createWallet(keyPair: KeyPair): Address {
    // 使用 WalletContractV4 (最新版本)
    this.wallet = WalletContractV4.create({
      workchain: 0, // 主链
      publicKey: keyPair.publicKey,
    });

    this.address = this.wallet.address;

    console.log('[WalletService] Wallet created:', {
      address: this.address.toString(),
      publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    });

    return this.address;
  }

  /**
   * 获取钱包地址（用户友好格式）
   * @param bounceable 是否可反弹（默认 false，用于用户转账）
   * @returns 钱包地址字符串
   *
   * @example
   * const address = walletService.getAddress();
   * console.log(address); // UQB...xyz
   */
  getAddress(bounceable: boolean = false): string {
    if (!this.address) {
      throw new Error('Wallet not initialized. Call createWallet() first.');
    }

    return this.address.toString({
      bounceable,
      urlSafe: true,
    });
  }

  /**
   * 获取原始地址对象
   */
  getAddressObject(): Address {
    if (!this.address) {
      throw new Error('Wallet not initialized. Call createWallet() first.');
    }

    return this.address;
  }

  /**
   * 查询钱包余额（从链上获取）
   * @returns 余额（nanoTON 单位，1 TON = 10^9 nanoTON）
   *
   * @example
   * const balance = await walletService.getBalance();
   * console.log('Balance:', balance); // 1000000000n (1 TON)
   */
  async getBalance(): Promise<bigint> {
    if (!this.address) {
      throw new Error('Wallet not initialized. Call createWallet() first.');
    }

    try {
      const balance = await this.client.getBalance(this.address);
      console.log('[WalletService] Balance fetched:', balance.toString(), 'nanoTON');
      return balance;
    } catch (error) {
      console.error('[WalletService] Failed to fetch balance:', error);
      throw new Error('Failed to fetch balance from blockchain');
    }
  }

  /**
   * 格式化余额（转换为 TON 单位）
   * @param balance nanoTON 余额
   * @param decimals 小数位数（默认 2）
   * @returns 格式化的余额字符串
   *
   * @example
   * const formatted = WalletService.formatBalance(1500000000n, 4);
   * console.log(formatted); // "1.5000"
   */
  static formatBalance(balance: bigint, decimals: number = 2): string {
    // 1 TON = 10^9 nanoTON
    const tonBalance = Number(balance) / 1e9;
    return tonBalance.toFixed(decimals);
  }

  /**
   * 格式化余额（带单位）
   * @param balance nanoTON 余额
   * @returns 格式化的余额字符串（带 TON 单位）
   *
   * @example
   * const formatted = WalletService.formatBalanceWithUnit(1500000000n);
   * console.log(formatted); // "1.50 TON"
   */
  static formatBalanceWithUnit(balance: bigint): string {
    return `${this.formatBalance(balance)} TON`;
  }

  /**
   * 将 TON 转换为 nanoTON
   * @param ton TON 数量
   * @returns nanoTON 数量
   *
   * @example
   * const nanoTon = WalletService.toNano(1.5);
   * console.log(nanoTon); // 1500000000n
   */
  static toNano(ton: number): bigint {
    return BigInt(Math.floor(ton * 1e9));
  }

  /**
   * 检查钱包是否已激活（是否有余额或交易记录）
   * @returns 如果余额 > 0 则返回 true
   */
  async isActive(): Promise<boolean> {
    try {
      const balance = await this.getBalance();
      return balance > 0n;
    } catch (error) {
      console.error('[WalletService] Failed to check wallet status:', error);
      return false;
    }
  }

  /**
   * 获取钱包状态信息（包含余额和激活状态）
   * @returns 钱包状态对象
   */
  async getWalletInfo() {
    if (!this.address) {
      throw new Error('Wallet not initialized');
    }

    try {
      const balance = await this.getBalance();
      const isActive = balance > 0n;

      return {
        address: this.getAddress(),
        addressRaw: this.getAddress(true),
        balance: balance.toString(),
        balanceFormatted: WalletService.formatBalance(balance),
        isActive,
      };
    } catch (error) {
      console.error('[WalletService] Failed to get wallet info:', error);
      throw error;
    }
  }

  /**
   * 获取钱包的 seqno (序列号，用于发送交易)
   * @returns seqno 数字
   */
  async getSeqno(): Promise<number> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      // 使用 client.open() 创建 provider 来调用合约方法
      const contract = this.client.open(this.wallet);
      const seqno = await contract.getSeqno();
      console.log('[WalletService] Current seqno:', seqno);
      return seqno;
    } catch (error) {
      console.error('[WalletService] Failed to get seqno:', error);
      // 如果钱包未激活，seqno 为 0
      return 0;
    }
  }

  /**
   * 切换到测试网
   */
  useTestnet() {
    this.client = new TonClient({
      endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
      apiKey: import.meta.env.VITE_TON_API_KEY || '',
    });
    console.log('[WalletService] Switched to testnet');
  }

  /**
   * 切换到主网
   */
  useMainnet() {
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: import.meta.env.VITE_TON_API_KEY || '',
    });
    console.log('[WalletService] Switched to mainnet');
  }

  /**
   * 获取当前使用的网络
   */
  getCurrentNetwork(): 'mainnet' | 'testnet' {
    const endpoint = (this.client as any).parameters.endpoint;
    return endpoint.includes('testnet') ? 'testnet' : 'mainnet';
  }
}
