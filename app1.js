import express from 'express';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const app = express();
const port = process.env.PORT || 3000;

app.post('/run-test', async (req, res) => {
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    
    await context.grantPermissions(['geolocation'], {
      origin: 'https://id.land'
    });

    const page = await context.newPage();
    await page.goto('https://id.land/users/sign_in');
    
    // Add your test logic here
    
    await browser.close();
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});