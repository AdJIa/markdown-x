# 任务 (Task)

## 元信息
- **任务编号**: TASK-002
- **任务名称**: 实现主进程 SearchService
- **所属功能**: 全局搜索功能
- **创建时间**: 2026-01-31 06:50
- **状态**: 📝 待办
- **优先级**: P0
- **预估时间**: 2h
- **基于设计**: [.openspec/designs/20260131-search-feature-design.md](../designs/20260131-search-feature-design.md)

---

## 1. 任务描述

### 1.1 目标
实现主进程的搜索服务，包括 FileScanner、ContentReader、TextMatcher、HistoryManager。

### 1.2 背景
搜索的核心逻辑在主进程执行，需要实现完整的服务层。

---

## 2. 详细要求

### 2.1 功能需求
- [ ] 实现 FileScanner 类 - 遍历文件
- [ ] 实现 ContentReader 类 - 读取文件内容
- [ ] 实现 TextMatcher 类 - 文本匹配
- [ ] 实现 HistoryManager 类 - 历史管理
- [ ] 实现 SearchService 类 - 整合以上组件

### 2.2 技术需求
- [ ] 文件路径: `electron/services/*.ts`
- [ ] 支持取消搜索
- [ ] 控制并发读取
- [ ] 错误处理完善

---

## 3. 文件变更

### 3.1 新增文件
| 路径 | 说明 |
|------|------|
| `electron/services/FileScanner.ts` | 文件扫描器 |
| `electron/services/ContentReader.ts` | 内容读取器 |
| `electron/services/TextMatcher.ts` | 文本匹配器 |
| `electron/services/HistoryManager.ts` | 历史管理器 |
| `electron/services/SearchService.ts` | 搜索服务 |

---

## 4. 实现指导

参考设计文档中的"详细设计"部分。

关键要点:
- 使用 `fs/promises` 读取文件
- 使用 `AbortController` 支持取消
- 并发控制: 最多同时读取 10 个文件
- 历史存储使用 electron-store

---

## 5. 验收标准

### 5.1 功能验收
- [ ] FileScanner 能正确遍历站点文件
- [ ] ContentReader 能正确读取文件
- [ ] TextMatcher 能正确匹配文本
- [ ] HistoryManager 能保存/读取历史
- [ ] SearchService 能执行完整搜索流程

### 5.2 代码验收
- [ ] TypeScript 类型正确
- [ ] 错误处理完善
- [ ] 代码有注释

### 5.3 测试验收
- [ ] 单元测试覆盖核心逻辑
- [ ] 类型检查通过

---

## 6. 依赖关系

### 6.1 依赖的任务
- [ ] TASK-001: 创建搜索相关类型定义

### 6.2 被依赖的任务
- [ ] TASK-004: 实现 IPC 通信

---

## 完成标记

**完成时间**: 2026-01-31 15:30
**状态**: ✅ 已完成
**提交**: 待提交 
