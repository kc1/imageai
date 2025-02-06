// import { uploadToDropbox } from "../uploadToDropbox";
const { uploadToDropbox } = require("../uploadToDropbox");

// const { writeToDropbox } = require("../writeImageToDropbox");

// const { test, expect } = require("@playwright/test");
// const sharp = require("sharp");
// const fetch = require('node-fetch');
// const fileContent = require('fs').readFileSync(filePath);
// const { uploadToDropbox } = require("../uploadToDropbox");
// const { refreshDropboxToken } = require("../refreshToken");
// const data = await refreshDropboxToken();
// const dropboxToken = data.access_token;

async function login(page) {

  // const context = await page.context();
  // await context.grantPermissions(["geolocation"], {
  //   origin: "*", // Apply to all origins
  // });

  // page = await context.newPage();

  // await context.grantPermissions(["geolocation"], {
  //   origin: "https://id.land", timeout: 90000,
  // });
  // await page.setDefaultTimeout(60000);
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'platform', { get: () => 'CrOS' });
  });
  await page.evaluateOnNewDocument(() => {
    WebGLRenderingContext.prototype.getParameter = (original => function (param) {
      if (param === 37445) return "Chromebook"; // Fake renderer
      return original.call(this, param);
    })(WebGLRenderingContext.prototype.getParameter);
  });
  await page.goto("https://id.land/users/sign_in", { timeout: 90000 }); // Set timeout to 90 seconds
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("optionhomes11@gmail.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("Landid1!");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  console.log("logged in");

  // Wait for navigation to complete after login
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 90000 }); // Set timeout to 90 seconds

  // Get list of iframes
  const iframes = page.frames();
  console.log("List of iframes:");
  iframes.forEach((frame, index) => {
    console.log(`Iframe ${index + 1}: ${frame.url()}`);
  });

  // Select the iframe with URL "https://id.land/discover" first, then "https://id.land/users/sign_in"
  let targetIframe = page.frame({ url: "https://id.land/discover" });

  if (!targetIframe) {
    targetIframe = page.frame({ url: "https://id.land/users/sign_in" });
  }

  if (targetIframe) {
    console.log("Target iframe found:", targetIframe.url());
    // Interact with the iframe
    // Example: await targetIframe.click('selector');
  } else {
    console.log("Target iframe not found");
  }

  // await page.goto("https://id.land/discover");
  console.log("logged in");

  // Wait for navigation to complete after login
  // await page.waitForNavigation({ waitUntil: 'networkidle' });

  // Optionally, you can wait for a specific element that indicates successful login
  // await page.waitForSelector('selector-for-element-after-login');

  // await page.getByRole("button", { name: "Sign In", exact: true }).click();
  // await page.keyboard.press("Escape");
  // await page.setViewportSize({ width: 1920, height: 1080 });
  return page;
}

async function performTest(page, property, dropboxToken) {
  await page.waitForTimeout(4000);
  const dt = new Date();
  let ts = Math.floor(dt.getTime() / 1000);
  const testFile = `${property.state}-${property.county}-${property.apn}-${ts}-test.png`;
  // const contoursFilename = `${property.state}-${property.county}-${property.apn}-${timestamp}-contours.png`;

  await page.screenshot({
    path: "./screenshots/" + testFile,
    fullPage: true,
  });
  await uploadToDropbox(testFile, "./screenshots/" + testFile, dropboxToken);
  console.log("Test file uploaded to Dropbox");
  await page.goto("https://id.land/discover");
  await page.waitForTimeout(10000);
  await page.getByText("Address").click();

  await page.getByText("Parcel").click();
  await page.getByText("ID").click();

  await page.keyboard.press("Tab");
  // await page.keyboard.type("Wisconsin");
  await page.keyboard.type(property.state);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  // await page.keyboard.type("Ashland");
  await page.keyboard.type(property.county);
  // await page.keyboard.press("Tab");
  // await page.keyboard.press("Tab");
  await page.getByPlaceholder("County").click();
  // await page.getByPlaceholder("County").fill("o");
  await page.getByPlaceholder("County").fill(property.county);
  // await page.locator("div.provisional > div.icon").getByText(/.*County.*/).click();
  // await page.locator("div.provisional > div.icon").getByText(/.*County.*/).click();
  // await page.getBy.locator("div.provisional").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  // await page.getByPlaceholder("County").click();
  // await page.getByPlaceholder("County").fill("o");

  // await page
  //   .locator("div")
  //   .filter({ hasText: new RegExp(/.*County.*/) })
  //   .locator("div")
  //   .click();
  await page.getByPlaceholder("ID").click();

  // .filter({ hasText: new RegExp(`^$County$`) })
  // await page.getByPlaceholder("ID").fill("1234");
  const apn = property.apn.toString();
  const cleanApn = apn.replace(/[^a-zA-Z0-9]/g, "");
  await page.getByPlaceholder("ID").fill(cleanApn);
  // let slug = "("+property.apn.slice(0, 2);
  // slug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // console.log(slug);
  // await page
  //   .locator("div")
  //   .filter({ hasText: new RegExp(`${slug}`) })
  // await page.keyboard.press('Shift+Tab');
  await page.keyboard.press("Shift+Tab");
  //   .click();
  // await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  // await page.keyboard.press('Tab');

  // await page.getByPlaceholder("County").click();
  await page.getByRole("button", { name: "GO" }).click();

  // Check if waypoint message exists before clicking
  try {
    const waypointMessage = page.locator(".waypoint-message__close > svg");
    if (await waypointMessage.isVisible({ timeout: 2000 })) {
      await waypointMessage.click();
    }
  } catch (error) {
    console.log("Waypoint message not found, continuing...");
  }

  await page.getByLabel("Map", { exact: true }).click({
    button: "right",
    position: {
      x: 809,
      y: 250,
    },
  });
  await page
    .locator("li")
    .filter({ hasText: "Water" })
    .locator("div")
    .first()
    .click();

  await page.waitForTimeout(2000);
  const date = new Date();
  // const formattedDate = `${(date.getMonth() + 1)
  //   .toString()
  //   .padStart(2, "0")}-${date
  //   .getDate()
  //   .toString()
  //   .padStart(2, "0")}-${date.getFullYear()}`;
  const timestamp = Math.floor(date.getTime() / 1000);
  const waterFilename = `${property.state}-${property.county}-${property.apn}-${timestamp}-water.png`;
  const contoursFilename = `${property.state}-${property.county}-${property.apn}-${timestamp}-contours.png`;

  await page.screenshot({
    path: "./screenshots/" + waterFilename,
    fullPage: true,
  });
  // const waterBuffer = await page.screenshot();
  // const imageInfo = await sharp("water.png").metadata();
  // console.log("Image dimensions:", {
  //   width: imageInfo.width,
  //   height: imageInfo.height,
  // });

  // await page.screenshot({
  //   path: "water-cropped.png",
  //   clip: {
  //     x: 0,
  //     y: 0,
  //     width: imageInfo.width,
  //     height: imageInfo.height,
  //   },
  // });

  await page
    .locator("li")
    .filter({ hasText: "Outdoors" })
    .locator("div")
    .first()
    .click();
  await page.waitForTimeout(10000);
  // const contourBuffer = await page.screenshot();
  await page.screenshot({
    path: "./screenshots/" + contoursFilename,
    fullPage: true,
  });

  // await uploadToDropbox(waterFilename, "./water.png", dropboxToken);
  await uploadToDropbox(
    waterFilename,
    "./screenshots/" + waterFilename,
    dropboxToken
  );
  await uploadToDropbox(
    contoursFilename,
    "./screenshots/" + contoursFilename,
    dropboxToken
  );

  // await writeToDropbox(waterBuffer, waterFilename, dropboxToken);
  // await writeToDropbox(contourBuffer, contoursFilename, dropboxToken);
}

