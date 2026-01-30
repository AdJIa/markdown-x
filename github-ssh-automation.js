const { chromium } = require('playwright');

(async () => {
  console.log('启动浏览器...');
  
  // 使用本地 Chrome 配置启动
  const browser = await chromium.launchPersistentContext(
    '/home/lujia/.config/google-chrome/Default',
    {
      headless: false,
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--start-maximized'],
      slowMo: 50
    }
  );
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('导航到 GitHub SSH 设置...');
  await page.goto('https://github.com/settings/ssh/new', { waitUntil: 'networkidle' });
  
  console.log('当前 URL:', page.url());
  
  // 检查是否在新 key 页面
  if (page.url().includes('/settings/ssh/new')) {
    console.log('成功进入 SSH key 添加页面');
    
    // 截图看当前状态
    await page.screenshot({ path: '/tmp/github-ssh.png' });
    console.log('已截图保存到 /tmp/github-ssh.png');
    
    // 填写表单
    await page.fill('input[name="public_key[title]"]', 'Linux Mint - Markdown-X');
    await page.fill('textarea[name="public_key[key]"]', 
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN4pSyhuQXJXwO16BB2znRy4YncKSiC5Z+Yqp8magOEQ lujia@markdown-x');
    
    console.log('表单已填写');
    
    // 等待用户确认或直接提交
    // await page.click('button[type="submit"]');
    console.log('请确认是否提交，或手动点击 Add SSH key');
    
    await page.waitForTimeout(10000);
  }
  
  await browser.close();
})();
