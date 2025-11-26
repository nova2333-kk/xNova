import { useState } from 'react';
import { Grid3x3, Home, Users, Wallet } from 'lucide-react';

import { BottomNav, type BottomNavItem, type MainTab } from '@/app/components/BottomNav';
import { AppsPage } from '@/app/pages/AppsPage';
import { BackupMnemonicPage } from '@/app/pages/BackupMnemonicPage';
import { CreateWalletPage } from '@/app/pages/CreateWalletPage';
import { FriendsPage } from '@/app/pages/FriendsPage';
import { HomePage } from '@/app/pages/HomePage';
import { SetWalletPasswordPage } from '@/app/pages/SetWalletPasswordPage';
import { TestMnemonicPage } from '@/app/pages/TestMnemonicPage';
import { TestStoragePage } from '@/app/pages/TestStoragePage';
import { UnlockWalletPage } from '@/app/pages/UnlockWalletPage';
import { WalletPage } from '@/app/pages/WalletPage';
import { MnemonicService, SecureStorage, SessionManager, WalletService } from '@/services/wallet';
import { WalletAPI } from '@/services/api';

type FlowView = 'createWallet' | 'setPassword' | 'backupMnemonic' | 'unlockWallet' | 'testMnemonic' | 'testStorage';
type View = MainTab | FlowView;

const mainTabs: MainTab[] = ['home', 'apps', 'friends', 'wallet'];

const navItems: BottomNavItem[] = [
  { id: 'home', label: '首页', icon: <Home className="h-5 w-5" /> },
  { id: 'apps', label: '应用库', icon: <Grid3x3 className="h-5 w-5" /> },
  { id: 'friends', label: '好友', icon: <Users className="h-5 w-5" /> },
  { id: 'wallet', label: '钱包', icon: <Wallet className="h-5 w-5" /> },
];

