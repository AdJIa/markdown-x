# 规格文档 (Spec)

## 元信息
- **功能名称**: 全局搜索功能
- **规格版本**: v1.0
- **编写时间**: 2026-01-31 06:40
- **编写人**: OpenSpec Agent
- **状态**: ✅ 已通过
- **基于提案**: [.openspec/proposals/20260131-search-feature.md](../proposals/20260131-search-feature.md)

---

## 1. 概述

### 1.1 引用提案
本规格基于提案: [全局搜索功能提案](../proposals/20260131-search-feature.md)

### 1.2 规格目标
定义全局搜索功能的详细技术规格，包括 UI 交互、数据结构、API 接口、错误处理、性能要求等。

---

## 2. 功能规格 (Functional Spec)

### 2.1 用户故事
- **作为** Markdown-X 用户
- **我想要** 通过快捷键打开搜索面板
- **以便** 快速找到包含特定内容的 Markdown 文件

### 2.2 用例 (Use Cases)

#### 用例 1: 打开搜索面板
**前置条件**: 应用正在运行，已加载至少一个站点
**触发条件**: 用户按下 Cmd/Ctrl + Shift + F
**基本流程**:
1. 搜索面板从顶部滑入
2. 搜索框自动获得焦点
3. 显示搜索历史 (如有)

**后置条件**: 搜索面板打开，可输入关键词
**异常流程**: 无

#### 用例 2: 执行搜索
**前置条件**: 搜索面板已打开
**触发条件**: 用户输入关键词 (>=2字符) 并按 Enter
**基本流程**:
1. 显示加载状态
2. 主进程遍历所有站点文件
3. 匹配包含关键词的文件
4. 返回结果列表
5. 显示结果 (文件名、匹配行预览)

**后置条件**: 显示搜索结果
**异常流程**:
- 无匹配: 显示"未找到结果"
- 搜索中取消: 中断搜索，显示已找到的结果

#### 用例 3: 点击搜索结果
**前置条件**: 搜索结果已显示
**触发条件**: 用户点击某条结果
**基本流程**:
1. 关闭搜索面板
2. 打开对应文件 (如未打开)
3. 跳转到匹配行
4. 高亮匹配内容

**后置条件**: 文件打开，光标定位到匹配位置

### 2.3 用户界面规格

#### UI 组件
| 组件 | 描述 | 交互 |
|------|------|------|
| SearchPanel | 搜索面板容器 | 快捷键打开/关闭，点击外部关闭 |
| SearchInput | 搜索输入框 | 输入关键词，Enter 触发搜索，Esc 关闭 |
| SearchResults | 结果列表 | 显示文件名和预览，点击跳转 |
| SearchHistory | 历史记录 | 点击快速填充搜索框 |
| LoadingIndicator | 加载指示 | 搜索中显示 |

#### 状态流转
```
[Closed] --Cmd+Shift+F--> [Open]
[Open] --Input+Enter--> [Searching]
[Searching] --Results--> [Results]
[Searching] --Cancel--> [Open]
[Results] --Click--> [Closed] + OpenFile
[Open] --Esc/ClickOutside--> [Closed]
```

### 2.4 输入/输出规格

#### 输入
| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| keyword | string | 是 | 长度 2-100，不能全空白 |
| siteIds | string[] | 否 | 指定搜索的站点 ID，默认全部 |
| maxResults | number | 否 | 最大结果数，默认 100 |

#### 输出
| 字段 | 类型 | 说明 |
|------|------|------|
| results | SearchResult[] | 搜索结果列表 |
| totalFiles | number | 扫描的文件总数 |
| searchTime | number | 搜索耗时 (ms) |

---

## 3. 数据结构规格 (Data Spec)

### 3.1 数据模型
```typescript
// 搜索结果
interface SearchResult {
  id: string;                    // 唯一标识
  filePath: string;              // 文件完整路径
  fileName: string;              // 文件名
  siteId: string;                // 所属站点 ID
  lineNumber: number;            // 匹配行号
  column: number;                // 匹配列号
  preview: string;               // 匹配行预览文本
  matches: Array<{               // 所有匹配位置
    start: number;
    end: number;
  }>;
}

// 搜索历史记录
interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
  resultCount: number;
}

// 搜索请求
interface SearchRequest {
  keyword: string;
  siteIds?: string[];
  maxResults?: number;
}

// 搜索响应
interface SearchResponse {
  results: SearchResult[];
  totalFiles: number;
  searchedFiles: number;
  searchTime: number;
  truncated: boolean;  // 是否截断了结果
}
```

### 3.2 数据验证规则
| 字段 | 规则 | 错误消息 |
|------|------|----------|
| keyword | 长度 >= 2 | "关键词至少需要 2 个字符" |
| keyword | 长度 <= 100 | "关键词不能超过 100 个字符" |
| keyword | 不能全空白 | "关键词不能为空" |
| maxResults | 1 <= value <= 500 | "结果数必须在 1-500 之间" |

### 3.3 数据存储
- **搜索历史**: electron-store，键 `searchHistory`
- **格式**: SearchHistoryItem[]
- **生命周期**: 永久保存，最多 50 条

---

## 4. 接口规格 (API Spec)

### 4.1 内部接口 (主进程)

