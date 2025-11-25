import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { initData } from '@tma.js/sdk-react';

import { Card, CardContent } from '@/components/ui/card';

interface HomePageProps {
  onCreateWallet: () => void;
  onSetPassword: () => void;
}

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
}

export function HomePage({ onCreateWallet, onSetPassword }: HomePageProps) {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // 获取 Telegram 用户信息
    try {
      const init = initData.state();
      if (init && init.user) {
        setUser({
          id: init.user.id,
          firstName: init.user.firstName,
          lastName: init.user.lastName,
          username: init.user.username,
          languageCode: init.user.languageCode,
          isPremium: init.user.isPremium,
          photoUrl: init.user.photoUrl,
        });
        console.log('[HomePage] Telegram user:', init.user);
      } else {
        console.log('[HomePage] No Telegram user data available');
      }
    } catch (error) {
      console.error('[HomePage] Failed to get Telegram user data:', error);
    }
  }, []);

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || user.username || `User ${user.id}`;
  };

  // 获取用户简短名称
  const getUserShortName = () => {
    if (!user) return 'Guest';
    return user.firstName || user.username || `User ${user.id}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white">
      <header className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 用户头像 */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={getUserDisplayName()}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <p className="text-sm text-white/80">欢迎回来</p>
              <h1 className="text-2xl font-semibold">{getUserShortName()}</h1>
            </div>
          </div>
          <button className="rounded-full bg-white/20 p-2 transition hover:bg-white/30">
            <Bell className="h-6 w-6" />
          </button>
        </div>

        {/* 用户信息卡片 */}
        <Card className="border-white/20 bg-white/10 text-white backdrop-blur">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold">用户信息</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">用户 ID</span>
                <span className="font-mono font-medium">{user?.id || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">完整名称</span>
                <span className="font-medium">{getUserDisplayName()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">用户名</span>
                <span className="font-medium">
                  {user?.username ? `@${user.username}` : '-'}
                </span>
              </div>
              {user?.isPremium && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70">账号类型</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-300">
                    ⭐ Premium
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/70">语言</span>
                <span className="font-medium uppercase">
                  {user?.languageCode || 'en'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      {/* 占位内容 */}
      <div className="flex flex-1 items-center justify-center pb-20">
        <div className="text-center text-white/60">
          <p className="text-lg">欢迎使用 xNova</p>
          <p className="mt-2 text-sm">请使用底部导航栏探索更多功能</p>
        </div>
      </div>
    </div>
  );
}

