#!/bin/bash
# OpenSpec SDD (Spec-Driven Development) 开发助手脚本
# 完整流程: EXPLORE → PROPOSAL → SPEC → DESIGN → TASKS → APPLY → TEST → ARCHIVE
# 上游优先原则: 必须先审查通过上游阶段，才能进入下游阶段

PROJECT_DIR="/home/lujia/clawd/repositories/markdown-x"
OPENCODE_CMD="opencode"
# 使用 Moonshot AI (China) Kimi K2.5 模型 (供应商: 月之暗面)
OPENCODE_MODEL="${OPENCODE_MODEL:-moonshotai-cn/kimi-k2.5}"
TEMPLATE_DIR=".openspec/templates"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 当前时间戳
TIMESTAMP=$(date +%Y%m%d)
DATETIME=$(date '+%Y-%m-%d %H:%M')

show_help() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    Markdown-X OpenSpec SDD 开发助手                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}SDD 完整流程:${NC}"
    echo "  EXPLORE → PROPOSAL → SPEC → DESIGN → TASKS → APPLY → TEST → ARCHIVE"
    echo ""
    echo -e "${YELLOW}命令列表:${NC}"
    echo ""
    echo "  ${GREEN}explore <feature-name>${NC}    启动探索模式 (Phase 0)"
    echo "                            分析 WHY/WHO/WHAT/CONTEXT/CONSTRAINTS"
    echo ""
    echo "  ${GREEN}propose <feature-name>${NC}    创建提案 (Phase 1)"
    echo "                            基于探索报告，定义 WHAT"
    echo ""
    echo "  ${GREEN}spec <feature-name>${NC}       创建规格文档 (Phase 2)"
    echo "                            基于提案，定义 HOW"
    echo ""
    echo "  ${GREEN}design <feature-name>${NC}     创建设计方案 (Phase 3)"
    echo "                            基于规格，设计架构"
    echo ""
    echo "  ${GREEN}plan <feature-name>${NC}       拆分任务 (Phase 4)"
    echo "                            基于设计，拆分为原子任务"
    echo ""
    echo "  ${GREEN}next${NC}                      执行下一个任务 (Phase 5)"
    echo "                            使用 opencode 实现任务"
    echo ""
    echo "  ${GREEN}test <feature-name>${NC}       执行测试 (Phase 6)"
    echo "                            全面测试验证"
    echo ""
    echo "  ${GREEN}archive <feature-name>${NC}    归档项目 (Phase 7)"
    echo "                            归档文档，知识沉淀"
    echo ""
    echo "  ${GREEN}review <file>${NC}             审查文档/代码"
    echo "                            上游优先原则审查"
    echo ""
    echo "  ${GREEN}status${NC}                    查看完整状态"
    echo "  ${GREEN}list${NC}                      列出所有文档"
    echo "  ${GREEN}help${NC}                      显示帮助"
    echo ""
    echo -e "${YELLOW}使用示例:${NC}"
    echo "  ./openspec-dev.sh explore search-feature"
    echo "  ./openspec-dev.sh propose search-feature"
    echo "  ./openspec-dev.sh spec search-feature"
    echo "  ./openspec-dev.sh design search-feature"
    echo "  ./openspec-dev.sh plan search-feature"
    echo "  ./openspec-dev.sh next"
    echo ""
    echo -e "${CYAN}上游优先原则:${NC} 每个阶段必须通过审查，才能进入下一阶段"
}

