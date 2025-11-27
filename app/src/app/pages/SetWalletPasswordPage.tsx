import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, MoreVertical } from 'lucide-react';

interface SetWalletPasswordPageProps {
  onBack: () => void;
  onPasswordSet?: (password: string) => void;
}

export function SetWalletPasswordPage({ onBack, onPasswordSet }: SetWalletPasswordPageProps) {
  const [password, setPassword] = useState<string[]>([]);

  const handleNumberClick = (digit: string) => {
    if (password.length < 6) {
      setPassword((prev) => [...prev, digit]);
    }
  };

  const handleDelete = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  // 当密码输入完成时自动跳转
  useEffect(() => {
    if (password.length === 6 && onPasswordSet) {
      // 将密码数组转换为字符串
      const passwordString = password.join('');
      // 模拟密码设置过程
      setTimeout(() => {
        onPasswordSet(passwordString);
      }, 500);
    }
  }, [password, onPasswordSet]);

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

      <main className="flex flex-1 flex-col px-6 pt-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">设置钱包密码</h2>
          <p className="mt-3 text-sm text-slate-500">
            <span className="text-slate-900">请设置 6 位数字密码，</span>
            此密码用于在此设备上使用您的钱包。
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-10 flex gap-3">
            {Array.from({ length: 6 }, (_, index) => index).map((index) => (
              <div
                key={index}
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-slate-200"
              >
                {password[index] && <div className="h-3 w-3 rounded-full bg-slate-900" />}
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="border-t bg-slate-50">
        <div className="grid max-w-md grid-cols-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, index) => {
            if (key === '') {
              return <div key={index} className="h-16 border-b border-r border-slate-200 bg-slate-100" />;
            }

            if (key === 'del') {
              return (
                <button
                  key={index}
                  className="flex h-16 items-center justify-center border-b border-slate-200 text-slate-600 transition hover:bg-slate-100"
                  onClick={handleDelete}
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 4H8L3 12l5 8h13a2 2 0 0 0 2-2z" />
                    <path d="M18 9l-6 6" />
                    <path d="M12 9l6 6" />
                  </svg>
                </button>
              );
            }

            return (
              <button
                key={index}
                className="h-16 border-b border-r border-slate-200 text-2xl font-medium transition hover:bg-slate-100"
                onClick={() => handleNumberClick(key)}
              >
                {key}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center py-3">
          <div className="h-1 w-32 rounded-full bg-slate-300" />
        </div>
      </section>
    </div>
  );
}

