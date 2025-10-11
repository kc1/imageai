// import { test, expect } from '@playwright/test';
const { uploadToDropbox } = require("../uploadToDropbox");

async function performTest2(page, property, dropboxToken) {
  await page.goto("https://id.land/discover");
  await page.getByRole("textbox").click();
  console.log("property", property);
  // await page.getByRole('textbox').fill('34,-88');
  await page
    .getByRole("textbox")
    .fill(property.lat.toString() + "," + property.lon.toString());
  // await page.getByRole('heading', { name: '-88.000000' }).click();
  // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p
  await page
    .locator(
      "#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p"
    )
    .click();
  // await page.getByRole('heading', { name: property.lat.toString() }).click();
  await page
    .locator("li")
    .filter({ hasText: "Water" })
    .getByRole("img")
    .click();
  await page
    .locator("li")
    .filter({ hasText: "Outdoors" })
    .getByRole("img")
    .locator("path")
    .click();
  await page.getByText("Account", { exact: true }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
}

async function performTestAPN(page, property, dropboxToken) {
  try {
    await page.waitForTimeout(4000);
    const dt = new Date();
    let ts = Math.floor(dt.getTime() / 1000);

    await page.goto("https://id.land/discover");
    await page.waitForTimeout(10000);
    await page
      .locator("div")
      .filter({ hasText: /^Smart Search$/ })
      .nth(2)
      .click();
    await page
      .locator("div")
      .filter({ hasText: /^Smart Search$/ })
      .first()
      .press("ArrowDown");
    await page
      .locator("div")
      .filter({ hasText: /^Smart Search$/ })
      .first()
      .press("ArrowDown");
    await page.locator("li").filter({ hasText: "Parcel" }).click();
    await page.locator("li").filter({ hasText: "ID" }).click();

    // Add state
    await page.keyboard.press("Tab");
    await page.keyboard.type(property.state);

    // Add county
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.type(property.county);

    // Add APN
    await page.getByPlaceholder("County").click();
    await page.getByPlaceholder("County").fill(property.county);
    await page
      .locator("#react-autowhatever-countyAutosuggest--item-0")
      .filter({ hasText: property.county.substring(0, 10) })
      .click(); // Match the first part of the county
    // await page.getByPlaceholder("ID").click();
    await page.getByPlaceholder("ID").first().click();
    await page.getByPlaceholder("ID").first().fill(property.apn.toString());

    // Select the APN from the dropdown
    await page
      .locator("#react-autowhatever-filterValueAutosuggest--item-0 div")
      // .filter({ hasText: property.apn.substring(0, 10) }) // Match the first part of the APN
      .locator("div")
      .click();

    // Click the GO button
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

    // await page.goto('https://id.land/discover');
    // await page.waitForTimeout(10000);
    // await page.getByRole('textbox').click();
    // console.log('property', property);
    // // await page.getByRole('textbox').fill('34,-88');
    // await page.getByRole('textbox').fill(property.lat.toString() + ',' + property.lon.toString());
    // // await page.getByRole('heading', { name: '-88.000000' }).click();
    // // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p
    // await page.locator('#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p').click();
    // // await page.getByRole('heading', { name: property.lat.toString() }).click();
    // await page.locator('li').filter({ hasText: 'Water' }).getByRole('img').click();

    //  // Check if waypoint message exists before clicking
    // try {
    //   const waypointMessage = page.locator(".waypoint-message__close > svg");
    //   if (await waypointMessage.isVisible({ timeout: 2000 })) {
    //     await waypointMessage.click();
    //   }
    // } catch (error) {
    //   console.log("Waypoint message not found, continuing...");
    // }

    // await page.getByLabel("Map", { exact: true }).click({
    //   button: "right",
    //   position: {
    //     x: 809,
    //     y: 250,
    //   },
    // });
    // await page
    //   .locator("li")
    //   .filter({ hasText: "Water" })
    //   .locator("div")
    //   .first()
    //   .click();

    await page.waitForTimeout(2000);
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);

    // const testFile = `${property.state}-${property.county}-${property.apn}-${ts}-test.png`;

    // await page.getByRole('textbox').fill(property.lat.toString() + ',' + property.lon.toString());

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
    await page.waitForTimeout(5000);
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
  } catch (error) {
    console.error("Error in performTestAPN:", error);
    await page.goto("https://id.land/discover");
    return { resultWaterFile: null, resultContourFile: null };
  }

  // await writeToDropbox(waterBuffer, waterFilename, dropboxToken);
  // await writeToDropbox(contourBuffer, contoursFilename, dropboxToken);
}