# ============================================
# Phase 0: EXPLORE - 探索模式
# ============================================
cmd_explore() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./openspec-dev.sh explore <feature-name>"
        exit 1
    fi

    local report_file=".openspec/explore/${TIMESTAMP}-${feature_name}-report.md"

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 0: EXPLORE - 探索模式${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "功能名称: ${CYAN}${feature_name}${NC}"
    echo -e "报告文件: ${CYAN}${report_file}${NC}"
    echo ""

    # 复制模板
    mkdir -p .openspec/explore
    cp ${TEMPLATE_DIR}/explore-template.md "${report_file}"
    
    # 填充基本信息
    sed -i "s/功能名称:/功能名称: ${feature_name}/" "${report_file}"
    sed -i "s/探索时间:/探索时间: ${DATETIME}/" "${report_file}"

    echo -e "${GREEN}✓ 探索报告模板已创建${NC}"
    echo ""
    
    # 使用 opencode 进行探索
    echo -e "${YELLOW}正在启动 OpenCode 进行探索分析...${NC}"
    echo -e "使用模型: ${CYAN}${OPENCODE_MODEL}${NC}"
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请为 markdown-x 项目进行深入探索分析：

功能名称: ${feature_name}

请分析以下方面并填写到探索报告：
1. WHY - 为什么要解决这个问题？痛点是什么？
2. WHO - 为谁解决这个问题？目标用户是谁？
3. WHAT - 问题的边界在哪里？包含什么，不包含什么？
4. CONTEXT - 相关系统/模块有哪些？依赖关系？
5. CONSTRAINTS - 技术/业务/时间限制？

项目上下文:
- Markdown-X 是基于 Electron + React + TypeScript 的 Markdown 编辑器
- 技术栈: Electron 30, React 18, CodeMirror 6
- 项目结构: electron/, src/, openspec/

请填写报告文件: ${report_file}
完成后，运行 ./openspec-dev.sh review ${report_file} 进行审查。"

    echo ""
    echo -e "${GREEN}探索报告已创建: ${report_file}${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 完善探索报告内容"
    echo "  2. 运行: ./openspec-dev.sh review ${report_file}"
    echo "  3. 审查通过后，运行: ./openspec-dev.sh propose ${feature_name}"
}

# ============================================
# Phase 1: PROPOSAL - 提案阶段
# ============================================
cmd_propose() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./openspec-dev.sh propose <feature-name>"
        exit 1
    fi

    # 检查探索报告是否存在
    local explore_file=$(find .openspec/explore -name "*${feature_name}*report.md" 2>/dev/null | head -1)
    if [ -z "$explore_file" ]; then
        echo -e "${RED}错误: 未找到探索报告${NC}"
        echo "请先运行: ./openspec-dev.sh explore ${feature_name}"
        exit 1
    fi

    local proposal_file=".openspec/proposals/${TIMESTAMP}-${feature_name}.md"

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 1: PROPOSAL - 提案阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "功能名称: ${CYAN}${feature_name}${NC}"
    echo -e "基于探索: ${CYAN}${explore_file}${NC}"
    echo -e "提案文件: ${CYAN}${proposal_file}${NC}"
    echo ""

    # 复制模板
    mkdir -p .openspec/proposals
    cp ${TEMPLATE_DIR}/proposal-template.md "${proposal_file}"
    
    # 填充基本信息
    sed -i "s/功能名称:/功能名称: ${feature_name}/" "${proposal_file}"
    sed -i "s/提案时间:/提案时间: ${DATETIME}/" "${proposal_file}"
    sed -i "s|\[链接到探索报告\]|[${explore_file}](${explore_file})|" "${proposal_file}"

    echo -e "${GREEN}✓ 提案模板已创建${NC}"
    echo ""
    
    # 使用 opencode 创建提案
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请为 markdown-x 项目创建正式提案：

功能名称: ${feature_name}
基于探索报告: ${explore_file}
提案文件: ${proposal_file}

请基于探索报告创建提案，包含：
1. 执行摘要（一句话描述 + 价值主张）
2. 背景（引用探索报告的发现）
3. 提案内容 - 明确 WHAT（要做什么）
4. 成功指标（可衡量的指标）
5. 风险评估
6. 替代方案对比
7. 时间/资源估算

