# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

xNova 是一个基于 Figma 设计的 Telegram Mini App，实现了自定义钱包、应用库、好友和引导流程。项目移除了原始 Telegram 模板的示例页面，完全基于 `/Users/kk/work/figma/project` 中的设计实现。

## 技术栈

- **前端框架**: React 18 + TypeScript（使用 Vite 构建）
- **样式方案**: Tailwind CSS + 自定义设计系统（位于 `src/components/ui/`）
- **UI 组件**: Radix UI（无障碍访问）+ CVA（组件变体管理）
- **UI 库**: Telegram UI (`@telegram-apps/telegram-ui`)、lucide-react（图标）
- **Mini App SDK**: @tma.js/sdk-react
- **构建工具**: Vite（使用 SWC 编译 React）
- **代码质量**: ESLint（TypeScript + React 规则）

## 常用命令

### 开发
```bash
npm run dev          # 开发模式（HTTP）
npm run dev:https    # 开发模式（HTTPS，使用 mkcert 本地证书，首次运行需要 sudo）
```

### 构建和部署
```bash
npm run build        # 生产构建（包含 TypeScript 类型检查）
npm run deploy       # 部署到 GitHub Pages（会自动先构建）
npm run preview      # 预览生产构建
```

### 代码质量
```bash
npm run lint         # 检查代码规范
npm run lint:fix     # 自动修复代码规范问题
```

## 架构设计

### 应用启动流程

1. **入口点** (`src/index.tsx`):
   - 导入 Telegram UI 样式（优先级最高，允许自定义 CSS 覆盖）
   - 导入 `mockEnv.ts` 模拟 Telegram 环境（用于开发和非 TG 环境）
   - 调用 `init()` 初始化 SDK 和依赖
   - 渲染 `<Root>` 组件

2. **初始化** (`src/init.ts`):
   - 配置 @tma.js/sdk-react 调试模式
   - 按需加载 Eruda 调试工具（移动端）
   - 处理 macOS Telegram 客户端已知 bug（主题、安全区域）
   - 挂载 Mini App 组件（backButton、viewport、themeParams 等）
   - 绑定 CSS 变量（主题参数、viewport）

3. **根组件** (`src/components/Root.tsx`):
   - 使用 `ErrorBoundary` 包裹整个应用
   - 根据 `miniApp.isDark` 和平台自动切换 Telegram UI 主题
   - 渲染主应用 `<App>`

### 核心应用结构 (`src/app/App.tsx`)

- **钱包状态管理**:
  - 使用 `localStorage` 持久化钱包创建状态（key: `xnova_wallet_created`）
  - 首次访问时，如果没有钱包，自动跳转到创建钱包页面
  - 创建钱包后，状态保存到本地存储，后续访问直接进入应用

- **视图管理**: 使用单一 state 管理视图切换（避免路由库依赖）
  - 主标签页: `home`、`apps`、`friends`、`wallet`
  - 流程页面: `createWallet`、`setPassword`

- **钱包创建流程**:
  1. 用户首次进入应用 → 显示创建钱包页面
  2. 点击"创建钱包"按钮 → 跳转到设置密码页面
  3. 输入 6 位数字密码 → 自动保存钱包状态到 localStorage
  4. 完成后跳转到钱包页面

  **流程图**: `首次访问` → `创建钱包页` → `设置密码页`(输入6位密码) → `钱包页`

- **组件层次**:
  ```
  App
  ├── 主视图区域（flex-1, overflow-hidden）
  │   └── 当前页面内容（pb-32 为底部导航留空间）
  └── BottomNav（仅在主标签页显示）
  ```

- **页面组件** (`src/app/pages/`):
  - `HomePage.tsx` - 首页
  - `AppsPage.tsx` - 应用库
  - `FriendsPage.tsx` - 好友列表
  - `WalletPage.tsx` - 钱包主页（需要先创建钱包）
  - `CreateWalletPage.tsx` - 创建钱包流程（onCreateWallet 回调）
  - `SetWalletPasswordPage.tsx` - 设置钱包密码流程（onPasswordSet 回调）

### UI 组件系统 (`src/components/ui/`)

基于 Radix UI 和 Tailwind CSS 的现代化组件系统：
- `Button` - 支持 6 种变体（default、destructive、outline、secondary、ghost、link）和 4 种尺寸
- `Card` - 卡片容器及子组件（Header、Title、Description、Content、Footer、Action）
- `Badge` - 标签徽章，支持 4 种变体（default、secondary、destructive、outline）
- `Tabs` - 选项卡组件（基于 Radix UI）
- `utils.ts` - `cn()` 工具函数用于合并和优化 className

