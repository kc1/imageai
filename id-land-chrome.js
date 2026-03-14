const { chromium } = require('patchright');

(async () => {
  const browser = await chromium.launchPersistentContext(
    '/tmp/patchright_profile',
    {
      channel: 'chrome',
      headless: false,
      viewport: null,
      args: [
        '--ignore-gpu-blocklist',
        '--enable-webgl',
        '--enable-accelerated-2d-canvas',
        '--use-gl=egl',
        '--disable-software-rasterizer'
      ]
    }
  );
  const page = await browser.newPage();
  await page.goto('https://id.land', { waitUntil: 'networkidle' });
})();
