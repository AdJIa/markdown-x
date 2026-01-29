# Markdown-X

一款功能强大的本地 Markdown 阅读和编辑器，基于 Electron 构建的桌面应用。

![Markdown-X 截图](screenshot.png)

## 功能特性

### 编辑与预览
- **实时预览** - 边写边看，所见即所得
- **三种视图模式** - 仅编辑、仅预览、分屏模式自由切换
- **代码高亮** - 支持多种编程语言的语法高亮

### Markdown 扩展
- **GFM 支持** - GitHub Flavored Markdown，包括表格、任务列表、删除线等
- **数学公式** - 基于 KaTeX 的 LaTeX 数学公式渲染
- **Mermaid 图表** - 支持流程图、时序图、甘特图等
- **代码块** - 支持语法高亮的代码块

### 站点管理
- **多站点支持** - 管理多个本地 Markdown 项目/文件夹
- **文件树浏览** - 直观的文件目录树导航
- **实时文件监控** - 自动检测文件系统变化并同步

### 用户体验
- **现代化界面** - 简洁优雅的深色主题设计
- **快捷键支持** - `Cmd/Ctrl + S` 快速保存
- **侧边栏折叠** - 可折叠的侧边栏，最大化编辑区域

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的前端构建工具
- **CodeMirror 6** - 代码编辑器
- **react-markdown** - Markdown 渲染
- **KaTeX** - 数学公式渲染
- **Mermaid** - 图表渲染
- **Chokidar** - 文件系统监控

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将同时启动 Vite 开发服务器和 Electron 应用。

### 构建应用

```bash
npm run build
```

构建产物将输出到 `release` 目录。

## 项目结构

```
markdown-x/
├── electron/           # Electron 主进程代码
│   ├── main.ts        # 主进程入口
│   └── preload.ts     # 预加载脚本
├── src/               # React 渲染进程代码
│   ├── components/    # React 组件
│   │   ├── Editor.tsx     # Markdown 编辑器
│   │   ├── Preview.tsx    # Markdown 预览
│   │   ├── FileTree.tsx   # 文件树组件
│   │   ├── Sidebar.tsx    # 侧边栏
│   │   └── SiteManager.tsx # 站点管理
│   ├── contexts/      # React Context
│   ├── styles/        # CSS 样式文件
│   ├── types/         # TypeScript 类型定义
│   ├── App.tsx        # 应用主组件
│   └── main.tsx       # 渲染进程入口
├── dist/              # 编译输出
└── release/           # 打包输出
```

## 使用说明

### 添加站点

1. 点击侧边栏底部的站点管理按钮
2. 选择「链接本地文件夹」
3. 浏览并选择包含 Markdown 文件的文件夹
4. 可选择启用实时文件监控

### 编辑文件

1. 在左侧文件树中选择 Markdown 文件
2. 在编辑器中进行编辑
3. 右侧实时预览效果
4. 使用 `Cmd/Ctrl + S` 保存

### 视图切换

使用工具栏中间的按钮在三种视图模式间切换：
- 📝 仅编辑器
- 📖 分屏视图
- 👁 仅预览

## 许可证

MIT License
