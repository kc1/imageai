const { chromium } = require('patchright');

async function launchBrowser() {
  const browser = await chromium.launch({
    // args: ["--use-angle=gl"],
    headless: false,
     });
  return browser;
}

//  proxy: {
//       server: 'http://198.23.239.134:6540', // Replace with your proxy server
//       username: 'asdyycvx', // Optional, if your proxy requires authentication
//       password: 'qk597lgwe2ni'  // Optional, if your proxy requires authentication
//     }


module.exports = { launchBrowser };
