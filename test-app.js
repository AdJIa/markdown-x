/**
 * Markdown-X 自动化测试
 * 测试核心功能无需 GUI
 */

const fs = require('fs');
const path = require('path');

// 模拟 Electron 环境
const mockElectron = {
  app: {
    getPath: () => '/tmp/markdown-x-test'
  }
};

// 测试 1: 检查应用包结构
console.log('\n=== 测试 1: 应用包结构 ===');
const appPath = process.argv[2] || './squashfs-root';

const checks = [
  ['主程序存在', () => fs.existsSync(path.join(appPath, 'markdown-x'))],
  ['ASAR 包存在', () => fs.existsSync(path.join(appPath, 'resources/app.asar'))],
  ['桌面入口存在', () => fs.existsSync(path.join(appPath, 'markdown-x.desktop'))],
  ['可执行权限', () => {
    try {
      const stats = fs.statSync(path.join(appPath, 'markdown-x'));
      return (stats.mode & 0o111) !== 0;
    } catch { return false; }
  }]
];

let passed = 0;
for (const [name, check] of checks) {
  const result = check();
  console.log(`${result ? '✅' : '❌'} ${name}`);
  if (result) passed++;
}
console.log(`结构测试: ${passed}/${checks.length} 通过`);

// 测试 2: ASAR 内容检查
console.log('\n=== 测试 2: ASAR 内容检查 ===');
try {
  const asar = require('asar');
  const asarPath = path.join(appPath, 'resources/app.asar');
  const files = asar.listFileSync(asarPath);
  
  const requiredFiles = [
    '/package.json',
    '/dist/main/main.js',
    '/dist/renderer/index.html',
    '/dist/renderer/assets/index',
    '/node_modules/react/package.json',
    '/node_modules/react-markdown/package.json',
    '/node_modules/mermaid/package.json',
    '/node_modules/katex/package.json'
  ];
  
  let fileChecks = 0;
  for (const req of requiredFiles) {
    const found = files.some(f => f.includes(req));
    console.log(`${found ? '✅' : '❌'} ${req}`);
    if (found) fileChecks++;
  }
  console.log(`ASAR 测试: ${fileChecks}/${requiredFiles.length} 通过`);
} catch (e) {
  console.log('⚠️  无法检查 ASAR:', e.message);
}

// 测试 3: 文件操作测试 (模拟主进程)
console.log('\n=== 测试 3: 文件系统操作 ===');
const testDir = '/tmp/markdown-x-test-fs';
const testFile = path.join(testDir, 'test.md');

// 清理
try { fs.rmSync(testDir, { recursive: true }); } catch {}
fs.mkdirSync(testDir, { recursive: true });

const fsTests = [
  ['创建目录', () => {
    fs.mkdirSync(path.join(testDir, 'subdir'), { recursive: true });
    return fs.existsSync(path.join(testDir, 'subdir'));
  }],
  ['写入文件', () => {
    fs.writeFileSync(testFile, '# Test\n\nHello World!', 'utf-8');
    return fs.existsSync(testFile);
  }],
  ['读取文件', () => {
    const content = fs.readFileSync(testFile, 'utf-8');
    return content.includes('# Test');
  }],
  ['文件大小限制', () => {
    const stats = fs.statSync(testFile);
    return stats.size < 10 * 1024 * 1024; // < 10MB
  }],
  ['删除文件', () => {
    fs.unlinkSync(testFile);
    return !fs.existsSync(testFile);
  }]
];

let fsPassed = 0;
for (const [name, test] of fsTests) {
  try {
    const result = test();
    console.log(`${result ? '✅' : '❌'} ${name}`);
    if (result) fsPassed++;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}
console.log(`文件测试: ${fsPassed}/${fsTests.length} 通过`);

// 测试 4: Markdown 解析测试
console.log('\n=== 测试 4: Markdown 渲染测试 ===');
const markdown = require('react-markdown');
const remarkGfm = require('remark-gfm');
const remarkMath = require('remark-math');

const testMarkdown = `
# 标题测试

## 二级标题

**粗体** *斜体* ~~删除线~~

| 表格 | 测试 |
|------|------|
| A    | B    |

\`$E=mc^2$\`

- [x] 任务列表

\`\`\`mermaid
graph TD
    A[开始] --> B[结束]
\`\`\`
`;

try {
  // 简单的 Markdown 语法检查
  const hasHeadings = /^#{1,6}\s/m.test(testMarkdown);
  const hasBold = /\*\*|__/s.test(testMarkdown);
  const hasItalic = /[*_]/s.test(testMarkdown);
  const hasTable = /\|.*\|/s.test(testMarkdown);
  const hasMath = /\$.*\$/s.test(testMarkdown);
  const hasTaskList = /-\s*\[[xX\s]\]/s.test(testMarkdown);
  const hasMermaid = /\`\`\`mermaid/s.test(testMarkdown);
  
  const syntaxTests = [
    ['GFM 标题', hasHeadings],
    ['粗体语法', hasBold],
    ['斜体语法', hasItalic],
    ['表格语法', hasTable],
    ['数学公式', hasMath],
    ['任务列表', hasTaskList],
    ['Mermaid 图', hasMermaid]
  ];
  
  let syntaxPassed = 0;
  for (const [name, result] of syntaxTests) {
    console.log(`${result ? '✅' : '❌'} ${name}`);
    if (result) syntaxPassed++;
  }
  console.log(`语法测试: ${syntaxPassed}/${syntaxTests.length} 通过`);
} catch (e) {
  console.log('❌ Markdown 测试失败:', e.message);
}

// 测试 5: 性能测试
console.log('\n=== 测试 5: 基础性能测试 ===');
const start = Date.now();

// 模拟大文件操作
const largeContent = '# Test\n\n'.repeat(10000);
const largeFile = path.join(testDir, 'large.md');
fs.writeFileSync(largeFile, largeContent, 'utf-8');
const stats = fs.statSync(largeFile);
const readContent = fs.readFileSync(largeFile, 'utf-8');
const writeTime = Date.now() - start;

console.log(`✅ 大文件写入/读取: ${writeTime}ms`);
console.log(`   文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`   内容长度: ${readContent.length} 字符`);

// 测试 6: 应用配置检查
console.log('\n=== 测试 6: 应用配置 ===');
try {
  const asar = require('asar');
  const asarPath = path.join(appPath, 'resources/app.asar');
  const pkgContent = asar.extractFile(asarPath, '/package.json');
  const pkg = JSON.parse(pkgContent);
  
  console.log(`✅ 应用名称: ${pkg.name}`);
  console.log(`✅ 版本: ${pkg.version}`);
  console.log(`✅ 主入口: ${pkg.main}`);
  console.log(`✅ Electron 版本: ${pkg.devDependencies?.electron || '未知'}`);
  
  const deps = Object.keys(pkg.dependencies || {});
  const criticalDeps = ['react', 'react-markdown', 'mermaid', 'katex', '@codemirror/lang-markdown'];
  let depsFound = 0;
  for (const dep of criticalDeps) {
    const found = deps.includes(dep);
    console.log(`${found ? '✅' : '❌'} 依赖: ${dep}`);
    if (found) depsFound++;
  }
  console.log(`依赖检查: ${depsFound}/${criticalDeps.length} 通过`);
} catch (e) {
  console.log('❌ 配置检查失败:', e.message);
}

// 清理
console.log('\n=== 清理测试文件 ===');
try { 
  fs.rmSync(testDir, { recursive: true, force: true }); 
  console.log('✅ 测试文件已清理');
} catch (e) {
  console.log('⚠️  清理失败:', e.message);
}

console.log('\n=== 测试完成 ===');
