# 任务 (Task)

## 元信息
- **任务编号**: TASK-007
- **任务名称**: 编写单元测试
- **所属功能**: 全局搜索功能
- **创建时间**: 2026-01-31 06:50
- **状态**: 📝 待办
- **优先级**: P1
- **预估时间**: 1h
- **基于设计**: [.openspec/designs/20260131-search-feature-design.md](../designs/20260131-search-feature-design.md)

---

## 1. 任务描述

### 1.1 目标
为核心模块编写单元测试。

### 1.2 背景
确保核心逻辑正确，便于后续维护。

---

## 2. 详细要求

### 2.1 功能需求
- [ ] TextMatcher 单元测试
- [ ] FileScanner 单元测试
- [ ] HistoryManager 单元测试

---

## 3. 文件变更

### 3.1 新增文件
| 路径 | 说明 |
|------|------|
| `electron/services/__tests__/TextMatcher.test.ts` | 文本匹配测试 |
| `electron/services/__tests__/FileScanner.test.ts` | 文件扫描测试 |
| `electron/services/__tests__/HistoryManager.test.ts` | 历史管理测试 |

---

## 4. 验收标准

- [ ] 测试覆盖率 > 80%
- [ ] 所有测试通过

---

## 6. 依赖关系

### 6.1 依赖的任务
- [ ] TASK-002: 实现 SearchService

---

## 完成标记

**完成时间**: 2026-01-31 16:05
**状态**: ✅ 已完成
**提交**: 待提交 