// test("test", async ({ page }) => {
//   test.setTimeout(60000);

//   // Create context with modified permissions and popup blocking
//   const context = await page.context();
//   await context.grantPermissions(["geolocation"], {
//     origin: "https://id.land",
//   });

//   // Create page from modified context
//   page = await context.newPage();

//   // Fix: Update permissions grant with proper URL format
//   await context.grantPermissions(["geolocation"], {
//     origin: "https://id.land",
//   });

//   await page.goto("https://id.land/users/sign_in");
//   await page.getByPlaceholder("Email address").click();
//   await page.getByPlaceholder("Email address").fill("optionhomes11@gmail.com");
//   await page.getByPlaceholder("Password").click();
//   await page.getByPlaceholder("Password").fill("Landid1!");
//   await page.getByRole("button", { name: "Sign In", exact: true }).click();
//   await page.keyboard.press("Escape");

//   await page.waitForTimeout(1000);
//   await page.getByText("Address").click();
//   await page.getByText("Parcel").click();
//   await page.getByText("ID").click();

//   await page.keyboard.press("Tab");
//   await page.keyboard.type("Wisconsin");
//   await page.keyboard.press("Tab");
//   await page.keyboard.press("Tab");
//   await page.keyboard.type("Ashland");
//   await page.keyboard.press("Tab");
//   // await page.getByText("Tab").click();
//   // await page.locator("#react-select-2-input").fill("wis");
//   // await page.getByText("Wisconsin", { exact: true }).click();
//   await page.getByPlaceholder("County").click();
//   await page.getByPlaceholder("County").fill("o");
//   await page
//     .locator("div")
//     .filter({ hasText: /^Ashland County$/ })
//     .locator("div")
//     .click();
//   await page.getByPlaceholder("ID").click();
//   await page.getByPlaceholder("ID").fill("1234");
//   await page
//     .locator("div")
//     .filter({ hasText: /^018-01234-0000 \(18012340000\)$/ })
//     .locator("div")
//     .click();
//   await page.getByRole("button", { name: "GO" }).click();

//   await page.locator(".waypoint-message__close > svg").click();
//   await page.getByLabel("Map", { exact: true }).click({
//     button: "right",
//     position: {
//       x: 809,
//       y: 250,
//     },
//   });
//   // await page.locator('div').filter({ hasText: /^3D46\.3431, -90\.5944$/ }).getByRole('img').nth(2).click();
//   await page
//     .locator("li")
//     .filter({ hasText: "Water" })
//     .locator("div")
//     .first()
//     .click();

//   await page.waitForTimeout(2000);
//   await page.screenshot({ path: "water.png", fullPage: true });

//   // Get the image dimensions
//   const imageInfo = await sharp("water.png").metadata();
//   console.log("Image dimensions:", {
//     width: imageInfo.width,
//     height: imageInfo.height,
//   });

//   // Now you can use these dimensions to take a cropped screenshot
//   await page.screenshot({
//     path: "water-cropped.png",
//     clip: {
//       x: 0,
//       y: 0,
//       width: imageInfo.width,
//       height: imageInfo.height,
//     },
//   });

//   await page
//     .locator("li")
//     .filter({ hasText: "Outdoors" })
//     .locator("div")
//     .first()
//     .click();
//   // await page.locator('li').filter({ hasText: 'Outdoors' }).getByRole('img').locator('path').click();
//   await page.waitForTimeout(2000);
//   await page.screenshot({ path: "contours.png", fullPage: true });
// });

module.exports = {
  performTest,
  login,
};
