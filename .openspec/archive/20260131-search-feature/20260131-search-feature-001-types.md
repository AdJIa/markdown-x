# 任务 (Task)

## 元信息
- **任务编号**: TASK-001
- **任务名称**: 创建搜索相关类型定义
- **所属功能**: 全局搜索功能
- **创建时间**: 2026-01-31 06:50
- **状态**: 📝 待办
- **优先级**: P0
- **预估时间**: 30min
- **基于设计**: [.openspec/designs/20260131-search-feature-design.md](../designs/20260131-search-feature-design.md)

---

## 1. 任务描述

### 1.1 目标
定义全局搜索功能所需的所有 TypeScript 类型，包括数据结构、接口、枚举等。

### 1.2 背景
所有类型需要在一开始定义好，供后续组件和服务使用。

---

## 2. 详细要求

### 2.1 功能需求
- [ ] 定义 SearchResult 类型
- [ ] 定义 SearchRequest / SearchResponse 类型
- [ ] 定义 SearchHistoryItem 类型
- [ ] 定义 IPC 接口类型

### 2.2 技术需求
- [ ] 类型定义在 `src/types/search.ts`
- [ ] 导出到 `src/types/index.ts`
- [ ] 所有字段必须有类型注解，禁止 any

---

## 3. 文件变更

### 3.1 新增文件
| 路径 | 说明 |
|------|------|
| `src/types/search.ts` | 搜索相关类型定义 |

### 3.2 修改文件
| 路径 | 修改内容 |
|------|----------|
| `src/types/index.ts` | 导出 search 类型 |

---

## 4. 实现指导

### 4.1 关键实现点
参考设计文档中的数据结构规格部分。

### 4.2 代码示例
```typescript
// src/types/search.ts

export interface SearchResult {
  id: string;
  filePath: string;
  fileName: string;
  siteId: string;
  lineNumber: number;
  column: number;
  preview: string;
  matches: Array<{
    start: number;
    end: number;
  }>;
}

export interface SearchRequest {
  keyword: string;
  siteIds?: string[];
  maxResults?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalFiles: number;
  searchedFiles: number;
  searchTime: number;
  truncated: boolean;
}

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
  resultCount: number;
}

// IPC 接口
export interface ElectronAPI {
  searchQuery: (request: SearchRequest) => Promise<SearchResponse>;
  searchCancel: () => void;
  searchGetHistory: () => Promise<SearchHistoryItem[]>;
  searchSaveToHistory: (item: Omit<SearchHistoryItem, 'id'>) => Promise<void>;
}
```

---

## 5. 验收标准

### 5.1 功能验收
- [ ] src/types/search.ts 文件存在
- [ ] 所有类型定义正确
- [ ] src/types/index.ts 正确导出

### 5.2 代码验收
- [ ] TypeScript 类型正确
- [ ] 无 any 类型
- [ ] 代码风格符合规范

### 5.3 测试验收
- [ ] 类型检查通过 (npm run typecheck)

---

## 6. 依赖关系

### 6.1 依赖的任务
- [ ] 无 (这是第一个任务)

### 6.2 被依赖的任务
- [ ] TASK-002: 实现 SearchService
- [ ] TASK-003: 实现 SearchContext

---

## 7. 实现记录

### 7.1 实现人
OpenCode Agent (moonshotai-cn/kimi-k2.5)

### 7.2 开始时间
2026-01-31 13:59

### 7.3 完成时间
2026-01-31 14:05

### 7.4 实际耗时
6 分钟

### 7.5 遇到的问题
无

### 7.6 变更说明
- 创建 `src/types/search.ts`，定义所有搜索相关类型
- 更新 `src/types/index.ts`，导出搜索类型并添加 electronAPI 搜索方法

---

## 8. 审查记录

### 8.1 审查人
Self

### 8.2 审查时间
2026-01-31 14:05

### 8.3 审查意见
- ✅ 所有类型定义完整
- ✅ 无 any 类型
- ✅ 代码风格与项目一致
- ✅ 类型检查通过 (npm run typecheck)

### 8.4 是否通过
- [x] 通过
- [ ] 需修改

---

## 完成标记

**完成时间**: 2026-01-31 14:05
**状态**: ✅ 已完成
**提交**: 待提交 
