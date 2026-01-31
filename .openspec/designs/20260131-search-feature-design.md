# 设计方案 (Design)

## 元信息
- **功能名称**: 全局搜索功能
- **设计版本**: v1.0
- **设计时间**: 2026-01-31 06:45
- **设计人**: OpenSpec Agent
- **状态**: ✅ 已通过
- **基于规格**: [.openspec/specs/20260131-search-feature-spec.md](../specs/20260131-search-feature-spec.md)

---

## 1. 概述

### 1.1 引用规格
本设计基于规格: [全局搜索功能规格](../specs/20260131-search-feature-spec.md)

### 1.2 设计目标
设计全局搜索功能的技术架构，包括组件设计、模块划分、数据流、关键决策等。

---

## 2. 架构设计

### 2.1 系统架构图
```
┌──────────────────────────────────────────────────────────────────────┐
│                           渲染进程 (Renderer)                         │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────────────────────┐  │
│  │   SearchPanel    │         │           AppContext             │  │
│  │  ┌────────────┐  │         │  ┌────────────────────────────┐  │  │
│  │  │SearchInput │  │◄────────┤  │     SearchContext          │  │  │
│  │  └────────────┘  │  dispatch  │  - searchKeyword           │  │  │
│  │        │         │         │  │  - searchResults           │  │  │
│  │  ┌────────────┐  │         │  │  - isSearching             │  │  │
│  │  │SearchResults│ │◄────────┤  │  - searchHistory           │  │  │
│  │  └────────────┘  │  state     │  - actions                 │  │  │
│  │        │         │         │  └────────────────────────────┘  │  │
│  │  ┌────────────┐  │         └──────────────────────────────────┘  │
│  │  │SearchHistory│ │                                               │
│  │  └────────────┘  │                                               │
│  └──────────────────┘                                               │
│           │                                                          │
│           │ IPC invoke                                               │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          主进程 (Main)                                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                      SearchService                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │  FileScanner │──►│ ContentReader│──►│  TextMatcher       │  │  │
│  │  │  - 遍历文件   │  │  - 读取内容  │  │  - 匹配关键词       │  │  │
│  │  │  - 过滤排除   │  │  - 编码处理  │  │  - 提取预览         │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │  │
│  │                          │                                      │  │
│  │                          ▼                                      │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  HistoryManager                                            │  │  │
│  │  │  - 保存/读取搜索历史 (electron-store)                      │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
               ┌───────────┴───────────┐
               ▼                       ▼
        ┌──────────────┐       ┌──────────────┐
        │   Node.js    │       │  chokidar    │
        │     fs       │       │  (已有)      │
        └──────────────┘       └──────────────┘
```

### 2.2 模块划分

#### 模块 1: SearchPanel (渲染进程)
**职责**: 搜索面板 UI，包含输入框、结果列表、历史记录
**接口**: 
```typescript
interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
```
**依赖**: SearchContext

#### 模块 2: SearchContext (渲染进程)
**职责**: 搜索状态管理，提供 actions 给组件
**接口**:
```typescript
interface SearchContextValue {
  keyword: string;
  results: SearchResult[];
  isSearching: boolean;
  history: SearchHistoryItem[];
  setKeyword: (k: string) => void;
  performSearch: () => Promise<void>;
  cancelSearch: () => void;
  clearHistory: () => void;
}
```
**依赖**: electronAPI (IPC)

#### 模块 3: SearchService (主进程)
**职责**: 执行搜索的核心逻辑
**接口**:
```typescript
class SearchService {
  async search(request: SearchRequest): Promise<SearchResponse>;
  cancel(): void;
  getHistory(): SearchHistoryItem[];
  saveToHistory(item: SearchHistoryItem): void;
}
```
**依赖**: FileScanner, ContentReader, TextMatcher, HistoryManager

#### 模块 4: FileScanner (主进程)
**职责**: 遍历文件系统，获取可搜索文件列表
**接口**:
```typescript
class FileScanner {
  async scan(siteIds?: string[]): Promise<string[]>;
  private isValidFile(path: string): boolean;
}
```

#### 模块 5: ContentReader (主进程)
**职责**: 读取文件内容
**接口**:
```typescript
class ContentReader {
  async read(filePath: string): Promise<string>;
  private shouldSkip(filePath: string, size: number): boolean;
}
```

