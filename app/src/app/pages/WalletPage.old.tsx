import { useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  Flame,
  MoreVertical,
  ScanLine,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const tokens = [
  { name: 'BUILD', icon: '🔷', amount: 225.32, usdAmount: 0.00016, price: '$0.036047', change: '+0.30%', positive: true },
  { name: 'USDT', icon: '🟢', amount: 0, usdAmount: 0, price: '$1.00', change: '', positive: true },
  { name: 'WORLD', icon: '⚡', amount: 0, usdAmount: 0, price: '$0.051811', change: '-5.28%', positive: false },
] as const;

export function WalletPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'records'>('tokens');

  return (
    <div className="min-h-full bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="rounded-full p-1">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-full p-2">
            <ChevronDown className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">资产总览</h2>
          <button className="rounded-full p-2 text-slate-500">
            <ScanLine className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4 h-1 w-20 rounded-full bg-blue-500" />

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
              <span>我的资产</span>
              <span>受区块链保护</span>
            </div>
            <p className="text-4xl font-semibold">$0.036047</p>
            <p className="text-sm text-green-400">⚡ 链上存储，安全保值</p>
          </CardContent>
        </Card>

        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <div className="flex items-center justify-between text-blue-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg text-white">
                ∞
              </div>
              <p className="font-medium">连接你的 TON 钱包</p>
            </div>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 py-6">
          <ActionButton label="充值" icon={<ArrowDownToLine className="h-7 w-7" />} badge="推荐" />
          <ActionButton label="提现" icon={<ArrowUpFromLine className="h-7 w-7" />} />
          <ActionButton label="交易" icon={<ArrowLeftRight className="h-7 w-7" />} />
        </div>

        <div className="mb-6 flex gap-3">
          <TabButton active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')}>
            代币
          </TabButton>
          <TabButton active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
            记录
          </TabButton>
        </div>

        {activeTab === 'tokens' ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 px-4 py-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" />
                <p>USDT 理财最高 15% 收益，X-World 官方上线</p>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </div>

            {tokens.map((token) => (
              <div key={token.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    {token.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{token.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{token.price}</span>
                      {token.change && (
                        <span className={token.positive ? 'text-green-600' : 'text-red-500'}>
                          {token.change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{token.amount}</p>
                  <p className="text-sm text-slate-500">
                    {token.usdAmount > 0 ? `$${token.usdAmount}` : '$0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">暂无交易记录</div>
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
    <button className="flex flex-col items-center gap-2 text-sm text-slate-600">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
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

