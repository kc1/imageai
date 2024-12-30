// playwright-extra is a drop-in replacement for playwright,
// it augments the installed playwright with plugin functionality

const { chromium } = require("playwright-extra");

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = require("puppeteer-extra-plugin-stealth")();
const sharp = require("sharp");

// Add the plugin to playwright (any number of plugins can be added)
chromium.use(stealth);

// That's it, the rest is playwright usage as normal 😊
chromium.launch({ headless: false }).then(async (browser) => {
  // Create context with modified permissions and popup blocking
  const context = await browser.newContext({
    permissions: ["geolocation"],
    geolocation: { latitude: 42.271389, longitude: -71.798889 },
    // Latitude and longitude coordinates are: 42.271389, -71.798889.
    javaScriptEnabled: true,
  });

  // Create page from modified context
  // const page = await context.newPage();

  // Fix: Update permissions grant with proper URL format
  // await context.grantPermissions(["geolocation"], {
  //   origin: "https://id.land",
  // });

  console.log("Testing the stealth plugin..");
  try {
    page = await context.newPage();

    // Fix: Update permissions grant with proper URL format
    await context.grantPermissions(["geolocation"], {
      origin: "https://id.land",
    });

    await page.goto("https://id.land/users/sign_in");
    await page.getByPlaceholder("Email address").click();
    await page
      .getByPlaceholder("Email address")
      .fill("optionhomes11@gmail.com");
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").fill("Landid1!");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page.keyboard.press("Escape");

    await page.waitForTimeout(1000);
    await page.getByText("Address").click();
    await page.getByText("Parcel").click();
    await page.getByText("ID").click();

    await page.keyboard.press("Tab");
    await page.keyboard.type("Wisconsin");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Ashland");
    await page.keyboard.press("Tab");
    await page.getByPlaceholder("County").click();
    await page.getByPlaceholder("County").fill("o");
    await page
      .locator("div")
      .filter({ hasText: /^Ashland County$/ })
      .locator("div")
      .click();
    await page.getByPlaceholder("ID").click();
    await page.getByPlaceholder("ID").fill("1234");
    await page
      .locator("div")
      .filter({ hasText: /^018-01234-0000 \(18012340000\)$/ })
      .locator("div")
      .click();
    await page.getByRole("button", { name: "GO" }).click();

    await page.locator(".waypoint-message__close > svg").click();
    await page.getByLabel("Map", { exact: true }).click({
      button: "right",
      position: {
        x: 809,
        y: 250,
      },
    });
    // await page.locator('div').filter({ hasText: /^3D46\.3431, -90\.5944$/ }).getByRole('img').nth(2).click();
    await page
      .locator("li")
      .filter({ hasText: "Water" })
      .locator("div")
      .first()
      .click();

    await page.waitForTimeout(10000);
    await page.screenshot({ path: "water.png", fullPage: true });

    // Get the image dimensions
    const imageInfo = await sharp("water.png").metadata();
    console.log("Image dimensions:", {
      width: imageInfo.width,
      height: imageInfo.height,
    });

    // Now you can use these dimensions to take a cropped screenshot
    await page.screenshot({
      path: "water-cropped.png",
      clip: {
        x: 0,
        y: 0,
        width: imageInfo.width,
        height: imageInfo.height,
      },
    });

    await page
      .locator("li")
      .filter({ hasText: "Outdoors" })
      .locator("div")
      .first()
      .click();
    // await page.locator('li').filter({ hasText: 'Outdoors' }).getByRole('img').locator('path').click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "contours.png", fullPage: true });

    console.log("All done, check the screenshot. ✨");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
});
