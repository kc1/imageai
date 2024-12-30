const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
const sharp = require("sharp");

chromium.use(stealth);

async function launchBrowser(headless = false) {
    const browser = await chromium.launch({ headless: headless });

    return browser;
}


module.exports = {
    launchBrowser
};