const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Add JSON middleware
app.use(express.json());

const dropboxV2Api = require("dropbox-v2-api");
const { Dropbox } = require("dropbox");
require("dotenv").config();
const { MongoClient } = require("mongodb");
var murl = process.env.MONGODB_URI;
const client = new MongoClient(murl);
client.connect();
const database = client.db("mydata");
// let collection = database.collection("alcornms");
let firstNum = 0;
let myArgs = process.argv.slice(2);
console.log(myArgs);
let lastNum = myArgs.pop();
console.log("Last number:", lastNum);

// const { launchBrowser } = require("./patchright.js");
const { launchBrowser } = require("./patchright2.js");
// const { launchBrowser } = require("./stealthPlaywright");
const { performTest, login } = require("./tests/test-5.spec.ts");
const { performTestAPN, performTestLatLon } = require("./tests/SETH1.spec.js");
const { refreshDropboxToken } = require("./refreshToken.js");
const { fetchMongoDBData, getDaysAgoString } = require("./getMongoData.js");
// const { getDaysAgoString } = require("./getMongoData");
const { upsertOneToBucket } = require("./updateBucket.js");
const { closeEngagementPopups } = require("./overlay.js");
// const { login } = require("./tests/test-5.spec.ts");
// const { log } = require("console");

const fs = require("fs").promises;
const path = require("path");
const { getSharedLink } = require("./getSharedLink.js");

async function deletePngFiles(folderPath) {
  try {
    // Read the contents of the folder
    const files = await fs.readdir(folderPath);
    // Filter out files that have a .png extension
    const pngFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".png",
    );

    // Loop through the filtered files and delete each one
    for (const file of pngFiles) {
      await fs.unlink(path.join(folderPath, file));
      console.log(`Deleted ${file}`);
    }

    console.log("All .png files deleted from", folderPath);
  } catch (error) {
    console.error("Error deleting .png files:", error);
  }
}

// Call the function for the "screenshots" folder
deletePngFiles("./screenshots");

// (async () => {
app.post("/sethProp", (req, res) => {
  
/*   curl --location 'http://localhost:3000/sethProp' \
  --header 'Content-Type: application/json' \
  --data '{
    "num": 30,
    "filterObj": {}
  }' */

  const body = req.body;
  res.send("Processing started");
  processSethProp(body).catch((err) =>
    console.error("Unhandled error in /sethProp async processing:", err),
  );
});

async function processSethProp(body) {
  console.time("sethPropProcessing");
  const sethPropStart = Date.now();

  try {
    console.log("body:", body);
    // const filterObj = body.filterObj || {};
    const filterObj = { $or: [{ WaterURL: "" }, { ContourURL: "" }] };
    const num = body.num || 30;
    console.log(filterObj);

    let collection = database.collection("alcornBucket");

    let response = await fetchMongoDBData(filterObj, "alcornBucket");
    let properties = response.documents;
    if (!properties || !properties.length) {
      console.log("No properties to process");
      return;
    }

    properties = properties.slice(0, num || properties.length);
    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;
    const dbx = new Dropbox({ accessToken: dropboxToken });

    const browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 34.8985,
        longitude: -88.5952,
      },
      javaScriptEnabled: true,
    });

    const page = await context.newPage();
    const loggedInPage = await login(page);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // At the beginning of your script, right after page load

    await closeEngagementPopups(loggedInPage);
/*     await loggedInPage.screenshot({
      path: "./screenshots/screenshot-debug.png",
    }); */
    await loggedInPage.keyboard.press("Escape");

    for (let i = 0; i < properties.length; i++) {
      console.log(`Processing property #${i + 1} of ${properties.length}`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        let property = properties[i];
        uploadData = await performTestLatLon(
          loggedInPage,
          property,
          dropboxToken,
          closeEngagementPopups,
        );

        // Ensure uploadData and the returned result files exist before accessing path_lower
        if (!uploadData) {
          console.error(
            "uploadData is null or undefined for property:",
            property,
          );
          // skip this property and continue with the next one
          continue;
        }

        let sharedWaterLink = "";
        let sharedContourLink = "";

        if (
          uploadData.resultWaterFile &&
          uploadData.resultWaterFile.path_lower
        ) {
          sharedWaterLink =
            (await getSharedLink(dbx, uploadData.resultWaterFile.path_lower)) ||
            "";
        } else {
          console.warn(
            "No resultWaterFile.path_lower for property, skipping water link:",
            property,
          );
        }

        if (
          uploadData.resultContourFile &&
          uploadData.resultContourFile.path_lower
        ) {
          sharedContourLink =
            (await getSharedLink(
              dbx,
              uploadData.resultContourFile.path_lower,
            )) || "";
        } else {
          console.warn(
            "No resultContourFile.path_lower for property, skipping contour link:",
            property,
          );
        }

        property.WaterURL = sharedWaterLink;
        property.ContourURL = sharedContourLink;

        // property.ContourURL = uploadData.resultContourFile.path_lower;
        // property.WaterURL = uploadData.resultWaterFile.path_lower;
        // console.log("Property:", property);
        await upsertOneToBucket(collection, property);
      } catch (err) {
        console.error("Error processing property:", err);
      }
    }
    await browser.close();
    console.timeEnd("sethPropProcessing");
    const sethPropDuration = Date.now() - sethPropStart;
    console.log(`sethProp processing duration: ${sethPropDuration}ms`);
    console.log("Processing complete");
  } catch (err) {
    console.error("Error in processSethProp:", err);
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
