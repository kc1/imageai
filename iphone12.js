// const { webkit, devices } = require("playwright");
const { webkit, devices } = require("patchright");
const iPhone = devices["iPhone 10"];

const { performTest, login } = require("./tests/test-5.spec.ts");

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    ...iPhone,
    permissions: ["geolocation"],
    geolocation: {
      latitude: 45.680386849221,
      longitude: -90.361372973983,
    },
    javaScriptEnabled: true,
  });
  const page = await context.newPage();
  await page.goto("http://example.com");
  await page.screenshot({ path: "screenshot.png" });
  // other actions...
  await browser.close();
})();
