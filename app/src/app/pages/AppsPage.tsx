import { Grid } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function AppsPage() {
  return (
    <div className="min-h-full bg-white">
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 pb-8 pt-6 text-white">
        <div className="mb-6 flex items-center gap-3">
          <Grid className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">应用中心</h1>
        </div>
        <input
          type="text"
          placeholder="搜索应用..."
          className="w-full rounded-2xl border border-white/30 bg-white/20 px-5 py-3 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/60"
        />
      </div>

      <div className="space-y-6 px-6 py-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">游戏应用</h2>

          <Card className="relative cursor-pointer transition hover:-translate-y-1 hover:shadow-xl">
            <Badge className="absolute right-3 top-3 bg-red-500 text-white">HOT</Badge>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* 游戏图标 */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold">🎲</div>
                  </div>
                </div>

                {/* 游戏信息 */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">红包牛牛</h3>
                  <p className="mt-1 text-sm text-slate-500">经典牛牛游戏，赢取红包奖励</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                      🔥 热门
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                      ⚡ 即时开始
                    </span>
                  </div>
                </div>

                {/* 进入按钮 */}
                <div className="flex-shrink-0">
                  <button className="rounded-full bg-red-500 px-6 py-2 font-medium text-white shadow-lg transition hover:bg-red-600 hover:shadow-xl">
                    开始游戏
                  </button>
                </div>
              </div>

              {/* 游戏特点 */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">在线玩家</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">1.2K+</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">今日奖池</p>
                  <p className="mt-1 text-lg font-bold text-red-600">¥8,888</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">评分</p>
                  <p className="mt-1 text-lg font-bold text-yellow-600">4.8 ⭐</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 游戏说明 */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-5">
            <h3 className="mb-3 font-semibold text-slate-900">🎮 游戏规则</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>每局游戏使用一副牌，每人发5张牌</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>组成牛牛可获得双倍奖励</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>每日登录即可获得免费游戏次数</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>赢得的红包可直接提现到钱包</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 即将推出 */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">即将推出</h2>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 text-5xl opacity-30">🎯</div>
              <p className="text-slate-500">更多精彩游戏即将上线</p>
              <p className="mt-1 text-sm text-slate-400">敬请期待</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

