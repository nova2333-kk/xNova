/**
 * WalletPage - 钱包页面（显示链上真实数据）
 */

import { useState, useEffect, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  Copy,
  Flame,
  MoreVertical,
  ScanLine,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SessionManager, MnemonicService, SecureStorage, WalletService } from '@/services/wallet';

interface WalletPageProps {
  onNeedUnlock: () => void;
}

export function WalletPage({ onNeedUnlock }: WalletPageProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'records'>('tokens');
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0.00');
  const [copied, setCopied] = useState(false);

  // 初始化钱包并获取数据
  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      setLoading(true);

      // 检查会话是否有效
      let walletService = SessionManager.getWalletService();

      if (!walletService) {
        // 会话无效，需要解锁钱包
        console.log('[WalletPage] Session expired, need to unlock');
        onNeedUnlock();
        return;
      }

      // 获取地址
      const walletAddress = walletService.getAddress();
      setAddress(walletAddress);
      console.log('[WalletPage] Wallet address:', walletAddress);

      // 获取余额
      await fetchBalance(walletService);
    } catch (error) {
      console.error('[WalletPage] Failed to initialize wallet:', error);
      // 初始化失败，需要重新解锁
      onNeedUnlock();
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (walletService: WalletService) => {
    try {
      const balanceBigInt = await walletService.getBalance();
      setBalance(balanceBigInt.toString());
      const formatted = WalletService.formatBalance(balanceBigInt, 2);
      setBalanceFormatted(formatted);
      console.log('[WalletPage] Balance:', formatted, 'TON');
    } catch (error) {
      console.error('[WalletPage] Failed to fetch balance:', error);
      setBalance('0');
      setBalanceFormatted('0.00');
    }
  };

  // 复制地址
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // 刷新余额
  const handleRefresh = async () => {
    const walletService = SessionManager.getWalletService();
    if (walletService) {
      await fetchBalance(walletService);
    }
  };

  // 格式化地址显示（前6位 ... 后4位）
  const formatAddress = (addr: string): string => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500">加载钱包数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">XWorld 钱包</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleRefresh} className="rounded-full p-2 hover:bg-slate-100" title="刷新">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 2v6h-6M3 22v-6h6M21 8a9 9 0 11-16 5M3 16a9 9 0 0116-5" />
            </svg>
          </button>
          <button className="rounded-full p-2 hover:bg-slate-100">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">资产总览</h2>
          <button onClick={handleCopyAddress} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" title="复制地址">
            {copied ? (
              <span className="text-xs text-green-600">✓ 已复制</span>
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mb-4 h-1 w-20 rounded-full bg-blue-500" />

        {/* 钱包地址 */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <span className="font-mono">{formatAddress(address)}</span>
          <button onClick={handleCopyAddress} className="text-blue-600 hover:text-blue-700">
            {copied ? '✓' : '复制'}
          </button>
        </div>

        {/* 资产卡片 */}
        <Card className="relative border-0 bg-slate-900 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.1) 20px,
                rgba(255,255,255,0.1) 21px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.1) 20px,
                rgba(255,255,255,0.1) 21px
              )`,
            }}
          />
          <CardContent className="relative space-y-6 p-6">
            <div className="flex items-start justify-between text-sm text-white/70">
              <span>TON 余额</span>
              <span>链上数据</span>
            </div>
            <div>
              <p className="text-4xl font-semibold">{balanceFormatted} TON</p>
              <p className="mt-2 text-sm text-white/60">
                {balance} nanoTON
              </p>
            </div>
            <p className="text-sm text-green-400">⚡ 链上存储，安全保值</p>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="grid grid-cols-3 gap-6 py-6">
          <ActionButton label="接收" icon={<ArrowDownToLine className="h-7 w-7" />} />
          <ActionButton label="发送" icon={<ArrowUpFromLine className="h-7 w-7" />} />
          <ActionButton label="交易" icon={<ArrowLeftRight className="h-7 w-7" />} />
        </div>

        {/* 标签切换 */}
        <div className="mb-6 flex gap-3">
          <TabButton active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')}>
            代币
          </TabButton>
          <TabButton active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
            记录
          </TabButton>
        </div>

        {/* 内容区域 */}
        {activeTab === 'tokens' ? (
          <div className="space-y-5">
            {/* TON 代币 */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                  💎
                </div>
                <div>
                  <p className="font-semibold">TON</p>
                  <p className="text-sm text-slate-500">The Open Network</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{balanceFormatted}</p>
                <p className="text-sm text-slate-500">TON</p>
              </div>
            </div>

            {/* 提示 */}
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium">💡 提示</p>
              <p className="mt-1 text-blue-700">
                这是您的 TON 钱包真实余额，数据来自 TON 区块链。
              </p>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <p>暂无交易记录</p>
            <p className="mt-2 text-sm">交易记录功能即将上线</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, children, ...props }: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex-1 rounded-full px-6 py-2 text-sm font-semibold transition ${
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {children}
    </button>
  );
}

function ActionButton({
  label,
  icon,
  badge,
}: {
  label: string;
  icon: ReactNode;
  badge?: string;
}) {
  return (
    <button className="flex flex-col items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800">
        {badge && (
          <Badge variant="destructive" className="absolute -right-1 -top-1 px-1 py-0.5 text-[10px]">
            {badge}
          </Badge>
        )}
        {icon}
      </div>
      {label}
    </button>
  );
}
