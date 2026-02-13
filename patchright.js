const { chromium } = require('patchright');

async function launchBrowser() {
  // Use system Chromium on Render, fallback to Playwright's Chromium locally
  // const executablePath = process.env.NODE_ENV === 'production' 
    // ? '/usr/bin/chromium' 
    // : '/opt/render/project/.cache/playwright/chromium-1194/chrome-linux/chrome';
    
  const browser = await chromium.launch({
    // args: ["--use-angle=gl"],
    args: ["--enable-unsafe-swiftshader"],
    headless: process.env.HEADLESS === undefined ? false : process.env.HEADLESS

    // headless:false ,
    // executablePath: executablePath
     });
  return browser;
}

//  proxy: {
//       server: 'http://198.23.239.134:6540', // Replace with your proxy server
//       username: 'asdyycvx', // Optional, if your proxy requires authentication
//       password: 'qk597lgwe2ni'  // Optional, if your proxy requires authentication
//     }


module.exports = { launchBrowser };