**设计原则**:
- 使用 CVA (class-variance-authority) 管理组件变体
- 使用 `cn()` 工具合并 className（clsx + tailwind-merge）
- 支持 `forwardRef` 传递 ref
- 继承原生 HTML 元素属性
- 完整的 TypeScript 类型支持
- 支持 Radix UI 的无障碍访问特性

### 环境模拟 (`src/mockEnv.ts`)

**触发条件**（满足任一）:
- 开发模式 (`import.meta.env.DEV`)
- 构建时设置 `VITE_FORCE_TG_MOCK=true`
- URL 参数包含 `mockEnv=1`
- 托管在 GitHub Pages（`*.github.io`）

**模拟功能**:
- 主题参数（theme_params）
- 视口信息（viewport）
- 安全区域（safe_area）
- 初始化数据（init_data，包含假用户信息）

**⚠️ 注意**: 生产环境如果不需要模拟，需要:
1. 删除 `src/index.tsx` 中的 `import './mockEnv.ts'`，或
2. 构建时设置 `VITE_FORCE_TG_MOCK=false`

### 样式系统

**Tailwind 配置** (`tailwind.config.js`):
- 启用 `dark` 类模式
- 自定义品牌色：`brand-lime` (#c8ff00)、`brand-midnight` (#030213)
- 自定义字体：SF Pro Display、Inter、PingFang SC
- 自定义动画：`scroll-seamless`（无缝滚动）、`pulse-ring`（脉冲环）
- 插件：`@tailwindcss/container-queries`

**全局样式** (`src/index.css`):
- Tailwind base/components/utilities 层
- 自定义全局样式

### TypeScript 配置

**关键设置** (`tsconfig.json`):
- 路径别名：`@/*` → `./src/*`
- 严格模式：启用所有严格类型检查
- 模块解析：`bundler`（Vite 优化）
- 未使用变量/参数检查：启用

### 构建配置

**Vite 配置** (`vite.config.ts`):
- **base**: `/xNova/`（GitHub Pages 路径，部署到其他平台需修改）
- **target**: `esnext`
- **minify**: `terser`
- **插件**:
  - `@vitejs/plugin-react-swc` - React + SWC 快速编译
  - `vite-tsconfig-paths` - 支持 tsconfig 路径别名
  - `vite-plugin-mkcert` - HTTPS 开发（仅当 `HTTPS` 环境变量存在）

### 部署配置

**GitHub Pages**:
1. 修改 `package.json` 中的 `homepage` 字段为你的仓库地址
2. 修改 `vite.config.ts` 中的 `base` 字段为你的仓库名
3. 运行 `npm run deploy`

**示例**（用户名 `telegram-mini-apps`，仓库名 `is-awesome`）:
```json
// package.json
"homepage": "https://telegram-mini-apps.github.io/is-awesome"
```
```ts
// vite.config.ts
base: '/is-awesome/'
```

## 开发注意事项

1. **包管理器**: 必须使用 npm（不支持 yarn/pnpm）

2. **HTTPS 证书**: 首次运行 `npm run dev:https` 需要 sudo 权限配置证书。Android/iOS TG 客户端不接受自签名证书，需使用远程服务器或配置有效证书。

3. **Telegram SDK 依赖**:
   - `@tma.js/sdk` 库仅在 Telegram 环境中可用
   - 开发模式依赖 `mockEnv.ts` 模拟环境
   - 生产环境部署到 TG 前需移除模拟逻辑

4. **状态管理**:
   - 当前无路由库，使用简单 state 管理视图
   - 如需添加复杂路由，考虑引入轻量级方案（如 wouter）

5. **组件开发**:
   - 新 UI 组件放在 `src/ui/`
   - 页面组件放在 `src/app/pages/`
   - 使用 `cn()` 工具处理条件样式

6. **Figma 设计同步**:
   - 设计文件位于 `/Users/kk/work/figma/project`
   - 实现新功能前参考 Figma 确保视觉一致性

7. **类型安全**:
   - 所有代码需通过 TypeScript 类型检查
   - 构建前自动运行 `tsc --noEmit`

8. **ESLint 规则**:
   - 使用 TypeScript ESLint 推荐规则
   - React Hooks 规则已启用
   - 禁用规则：`@typescript-eslint/no-unused-expressions`