项目上下文:
- Markdown-X 是基于 Electron + React + TypeScript 的 Markdown 编辑器
- 当前版本: 1.0.5
- 使用 GitHub Actions 自动构建

请填写提案文件: ${proposal_file}
完成后，运行 ./openspec-dev.sh review ${proposal_file} 进行审查。"

    echo ""
    echo -e "${GREEN}提案已创建: ${proposal_file}${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 完善提案内容"
    echo "  2. 运行: ./openspec-dev.sh review ${proposal_file}"
    echo "  3. 审查通过后，运行: ./openspec-dev.sh spec ${feature_name}"
}

# ============================================
# Phase 2: SPEC - 规格细化阶段
# ============================================
cmd_spec() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./openspec-dev.sh spec <feature-name>"
        exit 1
    fi

    # 检查提案是否存在
    local proposal_file=$(find .openspec/proposals -name "*${feature_name}*.md" 2>/dev/null | head -1)
    if [ -z "$proposal_file" ]; then
        echo -e "${RED}错误: 未找到提案${NC}"
        echo "请先运行: ./openspec-dev.sh propose ${feature_name}"
        exit 1
    fi

    local spec_file=".openspec/specs/${TIMESTAMP}-${feature_name}-spec.md"

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 2: SPEC - 规格细化阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "功能名称: ${CYAN}${feature_name}${NC}"
    echo -e "基于提案: ${CYAN}${proposal_file}${NC}"
    echo -e "规格文件: ${CYAN}${spec_file}${NC}"
    echo ""

    # 复制模板
    mkdir -p .openspec/specs
    cp ${TEMPLATE_DIR}/spec-template.md "${spec_file}"
    
    # 填充基本信息
    sed -i "s/功能名称:/功能名称: ${feature_name}/" "${spec_file}"
    sed -i "s/编写时间:/编写时间: ${DATETIME}/" "${spec_file}"
    sed -i "s|\[链接到提案\]|[${proposal_file}](${proposal_file})|" "${spec_file}"

    echo -e "${GREEN}✓ 规格模板已创建${NC}"
    echo ""
    
    # 使用 opencode 创建规格
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请为 markdown-x 项目创建详细规格文档：

功能名称: ${feature_name}
基于提案: ${proposal_file}
规格文件: ${spec_file}

请基于提案创建详细规格，包含：
1. 功能规格 - 用户故事、用例、UI规格
2. 数据结构规格 - TypeScript 接口定义
3. 接口规格 - 函数签名、IPC通道、事件
4. 错误处理规格 - 错误码、恢复策略
5. 性能规格 - 响应时间、资源使用
6. 安全规格 - 输入验证、数据保护
7. 测试验收标准 - 可测试的验收条件

项目上下文:
- Markdown-X 是基于 Electron + React + TypeScript 的 Markdown 编辑器
- IPC通信通过 electron/preload.ts 定义
- 状态管理使用 React Context
- 样式使用 CSS 变量

请填写规格文件: ${spec_file}
完成后，运行 ./openspec-dev.sh review ${spec_file} 进行审查。"

    echo ""
    echo -e "${GREEN}规格文档已创建: ${spec_file}${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 完善规格内容"
    echo "  2. 运行: ./openspec-dev.sh review ${spec_file}"
    echo "  3. 审查通过后，运行: ./openspec-dev.sh design ${feature_name}"
}

