const { chromium } = require('playwright');

(async () => {
  console.log('启动浏览器并导航到 GitHub Token 创建页面...');
  
  const browser = await chromium.launchPersistentContext(
    '/home/lujia/.config/google-chrome/Default',
    {
      headless: false,
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--start-maximized'],
      slowMo: 100
    }
  );
  
  const page = browser.pages()[0] || await browser.newPage();
  
  // 导航到 token 创建页面
  await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'networkidle' });
  
  console.log('当前 URL:', page.url());
  
  // 检查是否已登录
  if (page.url().includes('login')) {
    console.log('需要登录，请在浏览器中完成登录');
    await page.waitForTimeout(30000);
  }
  
  // 如果在 token 创建页面
  if (page.url().includes('/settings/tokens/new')) {
    console.log('进入 Token 创建页面');
    
    // 填写表单
    await page.fill('input[name="oauth_access[description]"]', 'Markdown-X Upload');
    
    // 勾选 repo 权限
    await page.check('input[name="oauth_access[scopes][][repo]"]');
    
    console.log('表单已填写，请确认生成 token');
    console.log('生成后请复制 token 并保存到 ~/.ssh/github_token');
    
    // 截图
    await page.screenshot({ path: '/tmp/github-token.png' });
    
    // 等待用户操作
    await page.waitForTimeout(30000);
  }
  
  await browser.close();
})();
