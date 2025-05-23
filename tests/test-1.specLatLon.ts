// import { test, expect } from '@playwright/test';
const { uploadToDropbox } = require("../uploadToDropbox");

// test('test', async ({ page }) => {
//   await page.goto('https://id.land/');
//   await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
//   await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
//   await page.getByPlaceholder('Email address').press('Tab');
//   await page.getByPlaceholder('Password').fill('Landid1!');
//   await page.getByRole('button', { name: 'Sign In', exact: true }).click();
//   await page.locator('div').filter({ hasText: /^Location Access Needed$/ }).getByRole('button').click();
//   await page.getByLabel('Map', { exact: true }).click({
//     position: {
//       x: 782,
//       y: 211
//     }
//   });
//   await page.goto('https://id.land/discover');
//   await page.getByRole('textbox').click();
//   await page.getByRole('textbox').fill('34,-88');
//   await page.getByRole('heading', { name: '-88.000000' }).click();
//   await page.locator('li').filter({ hasText: 'Water' }).getByRole('img').click();
//   await page.locator('li').filter({ hasText: 'Outdoors' }).getByRole('img').locator('path').click();
//   await page.getByText('Account', { exact: true }).click();
//   await page.getByRole('button', { name: 'Sign Out' }).click();
// });


async function performTest2(page, property, dropboxToken) {

  await page.goto('https://id.land/discover');
  await page.getByRole('textbox').click();
  console.log('property', property);
  // await page.getByRole('textbox').fill('34,-88');
  await page.getByRole('textbox').fill(property.lat.toString() + ',' + property.lon.toString());
  // await page.getByRole('heading', { name: '-88.000000' }).click();
  // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p
  await page.locator('#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p').click();
  // await page.getByRole('heading', { name: property.lat.toString() }).click();
  await page.locator('li').filter({ hasText: 'Water' }).getByRole('img').click();
  await page.locator('li').filter({ hasText: 'Outdoors' }).getByRole('img').locator('path').click();
  await page.getByText('Account', { exact: true }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
}



async function performTest3(page, property, dropboxToken) {
  await page.waitForTimeout(4000);
  const dt = new Date();
  let ts = Math.floor(dt.getTime() / 1000);

  // const testFile = `${property.state}-${property.county}-${property.apn}-${ts}-test.png`;
  // // const contoursFilename = `${property.state}-${property.county}-${property.apn}-${timestamp}-contours.png`;

  // await page.screenshot({
  //   path: "./screenshots/" + testFile,
  //   fullPage: true,
  // });
  // const testResult = await uploadToDropbox(testFile, "./screenshots/" + testFile, dropboxToken);
  // console.log("Test file uploaded to Dropbox");

  await page.goto('https://id.land/discover');
  await page.waitForTimeout(10000);
  await page.getByRole('textbox').click();
  console.log('property', property);
  // await page.getByRole('textbox').fill('34,-88');
  await page.getByRole('textbox').fill(property.lat.toString() + ',' + property.lon.toString());
  // await page.getByRole('heading', { name: '-88.000000' }).click();
  // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p
  await page.locator('#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p').click();
  // await page.getByRole('heading', { name: property.lat.toString() }).click();
  await page.locator('li').filter({ hasText: 'Water' }).getByRole('img').click();
 
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

  // const testFile = `${property.state}-${property.county}-${property.apn}-${ts}-test.png`;
  const waterFilename = `${property.state}-${property.county}-${property.apn}-${ts}-water.png`;
  // const contoursFilename = `${property.state}_${property.county}_${property.apn}_${timestamp}-contours.png`;
  // const contoursFilename = `${property.state}_${property.county}_${property.apn}_contours.png`;
  const contoursFilename = `${property.state}-${property.county}-${property.apn}-${ts}-contours.png`;

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
  let resultWaterFile = await uploadToDropbox(
    waterFilename,
    "./screenshots/" + waterFilename,
    dropboxToken
  );
  let resultContourFile = await uploadToDropbox(
    contoursFilename,
    "./screenshots/" + contoursFilename,
    dropboxToken
  );
  console.log(resultWaterFile, resultContourFile);

  return { resultWaterFile, resultContourFile };

  // await writeToDropbox(waterBuffer, waterFilename, dropboxToken);
  // await writeToDropbox(contourBuffer, contoursFilename, dropboxToken);
}

// #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt
module.exports = {
  performTest2,
  performTest3
};
