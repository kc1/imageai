const { chromium } = require("patchright");

// Use system Chromium on Render, fallback to Playwright's Chromium locally
// const executablePath = process.env.NODE_ENV === 'production'
// ? '/usr/bin/chromium'
// : '/opt/render/project/.cache/playwright/chromium-1194/chrome-linux/chrome';
/* 
(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--ignore-gpu-blocklist",
      "--use-gl=angle", // Force ANGLE rendering framework
      "--use-angle=swiftshader", // Force SwiftShader (Software WebGL)
      "--enable-webgl",
    ],
  });

  const page = await browser.newPage();
  await page.goto("https://get.webgl.org/");
  // The spinning cube should now appear!
  // await page.screenshot({ path: 'webgl-test.png' });

  await browser.close();
})();
 */

// there is a bug likely in the latest chromeos that 
// causes issues with WebGL rendering 

async function launchBrowser() {
  const browser = await chromium.launch({
    args: [
      "--ignore-gpu-blocklist",
      "--use-gl=angle", // Force ANGLE rendering framework
      "--use-angle=swiftshader", // Force SwiftShader (Software WebGL)
      "--enable-webgl",
    ],

    headless: process.env.HEADLESS === "true",
  });
  return browser;
}

module.exports = { launchBrowser };
