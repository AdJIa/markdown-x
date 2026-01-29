# AI Agent 指南

本文档为 AI 代码助手提供项目上下文和开发指南。

## 项目概述

Markdown-X 是一款基于 Electron 的本地 Markdown 编辑器桌面应用，采用 React + TypeScript + Vite 技术栈。

## 技术架构

### 主要技术
- **Electron 30** - 桌面应用框架
- **React 18** - UI 框架
- **TypeScript 5** - 类型系统
- **Vite 5** - 构建工具
- **CodeMirror 6** - 编辑器核心

### 进程模型
- `electron/main.ts` - Electron 主进程，处理文件系统和窗口管理
- `electron/preload.ts` - 预加载脚本，暴露安全的 API 给渲染进程
- `src/` - React 渲染进程代码

### 目录结构
```
src/
├── components/     # React 组件
├── contexts/       # React Context (站点管理、主题)
├── styles/         # CSS 样式文件
├── types/          # TypeScript 类型定义
├── App.tsx         # 主应用组件
└── main.tsx        # 渲染进程入口

electron/
├── main.ts         # 主进程入口
├── preload.ts      # 预加载脚本
└── tsconfig.json   # 主进程 TS 配置
```

## 代码规范

### TypeScript
- 使用严格模式
- 组件 Props 使用 interface 定义
- 避免使用 `any` 类型

### React
- 使用函数组件和 Hooks
- Context 用于全局状态管理
- 组件文件使用 `.tsx` 扩展名

### 样式
- 每个组件有对应的 CSS 文件
- 使用 CSS 变量管理主题
- 类名使用 kebab-case

### 文件命名
- 组件: PascalCase (如 `SiteManager.tsx`)
- 样式: PascalCase (如 `SiteManager.css`)
- 类型: `index.ts` 在 `types/` 目录

## IPC 通信

主进程通过 `ipcMain.handle` 暴露以下 API：

| Channel | 功能 |
|---------|------|
| `select-directory` | 打开目录选择对话框 |
| `read-directory` | 递归读取目录结构 |
| `read-file` | 读取文件内容 |
| `write-file` | 写入文件内容 |
| `create-file` | 创建新文件 |
| `create-directory` | 创建新目录 |
| `delete-item` | 删除文件或目录 |
| `rename-item` | 重命名文件或目录 |
| `watch-directory` | 开始监控目录变化 |
| `unwatch-directory` | 停止监控目录 |
| `open-external` | 打开外部链接 |
| `path-exists` | 检查路径是否存在 |

## 开发命令

```bash
npm run dev          # 启动开发环境
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
npm run typecheck    # TypeScript 类型检查
```

## 重要约束

1. **安全性**: 渲染进程不能直接访问 Node.js API，必须通过 preload 脚本
2. **文件大小**: 读取文件限制为 10MB
3. **递归深度**: 目录读取最大深度为 10 层
4. **隐藏文件**: 默认不显示以 `.` 开头的文件和目录

## Markdown 渲染

支持的 Markdown 扩展：
- **GFM** - 表格、任务列表、删除线、自动链接
- **数学公式** - KaTeX 渲染 (内联 `$...$`，块级 `$$...$$`)
- **Mermaid 图表** - 代码块语言设为 `mermaid`
- **代码高亮** - 使用 highlight.js

## 常见任务

### 添加新组件
1. 在 `src/components/` 创建组件文件
2. 在 `src/styles/` 创建对应样式文件
3. 在组件中导入样式

### 添加新的 IPC 方法
1. 在 `electron/main.ts` 添加 `ipcMain.handle`
2. 在 `electron/preload.ts` 暴露到 `contextBridge`
3. 在 `src/types/index.ts` 添加类型定义

### 修改主题样式
- 全局 CSS 变量定义在 `src/styles/index.css`
- 组件特定样式在各自的 CSS 文件中
