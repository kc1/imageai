const express = require("express");
// const sharp = require("sharp");

const { launchBrowser } = require("./stealthPlaywright");
const { performTest, login } = require("./tests/test-5.spec.ts");
// const { login } = require("./tests/test-5.spec.ts");
const { log } = require("console");

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

const { refreshDropboxToken } = require("./refreshToken");

app.post("/processMany", async (req, res) => {
  try {
    const properties = req.body;
    console.log("Properties:", properties);

    if (!properties || !properties.length) return "No properties to process";

    const data = await refreshDropboxToken();
    const dropboxToken = data.access_token;

    // return properties;

    const browser = await launchBrowser();
    // const context = await browser.newContext({storageState: "./state.json"});
    const context = await browser.newContext({
      permissions: ["geolocation"],
      
      geolocation: {
      latitude: 45.680386849221,
      longitude: -90.361372973983,
      },
      javaScriptEnabled: true,
      // storageState: "./state.json", // Load storage state from state.json
    });

    await context.route("**/*", async (route) => {
      await route.continue();
    });

    const page = await context.newPage();
    // const out = await loggedInPage.context().storageState();
    // console.log(out);

    const loggedInPage = await login(page);

    for (let i = 0; i < properties.length; i++) {
      let property = properties[i];
      property.apn = property.APN;
      if (property && property.state && property.county && property.APN) {
        // const page = await context.newPage();
        await performTest(loggedInPage, property, dropboxToken);
        // await require('fs').promises.unlink('./water.png').catch(err => console.error('Error deleting water.png:', err));
        // await require('fs').promises.unlink('./contours.png').catch(err => console.error('Error deleting water.png:', err));
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

    const page = await context.newPage();
    await context.route("**/*", async (route) => {
      await route.continue();
    });
    await context.loadStorageState({ path: "./state.json" });
    await performTest(page, property);

    await browser.close();
    res.json({
      success: true,
      data: {
        property,
        message: "Processing complete",
      },
    });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
