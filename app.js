const express = require("express");
// const sharp = require("sharp");

const { launchBrowser } = require("./patchright");
// const { launchBrowser } = require("./stealthPlaywright");
const { performTest, login } = require("./tests/test-5.spec.ts");
const { performTestAPN, performTestLatLon } = require("./tests/test-1.spec.ts");
const { refreshDropboxToken } = require("./refreshToken");
const { fetchMongoDBData } = require("./getMongoData");
const { getDaysAgoString } = require("./getMongoData");
// const { login } = require("./tests/test-5.spec.ts");
// const { log } = require("console");

const app = express();
const port = process.env.PORT || 3000;

// Add JSON middleware
app.use(express.json());

// Add index route
app.get("/", (req, res) => {
  try {
    res.send("Hello World");
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

app.post("/processMany", async (req, res) => {
  try {
    // const properties = req.body;
    // console.log("Properties:", properties);
    const fiveDaysAgo = getDaysAgoString(90);
    console.log(fiveDaysAgo);
    const filterObj = {
      $or: [
        { ContourURL: { $in: [null, "", []], $exists: true } },
        { WaterURL: { $in: [null, "", []], $exists: true } },
      ],
      list_date: { $gte: fiveDaysAgo },
    };

    console.log(filterObj);

    let response = await fetchMongoDBData(filterObj, "bucket1");
    let properties = response.documents;
    if (!properties || !properties.length) return "No properties to process";
    console.log("Properties:", properties);
    // return;

    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;

    const browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 45.680386849221,
        longitude: -90.361372973983,
      },
      javaScriptEnabled: true,
    });
    // Inject scripts to spoof Chrome OS via context.addInitScript
    // await context.addInitScript(() => {
    //   Object.defineProperty(navigator, "platform", {
    //     get: () => "CrOS",
    //   });
    // });

    // await context.addInitScript(() => {
    //   WebGLRenderingContext.prototype.getParameter = (original => function (param) {
    //     if (param === 37445) return "Chromebook"; // Fake renderer
    //     return original.call(this, param);
    //   })(WebGLRenderingContext.prototype.getParameter);
    // });

    const page = await context.newPage();
    const loggedInPage = await login(page);

    for (let i = 0; i < properties.length; i++) {
      let property = properties[i];
      property.apn = property.APN;
      if (property && property.state && property.county && property.APN) {
        // await performTest(loggedInPage, property, dropboxToken);
        await performTestAPN(loggedInPage, property, dropboxToken);
      }
    }

    await browser.close();

    res.json({
      success: true,
      data: {
        properties,
        message: "Processing complete",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/upDateRemoteCollectionWithAPN", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/process", async (req, res) => {
  try {
    const { property } = req.body;

    if (!property || !property.state || !property.county || !property.apn) {
      return res.status(400).json({ error: "Missing property details" });
    }
    console.log("Property:", property);

    const browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 45.680386849221,
        longitude: -90.361372973983,
      },
      javaScriptEnabled: true,
    });

    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;


    const page = await context.newPage();
    // /*     await context.route("**/*", async (route) => {
    // await route.continue();
    // */   });
    // await context.loadStorageState({ path: "./state.json" });
    const loggedInPage = await login(page);
    // await performTest(loggedInPage, property);
    // await performTestLatLon(loggedInPage, property, dropboxToken);

    // Take a screenshot before closing the browser
    const timestamp = Date.now();
    const screenshotFilename = `property-${property.state}-${property.county}-${timestamp}.png`;
    const screenshotPath = `./screenshots/${screenshotFilename}`;
    
    await loggedInPage.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`Screenshot saved: ${screenshotPath}`);

    await browser.close();
    
    // Return the screenshot image instead of JSON
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${screenshotFilename}"`);
    res.sendFile(screenshotPath, { root: __dirname });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/createCredentials", async (req, res) => {
  try {
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
    await loggedInPage.context().storageState({ path: "./state.json" });
    browser.close();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/screenshot", async (req, res) => {
  try {
    const { url, filename, fullPage = true, width = 1920, height = 1080 } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 45.680386849221,
        longitude: -90.361372973983,
      },
      javaScriptEnabled: true,
      viewport: { width, height }
    });

    const page = await context.newPage();
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Generate filename if not provided
    const screenshotFilename = filename || `screenshot-${Date.now()}.png`;
    const screenshotPath = `./screenshots/${screenshotFilename}`;
    
    // Take screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: fullPage
    });

    await browser.close();

    res.json({
      success: true,
      data: {
        filename: screenshotFilename,
        path: screenshotPath,
        url: url,
        message: "Screenshot taken successfully"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