# ============================================
# Phase 3: DESIGN - 设计方案阶段
# ============================================
cmd_design() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./openspec-dev.sh design <feature-name>"
        exit 1
    fi

    # 检查规格是否存在
    local spec_file=$(find .openspec/specs -name "*${feature_name}*spec.md" 2>/dev/null | head -1)
    if [ -z "$spec_file" ]; then
        echo -e "${RED}错误: 未找到规格文档${NC}"
        echo "请先运行: ./openspec-dev.sh spec ${feature_name}"
        exit 1
    fi

    local design_file=".openspec/designs/${TIMESTAMP}-${feature_name}-design.md"

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 3: DESIGN - 设计方案阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "功能名称: ${CYAN}${feature_name}${NC}"
    echo -e "基于规格: ${CYAN}${spec_file}${NC}"
    echo -e "设计文件: ${CYAN}${design_file}${NC}"
    echo ""

    # 复制模板
    mkdir -p .openspec/designs
    cp ${TEMPLATE_DIR}/design-template.md "${design_file}"
    
    # 填充基本信息
    sed -i "s/功能名称:/功能名称: ${feature_name}/" "${design_file}"
    sed -i "s/设计时间:/设计时间: ${DATETIME}/" "${design_file}"
    sed -i "s|\[链接到规格文档\]|[${spec_file}](${spec_file})|" "${design_file}"

    echo -e "${GREEN}✓ 设计模板已创建${NC}"
    echo ""
    
    # 使用 opencode 创建设计
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请为 markdown-x 项目创建技术设计方案：

功能名称: ${feature_name}
基于规格: ${spec_file}
设计文件: ${design_file}

请基于规格创建设计方案，包含：
1. 架构设计 - 系统架构图、模块划分、数据流
2. 详细设计 - 每个模块的职责、接口、实现策略
3. 关键决策 - 技术选型理由、替代方案对比
4. 风险缓解 - 技术风险、实现风险及应对措施
5. 文件结构 - 新增/修改/删除的文件清单
6. 测试策略 - 单元测试、集成测试、E2E测试计划

项目上下文:
- Markdown-X 架构: Electron 主进程 + React 渲染进程
- 目录结构: electron/, src/components/, src/contexts/, src/styles/
- IPC通信: preload.ts 定义通道
- 构建工具: Vite + electron-builder

请填写设计文件: ${design_file}
完成后，运行 ./openspec-dev.sh review ${design_file} 进行审查。"

    echo ""
    echo -e "${GREEN}设计方案已创建: ${design_file}${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 完善设计方案"
    echo "  2. 运行: ./openspec-dev.sh review ${design_file}"
    echo "  3. 审查通过后，运行: ./openspec-dev.sh plan ${feature_name}"
}

# ============================================
# Phase 4: TASKS - 任务拆分阶段
# ============================================
cmd_plan() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./openspec-dev.sh plan <feature-name>"
        exit 1
    fi

    # 检查设计是否存在
    local design_file=$(find .openspec/designs -name "*${feature_name}*design.md" 2>/dev/null | head -1)
    if [ -z "$design_file" ]; then
        echo -e "${RED}错误: 未找到设计方案${NC}"
        echo "请先运行: ./openspec-dev.sh design ${feature_name}"
        exit 1
    fi

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 4: TASKS - 任务拆分阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "功能名称: ${CYAN}${feature_name}${NC}"
    echo -e "基于设计: ${CYAN}${design_file}${NC}"
    echo ""

    mkdir -p .openspec/tasks

    echo -e "${YELLOW}正在使用 OpenCode 拆分任务...${NC}"
    echo ""

    # 使用 opencode 拆分任务
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请为 markdown-x 项目基于设计方案拆分任务：

功能名称: ${feature_name}
基于设计: ${design_file}
任务目录: .openspec/tasks/

请将设计拆分为原子任务，每个任务：
1. 粒度: 30分钟到2小时可完成
2. 包含: 任务描述、文件变更、验收标准
3. 命名: ${TIMESTAMP}-${feature_name}-{n}-{描述}.md
4. 标记: 任务之间的依赖关系
5. 使用任务模板: ${TEMPLATE_DIR}/task-template.md

任务应该覆盖设计中的所有实现点，包括：
- 组件开发
- 类型定义
- 逻辑实现
- 样式编写
- 单元测试

项目上下文:
- Markdown-X 使用 TypeScript，所有代码必须有类型
- 组件在 src/components/
- 类型定义在 src/types/
- 样式在 src/styles/
- IPC 在 electron/preload.ts 和 electron/main.ts