async function performTestLatLon(page, property, dropboxToken) {
  try {
    await page.waitForTimeout(4000);
    const dt = new Date();
    let ts = Math.floor(dt.getTime() / 1000);

    await page.goto("https://id.land/discover");
    await page.waitForTimeout(5000);
    await page.getByRole("textbox").click();
    console.log("property", property);
    // await page.getByRole('textbox').fill('34,-88');
    await page
      .getByRole("textbox")
      .fill(property.lat.toString() + "," + property.lon.toString());
    // await page.getByRole('heading', { name: '-88.000000' }).click();
    // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p
    // await page.locator('#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div ').click();
    await page.getByRole("textbox").press("Enter");
    /*   await page
    .locator(
      "#mapright-map-container > div.search-bar > div.search-bar__search-control h3"
    )
    .click(); */
    await page
      .locator(
        "#mapright-map-container > div.home-map-panels > div > div > div > div > div.styles-module__resultsContainer___fV9m0 > div > div:nth-child(1) > ul > li > span > div > h3"
      )
      .click();
    // await page.locator("#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > h3").click();
    // await page.locator("#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___fV9m0.styles-module__relativeToInput___kBcGo > ul > li > span > div > h3").click();
    // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___fV9m0.styles-module__relativeToInput___kBcGo 0> div > div:nth-child(1) > ul > li > span > div > h3
    // await page.locator("#mapright-map-container > div.home-map-panels > div > div > div > div > div.styles-module__resultsContainer___fV9m0 > div > div:nth-child(1) > ul > li > span > div > h3").click();
    await page
      .locator(
        "#mapright-map-container > div.home-map-panels > div > div > div > div > div.lid-sidebar__tabs > div > div:nth-child(1) > ul > li.lid-sidebar__tabs__element.lid-sidebar__tabs__element--selected > div > span.lid-sidebar__tabs__element__selected-icon > svg > path"
      )
      .click();
    // await page.locator("#mapright-map-container > div.home-map-panels > div h3").first().click();
    console.log("Clicked on the first search result");
    /*   await page
    .locator(
      "#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___fV9m0.styles-module__relativeToInput___kBcGo > ul > li > span > div > h3"
    )
    .click();
  */ // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___fV9m0.styles-module__relativeToInput___kBcGo > div > div:nth-child(1) > ul > li > span > div > h3
    // await page.getByRole('heading', { name: property.lat.toString() }).click();
    await page
      .locator("li")
      .filter({ hasText: "Water" })
      .getByRole("img")
      .click();

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
    const timestamp = Math.floor(date.getTime() / 1000);

    // const testFile = `${property.state}-${property.county}-${property.apn}-${ts}-test.png`;

    // await page.getByRole('textbox').fill(property.lat.toString() + ',' + property.lon.toString());

    const waterFilename = `${property.state}=${property.county}=${
      property.lat.toString() + "," + property.lon.toString()
    }=${ts}=water.png`;
    // const contoursFilename = `${property.state}_${property.county}_${property.apn}_${timestamp}-contours.png`;
    // const contoursFilename = `${property.state}_${property.county}_${property.apn}_contours.png`;
    const contoursFilename = `${property.state}=${property.county}=${
      property.lat.toString() + "," + property.lon.toString()
    }=${ts}=contours.png`;

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
    await page.waitForTimeout(8000);
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
  } catch (error) {
    await page.goto("https://id.land/discover");
    console.error("Error in performTestLatLon:", error);
  }

  // await writeToDropbox(waterBuffer, waterFilename, dropboxToken);
  // await writeToDropbox(contourBuffer, contoursFilename, dropboxToken);
}

// #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt
module.exports = {
  performTestAPN,
  performTestLatLon,
};
