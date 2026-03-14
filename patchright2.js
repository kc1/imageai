// Make sure to require Playwright (or patchright if you are using that)
const { chromium } = require('patchright'); 

async function launchBrowser() {
  const browser = await chromium.launch({
    // It's highly recommended to use the new headless mode when faking WebGL
    // If process.env.HEADLESS isn't set, default to false for debugging
    // headless: process.env.HEADLESS === "true", 
    headless: true, 
    
    args: [
      // 1. Force Software WebGL (Bypass broken Crostini GPU)
      "--ignore-gpu-blocklist",
      "--use-gl=angle", 
      "--use-angle=swiftshader", 
      "--enable-webgl",

      // 2. Disable Sandboxing (Crucial for running Chromium inside Linux VMs/Containers)
      "--no-sandbox",
      "--disable-setuid-sandbox",

      // 3. Optimize headless rendering (Prevents black screens when headless)
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
    ],
  });
  
  return browser;
}

module.exports = { launchBrowser };