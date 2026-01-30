const { chromium } = require('playwright');

const SSH_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN4pSyhuQXJXwO16BB2znRy4YncKSiC5Z+Yqp8magOEQ lujia@markdown-x';

(async () => {
  // 启动浏览器，尝试使用用户数据目录
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // 导航到 GitHub SSH 设置
  console.log('导航到 GitHub SSH 设置...');
  await page.goto('https://github.com/settings/keys');
  
  // 等待页面加载
  await page.waitForLoadState('networkidle');
  
  // 检查是否需要登录
  const url = page.url();
  console.log('当前 URL:', url);
  
  if (url.includes('login')) {
    console.log('需要登录，请在浏览器中完成登录');
    // 等待用户手动登录
    await page.waitForNavigation({ url: '**/settings/keys', timeout: 120000 });
  }
  
  console.log('已登录，检查现有 SSH keys...');
  
  // 检查是否已有相同 key
  const pageContent = await page.content();
  if (pageContent.includes('lujia@markdown-x')) {
    console.log('SSH key 已存在，无需添加');
    await browser.close();
    return;
  }
  
  // 点击 New SSH key 按钮
  console.log('点击 New SSH key...');
  await page.click('a[href="/settings/ssh/new"]');
  
  // 等待表单加载
  await page.waitForSelector('#public_key_title');
  
  // 填写表单
  console.log('填写 SSH key 信息...');
  await page.fill('#public_key_title', 'Linux Mint - Markdown-X');
  await page.fill('#public_key_key', SSH_KEY);
  
  // 点击添加按钮
  console.log('提交...');
  await page.click('button[type="submit"]');
  
  // 等待结果
  await page.waitForTimeout(3000);
  
  console.log('SSH key 添加完成！');
  
  await browser.close();
})();
