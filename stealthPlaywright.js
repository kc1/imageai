const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const sharp = require("sharp");

chromium.use(stealth);

async function launchBrowser() {
  const browser = await chromium.launch({
    // args: ["--use-angle=gl"],
    headless: true,
     });
  return browser;
}

//  proxy: {
//       server: 'http://198.23.239.134:6540', // Replace with your proxy server
//       username: 'asdyycvx', // Optional, if your proxy requires authentication
//       password: 'qk597lgwe2ni'  // Optional, if your proxy requires authentication
//     }


module.exports = { launchBrowser };