请创建任务文件到 .openspec/tasks/ 目录。"

    echo ""
    echo -e "${GREEN}✓ 任务拆分完成${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 查看任务列表: ./openspec-dev.sh list"
    echo "  2. 执行第一个任务: ./openspec-dev.sh next"
}

# ============================================
# Phase 5: APPLY - 实现阶段
# ============================================
cmd_next() {
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 5: APPLY - 实现阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""

    # 查找待办任务
    local todo_tasks=$(find .openspec/tasks -name "*.md" -type f 2>/dev/null | head -10)
    
    if [ -z "$todo_tasks" ]; then
        echo -e "${GREEN}没有待处理的任务！${NC}"
        echo ""
        echo "使用以下命令创建新功能:"
        echo "  ./openspec-dev.sh explore <feature-name>"
        return
    fi

    # 显示任务列表
    echo -e "${CYAN}待处理任务:${NC}"
    echo "$todo_tasks" | nl -w2 -s'. ' | head -5
    local total_count=$(echo "$todo_tasks" | wc -l)
    if [ "$total_count" -gt 5 ]; then
        echo "  ... 还有 $((total_count - 5)) 个任务"
    fi
    echo ""
    
    local first_task=$(echo "$todo_tasks" | head -1)
    echo -e "准备执行任务: ${CYAN}${first_task}${NC}"
    echo ""

    # 使用 opencode 执行任务
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请执行 markdown-x 项目的以下任务：

任务文件: ${first_task}

要求：
1. 读取任务文件，理解需求和验收标准
2. 严格按照任务描述实现功能
3. 所有代码必须是 TypeScript，禁止隐式 any
4. 必须包含错误处理
5. 必须包含单元测试
6. 代码风格符合项目规范
7. 完成后更新任务状态为已完成
8. 提交代码变更

项目规范：
- 组件使用 PascalCase.tsx
- 工具函数使用 camelCase.ts
- 类型定义在 src/types/
- 样式使用 CSS 变量
- IPC 必须在 preload.ts 定义

请在实现过程中：
- 如遇到问题，记录到任务文件的"遇到的问题"部分
- 如有变更，记录到"变更说明"部分
- 完成后填写"实现记录"部分

任务文件: ${first_task}"

    echo ""
    echo -e "${YELLOW}任务执行完成${NC}"
    echo ""
    echo -e "继续执行下一个任务: ${GREEN}./openspec-dev.sh next${NC}"
}

# ============================================
# Phase 6: TEST - 测试阶段
# ============================================
cmd_test() {
    local feature_name=$1

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 6: TEST - 测试阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""

    local test_report=".openspec/test-reports/${TIMESTAMP}-${feature_name}-test-report.md"
    mkdir -p .openspec/test-reports

    echo -e "测试报告: ${CYAN}${test_report}${NC}"
    echo ""

    # 使用 opencode 执行测试
    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请为 markdown-x 项目执行全面测试：

功能名称: ${feature_name}
测试报告: ${test_report}

请执行以下测试：
1. 单元测试 - 运行 npm test 或相关测试命令
2. 类型检查 - 运行 npm run typecheck
3. 功能测试 - 验证规格中的验收标准
4. 手动测试 - 在开发环境中测试功能
5. 性能测试 - 验证性能规格要求
6. 边界测试 - 测试异常情况

测试完成后：
1. 生成测试报告到 ${test_report}
2. 记录测试结果（通过/失败）
3. 记录发现的 bug
4. 记录性能指标
5. 给出是否可以发布的结论

项目上下文:
- Markdown-X 使用 npm 管理依赖
- 测试框架: [根据项目实际情况]
- 构建命令: npm run build
- 开发命令: npm run dev

请生成完整的测试报告。"

    echo ""
    echo -e "${GREEN}测试报告已生成: ${test_report}${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 查看测试报告"
    echo "  2. 如测试通过，运行: ./openspec-dev.sh archive ${feature_name}"
}