export function App() {
  // 使用 SecureStorage 检查是否已创建钱包
  const [hasWallet, setHasWallet] = useState<boolean>(() => {
    return SecureStorage.hasWallet();
  });

  // 临时存储创建流程中的数据
  const [tempMnemonic, setTempMnemonic] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('');

  // 如果没有钱包，默认显示创建钱包页面；否则显示首页
  const [view, setView] = useState<View>(() => {
    return hasWallet ? 'home' : 'createWallet';
  });

  const handleSelect = (tab: MainTab) => {
    // 如果点击钱包标签但没有钱包，跳转到创建钱包页面
    if (tab === 'wallet' && !hasWallet) {
      setView('createWallet');
    } else {
      setView(tab);
    }
  };

  // 步骤1: 点击创建钱包按钮 -> 生成助记词并跳转到设置密码页面
  const handleCreateWalletClick = () => {
    // 生成24词助记词
    const mnemonic = MnemonicService.generateMnemonic(24);
    setTempMnemonic(mnemonic);
    console.log('[Wallet Flow] Step 1: Mnemonic generated');
    setView('setPassword');
  };

  // 步骤2: 设置密码完成 -> 跳转到备份助记词页面
  const handlePasswordSet = (password: string) => {
    setTempPassword(password);
    console.log('[Wallet Flow] Step 2: Password set');
    setView('backupMnemonic');
  };

  // 步骤3: 确认备份助记词 -> 加密存储并完成创建
  const handleBackupConfirmed = async () => {
    try {
      // 使用密码加密并保存助记词
      SecureStorage.saveWallet(tempMnemonic, tempPassword);
      console.log('[Wallet Flow] Step 3: Wallet saved with encryption');

      // 从助记词派生密钥对并创建会话
      const keyPair = await MnemonicService.deriveKeyPair(tempMnemonic, tempPassword);
      SessionManager.createSession(keyPair);
      console.log('[Wallet Flow] Step 4: Session created');

      // 创建 WalletService 实例以获取地址
      const walletService = new WalletService();
      walletService.createWallet(keyPair);
      const address = walletService.getAddress();
      const publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');

      console.log('[Wallet Flow] Step 5: Syncing wallet to server...', {
        address,
        publicKey: publicKeyHex.slice(0, 16) + '...',
      });

      // 同步钱包到服务端
      try {
        await WalletAPI.create({
          address,
          public_key: publicKeyHex,
        });
        console.log('[Wallet Flow] Step 6: Wallet synced to server');
      } catch (apiError) {
        console.error('[Wallet Flow] ⚠️ Failed to sync wallet to server:', apiError);
        // 不阻止流程继续，钱包仍然可以在本地使用
      }

      // 清理临时数据
      setTempMnemonic('');
      setTempPassword('');

      // 更新状态
      setHasWallet(true);
      setView('wallet');

      console.log('[Wallet Flow] ✅ Wallet creation completed successfully');
    } catch (error) {
      console.error('[Wallet Flow] ❌ Failed to save wallet:', error);
      alert('保存钱包失败，请重试');
    }
  };

  // 解锁钱包
  const handleUnlockWallet = async (password: string) => {
    try {
      // 解密助记词
      const mnemonic = SecureStorage.unlockWallet(password);
      console.log('[Unlock] Wallet unlocked');

      // 从助记词派生密钥对并创建会话
      const keyPair = await MnemonicService.deriveKeyPair(mnemonic, password);
      SessionManager.createSession(keyPair);
      console.log('[Unlock] Session created');

      // 跳转到钱包页面
      setView('wallet');
    } catch (error) {
      console.error('[Unlock] Failed to unlock wallet:', error);
      alert('密码错误或钱包数据损坏');
      // 重置密码输入
      setView('unlockWallet');
    }
  };

  // 需要解锁钱包时的回调
  const handleNeedUnlock = () => {
    setView('unlockWallet');
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'home':
        return <HomePage />;
      case 'apps':
        return <AppsPage />;
      case 'friends':
        return <FriendsPage />;
      case 'wallet':
        // 如果没有钱包，显示创建钱包页面
        if (!hasWallet) {
          return <CreateWalletPage onBack={() => setView('home')} onCreateWallet={handleCreateWalletClick} />;
        }
        return <WalletPage onNeedUnlock={handleNeedUnlock} />;
      case 'createWallet':
        return <CreateWalletPage onBack={() => setView(hasWallet ? 'wallet' : 'home')} onCreateWallet={handleCreateWalletClick} />;
      case 'setPassword':
        return <SetWalletPasswordPage onBack={() => setView('createWallet')} onPasswordSet={handlePasswordSet} />;
      case 'backupMnemonic':
        return <BackupMnemonicPage mnemonic={tempMnemonic} onBack={() => setView('setPassword')} onConfirmed={handleBackupConfirmed} />;
      case 'unlockWallet':
        return <UnlockWalletPage onBack={() => setView('home')} onUnlocked={handleUnlockWallet} />;
      case 'testMnemonic':
        return <TestMnemonicPage />;
      case 'testStorage':
        return <TestStoragePage />;
      default:
        return null;
    }
  };

  const isMainTab = (value: View): value is MainTab => mainTabs.includes(value as MainTab);

  // 开发模式下的重置钱包功能
  const handleResetWallet = () => {
    if (import.meta.env.DEV) {
      if (confirm('⚠️ 确定要重置钱包吗？这将删除所有钱包数据！')) {
        SecureStorage.deleteWallet();
        setHasWallet(false);
        setView('createWallet');
        console.log('[Dev] Wallet reset');
      }
    }
  };

  return (
    <div className="app-shell flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* 开发模式下显示测试和重置按钮 */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => setView('testMnemonic')}
            className="rounded-full bg-blue-500 px-4 py-2 text-xs text-white shadow-lg hover:bg-blue-600"
          >
            🧪 测试助记词
          </button>
          <button
            onClick={() => setView('testStorage')}
            className="rounded-full bg-purple-500 px-4 py-2 text-xs text-white shadow-lg hover:bg-purple-600"
          >
            🔐 测试存储
          </button>
          {hasWallet && (
            <button
              onClick={handleResetWallet}
              className="rounded-full bg-red-500 px-4 py-2 text-xs text-white shadow-lg hover:bg-red-600"
            >
              🔄 重置钱包
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pb-32">{renderCurrentView()}</div>
      </div>
      {isMainTab(view) && (
        <BottomNav
          active={view}
          items={navItems}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}