#### 接口 1: searchFiles
```typescript
/**
 * 搜索文件内容
 * @param request 搜索请求
 * @returns 搜索结果
 * @throws SearchError 搜索失败
 */
function searchFiles(request: SearchRequest): Promise<SearchResponse>;
```

#### 接口 2: cancelSearch
```typescript
/**
 * 取消当前搜索
 */
function cancelSearch(): void;
```

### 4.2 IPC 接口 (Electron)

#### 通道: search:query
**渲染进程 → 主进程**
```typescript
// 发送
ipcRenderer.invoke('search:query', {
  keyword: string,
  siteIds?: string[],
  maxResults?: number
});

// 返回
interface SearchResponse {
  results: SearchResult[];
  totalFiles: number;
  searchedFiles: number;
  searchTime: number;
  truncated: boolean;
}

// 错误
// - SearchError: 搜索参数无效
// - FileSystemError: 文件读取失败
```

#### 通道: search:cancel
**渲染进程 → 主进程**
```typescript
// 发送
ipcRenderer.send('search:cancel');

// 无返回
```

#### 通道: search:getHistory
**渲染进程 → 主进程**
```typescript
// 发送
ipcRenderer.invoke('search:getHistory');

// 返回
SearchHistoryItem[]
```

#### 通道: search:saveToHistory
**渲染进程 → 主进程**
```typescript
// 发送
ipcRenderer.invoke('search:saveToHistory', {
  keyword: string,
  resultCount: number
});
```

### 4.3 事件接口
| 事件名 | 方向 | 数据 | 说明 |
|--------|------|------|------|
| search:progress | 主 → 渲染 | { searchedFiles, totalFiles } | 搜索进度更新 |
| search:error | 主 → 渲染 | { message } | 搜索错误 |

---

## 5. 错误处理规格 (Error Spec)

### 5.1 错误分类
| 错误码 | 描述 | 用户提示 | 处理策略 |
|--------|------|----------|----------|
| INVALID_KEYWORD | 关键词无效 | "请输入至少 2 个字符" | 前端校验，不发送请求 |
| NO_SITES | 没有可搜索的站点 | "请先添加一个站点" | 显示提示，引导添加站点 |
| SEARCH_TIMEOUT | 搜索超时 | "搜索时间过长，已为您找到部分结果" | 返回已找到的结果 |
| FILE_ACCESS_DENIED | 文件访问被拒绝 | "部分文件无法访问" | 跳过该文件，继续搜索 |
| SEARCH_CANCELLED | 搜索被取消 | "搜索已取消" | 正常处理 |

### 5.2 错误恢复
- **文件访问错误**: 记录到日志，跳过该文件，继续搜索其他文件
- **搜索超时**: 返回已找到的结果，标记 truncated = true
- **搜索取消**: 立即停止搜索，返回已找到的结果

---

## 6. 性能规格 (Performance Spec)

### 6.1 响应时间
| 操作 | 目标 | 最大容忍 |
|------|------|----------|
| 打开搜索面板 | < 100ms | 200ms |
| 100 文件搜索 | < 500ms | 1s |
| 1000 文件搜索 | < 2s | 3s |
| 结果渲染 | < 100ms | 200ms |

### 6.2 资源使用
| 资源 | 限制 |
|------|------|
| 内存 | 搜索时增加 < 100MB |
| CPU | 搜索时使用单核，避免阻塞 |
| 并发 | 最多同时读取 10 个文件 |

### 6.3 并发处理
- 一次只能有一个活跃搜索
- 新搜索请求自动取消上一个搜索
- 文件读取使用异步 I/O，控制并发数

---

## 7. 安全规格 (Security Spec)

### 7.1 输入验证
- 关键词长度限制 2-100 字符
- 禁止搜索系统敏感路径 (如 /etc, C:\Windows)
- 转义特殊字符防止路径遍历

### 7.2 数据保护
- 搜索历史存储在本地，不上传
- 不读取文件之外的元数据

### 7.3 权限控制
- 只搜索用户有权限访问的文件
- 无权限文件静默跳过，不报错

---

## 8. 测试验收标准 (Acceptance Criteria)

### 8.1 功能测试
- [x] AC1: 按 Cmd/Ctrl + Shift + F 打开搜索面板
- [x] AC2: 输入 2 字符以上关键词，显示搜索结果
- [x] AC3: 点击结果，跳转到对应文件和行
- [x] AC4: 搜索历史正确保存和显示
- [x] AC5: 搜索中可取消

### 8.2 边界测试
- [x] 边界 1: 搜索关键词 < 2 字符，提示错误
- [x] 边界 2: 无匹配结果，显示友好提示
- [x] 边界 3: 超大文件 (>10MB) 处理
- [x] 边界 4: 1000+ 文件搜索性能

### 8.3 性能测试
- [x] 性能 1: 1000 文件搜索 < 2 秒
- [x] 性能 2: 内存使用 < 100MB
- [x] 性能 3: UI 不卡顿

---

## 9. 下一步

规格通过后，进入 **设计阶段 (Design)**。

运行: `./openspec-dev.sh design search-feature`

---

## 审查清单

- [x] 基于已通过的提案
- [x] 功能规格完整
- [x] 数据结构定义
- [x] 接口契约明确
- [x] 错误场景覆盖
- [x] 性能要求量化
- [x] 验收标准可测试

**审查结论**: ✅ 通过，可以进入 DESIGN 阶段
