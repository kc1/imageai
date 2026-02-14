const { chromium } = require('patchright');

async function launchBrowser() {
  // Use system Chromium on Render, fallback to Playwright's Chromium locally
  // const executablePath = process.env.NODE_ENV === 'production' 
    // ? '/usr/bin/chromium' 
    // : '/opt/render/project/.cache/playwright/chromium-1194/chrome-linux/chrome';
    
  const browser = await chromium.launch({
    // args: ["--use-angle=gl"],
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-sync",
      "--disable-translate",
      "--disable-plugins",
      "--window-size=1280,1024",
      "--enable-unsafe-swiftshader",
    ],
    headless: process.env.HEADLESS === 'true'

     });
  return browser;
}

module.exports = { launchBrowser };