#### 模块 6: TextMatcher (主进程)
**职责**: 文本匹配和预览提取
**接口**:
```typescript
class TextMatcher {
  match(content: string, keyword: string): MatchResult[];
  extractPreview(content: string, matches: MatchResult[]): string;
}
```

#### 模块 7: HistoryManager (主进程)
**职责**: 管理搜索历史
**接口**:
```typescript
class HistoryManager {
  getAll(): SearchHistoryItem[];
  add(item: SearchHistoryItem): void;
  clear(): void;
  private trim(): void;  // 保持最多 50 条
}
```

### 2.3 数据流
```
1. 用户输入关键词
   │
   ▼
2. SearchContext.setKeyword()
   │
   ▼
3. 用户按 Enter
   │
   ▼
4. SearchContext.performSearch()
   │
   ▼
5. IPC: search:query → 主进程
   │
   ▼
6. SearchService.search()
   ├── FileScanner.scan() → 文件列表
   ├── ContentReader.read() → 文件内容
   ├── TextMatcher.match() → 匹配结果
   └── 聚合结果
   │
   ▼
7. IPC: 返回 SearchResponse
   │
   ▼
8. SearchContext 更新 results
   │
   ▼
9. SearchResults 组件重新渲染
```

---

## 3. 详细设计

### 3.1 SearchPanel 组件详细设计

**职责**: 搜索面板容器，管理打开/关闭状态

**接口定义**:
```typescript
interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchPanelState {
  isAnimating: boolean;
}
```

**实现策略**:
- 使用 CSS transform 实现滑入动画
- 点击遮罩层关闭面板
- Esc 键关闭面板
- 打开时自动聚焦输入框

**关键实现点**:
```typescript
// 快捷键监听
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      onOpen();
    }
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

### 3.2 SearchService 详细设计

**职责**: 执行搜索的核心逻辑

**实现策略**:
- 使用异步生成器逐文件处理，支持取消
- 控制并发读取文件数 (max 10)
- 使用 AbortController 支持取消

**关键算法/流程**:
```typescript
async search(request: SearchRequest): Promise<SearchResponse> {
  const abortController = new AbortController();
  this.currentSearch = abortController;
  
  const files = await this.fileScanner.scan(request.siteIds);
  const results: SearchResult[] = [];
  let searchedFiles = 0;
  
  // 分批处理，控制并发
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    if (abortController.signal.aborted) break;
    
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(file => this.searchFile(file, request.keyword))
    );
    
    results.push(...batchResults.flat());
    searchedFiles += batch.length;
    
    // 发送进度更新
    this.sendProgress(searchedFiles, files.length);
    
    // 检查是否达到最大结果数
    if (results.length >= request.maxResults!) {
      results.length = request.maxResults!;
      break;
    }
  }
  
  return {
    results,
    totalFiles: files.length,
    searchedFiles,
    searchTime: Date.now() - startTime,
    truncated: results.length >= request.maxResults!
  };
}
```

### 3.3 TextMatcher 详细设计

**职责**: 文本匹配和预览提取

**实现策略**:
- 使用 indexOf 进行简单文本匹配 (区分大小写选项)
- 提取匹配行及上下文

**关键算法**:
```typescript
match(content: string, keyword: string): MatchResult[] {
  const results: MatchResult[] = [];
  const lines = content.split('\n');
  const lowerKeyword = keyword.toLowerCase();
  
  lines.forEach((line, lineIndex) => {
    let index = 0;
    while (true) {
      const foundIndex = line.toLowerCase().indexOf(lowerKeyword, index);
      if (foundIndex === -1) break;
      
      results.push({
        lineNumber: lineIndex + 1,
        column: foundIndex + 1,
        match: line.slice(foundIndex, foundIndex + keyword.length)
      });
      
      index = foundIndex + 1;
    }
  });
  
  return results;
}

