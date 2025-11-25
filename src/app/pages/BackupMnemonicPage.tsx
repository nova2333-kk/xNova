/**
 * BackupMnemonicPage - 助记词备份页面
 * 显示生成的助记词，提示用户备份
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

interface BackupMnemonicPageProps {
  mnemonic: string;
  onBack: () => void;
  onConfirmed: () => void;
}

export function BackupMnemonicPage({ mnemonic, onBack, onConfirmed }: BackupMnemonicPageProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const words = mnemonic.split(' ');

  // 复制助记词到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('复制失败，请手动抄写');
    }
  };

  // 用户确认已备份
  const handleConfirm = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    // 已确认，继续下一步
    onConfirmed();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              ← 返回
            </button>
            <h1 className="text-lg font-semibold text-slate-900">备份助记词</h1>
            <div className="w-12" />
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* 警告提示 */}
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <div className="space-y-2 text-sm text-amber-900">
                  <p className="font-semibold">⚠️ 重要提示</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>这是恢复钱包的唯一方式，请务必妥善保管</li>
                    <li>任何人获得助记词都可以控制你的资产</li>
                    <li>建议手写在纸上，存放在安全的地方</li>
                    <li>不要截图、不要保存在云端</li>
                    <li>不要通过网络分享给任何人</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 助记词显示 */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-700">您的助记词（24个单词）</h2>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      复制
                    </>
                  )}
                </Button>
              </div>

              {/* 单词网格 */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {words.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"
                  >
                    <span className="text-xs font-medium text-slate-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-sm font-medium text-slate-900">
                      {word}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 确认备份 */}
          <Card className={confirmed ? 'border-green-300 bg-green-50' : ''}>
            <CardContent className="pt-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-midnight focus:ring-brand-midnight"
                />
                <span className={`text-sm ${confirmed ? 'text-green-900' : 'text-slate-700'}`}>
                  我已经安全地备份了助记词，并理解如果丢失助记词，我的资产将无法恢复。
                </span>
              </label>
            </CardContent>
          </Card>

          {/* 底部提示 */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold">备份建议</p>
                  <p className="mt-1">
                    将这24个单词按顺序抄写在纸上，存放在只有你能接触到的安全地方。
                    如果担心遗失，可以制作多份备份分别存放。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-2xl">
          <Button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="w-full"
            size="lg"
          >
            {confirmed ? '继续' : '请先确认已备份'}
          </Button>
        </div>
      </div>
    </div>
  );
}
