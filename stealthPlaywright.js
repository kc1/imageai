const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
const sharp = require("sharp");

chromium.use(stealth);

async function launchBrowser(headless = true) {
    // const browser = await chromium.launch({ headless: headless });
    const browser = await playwright.chromium.connect(process.env.BROWSER_PLAYWRIGHT_ENDPOINT);

    return browser;
}


module.exports = {
    launchBrowser
};