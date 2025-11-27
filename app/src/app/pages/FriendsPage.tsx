import { type ReactNode } from 'react';
import { Copy, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function FriendsPage() {
  return (
    <div className="min-h-full bg-black pb-10 text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-900 px-6 py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 16px, rgba(255,255,255,0.2) 16px, rgba(255,255,255,0.2) 17px),
              repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(255,255,255,0.2) 16px, rgba(255,255,255,0.2) 17px)
            `,
          }}
        />
        <div className="relative z-10 max-w-[60%] space-y-4">
          <p className="text-2xl">每邀请一个好友</p>
          <p className="text-sm text-white/60">最多可赚</p>
          <p className="text-7xl font-bold tracking-tight text-brand-lime">$150</p>
        </div>
      </section>

      <div className="bg-purple-600 py-2">
        <div className="flex animate-scroll-seamless whitespace-nowrap text-sm uppercase tracking-[0.2em] text-white/80">
          {Array.from({ length: 12 }, (_, index) => index).map((index) => (
            <span key={index} className="mx-6 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-white" />
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-8 px-4 pt-8">
        <section>
          <SectionTitle>我的邀请</SectionTitle>
          <Card className="border-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white">
            <CardContent className="space-y-6 p-5">
              <div className="grid grid-cols-2 gap-6">
                <StatBlock
                  title="邀请人数"
                  value="1"
                  helper="查看明细"
                />
                <StatBlock
                  title="邀请奖励"
                  value="$0.03"
                  helper="收益记录"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-brand-lime text-black hover:opacity-90"
                >
                  现在邀请
                </Button>
                <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionTitle>奖励</SectionTitle>
          <Card className="border-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white">
            <CardContent className="space-y-6 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime text-lg font-bold text-black">
                  1°
                </div>
                <div>
                  <h3 className="text-lg font-semibold">邀请奖励</h3>
                  <p className="mb-3 text-sm text-white/70">
                    当你的朋友完成任务时，你可以获得价值高达
                  </p>
                  <div className="flex items-center gap-3 text-lg">
                    <span>💰</span>
                    <span>1,138,230 ≈ $180.51</span>
                  </div>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 border-t border-white/10 pt-4 text-sm text-white/70 hover:text-white">
                查看详情
                <ChevronRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </section>

        <Card className="border-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime text-lg font-bold text-black">
                2°
              </div>
              <div>
                <h3 className="text-lg font-semibold">二级奖励</h3>
                <p className="text-sm text-white/70">
                  你的好友邀请的用户完成任务，你也能获得额外奖励
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white">
          <CardContent className="space-y-4 p-0">
            <div className="border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-3 text-lg">
                <span>🎯</span>
                <h3 className="font-semibold">多级邀请奖励</h3>
              </div>
            </div>
            <div className="px-5 pb-5 text-sm text-white/70">
              更高等级带来更多返佣，最多可额外获得 35% 好友收益。
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white text-slate-900">
          <CardContent className="space-y-6 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime text-lg font-bold text-black">
                  3°
                </div>
                <h3 className="text-xl font-semibold text-brand-lime">每周礼包</h3>
                <p className="text-sm text-slate-500">本周最高额外奖励是</p>
                <p className="text-lg">
                  💰 386,550 ≈ <span className="text-green-600">$61.30</span>
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm">
                <div className="rounded-md bg-white/10 px-2 py-1">01</div>:
                <div className="rounded-md bg-white/10 px-2 py-1">19</div>:
                <div className="rounded-md bg-white/10 px-2 py-1">24</div>:
                <div className="rounded-md bg-white/10 px-2 py-1">46</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-brand-lime text-black hover:opacity-90">
                现在邀请
              </Button>
              <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500">
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.4em] text-white/50">
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, index) => index).map((index) => (
          <span key={index} className="h-1.5 w-1.5 bg-white/40" />
        ))}
      </div>
      {children}
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, index) => index).map((index) => (
          <span key={index} className="h-1.5 w-1.5 bg-white/40" />
        ))}
      </div>
    </div>
  );
}

function StatBlock({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-semibold">{value}</p>
      <button className="mt-1 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
        {title}
        <ChevronRight className="h-3 w-3" />
      </button>
      <p className="text-xs text-white/40">{helper}</p>
    </div>
  );
}

