const { chromium } = require('patchright');

(async () => {
  console.log('Connecting to Chrome...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  
  const contexts = browser.contexts();
  console.log(`Found ${contexts.length} context(s)`);
  
  let page = contexts[0]?.pages()[0];
  if (!page) {
    console.log('No existing pages, creating new one');
    const context = await browser.newContext();
    page = await context.newPage();
  }
  
  console.log('Navigating to id.land...');
  await page.goto('https://id.land', { waitUntil: 'networkidle' });
  console.log('✅ Loaded via Patchright + Chrome WebGL!');
})();