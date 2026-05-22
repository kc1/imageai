const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Add JSON middleware
app.use(express.json());

const dropboxV2Api = require("dropbox-v2-api");
const { Dropbox } = require("dropbox");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const dns = require("dns");
var murl = process.env.MONGODB_URI;
// Local stub resolver often SERVFAILs SRV; mongodb+srv needs SRV (see dig vs dig @1.1.1.1).
if (typeof murl === "string" && murl.startsWith("mongodb+srv://")) {
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);
}
const MONGO_DB_NAME = "mydata";
const MONGO_MAX_POOL_SIZE = Number(process.env.MONGO_MAX_POOL_SIZE || 5);

function createMongoClient(runLabel) {
  const options = {
    maxPoolSize: MONGO_MAX_POOL_SIZE,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    waitQueueTimeoutMS: 10000,
  };
  console.log(
    `[MongoDB] Creating fresh client for ${runLabel} with maxPoolSize=${options.maxPoolSize}`,
  );
  return new MongoClient(murl, options);
}

function logMongoClientState(client, label) {
  const serverCount = client.topology?.description?.servers?.size ?? 0;
  console.log(`[MongoDB] ${label} | knownServers=${serverCount}`);
}

let firstNum = 0;
let myArgs = process.argv.slice(2);
console.log(myArgs);
let lastNum = myArgs.pop();
console.log("Last number:", lastNum);

// const { launchBrowser } = require("./patchright.js");
const { launchBrowser } = require("./patchright2.js");
// const { launchBrowser } = require("./stealthPlaywright");
const { performTest, login } = require("./tests/test-5.spec.ts");
const { performTestAPN, performTestLatLon } = require("./tests/SETH2.spec.js");
const { refreshDropboxToken } = require("./refreshToken.js");
const { fetchMongoDBData, getDaysAgoString } = require("./getMongoData.js");
// const { getDaysAgoString } = require("./getMongoData");
const { upsertOneToBucket } = require("./updateBucket.js");
const { closeEngagementPopups, setBasemap } = require("./overlay.js");
const { addBuffer, buildGEOJSONIOurl } = require("./turfUtilities.js");
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
async function loadGeoJSONInGeojsonIO(page, geojsonObj) {
  console.log("Loading GeoJSON into geojson.io...");

  await page.goto("http://127.0.0.1:8080/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Strong wait for full API readiness
  console.log("Waiting for full window.api...");
  await page.waitForFunction(
    () => {
      return (
        window.api &&
        window.api.data &&
        window.api.map &&
        typeof window.api.data.set === "function"
      );
    },
    { timeout: 35000, polling: 500 },
  );

  // Debug info
  await page.evaluate(() => {
    console.log("=== window.api STATUS ===", {
      api: !!window.api,
      data: !!window.api?.data,
      map: !!window.api?.map,
      setMethod: typeof window.api?.data?.set,
      mapVersion: window.api?.map?.version,
    });
  });

  // Load the GeoJSON
  await page.evaluate((geojson) => {
    // Convert to FeatureCollection if needed
    let fc = geojson;
    if (geojson.type === "Polygon") {
      fc = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "My Polygon" },
            geometry: geojson,
          },
        ],
      };
    }

    // Main load method
    window.api.data.set({ map: fc });
    console.log("✅ window.api.data.set() executed");
  }, geojsonObj);

  // Wait a bit for rendering
  await page.waitForTimeout(1200);

  // Force zoom using bbox
  await page.evaluate((bbox) => {
    if (window.api?.map && bbox) {
      const [west, south, east, north] = bbox;
      window.api.map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        {
          padding: 120,
          duration: 1400,
          maxZoom: 19,
        },
      );
      console.log("✅ fitBounds executed");
    }
  }, geojsonObj.bbox);

  // Optional: Switch to 2D mode (sometimes helps with small polygons)
  await page.evaluate(() => {
    if (window.api?.map) {
      window.api.map.setProjection("mercator");
    }
  });

  console.log("✅ GeoJSON loading finished");
  return true;
}

app.post("/buildScreenshotsFromLink", (req, res) => {
  /*   curl --location 'http://localhost:3000/sethProp' \
  --header 'Content-Type: application/json' \
  --data '{
    "num": 30,
    "filterObj": {}
  }' */

  const body = req.body;
  res.send("Processing started");
  // return;
  takeScreenShots(body).catch((err) =>
    console.error("Unhandled error in /sethProp async processing:", err),
  );
});

