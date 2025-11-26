# TON 链非托管钱包开发方案

## 目录
1. [技术架构](#技术架构)
2. [核心依赖库](#核心依赖库)
3. [密钥管理方案](#密钥管理方案)
4. [钱包功能实现](#钱包功能实现)
5. [安全考虑](#安全考虑)
6. [实施步骤](#实施步骤)

---

## 技术架构

### 整体架构图
```
┌─────────────────────────────────────────────────┐
│          Telegram Mini App UI Layer             │
│  (React + TypeScript + Tailwind CSS)            │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│         Wallet Service Layer                    │
│  - 密钥管理 (Key Management)                    │
│  - 交易构建 (Transaction Builder)               │
│  - 签名服务 (Signing Service)                   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│         Storage Layer                           │
│  - Encrypted LocalStorage (加密本地存储)       │
│  - IndexedDB (大数据存储)                       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│         TON Blockchain Layer                    │
│  - TON SDK (@ton/ton, @ton/crypto)             │
│  - TON Connect 2.0                              │
│  - TON API (https://tonapi.io)                  │
└─────────────────────────────────────────────────┘
```

---

## 核心依赖库

### 必需的 NPM 包

```bash
# TON 核心库
npm install @ton/ton @ton/crypto @ton/core

# TON Connect 2.0 (用于 DApp 集成)
npm install @tonconnect/sdk

# 加密库
npm install tweetnacl tweetnacl-util crypto-js

# BIP39 助记词生成
npm install bip39 @scure/bip32 @scure/bip39

# 工具库
npm install buffer bn.js
```

### 依赖说明

| 包名 | 用途 | 是否必需 |
|------|------|----------|
| `@ton/ton` | TON SDK 核心，处理交易、合约 | ✅ 必需 |
| `@ton/crypto` | TON 加密工具 | ✅ 必需 |
| `@ton/core` | TON 底层数据结构 | ✅ 必需 |
| `@tonconnect/sdk` | 连接 DApps | ⭐ 推荐 |
| `bip39` | 助记词生成和验证 | ✅ 必需 |
| `@scure/bip32` | HD 钱包路径派生 | ✅ 必需 |
| `tweetnacl` | 加密操作 | ✅ 必需 |
| `crypto-js` | 本地加密存储 | ✅ 必需 |

---

## 密钥管理方案

### 1. 助记词生成（推荐 BIP39）

```typescript
// src/services/wallet/mnemonic.ts
import * as bip39 from 'bip39';
import { mnemonicToWalletKey } from '@ton/crypto';

export class MnemonicService {
  /**
   * 生成 12 或 24 个单词的助记词
   */
  static generateMnemonic(wordCount: 12 | 24 = 24): string {
    const strength = wordCount === 24 ? 256 : 128;
    return bip39.generateMnemonic(strength);
  }

  /**
   * 验证助记词是否有效
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * 从助记词派生 TON 密钥对
   */
  static async deriveKeyPair(mnemonic: string, password?: string) {
    const words = mnemonic.split(' ');
    const keyPair = await mnemonicToWalletKey(words, password);
    return keyPair; // { publicKey, secretKey }
  }
}
```

### 2. 密钥加密存储

**重要**: 私钥绝不能明文存储！

```typescript
// src/services/wallet/storage.ts
import CryptoJS from 'crypto-js';

export class SecureStorage {
  private static WALLET_KEY = 'xnova_encrypted_wallet';
  private static SALT_KEY = 'xnova_salt';

  /**
   * 使用用户密码加密助记词
   */
  static encryptMnemonic(mnemonic: string, password: string): string {
    // 生成盐值（首次创建时）
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    localStorage.setItem(this.SALT_KEY, salt);

    // 使用 PBKDF2 派生加密密钥
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });

    // AES 加密
    const encrypted = CryptoJS.AES.encrypt(mnemonic, key.toString());
    return encrypted.toString();
  }

  /**
   * 解密助记词
   */
  static decryptMnemonic(encryptedMnemonic: string, password: string): string {
    const salt = localStorage.getItem(this.SALT_KEY);
    if (!salt) throw new Error('Salt not found');

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });

    const decrypted = CryptoJS.AES.decrypt(encryptedMnemonic, key.toString());
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 保存加密的钱包数据
   */
  static saveWallet(encryptedMnemonic: string): void {
    localStorage.setItem(this.WALLET_KEY, encryptedMnemonic);
  }

  /**
   * 获取加密的钱包数据
   */
  static getWallet(): string | null {
    return localStorage.getItem(this.WALLET_KEY);
  }

  /**
   * 删除钱包（危险操作）
   */
  static deleteWallet(): void {
    localStorage.removeItem(this.WALLET_KEY);
    localStorage.removeItem(this.SALT_KEY);
  }
}
```

### 3. 会话密钥管理

用户输入密码后，在内存中临时保存密钥对，避免频繁输入密码。

```typescript
// src/services/wallet/session.ts
import { KeyPair } from '@ton/crypto';

export class SessionManager {
  private static keyPair: KeyPair | null = null;
  private static sessionTimeout: NodeJS.Timeout | null = null;
  private static SESSION_DURATION = 15 * 60 * 1000; // 15分钟

  /**
   * 设置会话密钥对
   */
  static setKeyPair(keyPair: KeyPair): void {
    this.keyPair = keyPair;
    this.resetTimeout();
  }

  /**
   * 获取会话密钥对
   */
  static getKeyPair(): KeyPair | null {
    return this.keyPair;
  }

  /**
   * 清除会话
   */
  static clearSession(): void {
    this.keyPair = null;
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
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
      this.clearSession();
    }, this.SESSION_DURATION);
  }

  /**
   * 检查会话是否有效
   */
  static isSessionValid(): boolean {
    return this.keyPair !== null;
  }
}
```

---

## 钱包功能实现

### 1. 钱包初始化服务

```typescript
// src/services/wallet/wallet.ts
import { Address, TonClient, WalletContractV4, internal } from '@ton/ton';
import { KeyPair } from '@ton/crypto';

export class WalletService {
  private client: TonClient;
  private wallet: WalletContractV4 | null = null;

  constructor() {
    // 连接到 TON 主网
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: process.env.VITE_TON_API_KEY // 从环境变量读取
    });
  }

  /**
   * 从密钥对创建钱包实例
   */
  async createWallet(keyPair: KeyPair): Promise<Address> {
    this.wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey
    });

    return this.wallet.address;
  }

  /**
   * 获取钱包地址（用户友好格式）
   */
  getAddress(): string {
    if (!this.wallet) throw new Error('Wallet not initialized');
    return this.wallet.address.toString({
      bounceable: false,
      urlSafe: true
    });
  }

  /**
   * 获取钱包余额
   */
  async getBalance(): Promise<bigint> {
    if (!this.wallet) throw new Error('Wallet not initialized');
    const balance = await this.client.getBalance(this.wallet.address);
    return balance;
  }

  /**
   * 格式化余额（TON 为单位）
   */
  static formatBalance(balance: bigint): string {
    return (Number(balance) / 1e9).toFixed(4);
  }
}
```

### 2. 交易发送服务

```typescript
// src/services/wallet/transaction.ts
import { TonClient, WalletContractV4, internal, SendMode } from '@ton/ton';
import { KeyPair } from '@ton/crypto';

export class TransactionService {
  private client: TonClient;

  constructor(client: TonClient) {
    this.client = client;
  }

  /**
   * 发送 TON
   */
  async sendTON(
    wallet: WalletContractV4,
    keyPair: KeyPair,
    toAddress: string,
    amount: bigint,
    comment?: string
  ): Promise<void> {
    // 获取 seqno
    const seqno = await wallet.getSeqno(this.client);

    // 构建交易
    const transfer = wallet.createTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: toAddress,
          value: amount,
          body: comment || '',
          bounce: false
        })
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY
    });

    // 发送交易
    await this.client.sendExternalMessage(wallet, transfer);
  }

  /**
   * 估算交易费用
   */
  static estimateFee(amount: bigint): bigint {
    // TON 网络标准费用约 0.01-0.05 TON
    return BigInt(0.05 * 1e9); // 0.05 TON
  }
}
```

### 3. 交易历史查询

```typescript
// src/services/wallet/history.ts
import axios from 'axios';

export interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  fee: string;
  comment?: string;
  success: boolean;
}

export class TransactionHistory {
  private static TONAPI_BASE = 'https://tonapi.io/v2';

  /**
   * 获取交易历史
   */
  static async getTransactions(
    address: string,
    limit: number = 20
  ): Promise<Transaction[]> {
    try {
      const response = await axios.get(
        \`\${this.TONAPI_BASE}/blockchain/accounts/\${address}/transactions\`,
        {
          params: { limit }
        }
      );

      return response.data.transactions.map((tx: any) => ({
        hash: tx.hash,
        timestamp: tx.utime,
        from: tx.in_msg?.source || 'External',
        to: tx.out_msgs?.[0]?.destination || address,
        amount: tx.out_msgs?.[0]?.value || '0',
        fee: tx.fee,
        comment: tx.in_msg?.message || '',
        success: tx.success
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }
}
```

---

## 安全考虑

### ⚠️ 关键安全原则

1. **私钥永不离开设备**
   - ❌ 不要将私钥或助记词发送到服务器
   - ✅ 所有签名操作在客户端完成

2. **强密码保护**
   - ✅ 使用 PBKDF2 + 高迭代次数 (10000+)
   - ✅ 生物识别（如果设备支持）
   - ✅ 密码强度检查

3. **会话管理**
   - ✅ 15 分钟无操作自动锁定
   - ✅ 敏感操作需要重新验证密码
   - ✅ 离开页面清除内存中的密钥

4. **助记词备份**
   - ⚠️ 用户必须手动抄写助记词
   - ❌ 不要截图、不要云端备份
   - ✅ 提供助记词验证环节

5. **防钓鱼**
   - ✅ 显示完整的交易详情
   - ✅ 二次确认大额交易
   - ✅ 地址簿功能

### 安全检查清单

```markdown
- [ ] 助记词生成使用安全的随机源
- [ ] 私钥使用 AES-256 加密存储
- [ ] 使用 PBKDF2 派生加密密钥
- [ ] 会话超时自动锁定
- [ ] 敏感操作需要密码验证
- [ ] 交易签名前显示详细信息
- [ ] 大额交易二次确认
- [ ] 备份助记词强制用户手抄
- [ ] 测试网测试后再上主网
- [ ] 代码审计和安全测试
```

---

## 实施步骤

### 阶段 1: 基础设施搭建（1-2 周）

#### 1.1 安装依赖
```bash
npm install @ton/ton @ton/crypto @ton/core bip39 @scure/bip32 crypto-js tweetnacl
```

#### 1.2 创建服务目录结构
```
src/services/wallet/
├── mnemonic.ts         # 助记词生成和验证
├── storage.ts          # 加密存储
├── session.ts          # 会话管理
├── wallet.ts           # 钱包核心功能
├── transaction.ts      # 交易处理
├── history.ts          # 交易历史
└── index.ts            # 统一导出
```

#### 1.3 实现核心加密功能
- MnemonicService: 助记词生成
- SecureStorage: 加密存储
- SessionManager: 会话管理

### 阶段 2: 钱包核心功能（2-3 周）

#### 2.1 创建钱包流程
```typescript
// 完整的创建流程
1. 生成助记词 (24 words)
2. 显示助记词给用户备份
3. 验证用户已备份（要求输入部分单词）
4. 设置钱包密码
5. 加密保存助记词
6. 派生密钥对
7. 创建钱包合约实例
8. 显示钱包地址
```

#### 2.2 导入钱包流程
```typescript
// 导入已有钱包
1. 输入助记词
2. 验证助记词有效性
3. 设置钱包密码
4. 加密保存助记词
5. 派生密钥对
6. 恢复钱包地址
```

#### 2.3 钱包主页功能
```typescript
- 显示 TON 余额
- 显示钱包地址（带复制功能）
- 显示交易历史
- 接收/发送按钮
```

### 阶段 3: 交易功能（1-2 周）

#### 3.1 发送 TON
```typescript
流程:
1. 输入收款地址（支持扫码）
2. 输入金额
3. 预览交易（显示手续费）
4. 确认并输入密码
5. 签名并广播交易
6. 显示交易哈希
7. 追踪交易状态
```

#### 3.2 接收 TON
```typescript
功能:
- 显示钱包地址二维码
- 复制地址功能
- 生成支付链接
```

### 阶段 4: TON Connect 集成（1 周）

#### 4.1 实现 TON Connect 2.0
```typescript
// 支持连接到 DApps
1. 实现连接协议
2. 显示连接请求
3. 用户授权
4. 签名交易请求
5. 断开连接
```

### 阶段 5: 测试和优化（2 周）

#### 5.1 测试环境
```bash
# 使用 TON 测试网
endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'

# 获取测试币
https://t.me/testgiver_ton_bot
```

#### 5.2 测试用例
```markdown
- [ ] 创建新钱包
- [ ] 导入钱包
- [ ] 显示余额
- [ ] 发送 TON
- [ ] 接收 TON
- [ ] 查看交易历史
- [ ] 密码验证
- [ ] 会话超时
- [ ] 助记词备份和恢复
- [ ] TON Connect 连接
```

---

## 环境变量配置

创建 `.env` 文件:

```bash
# TON 网络配置
VITE_TON_NETWORK=mainnet  # mainnet | testnet
VITE_TON_API_KEY=your_toncenter_api_key
VITE_TONAPI_KEY=your_tonapi_key

# 功能开关
VITE_ENABLE_TESTNET=false
VITE_ENABLE_TON_CONNECT=true

# 安全配置
VITE_SESSION_TIMEOUT=900000  # 15分钟（毫秒）
VITE_PASSWORD_MIN_LENGTH=8
```

---

## 用户界面建议

### 关键页面

1. **创建/导入钱包页**
   - 创建新钱包按钮
   - 导入已有钱包按钮

2. **助记词备份页**
   - 显示 24 个单词
   - 警告提示
   - "我已备份"确认

3. **助记词验证页**
   - 随机选择几个单词让用户填写

4. **钱包主页**
   - TON 余额（大字显示）
   - 钱包地址
   - 接收/发送按钮
   - 交易历史列表

5. **发送页面**
   - 收款地址输入
   - 金额输入
   - 交易费用预览
   - 确认按钮

6. **接收页面**
   - 钱包地址二维码
   - 地址文本（可复制）

7. **交易详情页**
   - 交易哈希
   - 时间
   - 金额
   - 手续费
   - 状态

---

## 推荐的开发工具

### API 和工具

1. **TON Center API** - https://toncenter.com
   - 免费 API Key
   - 主网和测试网支持

2. **TON API (tonapi.io)** - https://tonapi.io
   - 更现代的 REST API
   - 更好的交易历史查询

3. **TON Explorer** - https://tonscan.org
   - 查看交易
   - 调试工具

4. **测试水龙头** - https://t.me/testgiver_ton_bot
   - 获取测试网 TON

### VSCode 插件

- TON Development Kit
- Solidity (如果开发智能合约)

---

## 常见问题 FAQ

### Q1: 助记词数量选择 12 还是 24？
**A**: 推荐使用 24 个单词，更安全。TON 生态推荐 24 词。

### Q2: 如何处理用户忘记密码？
**A**: 无法找回！这是非托管钱包的特性。只能通过助记词重新导入。

### Q3: 需要自己的后端服务器吗？
**A**: 不需要！完全客户端实现，只需要调用 TON 公共 API。

### Q4: 如何实现多账户？
**A**: 使用 BIP44 路径派生：\`m/44'/607'/0'/0/index\`（TON 的 coin_type 是 607）

### Q5: 交易确认需要多久？
**A**: TON 网络很快，通常 5-10 秒完成确认。

---

## 参考资料

### 官方文档
- TON 官方文档: https://docs.ton.org
- TON SDK GitHub: https://github.com/ton-org/ton
- TON Connect 文档: https://github.com/ton-connect/sdk

### 示例项目
- MyTonWallet (开源): https://github.com/mytonwalletorg/mytonwallet
- Tonkeeper: https://tonkeeper.com
- TON Wallet Example: https://github.com/ton-community/wallet-contract

### 安全最佳实践
- OWASP Mobile Security: https://owasp.org/www-project-mobile-security/
- Cryptocurrency Wallet Security: https://github.com/ethereum/wiki/wiki/Safety

---

## 下一步行动

### 立即开始

1. ✅ 安装核心依赖
2. ✅ 创建服务目录结构
3. ✅ 实现 MnemonicService
4. ✅ 实现 SecureStorage
5. ✅ 创建基础 UI 组件

### 本周目标

- [ ] 完成助记词生成和存储
- [ ] 实现密钥派生
- [ ] 创建钱包实例
- [ ] 显示钱包地址和余额

### 本月目标

- [ ] 完成发送/接收功能
- [ ] 实现交易历史
- [ ] TON Connect 集成
- [ ] 完成测试网测试

---

**准备好开始了吗？** 从安装依赖开始，一步一步实现你的 TON 钱包！ 🚀
