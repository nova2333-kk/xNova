import { ArrowLeft, ChevronDown, MoreVertical } from 'lucide-react';

import heroImage from '@/assets/application.png';
import { Button } from '@/components/ui/button';

interface CreateWalletPageProps {
  onBack: () => void;
  onCreateWallet?: () => void;
}

export function CreateWalletPage({ onBack, onCreateWallet }: CreateWalletPageProps) {
  const handleCreateWallet = () => {
    // 调用创建钱包回调
    if (onCreateWallet) {
      onCreateWallet();
    }
  };
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <button className="rounded-full p-2">
            <ChevronDown className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-8 px-6 py-8 text-center">
        <div className="w-full max-w-md space-y-6">
          <img
            src={heroImage}
            alt="Web3 Wallet illustration"
            className="w-full rounded-3xl border border-slate-100 object-cover shadow-md"
          />
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Web3钱包，一个就够了</h2>
            <p className="mt-2 text-slate-500">最适合 Web3 的钱包，安全且高效</p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4 pt-6">
          <Button className="h-14 w-full rounded-2xl text-lg" onClick={handleCreateWallet}>
            创建钱包
          </Button>
          <button className="w-full text-sm text-slate-500 hover:text-slate-900">
            什么是私人钱包？
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-green-600">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 12l2 2 4-4" />
              <path d="M12 22a10 10 0 1 1 10-10" />
            </svg>
            新加坡 Insurers 承保资产安全
          </div>
        </div>
      </main>
    </div>
  );
}

