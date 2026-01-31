# Markdown-X 项目上下文

## 项目定位
一款功能强大的**本地 Markdown 阅读和编辑器**，基于 Electron 构建的桌面应用，支持实时预览、多站点管理、Mermaid 图表、数学公式等高级功能。

## 核心技术栈

### 运行时
| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 30.x | 跨平台桌面应用框架 |
| React | 18.x | UI 组件库 |
| TypeScript | 5.4.x | 类型安全 |
| Node.js | >=18 | 运行时 |

### 构建工具
| 工具 | 用途 |
|------|------|
| Vite | 前端构建 + 热更新 |
| electron-builder | 应用打包 |
| concurrently | 并行运行开发服务器 |

### 编辑器与渲染
| 库 | 用途 |
|------|------|
| @uiw/react-codemirror | Markdown 编辑器 |
| react-markdown | Markdown 渲染 |
| remark-gfm | GitHub Flavored Markdown |
| rehype-katex | LaTeX 数学公式 |
| mermaid | 流程图/时序图/甘特图 |
| react-syntax-highlighter | 代码高亮 |

### 系统功能
| 库 | 用途 |
|------|------|
| chokidar | 文件系统监控 |
| electron-store | 本地配置存储 |
| uuid | 唯一标识符生成 |

## 架构设计

### 进程分离
```
┌─────────────────────────────────────────────────┐
│                   主进程 (Node.js)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ 窗口管理  │  │ 文件系统  │  │ 系统对话框    │   │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └─────────────┴───────────────┘            │
│                    IPC (预加载脚本)                │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────┐
│              渲染进程 (Chromium)                  │
│  ┌───────────────────┼───────────────────────┐  │
│  │         React 应用 (UI 层)                  │  │
│  │  ┌────────┐ ┌────────┐ ┌──────────────┐   │  │
│  │  │ Editor │ │ Preview│ │  FileTree    │   │  │
│  │  └────────┘ └────────┘ └──────────────┘   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 数据流
1. **用户操作** → React 组件
2. **状态变更** → React Context
3. **需要系统功能** → IPC 调用
4. **主进程处理** → 返回结果
5. **UI 更新** → 重新渲染

## 开发规范

### 文件命名
- 组件: `PascalCase.tsx` (如 `Editor.tsx`)
- 工具函数: `camelCase.ts` (如 `fileUtils.ts`)
- 类型定义: `types.ts` 或 `*.types.ts`
- 样式: `*.css` 或 `*.module.css`

### TypeScript 规范
```typescript
// ✅ 显式定义接口
interface FileNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

// ✅ 函数返回类型
async function readFile(path: string): Promise<string> {
  // ...
}

// ❌ 禁止隐式 any
function badFunc(data) { ... }  // 错误！
```

### IPC 通信规范
所有 IPC 必须在 `electron/preload.ts` 中定义：
```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('file:write', path, content),
  
  // 对话框
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
});
```

### 错误处理
```typescript
// ✅ 显式处理错误
async function loadFile(path: string) {
  try {
    const content = await window.electronAPI.readFile(path);
    return { success: true, content };
  } catch (error) {
    console.error('Failed to load file:', error);
    return { success: false, error: error.message };
  }
}
```

### CSS 变量规范
```css
:root {
  /* 背景 */
  --bg-primary: #1a1a2e;
  --bg-secondary: #252542;
  --bg-tertiary: #303052;
  
  /* 文本 */
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  
  /* 强调色 */
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  
  /* 边框 */
  --border-color: rgba(255, 255, 255, 0.1);
}
```

## Git 提交规范

### Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具

### 示例
```bash
feat(editor): 添加代码折叠功能

- 集成 @codemirror/fold 扩展
- 添加折叠/展开快捷键
- 支持记忆折叠状态

Closes #42
```

## 性能考量

### 大文件处理
- 使用虚拟滚动处理大文档
- 文件树懒加载子目录
- 编辑器内容按需渲染

### 文件监控
- 使用 chokidar 的 debounce 选项
- 区分文件内容和元数据变更
- 避免不必要的重新渲染

### 渲染优化
- React.memo 包裹纯展示组件
- useMemo/useCallback 优化计算
- CodeMirror 使用单一实例

## 安全注意事项

### 文件系统
- 所有路径操作必须经过验证
- 禁止访问应用目录外的敏感路径
- 文件写入前确认用户授权

### XSS 防护
- Markdown 渲染使用 DOMPurify
- 禁止直接插入 HTML
- 代码执行沙箱化

## 测试策略

### 单元测试
- 工具函数需要单元测试
- 组件使用 React Testing Library

### 集成测试
- IPC 通信端到端测试
- 文件操作流程测试

### 手动测试清单
- [ ] 新建/打开/保存文件
- [ ] 站点添加/删除
- [ ] 视图模式切换
- [ ] Markdown 扩展语法
- [ ] 多平台兼容性

## 待改进项

1. **搜索功能**: 全局内容搜索
2. **插件系统**: 支持自定义扩展
3. **云端同步**: 配置和文件云备份
4. **协作编辑**: 多人实时编辑
5. **移动端适配**: 响应式布局优化
