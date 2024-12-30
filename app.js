const express = require("express");
// const sharp = require("sharp");

const { launchBrowser } = require("./stealthPlaywright");
const { performTest } = require('./tests/test-5.spec.ts');

const app = express();
const port = process.env.PORT || 3000;

app.post("/process", async (req, res) => {
  try {
    // const browser = await chromium.launch();
    const browser = await launchBrowser();
    // const context = await browser.newContext();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: { latitude: 42.271389, longitude: -71.798889 },
      // Latitude and longitude coordinates are: 42.271389, -71.798889.
      javaScriptEnabled: true,
    });

    // await context.grantPermissions(["geolocation"], {
    //   origin: "https://id.land",
    // });

    const page = await context.newPage();
    // await page.goto("https://id.land/users/sign_in");

    await performTest(page);
    // Add your test logic here

    // await page.screenshot({ path: "water.png", fullPage: true });
    await browser.close();
    res.json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
