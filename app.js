const express = require("express");
// const sharp = require("sharp");

const { launchBrowser } = require("./stealthPlaywright");
const { performTest } = require('./tests/test-5.spec.ts');

const app = express();
const port = process.env.PORT || 3000;

// Add JSON middleware
app.use(express.json());

app.post("/process", async (req, res) => {
  try {
    const { property } = req.body;
    
    if (!property || !property.state || !property.county || !property.apn) {
      return res.status(400).json({ error: 'Missing property details' });
    }
    console.log('Property:', property);

    const browser = await launchBrowser();
    const context = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: {
        latitude: 45.680386849221 ,
        longitude: -90.361372973983,
      },
      javaScriptEnabled: true,
    });

    const page = await context.newPage();

    await performTest(page, property);

    await browser.close();
    res.json({ 
      success: true, 
      data: {
        property,
        message: 'Processing complete'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
