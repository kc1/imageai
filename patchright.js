const { chromium } = require('patchright');

async function launchBrowser() {
  const browser = await chromium.launch({
    // args: ["--use-angle=gl"],
    args: ["--enable-unsafe-swiftshader"],
    headless: true,
    executablePath: '/opt/render/project/.cache/playwright/chromium-1194/chrome-linux/chrome'
     });
  return browser;
}

//  proxy: {
//       server: 'http://198.23.239.134:6540', // Replace with your proxy server
//       username: 'asdyycvx', // Optional, if your proxy requires authentication
//       password: 'qk597lgwe2ni'  // Optional, if your proxy requires authentication
//     }


module.exports = { launchBrowser };
