# 钱包创建流程说明

## 完整流程

```
┌─────────────────────────────────────────────────────────────┐
│                     钱包创建完整流程                          │
└─────────────────────────────────────────────────────────────┘

第一次进入应用
    │
    ↓
检查本地是否有钱包 (SecureStorage.hasWallet())
    │
    ├── 有钱包 → 显示首页
    │
    └── 没有钱包 → 显示创建钱包页面
            │
            │ 用户点击"创建钱包"
            ↓
        【步骤 1】CreateWalletPage
            │
            │ handleCreateWalletClick()
            │ - 生成 24 词助记词
            │ - 保存到临时变量 tempMnemonic
            │
            ↓
        【步骤 2】SetWalletPasswordPage
            │
            │ 用户输入 6 位数字密码
            │
            │ handlePasswordSet(password)
            │ - 保存密码到临时变量 tempPassword
            │
            ↓
        【步骤 3】BackupMnemonicPage
            │
            │ 显示助记词（24个单词）
            │ 提示用户备份
            │
            │ 用户确认已备份
            │
            │ handleBackupConfirmed()
            │ - SecureStorage.saveWallet(mnemonic, password)
            │   ├── 使用 PBKDF2 从密码派生加密密钥
            │   ├── 使用 AES-256 加密助记词
            │   └── 保存到 localStorage
            │ - 清理临时数据
            │ - 更新 hasWallet 状态
            │
            ↓
        【完成】跳转到钱包页面
            │
            ↓
        显示钱包地址、余额等信息
```

## 关键检查点

### 1. 钱包存在检查
```typescript
// App.tsx 初始化时
const [hasWallet, setHasWallet] = useState<boolean>(() => {
  return SecureStorage.hasWallet();
});
```

**检查逻辑：**
- 使用 `SecureStorage.hasWallet()` 检查 localStorage 中是否存在加密的钱包数据
- 如果存在 → `hasWallet = true` → 显示首页
- 如果不存在 → `hasWallet = false` → 显示创建钱包页面

### 2. 防止重复创建
```typescript
// 检查到已有钱包时
if (SecureStorage.hasWallet()) {
  alert('您已经创建过钱包了！');
  return;
}
```

**安全措施：**
- 在创建钱包流程的每个步骤都可以检查是否已有钱包
- 避免用户意外覆盖现有钱包
- 重置钱包需要用户明确确认（开发模式下）

## 数据流转

### 临时数据（创建过程中）
```typescript
// 仅在内存中存储，流程完成后清理
const [tempMnemonic, setTempMnemonic] = useState<string>('');
const [tempPassword, setTempPassword] = useState<string>('');
```

### 持久化数据（加密存储）
```typescript
// 存储在 localStorage 中，经过加密
{
  "xnova_encrypted_wallet": {
    "encryptedMnemonic": "U2FsdGVkX1+...",  // AES-256 加密
    "salt": "a1b2c3d4...",                   // PBKDF2 盐值
    "version": 1,                            // 数据格式版本
    "createdAt": 1732557600000               // 创建时间戳
  },
  "xnova_salt": "a1b2c3d4..."               // 加密盐值（独立存储）
}
```

## 安全特性

### 1. 加密算法
- **AES-256**: 对称加密算法，用于加密助记词
- **PBKDF2**: 密钥派生函数，10000次迭代
- **随机盐值**: 128位随机生成，防止彩虹表攻击

### 2. 密码要求
- 最小长度：6位数字（当前实现）
- 可扩展为更复杂的密码策略

### 3. 助记词安全
- 生成后立即显示给用户备份
- 用户必须确认已备份才能继续
- 加密后存储，明文助记词不会保存

### 4. 防止数据泄露
- 临时数据仅在内存中
- 流程完成后清理所有临时变量
- 密码不会被记录或打印

## 错误处理

### 保存失败
```typescript
try {
  SecureStorage.saveWallet(tempMnemonic, tempPassword);
  // 成功处理...
} catch (error) {
  console.error('❌ Failed to save wallet:', error);
  alert('保存钱包失败，请重试');
  // 不清理临时数据，允许用户重试
}
```

### 页面意外关闭
- 如果用户在流程中途关闭应用：
  - 临时数据丢失（内存变量）
  - 钱包未创建（hasWallet 仍为 false）
  - 用户需要重新开始创建流程
  - 这是预期行为，确保钱包创建的完整性

## 开发调试

### 重置钱包（仅开发模式）
```typescript
const handleResetWallet = () => {
  if (import.meta.env.DEV) {
    if (confirm('⚠️ 确定要重置钱包吗？')) {
      SecureStorage.deleteWallet();
      setHasWallet(false);
      setView('createWallet');
    }
  }
};
```

**按钮位置：** 右下角悬浮按钮 "🔄 重置钱包"

**安全限制：**
- 仅在 `DEV` 模式下显示
- 需要用户确认
- 生产环境不会出现此按钮

## 测试场景

### 1. 正常创建流程
```
1. 访问应用 → 显示创建钱包页面
2. 点击"创建钱包" → 进入密码设置
3. 输入 6 位密码 → 显示助记词
4. 确认备份 → 保存钱包
5. 跳转到钱包页面 ✅
```

### 2. 已有钱包
```
1. 访问应用 → 检测到已有钱包
2. 直接显示首页 ✅
3. 点击钱包标签 → 显示钱包页面 ✅
```

### 3. 中途返回
```
1. 创建钱包 → 密码设置 → 点击返回
2. 返回创建钱包页面
3. 临时数据被保留（可以重新进入流程）
```

### 4. 重置钱包（开发）
```
1. 点击"🔄 重置钱包"
2. 确认删除
3. 清空 localStorage
4. 重新进入创建流程 ✅
```

## 日志输出

流程中的关键日志：
```
[Wallet Flow] Step 1: Mnemonic generated
[Wallet Flow] Step 2: Password set
[Wallet Flow] Step 3: Wallet saved with encryption
[Wallet Flow] ✅ Wallet creation completed successfully
```

错误日志：
```
[Wallet Flow] ❌ Failed to save wallet: Error message
```

重置日志：
```
[Dev] Wallet reset
```

## 下一步功能

### 待实现：
1. **钱包解锁**：用户输入密码解锁钱包
2. **会话管理**：保持登录状态 15 分钟
3. **密码验证**：显示钱包信息前验证密码
4. **导入钱包**：从助记词恢复钱包
5. **TON 地址生成**：从密钥对派生钱包地址
6. **余额查询**：连接 TON 网络查询余额

### 已完成：
- ✅ 助记词生成和验证
- ✅ 加密存储
- ✅ 钱包创建流程
- ✅ 钱包存在检查
- ✅ 备份提示界面