# ============================================
# Phase 7: ARCHIVE - 归档阶段
# ============================================
cmd_archive() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./openspec-dev.sh archive <feature-name>"
        exit 1
    fi

    local archive_dir=".openspec/archive/${TIMESTAMP}-${feature_name}"

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Phase 7: ARCHIVE - 归档阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "功能名称: ${CYAN}${feature_name}${NC}"
    echo -e "归档目录: ${CYAN}${archive_dir}${NC}"
    echo ""

    mkdir -p "${archive_dir}"

    # 收集所有相关文档
    echo -e "${YELLOW}正在归档文档...${NC}"
    
    find .openspec/explore -name "*${feature_name}*" -exec cp {} "${archive_dir}/" \; 2>/dev/null
    find .openspec/proposals -name "*${feature_name}*" -exec cp {} "${archive_dir}/" \; 2>/dev/null
    find .openspec/specs -name "*${feature_name}*" -exec cp {} "${archive_dir}/" \; 2>/dev/null
    find .openspec/designs -name "*${feature_name}*" -exec cp {} "${archive_dir}/" \; 2>/dev/null
    find .openspec/tasks -name "*${feature_name}*" -exec cp {} "${archive_dir}/" \; 2>/dev/null
    find .openspec/test-reports -name "*${feature_name}*" -exec cp {} "${archive_dir}/" \; 2>/dev/null

    # 创建归档索引
    cat > "${archive_dir}/README.md" << EOF
# ${feature_name} - 项目归档

## 归档时间
${DATETIME}

## 归档内容
- 探索报告
- 提案文档
- 规格文档
- 设计方案
- 任务列表
- 测试报告

## 项目总结
[在此总结项目经验教训]

## 后续改进建议
[如有]
EOF

    echo -e "${GREEN}✓ 项目已归档到: ${archive_dir}${NC}"
    echo ""
    echo -e "${CYAN}归档内容:${NC}"
    ls -1 "${archive_dir}"
}

