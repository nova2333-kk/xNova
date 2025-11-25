/**
 * SecureStorage 测试页面
 * 用于测试加密存储、密码验证等功能
 */

import { useState } from 'react';
import { MnemonicService, SecureStorage } from '@/services/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TestStoragePage() {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [unlockedMnemonic, setUnlockedMnemonic] = useState<string>('');
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<{ createdAt: number; version: number } | null>(null);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [backupData, setBackupData] = useState<string>('');

  // 刷新钱包状态
  const refreshWalletStatus = () => {
    const exists = SecureStorage.hasWallet();
    setHasWallet(exists);

    if (exists) {
      const createdAt = SecureStorage.getWalletCreatedAt();
      const version = SecureStorage.getWalletVersion();
      if (createdAt && version) {
        setWalletInfo({ createdAt, version });
      }
    } else {
      setWalletInfo(null);
    }
  };

  // 初始化时检查钱包状态
  useState(() => {
    refreshWalletStatus();
  });

  // 1. 生成新助记词
  const handleGenerateMnemonic = () => {
    const newMnemonic = MnemonicService.generateMnemonic(24);
    setMnemonic(newMnemonic);
    console.log('[Test] Generated mnemonic:', newMnemonic);
  };

  // 2. 保存钱包
  const handleSaveWallet = () => {
    if (!mnemonic) {
      alert('请先生成助记词');
      return;
    }

    if (!password) {
      alert('请输入密码');
      return;
    }

    try {
      SecureStorage.saveWallet(mnemonic, password);
      alert('钱包保存成功！');
      refreshWalletStatus();
      setMnemonic('');
      setPassword('');
      console.log('[Test] Wallet saved successfully');
    } catch (error) {
      alert(`保存失败: ${error}`);
      console.error('[Test] Save error:', error);
    }
  };

  // 3. 验证密码
  const handleVerifyPassword = () => {
    if (!unlockPassword) {
      alert('请输入密码');
      return;
    }

    const isValid = SecureStorage.verifyPassword(unlockPassword);
    if (isValid) {
      alert('✅ 密码正确');
      console.log('[Test] Password is correct');
    } else {
      alert('❌ 密码错误');
      console.log('[Test] Password is incorrect');
    }
  };

  // 4. 解锁钱包
  const handleUnlockWallet = () => {
    if (!unlockPassword) {
      alert('请输入密码');
      return;
    }

    try {
      const unlockedMnemonic = SecureStorage.unlockWallet(unlockPassword);
      setUnlockedMnemonic(unlockedMnemonic);
      alert('钱包解锁成功！');
      console.log('[Test] Unlocked mnemonic:', unlockedMnemonic);
    } catch (error) {
      alert(`解锁失败: ${error}`);
      console.error('[Test] Unlock error:', error);
    }
  };

  // 5. 更改密码
  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      alert('请输入旧密码和新密码');
      return;
    }

    try {
      SecureStorage.changePassword(oldPassword, newPassword);
      alert('密码更改成功！');
      refreshWalletStatus();
      setOldPassword('');
      setNewPassword('');
      console.log('[Test] Password changed successfully');
    } catch (error) {
      alert(`更改密码失败: ${error}`);
      console.error('[Test] Change password error:', error);
    }
  };

  // 6. 导出钱包
  const handleExportWallet = () => {
    try {
      const data = SecureStorage.exportWallet();
      setBackupData(data);
      alert('钱包导出成功！');
      console.log('[Test] Exported wallet data');
    } catch (error) {
      alert(`导出失败: ${error}`);
      console.error('[Test] Export error:', error);
    }
  };

  // 7. 导入钱包
  const handleImportWallet = () => {
    if (!backupData) {
      alert('请先导出或粘贴备份数据');
      return;
    }

    try {
      SecureStorage.importWallet(backupData);
      alert('钱包导入成功！');
      refreshWalletStatus();
      setBackupData('');
      console.log('[Test] Wallet imported successfully');
    } catch (error) {
      alert(`导入失败: ${error}`);
      console.error('[Test] Import error:', error);
    }
  };

  // 8. 删除钱包
  const handleDeleteWallet = () => {
    if (!confirm('⚠️ 确定要删除钱包吗？此操作无法撤销！')) {
      return;
    }

    SecureStorage.deleteWallet();
    alert('钱包已删除');
    refreshWalletStatus();
    setUnlockedMnemonic('');
    console.log('[Test] Wallet deleted');
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">SecureStorage 测试</h1>

        {/* 钱包状态 */}
        <Card className={hasWallet ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50'}>
          <CardHeader>
            <CardTitle>钱包状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">状态:</span>
              <Badge variant={hasWallet ? 'default' : 'secondary'}>
                {hasWallet ? '✅ 钱包存在' : '❌ 未创建钱包'}
              </Badge>
            </div>
            {walletInfo && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">创建时间:</span>
                  <span className="text-sm text-slate-600">
                    {new Date(walletInfo.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">数据版本:</span>
                  <Badge variant="secondary">v{walletInfo.version}</Badge>
                </div>
              </>
            )}
            <Button onClick={refreshWalletStatus} variant="outline" size="sm">
              刷新状态
            </Button>
          </CardContent>
        </Card>

        {/* 1. 创建和保存钱包 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 创建和保存钱包</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button onClick={handleGenerateMnemonic} variant="default">
                生成助记词
              </Button>
              {mnemonic && (
                <div className="mt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">助记词:</span>
                    <Button onClick={() => copyToClipboard(mnemonic)} variant="outline" size="sm">
                      复制
                    </Button>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3 font-mono text-sm">
                    {mnemonic}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                设置密码（至少6位）:
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveWallet} variant="default" disabled={!mnemonic || !password}>
              保存钱包
            </Button>
          </CardContent>
        </Card>

        {/* 2. 验证和解锁钱包 */}
        <Card>
          <CardHeader>
            <CardTitle>2. 验证和解锁钱包</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                输入密码:
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="输入密码"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleVerifyPassword} variant="outline" disabled={!hasWallet}>
                验证密码
              </Button>
              <Button onClick={handleUnlockWallet} variant="default" disabled={!hasWallet}>
                解锁钱包
              </Button>
            </div>

            {unlockedMnemonic && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">解锁的助记词:</span>
                  <Button onClick={() => copyToClipboard(unlockedMnemonic)} variant="outline" size="sm">
                    复制
                  </Button>
                </div>
                <div className="rounded-md bg-green-50 p-3 font-mono text-sm text-green-900">
                  {unlockedMnemonic}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. 更改密码 */}
        <Card>
          <CardHeader>
            <CardTitle>3. 更改密码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                旧密码:
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="输入旧密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                新密码（至少6位）:
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <Button onClick={handleChangePassword} variant="default" disabled={!hasWallet}>
              更改密码
            </Button>
          </CardContent>
        </Card>

        {/* 4. 导出和导入 */}
        <Card>
          <CardHeader>
            <CardTitle>4. 导出和导入钱包</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button onClick={handleExportWallet} variant="outline" disabled={!hasWallet}>
                导出钱包数据
              </Button>
              <p className="mt-2 text-xs text-slate-500">
                导出的数据仍然是加密的，需要原密码才能解锁
              </p>
            </div>

            {backupData && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">备份数据:</span>
                  <Button onClick={() => copyToClipboard(backupData)} variant="outline" size="sm">
                    复制
                  </Button>
                </div>
                <textarea
                  className="w-full rounded-md border border-slate-300 p-3 font-mono text-xs"
                  rows={6}
                  readOnly
                  value={backupData}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                粘贴备份数据:
              </label>
              <textarea
                className="w-full rounded-md border border-slate-300 p-3 font-mono text-xs"
                rows={6}
                placeholder="粘贴钱包备份数据..."
                value={backupData}
                onChange={(e) => setBackupData(e.target.value)}
              />
            </div>

            <Button onClick={handleImportWallet} variant="default" disabled={!backupData}>
              导入钱包
            </Button>
          </CardContent>
        </Card>

        {/* 5. 删除钱包 */}
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">5. 删除钱包 (危险操作)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDeleteWallet} variant="destructive" disabled={!hasWallet}>
              删除钱包
            </Button>
            <p className="mt-2 text-xs text-red-700">
              ⚠️ 删除后无法恢复，除非你有备份数据
            </p>
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              💡 <strong>提示:</strong>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>密码至少需要 6 个字符</li>
              <li>助记词使用 AES-256 加密存储</li>
              <li>密钥使用 PBKDF2 (10000次迭代) 派生</li>
              <li>所有测试结果也会输出到浏览器控制台</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
