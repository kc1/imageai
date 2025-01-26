const { chromium } = require("playwright-extra");
const stealth = require("playwright-extra-plugin-stealth")();
const sharp = require("sharp");

chromium.use(stealth);

async function launchBrowser(headless = true) {
    // const browser = await chromium.launch({ headless: headless });
    const browser = await chromium.connect(process.env.BROWSER_PLAYWRIGHT_ENDPOINT);

    return browser;
}


module.exports = {
    launchBrowser
};