// const { test, expect } = require("@playwright/test");
const sharp = require("sharp");

async function performTest(page,property) {
  // test.setTimeout(60000);

  const context = await page.context();
  await context.grantPermissions(["geolocation"], {
    origin: "https://id.land",
  });

  page = await context.newPage();

  await context.grantPermissions(["geolocation"], {
    origin: "https://id.land",
  });

  await page.goto("https://id.land/users/sign_in");
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("optionhomes11@gmail.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("Landid1!");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.keyboard.press("Escape");

  await page.waitForTimeout(1000);
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
  await page.keyboard.press("Tab");
  await page.getByPlaceholder("County").click();
  await page.getByPlaceholder("County").fill("o");
  await page
    .locator("div")
    .filter({ hasText: /^Ashland County$/ })
    .locator("div")
    .click();
  await page.getByPlaceholder("ID").click();
  // await page.getByPlaceholder("ID").fill("1234");
  await page.getByPlaceholder("ID").fill(property.apn);
  // let slug = "("+property.apn.slice(0, 2); 
  // slug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // console.log(slug);
  // await page
  //   .locator("div")
  //   .filter({ hasText: new RegExp(`${slug}`) })
  // await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  //   .click();
  // await page.keyboard.press("Tab");
  await page.keyboard.press('Tab');
  // await page.keyboard.press('Tab');

  // await page.getByPlaceholder("County").click();
  await page.getByRole("button", { name: "GO" }).click();

  await page.locator(".waypoint-message__close > svg").click();
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
  await page.screenshot({ path: "water.png", fullPage: true });

  const imageInfo = await sharp("water.png").metadata();
  console.log("Image dimensions:", {
    width: imageInfo.width,
    height: imageInfo.height,
  });

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
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "contours.png", fullPage: true });
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
   performTest 
};