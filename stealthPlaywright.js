const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const sharp = require("sharp");

chromium.use(stealth);

async function launchBrowser() {
  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: 'http://23.94.138.75:6349', // Replace with your proxy server
      username: 'asdyycvx', // Optional, if your proxy requires authentication
      password: 'qk597lgwe2ni'  // Optional, if your proxy requires authentication
    }
  });
  return browser;
}

module.exports = { launchBrowser };
