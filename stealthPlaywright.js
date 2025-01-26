// const { chromium } = require("playwright");
const { chromium } = require("playwright-extra");
// const stealth = require("playwright-extra-plugin-stealth")();
const stealth = require("puppeteer-extra-plugin-stealth")();
const sharp = require("sharp");

chromium.use(stealth);

async function launchBrowser(headless = true) {
  let browser;
  if (process.env.BROWSER_PLAYWRIGHT_ENDPOINT) {
    browser = await chromium.connect(process.env.BROWSER_PLAYWRIGHT_ENDPOINT);
  } else {
    browser = await chromium.launch({ headless: headless });
  }

  return browser;
}

module.exports = {
  launchBrowser,
};
