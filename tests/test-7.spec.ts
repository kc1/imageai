// import { uploadToDropbox } from "../uploadToDropbox";

// const { uploadToDropbox } = require("../uploadToDropbox");
// // const { test, expect } = require("@playwright/test");
// const sharp = require("sharp");
// // const fetch = require('node-fetch');
// // const fileContent = require('fs').readFileSync(filePath);
// const { refreshDropboxToken } = require("../refreshToken");
// async function performTest(page,property) {
//   // test.setTimeout(60000);
//   const data = await refreshDropboxToken();
//   const dropboxToken = data.access_token;


//   const context = await page.context();
//   await context.grantPermissions(["geolocation"], {
//     origin: "https://id.land",
//   });

//   page = await context.newPage();

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
//   // await page.keyboard.type("Wisconsin");
//   await page.keyboard.type(property.state);
//   await page.keyboard.press("Tab");
//   await page.keyboard.press("Tab");
//   // await page.keyboard.type("Ashland");
//   await page.keyboard.type(property.county);
//   // await page.keyboard.press("Tab");
//   // await page.keyboard.press("Tab");
//   await page.getByPlaceholder("County").click();
//   // await page.getByPlaceholder("County").fill("o");
//   await page.getByPlaceholder("County").fill(property.county);
//   // await page.locator("div.provisional > div.icon").getByText(/.*County.*/).click();
//   // await page.locator("div.provisional > div.icon").getByText(/.*County.*/).click();
//   // await page.getBy.locator("div.provisional").click();
//   await page.keyboard.press('ArrowDown');
//   await page.keyboard.press('Enter');
//   await page.keyboard.press('Tab');
//   // await page.getByPlaceholder("County").click();
//   // await page.getByPlaceholder("County").fill("o");

//   // await page
//   //   .locator("div")
//   //   .filter({ hasText: new RegExp(/.*County.*/) })
//   //   .locator("div")
//   //   .click();
//   await page.getByPlaceholder("ID").click();

//     // .filter({ hasText: new RegExp(`^$County$`) })
//   // await page.getByPlaceholder("ID").fill("1234");
//   await page.getByPlaceholder("ID").fill(property.apn);
//   // let slug = "("+property.apn.slice(0, 2); 
//   // slug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
//   // console.log(slug);
//   // await page
//   //   .locator("div")
//   //   .filter({ hasText: new RegExp(`${slug}`) })
//   // await page.keyboard.press('Shift+Tab');
//   await page.keyboard.press('Shift+Tab');
//   //   .click();
//   // await page.keyboard.press("Tab");
//   await page.keyboard.press('Tab');
//   // await page.keyboard.press('Tab');

//   // await page.getByPlaceholder("County").click();
//   await page.getByRole("button", { name: "GO" }).click();

//   await page.locator(".waypoint-message__close > svg").click();
//   await page.getByLabel("Map", { exact: true }).click({
//     button: "right",
//     position: {
//       x: 809,
//       y: 250,
//     },
//   });
//   await page
//     .locator("li")
//     .filter({ hasText: "Water" })
//     .locator("div")
//     .first()
//     .click();

//   await page.waitForTimeout(2000);
//   await page.screenshot({ path: "water.png", fullPage: true });

//   // const imageInfo = await sharp("water.png").metadata();
//   // console.log("Image dimensions:", {
//   //   width: imageInfo.width,
//   //   height: imageInfo.height,
//   // });

//   // await page.screenshot({
//   //   path: "water-cropped.png",
//   //   clip: {
//   //     x: 0,
//   //     y: 0,
//   //     width: imageInfo.width,
//   //     height: imageInfo.height,
//   //   },
//   // });

//   await page
//     .locator("li")
//     .filter({ hasText: "Outdoors" })
//     .locator("div")
//     .first()
//     .click();
//   await page.waitForTimeout(2000);
//   await page.screenshot({ path: "contours.png", fullPage: true });

//   const date = new Date();
//   const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
//   const waterFilename = `${property.state}-${property.county}-${property.apn}-${formattedDate}-water.png`;
//   const contoursFilename = `${property.state}-${property.county}-${property.apn}-${formattedDate}-contours.png`;

//   await uploadToDropbox(waterFilename,"./water.png",dropboxToken);
//   await uploadToDropbox(contoursFilename,"./contours.png",dropboxToken);
// }

// module.exports = {
//    performTest 
// };