async function takeScreenShots(body) {
  let mongoClient;
  let browser;

  try {
    const { uploadToDropbox } = require("./uploadToDropbox.js");
    console.log("body:", body);
    const filterObj = { RoadURL: "" };
    const num = body.num || 30;
    console.log(filterObj);

    mongoClient = createMongoClient("buildScreenshotsFromLink");
    await mongoClient.connect();
    logMongoClientState(mongoClient, "Connected in takeScreenShots");
    const database = mongoClient.db(MONGO_DB_NAME);
    let collection = database.collection("alcornGeoJsonBucket");

    let response = await fetchMongoDBData(filterObj, collection);
    let properties = response.documents;
    if (!properties || !properties.length) {
      console.log("No properties to process");
      return;
    }

    properties = properties.slice(0, num || properties.length);
    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;
    const dbx = new Dropbox({
      accessToken: dropboxToken,
    });

    browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 34.8985,
        longitude: -88.5952,
      },
      javaScriptEnabled: true,
    });

    for (let i = 0; i < properties.length; i++) {
      console.log(`Processing property #${i + 1} of ${properties.length}`);
      try {
        const pagesToClose = context.pages().slice(-2);
        for (const stalePage of pagesToClose) {
          await stalePage.close().catch((err) => {
            console.warn("Failed to close stale page:", err.message);
          });
        }
        let page = await context.newPage();

        await new Promise((resolve) => setTimeout(resolve, 5000));
        const property = properties[i];
        const PARNO = property.PARNO || false;
        const parcel = property.parcel || false;
        let libraryFilterObj = { $or: [{ PARNO: PARNO }, { parcel: parcel }] };
        if (!PARNO && !parcel) {
          console.warn(
            "Skipping property with missing PARNO or parcel:",
            property,
          );
          continue;
        }
        let output = await fetchMongoDBData(
          libraryFilterObj,
          "alcornMERGED2subset",
        );
        let fullPropertyRecords = output.documents;
        if (!fullPropertyRecords || !fullPropertyRecords.length) {
          console.log("Can't process");
          continue;
        }
        const fullPropertyRecord = fullPropertyRecords.pop();
        console.log("Property:", property.PARNO)
        const originalGeoJSON = fullPropertyRecord.geometry;
        console.log(originalGeoJSON);
        const bufferedGeoJSON = await addBuffer(
          originalGeoJSON,
          25 * 0.000189394,
          "miles",
        );
        console.log(bufferedGeoJSON);
        const bufferedGeoJSONURL = await buildGEOJSONIOurl(bufferedGeoJSON);

        const dt = new Date();
        let ts = Math.floor(dt.getTime() / 1000);
        const modifiedPARNO = property.PARNO.replace(/ /g, "-");
        const roadFile = `${modifiedPARNO}-${ts}-road.png`;

        console.log("");
        // await loadGeoJSONInGeojsonIO(page, bufferedGeoJSON);
        await page.goto(bufferedGeoJSONURL);

        await page.waitForTimeout(4000);

        try {
          const leftHandle = await page.$(
            "i.sidebar-handle-icon.fa-solid.fa-caret-left",
          );
          if (leftHandle) {
            console.log("Sidebar already hidden; map is maximized.");
          } else {
            const rightHandle = await page.waitForSelector(
              "i.sidebar-handle-icon.fa-solid.fa-caret-right",
              { visible: true, timeout: 5000 },
            );
            await rightHandle.click();
            console.log("Clicked sidebar right caret to maximize map.");
          }
        } catch (err) {
          console.error(
            "Error maximizing map/sidebar after navigating to buffered GeoJSON URL:",
            err,
          );
        }

        try {
          const standardButton = await page.waitForSelector(
            'div.layer-switch button.pad0x:has-text("Standard")',
            { visible: true, timeout: 5000 },
          );
          await standardButton.click();
          console.log("Selected Standard layer for road screenshot.");
        } catch (err) {
          console.error("Error selecting Standard layer:", err);
        }

        await page.waitForTimeout(4000);
        await page.screenshot({
          path: "./screenshots/" + roadFile,
          fullPage: true,
        });

        let resultRoadFile = await uploadToDropbox(
          roadFile,
          "./screenshots/" + roadFile,
          dropboxToken,
        );
        console.log(resultRoadFile);

        // Ensure uploadData and the returned result files exist before accessing path_lower
        if (!resultRoadFile) {
          console.error(
            "resultRoadFile is null or undefined for property:",
            property,
          );
        } else {
          let sharedRoadLink =
            (await getSharedLink(dbx, resultRoadFile.path_lower)) || "";
          property.RoadURL = sharedRoadLink;
          await upsertOneToBucket(collection, property);
        }

        // click the "New" button in geojson.io toolbar
        /* try {
          const newButton = await page.waitForSelector(
            'div.file-bar.hidden.md\\:block div.item:has-text("New") a.parent',
            { visible: true, timeout: 10000 },
          );
          await newButton.click();
        } catch (err) {
          console.error("Error clicking the New button:", err);
        } */

        // next: add building footprint screenshots using same GeoJSONobj and same process as above, but with different file name and property field (BuildingURL)
        
        const buildingFile = `${modifiedPARNO}-${ts}-building.png`;

        await page.waitForTimeout(3000);
        console.log(originalGeoJSON);
        const originalGeoJSONurl = await buildGEOJSONIOurl(originalGeoJSON);


        const buildingPage = await context.newPage();
        try {
          await buildingPage.goto(originalGeoJSONurl);
          // await loadGeoJSONInGeojsonIO(buildingPage, originalGeoJSON);
          console.log("Loaded original GeoJSON into local geojson.io");
        } catch (err) {
          console.error(
            "Error loading original GeoJSON into local geojson.io:",
            err,
          );
        }
        await buildingPage.waitForTimeout(4000);

        try {
          const outdoorsButton = await buildingPage.waitForSelector(
            'div.layer-switch button.pad0x:has-text("Outdoors")',
            { visible: true, timeout: 5000 },
          );
          await outdoorsButton.click();
          console.log("Selected Outdoors layer for building screenshot.");
        } catch (err) {
          console.error("Error selecting Outdoors layer:", err);
        }

        try {
          const leftHandle = await buildingPage.$(
            "i.sidebar-handle-icon.fa-solid.fa-caret-left",
          );
          if (leftHandle) {
            console.log("Sidebar already hidden; map is maximized.");
          } else {
            const rightHandle = await buildingPage.waitForSelector(
              "i.sidebar-handle-icon.fa-solid.fa-caret-right",
              { visible: true, timeout: 5000 },
            );
            await rightHandle.click();
            console.log("Clicked sidebar right caret to maximize map.");
          }
        } catch (err) {
          console.error(
            "Error maximizing map/sidebar after navigating to buffered GeoJSON URL:",
            err,
          );
        }
        await buildingPage.waitForTimeout(2000);
        await buildingPage.screenshot({
          path: "./screenshots/" + buildingFile,
          fullPage: true,
        });
        await buildingPage.close();

        let resultBuildingFile = await uploadToDropbox(
          buildingFile,
          "./screenshots/" + buildingFile,
          dropboxToken,
        );
        console.log(resultBuildingFile);

        // Ensure uploadData and the returned result files exist before accessing path_lower
        if (!resultBuildingFile) {
          console.error(
            "resultBuildingFile is null or undefined for property:",
            property,
          );
        } else {
          let sharedBuildingLink =
            (await getSharedLink(dbx, resultBuildingFile.path_lower)) || "";
          property.BuildingURL = sharedBuildingLink;
          await upsertOneToBucket(collection, property);
        }
      } catch (err) {
        console.error("Error processing property:", err);
      }
    }
    console.log("Processing complete");
  } finally {
    if (browser) {
      await browser.close().catch((err) => {
        console.error("Failed to close browser:", err);
      });
    }
    if (mongoClient) {
      logMongoClientState(mongoClient, "Closing in takeScreenShots");
      await mongoClient.close().catch((err) => {
        console.error("Failed to close Mongo client in takeScreenShots:", err);
      });
    }
  }
}

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
  let timerEnded = false;
  let mongoClient;
  let browser;

  try {
    console.log("body:", body);
    // const filterObj = body.filterObj || {};
    const filterObj = { $or: [{ WaterURL: "" }, { ContourURL: "" }] };
    const num = body.num || 30;
    console.log(filterObj);

    mongoClient = createMongoClient("sethProp");
    await mongoClient.connect();
    logMongoClientState(mongoClient, "Connected in processSethProp");
    const database = mongoClient.db(MONGO_DB_NAME);
    let collection = database.collection("alcornBucket");

    let response = await fetchMongoDBData(filterObj, collection);
    let properties = response.documents;
    if (!properties || !properties.length) {
      console.log("No properties to process");
      return;
    }

    properties = properties.slice(0, num || properties.length);
    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;
    const dbx = new Dropbox({ accessToken: dropboxToken });

    browser = await launchBrowser();
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
    await new Promise((resolve) => setTimeout(resolve, 15000));
    // At the beginning of your script, right after page load

    await closeEngagementPopups(loggedInPage);
    await loggedInPage.screenshot({
      path: "./screenshots/screenshot-debug.png",
    });
    await loggedInPage.keyboard.press("Escape");
    await setBasemap(loggedInPage);

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
        const errorTs = new Date().toISOString().replace(/[:.]/g, "-");
        const errorScreenshotPath = `./screenshots/ERROR-${errorTs}.png`;
        await loggedInPage
          .screenshot({
            path: errorScreenshotPath,
            fullPage: true,
          })
          .catch(() => {});
        console.error(`Saved error screenshot: ${errorScreenshotPath}`);
        console.error("Error processing property:", err);
      }
    }
    await loggedInPage.getByRole("button").first().click();
    await loggedInPage.locator("header").getByRole("button").nth(2).click();
    await loggedInPage.getByRole("button", { name: "Sign Out" }).click();
    console.timeEnd("sethPropProcessing");
    timerEnded = true;
    const sethPropDuration = Date.now() - sethPropStart;
    console.log(`sethProp processing duration: ${sethPropDuration}ms`);
    console.log("Processing complete");
  } catch (err) {
    console.error("Error in processSethProp:", err);
  } finally {
    if (browser) {
      await browser.close().catch((err) => {
        console.error("Failed to close browser:", err);
      });
    }
    if (mongoClient) {
      logMongoClientState(mongoClient, "Closing in processSethProp");
      await mongoClient.close().catch((err) => {
        console.error("Failed to close Mongo client in processSethProp:", err);
      });
    }
    if (!timerEnded) {
      console.timeEnd("sethPropProcessing");
      const sethPropDuration = Date.now() - sethPropStart;
      console.log(`sethProp processing duration: ${sethPropDuration}ms`);
      console.log("Processing complete");
    }
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
