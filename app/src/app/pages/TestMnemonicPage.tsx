/**
 * MnemonicService 测试页面
 * 用于测试助记词生成、验证、密钥派生等功能
 */

import { useState } from 'react';
import { MnemonicService } from '@/services/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TestMnemonicPage() {
  const [mnemonic12, setMnemonic12] = useState<string>('');
  const [mnemonic24, setMnemonic24] = useState<string>('');
  const [testMnemonic, setTestMnemonic] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [derivedPublicKey, setDerivedPublicKey] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [searchPrefix, setSearchPrefix] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [testWord, setTestWord] = useState<string>('');
  const [isWordValid, setIsWordValid] = useState<boolean | null>(null);

  // 测试：生成 12 词助记词
  const handleGenerate12 = () => {
    const mnemonic = MnemonicService.generateMnemonic(12);
    setMnemonic12(mnemonic);
    console.log('[Test] Generated 12-word mnemonic:', mnemonic);
  };

  // 测试：生成 24 词助记词
  const handleGenerate24 = () => {
    const mnemonic = MnemonicService.generateMnemonic(24);
    setMnemonic24(mnemonic);
    console.log('[Test] Generated 24-word mnemonic:', mnemonic);
  };

  // 测试：验证助记词
  const handleValidate = () => {
    const valid = MnemonicService.validateMnemonic(testMnemonic);
    setIsValid(valid);
    console.log('[Test] Mnemonic validation:', valid);
  };

  // 测试：获取单词数量
  const handleGetWordCount = () => {
    const count = MnemonicService.getWordCount(testMnemonic);
    setWordCount(count);
    console.log('[Test] Word count:', count);
  };

  // 测试：密钥派生
  const handleDeriveKey = async () => {
    if (!testMnemonic) {
      alert('请先输入助记词');
      return;
    }

    try {
      const keyPair = await MnemonicService.deriveKeyPair(testMnemonic);
      const publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');
      setDerivedPublicKey(publicKeyHex);
      console.log('[Test] Derived public key:', publicKeyHex);
      console.log('[Test] Secret key length:', keyPair.secretKey.length);
    } catch (error) {
      alert(`密钥派生失败: ${error}`);
      console.error('[Test] Key derivation error:', error);
    }
  };

  // 测试：创建完整钱包
  const handleCreateWallet = async () => {
    try {
      const wallet = await MnemonicService.createWallet(24);
      console.log('[Test] Created wallet:');
      console.log('  Mnemonic:', wallet.mnemonic);
      console.log('  Public Key:', Buffer.from(wallet.publicKey).toString('hex'));
      alert('钱包创建成功！请查看控制台');
    } catch (error) {
      alert(`创建钱包失败: ${error}`);
      console.error('[Test] Create wallet error:', error);
    }
  };

  // 测试：搜索单词
  const handleSearchWords = () => {
    const results = MnemonicService.searchWords(searchPrefix, 10);
    setSearchResults(results);
    console.log('[Test] Search results for', searchPrefix, ':', results);
  };

  // 测试：验证单词
  const handleValidateWord = () => {
    const valid = MnemonicService.isValidWord(testWord);
    setIsWordValid(valid);
    console.log('[Test] Word validation for', testWord, ':', valid);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">MnemonicService 测试</h1>

        {/* 1. 生成助记词 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 生成助记词</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button onClick={handleGenerate12} variant="default">
                  生成 12 词助记词
                </Button>
                {mnemonic12 && (
                  <Button onClick={() => copyToClipboard(mnemonic12)} variant="outline" size="sm">
                    复制
                  </Button>
                )}
              </div>
              {mnemonic12 && (
                <div className="rounded-md bg-slate-100 p-3 font-mono text-sm">
                  {mnemonic12}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button onClick={handleGenerate24} variant="default">
                  生成 24 词助记词
                </Button>
                {mnemonic24 && (
                  <Button onClick={() => copyToClipboard(mnemonic24)} variant="outline" size="sm">
                    复制
                  </Button>
                )}
              </div>
              {mnemonic24 && (
                <div className="rounded-md bg-slate-100 p-3 font-mono text-sm">
                  {mnemonic24}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. 验证助记词 */}
        <Card>
          <CardHeader>
            <CardTitle>2. 验证助记词</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <textarea
                className="w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
                rows={3}
                placeholder="输入助记词进行验证..."
                value={testMnemonic}
                onChange={(e) => setTestMnemonic(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleValidate} variant="default">
                验证助记词
              </Button>
              <Button onClick={handleGetWordCount} variant="outline">
                获取单词数量
              </Button>
            </div>
            {isValid !== null && (
              <div className="flex items-center gap-2">
                <span>验证结果:</span>
                <Badge variant={isValid ? 'default' : 'destructive'}>
                  {isValid ? '✅ 有效' : '❌ 无效'}
                </Badge>
              </div>
            )}
            {wordCount > 0 && (
              <div className="flex items-center gap-2">
                <span>单词数量:</span>
                <Badge variant="secondary">{wordCount}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. 密钥派生 */}
        <Card>
          <CardHeader>
            <CardTitle>3. 密钥派生</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleDeriveKey} variant="default">
              从助记词派生密钥对
            </Button>
            {derivedPublicKey && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">公钥 (Hex):</p>
                <div className="break-all rounded-md bg-slate-100 p-3 font-mono text-xs">
                  {derivedPublicKey}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. 创建完整钱包 */}
        <Card>
          <CardHeader>
            <CardTitle>4. 创建完整钱包</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateWallet} variant="default">
              创建钱包 (24词 + 密钥对)
            </Button>
            <p className="mt-2 text-sm text-slate-500">
              结果将输出到浏览器控制台
            </p>
          </CardContent>
        </Card>

        {/* 5. 单词搜索（自动补全） */}
        <Card>
          <CardHeader>
            <CardTitle>5. 单词搜索（自动补全）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="输入前缀搜索单词 (如: aba)"
                value={searchPrefix}
                onChange={(e) => setSearchPrefix(e.target.value)}
              />
              <Button onClick={handleSearchWords} variant="default">
                搜索
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchResults.map((word) => (
                  <Badge key={word} variant="secondary">
                    {word}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6. 单词验证 */}
        <Card>
          <CardHeader>
            <CardTitle>6. 单词验证</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="输入单词验证是否在 BIP39 词库中"
                value={testWord}
                onChange={(e) => setTestWord(e.target.value)}
              />
              <Button onClick={handleValidateWord} variant="default">
                验证
              </Button>
            </div>
            {isWordValid !== null && (
              <div className="flex items-center gap-2">
                <span>验证结果:</span>
                <Badge variant={isWordValid ? 'default' : 'destructive'}>
                  {isWordValid ? '✅ 在词库中' : '❌ 不在词库中'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              💡 <strong>提示:</strong> 所有测试结果也会输出到浏览器控制台。打开开发者工具查看详细日志。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