extractPreview(line: string, column: number, keyword: string): string {
  const maxLength = 80;
  const contextChars = 30;
  
  const start = Math.max(0, column - 1 - contextChars);
  const end = Math.min(line.length, column - 1 + keyword.length + contextChars);
  
  let preview = line.slice(start, end);
  if (start > 0) preview = '...' + preview;
  if (end < line.length) preview = preview + '...';
  
  return preview;
}
```

---

## 4. 关键决策

### 4.1 决策 1: 搜索算法选择
**问题**: 使用实时遍历还是预建索引？

**选项对比**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| 实时遍历 | 实现简单，无维护成本，始终最新 | 大量文件性能一般 |
| 预建索引 | 搜索极快 | 需要维护索引，增加复杂性 |

**决策**: 采用 **实时遍历** (MVP 方案)

**理由**:
1. 对于目标场景 (<1000 文件) 性能足够
2. 实现简单，2 天可完成
3. 后续可平滑升级为混合方案

### 4.2 决策 2: 状态管理方案
**问题**: 使用 Context 还是 Redux？

**选项对比**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| React Context | 无需额外依赖，项目已有 | 大数据量更新性能一般 |
| Redux | 性能好，调试方便 | 需要额外依赖和样板代码 |

**决策**: 采用 **React Context**

**理由**:
1. 项目已使用 Context 模式
2. 搜索状态相对简单，不需要 Redux
3. 保持技术栈一致性

### 4.3 决策 3: 文件读取策略
**问题**: 如何控制并发读取？

**决策**: 采用 **分批并发，每批 10 个文件**

**理由**:
1. 平衡性能和资源使用
2. 避免同时打开过多文件句柄
3. 可中途取消

---

## 5. 技术选型

### 5.1 无需新增依赖
- **文件读取**: Node.js 原生 fs/promises
- **文本匹配**: 原生 String.indexOf
- **状态管理**: React Context (已有)

### 5.2 使用现有依赖
- **文件监控**: chokidar (项目中已有)
- **存储**: electron-store (项目中已有)

---

## 6. 风险缓解

### 6.1 技术风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 大量文件搜索卡顿 | 高 | 1. 分批并发处理 2. 添加取消按钮 3. 限制最大结果数 |
| 内存溢出 | 中 | 1. 限制单文件读取大小 2. 流式读取大文件 |
| 搜索结果过多 | 中 | 限制最大结果数 100 条，标记 truncated |

### 6.2 实现风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 编码问题 (非 UTF8 文件) | 中 | 使用 iconv-lite 检测编码 |
| 权限问题 | 低 | 静默跳过无权限文件 |

---

## 7. 文件结构

### 7.1 新增文件
| 路径 | 说明 |
|------|------|
| `src/components/SearchPanel.tsx` | 搜索面板组件 |
| `src/components/SearchInput.tsx` | 搜索输入框 |
| `src/components/SearchResults.tsx` | 搜索结果列表 |
| `src/components/SearchHistory.tsx` | 搜索历史 |
| `src/contexts/SearchContext.tsx` | 搜索状态管理 |
| `src/types/search.ts` | 搜索相关类型定义 |
| `src/styles/search.css` | 搜索组件样式 |
| `electron/services/SearchService.ts` | 搜索服务 |
| `electron/services/FileScanner.ts` | 文件扫描器 |
| `electron/services/ContentReader.ts` | 内容读取器 |
| `electron/services/TextMatcher.ts` | 文本匹配器 |
| `electron/services/HistoryManager.ts` | 历史管理器 |

### 7.2 修改文件
| 路径 | 修改内容 |
|------|----------|
| `electron/main.ts` | 添加 IPC 处理器 |
| `electron/preload.ts` | 暴露搜索 API |
| `src/App.tsx` | 添加 SearchPanel 和快捷键监听 |
| `src/types/index.ts` | 导出搜索类型 |

### 7.3 删除文件
| 路径 | 说明 |
|------|------|
| 无 | - |

---

## 8. 测试策略

### 8.1 单元测试
- **TextMatcher**: 测试各种文本匹配场景
- **FileScanner**: 测试文件过滤和遍历
- **HistoryManager**: 测试历史记录的增删改查

### 8.2 集成测试
- **SearchService**: 测试完整搜索流程
- **IPC 通信**: 测试渲染进程和主进程通信

### 8.3 端到端测试
- 打开搜索面板 → 输入关键词 → 查看结果 → 点击跳转
- 取消搜索功能
- 历史记录功能

---

## 9. 下一步

设计通过后，进入 **任务拆分 (Tasks)** 阶段。

运行: `./openspec-dev.sh plan search-feature`

---

## 审查清单

- [x] 基于已通过的规格
- [x] 架构清晰
- [x] 模块职责明确
- [x] 关键决策有依据
- [x] 风险有应对方案
- [x] 可追溯性建立

**审查结论**: ✅ 通过，可以进入 TASKS 阶段
