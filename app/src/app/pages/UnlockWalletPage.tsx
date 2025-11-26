/**
 * UnlockWalletPage - 解锁钱包页面
 * 用户输入密码解锁钱包
 */

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface UnlockWalletPageProps {
  onBack: () => void;
  onUnlocked: (password: string) => void;
}

export function UnlockWalletPage({ onBack, onUnlocked }: UnlockWalletPageProps) {
  const [password, setPassword] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleNumberClick = (digit: string) => {
    if (password.length < 6) {
      setPassword((prev) => [...prev, digit]);
      setError(''); // 清除错误提示
    }
  };

  const handleDelete = () => {
    setPassword((prev) => prev.slice(0, -1));
    setError('');
  };

  // 当密码输入完成时自动验证
  useEffect(() => {
    if (password.length === 6) {
      const passwordString = password.join('');
      // 延迟一下让用户看到输入完成
      setTimeout(() => {
        onUnlocked(passwordString);
      }, 300);
    }
  }, [password, onUnlocked]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <button onClick={onBack} className="rounded-full p-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">解锁钱包</h1>
        <div className="w-10" />
      </header>

      <main className="flex flex-1 flex-col px-6 pt-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">输入密码</h2>
          <p className="mt-2 text-sm text-slate-500">
            请输入 6 位数字密码以解锁钱包
          </p>
        </div>

        <div className="mt-12 flex flex-1 flex-col items-center">
          {/* 密码输入框 */}
          <div className="mb-4 flex gap-3">
            {Array.from({ length: 6 }, (_, index) => index).map((index) => (
              <div
                key={index}
                className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition ${
                  error
                    ? 'border-red-300 bg-red-50'
                    : password[index]
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {password[index] && (
                  <div className={`h-3 w-3 rounded-full ${error ? 'bg-red-500' : 'bg-slate-900'}`} />
                )}
              </div>
            ))}
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </main>

      {/* 数字键盘 */}
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
