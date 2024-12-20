// playwright-extra is a drop-in replacement for playwright,
// it augments the installed playwright with plugin functionality
const { chromium } = require("playwright-extra");

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = require("puppeteer-extra-plugin-stealth")();

// Add the plugin to playwright (any number of plugins can be added)
chromium.use(stealth);

// That's it, the rest is playwright usage as normal 😊
chromium.launch({ headless: false }).then(async (browser) => {
  // Create context with modified permissions and popup blocking
  const context = await browser.newContext({
    permissions: ['geolocation'],
    geolocation: { latitude: 51.1, longitude: 45.3 },
    javaScriptEnabled: true,
  });
  
  // Create page from modified context
  const page = await context.newPage();
  
  // Fix: Update permissions grant with proper URL format
  await context.grantPermissions(['geolocation'], { origin: 'https://id.land' });

  console.log("Testing the stealth plugin..");
  // await page.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle' })
  //  await page.goto('https://id.land/');

  // await page.goto('https://land.id', { waitUntil: 'networkidle' })
  // await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
  //   await page.getByPlaceholder('Email address').click();

  // await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
  // await page.getByPlaceholder('Password').click();
  // await page.getByPlaceholder('Password').fill('B3CZL@5f!3fDx7j');
  // await page.getByRole('button', { name: 'Sign In' }).click();
  try {
    // Remove redundant permissions call
    // await page.context().grantPermissions([], { origin: 'https://id.land' });
    await page.goto("https://id.land/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Sign in" })
      .click();
    await page.getByPlaceholder("Email address").click();
    await page
      .getByPlaceholder("Email address")
      .fill("optionhomes11@gmail.com");
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").click({ button: "right" });
    await page.getByPlaceholder("Password").fill("Landid1!");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    // Wait for navigation after login (adjust timeout as needed)
    await page.waitForNavigation({ timeout: 10000 });
    
    // Add keyboard escape press
    await page.keyboard.press('Escape');
    
    // Optional: Add a small delay to ensure escape is processed
    await page.waitForTimeout(1000);
    // await page
    //   .getByLabel("Modal")
    //   .locator("div")
    //   .filter({ hasText: "Location Access Needed" })
    //   .getByRole("button")
    //   .click();
    // await page.locator(".chevron-regular-direction__right").first().click();
    
    await page.getByText("Parcel").click();
    await page.getByText("ID").click();
    await page.getByText("Kansas").click();
    await page.locator("#react-select-2-input").fill("wis");
    await page.getByText("Wisconsin", { exact: true }).click();
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

    //   await page.goto('https://land.id', { waitUntil: 'networkidle' })
    //  await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
    //   await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
    //   await page.getByPlaceholder('Password').click();
    //   await page.getByPlaceholder('Password').fill('B3CZL@5f!3fDx7j');
    //   await page.getByRole('button', { name: 'Sign In' }).click();

    await page.screenshot({ path: "stealth.png", fullPage: true });
    console.log("All done, check the screenshot. ✨");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
});