# ============================================
# REVIEW - 审查
# ============================================
cmd_review() {
    local target=$1
    if [ -z "$target" ]; then
        echo -e "${RED}错误: 请提供要审查的文件或目录${NC}"
        echo "用法: ./openspec-dev.sh review <file-or-directory>"
        exit 1
    fi

    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  REVIEW - 审查阶段${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "审查目标: ${CYAN}${target}${NC}"
    echo ""

    ${OPENCODE_CMD} run -m ${OPENCODE_MODEL} "请审查 markdown-x 项目的以下文档/代码：

审查目标: ${target}

审查原则（上游优先）:
1. 是否基于上游阶段的输出？
2. 是否满足阶段退出标准？
3. 是否有未解决的风险？
4. 是否可追溯到原始需求？

审查内容:
1. 完整性 - 是否包含所有必要信息？
2. 一致性 - 是否与上游文档一致？
3. 可行性 - 是否可以实际执行？
4. 质量 - 是否符合项目规范？

请给出审查结论:
- [ ] 通过 - 可以进入下一阶段
- [ ] 有条件通过 - 需要小修改
- [ ] 不通过 - 需要重大修改

并给出具体的改进建议。"

    echo ""
    echo -e "${GREEN}审查完成${NC}"
}

# ============================================
# STATUS - 状态查看
# ============================================
cmd_status() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           Markdown-X OpenSpec SDD 状态                 ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # 探索
    echo -e "${YELLOW}🔍 Phase 0: EXPLORE (探索)${NC}"
    if [ -d ".openspec/explore" ]; then
        local count=$(find .openspec/explore -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  探索报告: ${count} 个"
        find .openspec/explore -name "*.md" -type f 2>/dev/null | head -3 | sed 's/^/    - /'
    else
        echo "  (无探索报告)"
    fi
    echo ""

    # 提案
    echo -e "${YELLOW}📝 Phase 1: PROPOSAL (提案)${NC}"
    if [ -d ".openspec/proposals" ]; then
        local count=$(find .openspec/proposals -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  提案文档: ${count} 个"
        find .openspec/proposals -name "*.md" -type f 2>/dev/null | head -3 | sed 's/^/    - /'
    else
        echo "  (无提案)"
    fi
    echo ""

    # 规格
    echo -e "${YELLOW}📋 Phase 2: SPEC (规格)${NC}"
    if [ -d ".openspec/specs" ]; then
        local count=$(find .openspec/specs -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  规格文档: ${count} 个"
        find .openspec/specs -name "*.md" -type f 2>/dev/null | head -3 | sed 's/^/    - /'
    else
        echo "  (无规格文档)"
    fi
    echo ""

    # 设计
    echo -e "${YELLOW}🏗️  Phase 3: DESIGN (设计)${NC}"
    if [ -d ".openspec/designs" ]; then
        local count=$(find .openspec/designs -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  设计方案: ${count} 个"
        find .openspec/designs -name "*.md" -type f 2>/dev/null | head -3 | sed 's/^/    - /'
    else
        echo "  (无设计方案)"
    fi
    echo ""

    # 任务
    echo -e "${YELLOW}✅ Phase 4-5: TASKS/APPLY (任务/实现)${NC}"
    if [ -d ".openspec/tasks" ]; then
        local total=$(find .openspec/tasks -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  任务总数: ${total} 个"
        find .openspec/tasks -name "*.md" -type f 2>/dev/null | head -3 | sed 's/^/    - /'
    else
        echo "  (无任务)"
    fi
    echo ""

    # 测试
    echo -e "${YELLOW}🧪 Phase 6: TEST (测试)${NC}"
    if [ -d ".openspec/test-reports" ]; then
        local count=$(find .openspec/test-reports -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  测试报告: ${count} 个"
    else
        echo "  (无测试报告)"
    fi
    echo ""

    # 归档
    echo -e "${YELLOW}📦 Phase 7: ARCHIVE (归档)${NC}"
    if [ -d ".openspec/archive" ]; then
        local count=$(find .openspec/archive -type d 2>/dev/null | wc -l)
        echo "  归档项目: ${count} 个"
    else
        echo "  (无归档)"
    fi
    echo ""

    # Git 状态
    echo -e "${YELLOW}📁 Git 状态:${NC}"
    git status --short 2>/dev/null | head -5 || echo "  (无法获取)"
}

# ============================================
# LIST - 列出所有文档
# ============================================
cmd_list() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  OpenSpec 文档列表${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""

    for dir in explore proposals specs designs tasks test-reports; do
        echo -e "${YELLOW}.${dir}/${NC}"
        if [ -d ".openspec/${dir}" ]; then
            find .openspec/${dir} -name "*.md" -type f 2>/dev/null | sed 's/^/  /' | sort
        fi
        echo ""
    done

    echo -e "${YELLOW}archive/${NC}"
    if [ -d ".openspec/archive" ]; then
        ls -1 .openspec/archive/ 2>/dev/null | sed 's/^/  /'
    fi
}

# ============================================
# 主入口
# ============================================
case "${1:-help}" in
    explore)
        cmd_explore "$2"
        ;;
    propose)
        cmd_propose "$2"
        ;;
    spec)
        cmd_spec "$2"
        ;;
    design)
        cmd_design "$2"
        ;;
    plan)
        cmd_plan "$2"
        ;;
    next)
        cmd_next
        ;;
    test)
        cmd_test "$2"
        ;;
    archive)
        cmd_archive "$2"
        ;;
    review)
        cmd_review "$2"
        ;;
    status)
        cmd_status
        ;;
    list)
        cmd_list
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
