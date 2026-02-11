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
let collection = database.collection("bucket1");
let firstNum = 0;
let myArgs = process.argv.slice(2);
console.log(myArgs);
let lastNum = myArgs.pop();
console.log("Last number:", lastNum);

const { launchBrowser } = require("./patchright.js");
// const { launchBrowser } = require("./stealthPlaywright");
const { performTest, login } = require("./tests/test-5.spec.ts");
const { performTestAPN, performTestLatLon } = require("./tests/test-1.spec.ts");
const { refreshDropboxToken } = require("./refreshToken.js");
const { fetchMongoDBData, getDaysAgoString } = require("./getMongoData.js");
// const { getDaysAgoString } = require("./getMongoData");
const { upsertOneToBucket } = require("./updateBucket.js");
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
app.post("/main", async (req, res) => {

  try {
    // const properties = req.body;
    // console.log("Properties:", properties);
    // const fiveDaysAgo = getDaysAgoString(90);
    const daysAgo = myArgs[0] ? parseInt(myArgs[0]) : 90;
    const numberDaysAgo = getDaysAgoString(daysAgo);
    console.log(numberDaysAgo);
    const filterObj = {
      $or: [
        { ContourURL: { $in: [null, "", []], $exists: true } },
        { WaterURL: { $in: [null, "", []], $exists: true } },
      ],
      list_date: { $gte: numberDaysAgo },
    };

    console.log(filterObj);

    let response = await fetchMongoDBData(filterObj, "bucket1");
    let properties = response.documents;
    if (!properties || !properties.length) return "No properties to process";
    properties = properties.slice(0, lastNum - 1);
    console.log("Properties:", properties);
    // return;

    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;
    const dbx = new Dropbox({ accessToken: dropboxToken });

    const browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 45.680386849221,
        longitude: -90.361372973983,
      },
      javaScriptEnabled: true,
    });

    const page = await context.newPage();
    const loggedInPage = await login(page);
    await loggedInPage.keyboard.press("Escape");
    for (let i = 0; i < properties.length; i++) {
      let property = properties[i];
      property.apn = property.APN;
      console.log("Property:", property);
      let uploadData;
      if (
        property &&
        property.state &&
        property.county &&
        property.APN !== ""
      ) {
        uploadData = await performTestAPN(loggedInPage, property, dropboxToken);
        // const uploadData = await performTest(loggedInPage, property, dropboxToken);
        // const uploadData = await performTest2(loggedInPage, property, dropboxToken);
      } else if (
        property &&
        property.state &&
        property.county &&
        property.apn === ""
      ) {
        uploadData = await performTestLatLon(
          loggedInPage,
          property,
          dropboxToken,
        );
      }

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

      try {
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
      } catch (err) {
        console.error("Failed to create shared water link:", err);
      }

      try {
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
      } catch (err) {
        console.error("Failed to create shared contour link:", err);
      }

      property.WaterURL = sharedWaterLink;
      property.ContourURL = sharedContourLink;

      // property.ContourURL = uploadData.resultContourFile.path_lower;
      // property.WaterURL = uploadData.resultWaterFile.path_lower;
      // console.log("Property:", property);
      await upsertOneToBucket(collection, property);
    }

    await browser.close();
    console.log("Processing complete");
  } catch (error) {
    console.log("Error:", error);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

