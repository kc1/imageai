require("dotenv").config();
const { MongoClient } = require("mongodb");
var murl = process.env.MONGODB_URI;
const client = new MongoClient(murl);
client.connect();
const database = client.db("mydata");
let collection = database.collection("bucket1");
let firstNum = 0;
let lastNum = 3;
let myArgs = process.argv.slice(2);
console.log(myArgs);

const { launchBrowser } = require("./patchright");
// const { launchBrowser } = require("./stealthPlaywright");
const { performTest, login } = require("./tests/test-5.spec.ts");
const { performTestAPN, performTestLatLon } = require("./tests/test-1.spec.ts");
const { refreshDropboxToken } = require("./refreshToken");
const { fetchMongoDBData } = require("./getMongoData");
const { getDaysAgoString } = require("./getMongoData");
const { upsertOneToBucket } = require("./updateBucket");
// const { login } = require("./tests/test-5.spec.ts");
// const { log } = require("console");

(async () => {
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
          dropboxToken
        );
      }
           property.ContourURL = uploadData.resultContourFile.path_lower;
      property.WaterURL = uploadData.resultWaterFile.path_lower;
      // console.log("Property:", property);
      await upsertOneToBucket(collection, property);
    }

    await browser.close();
  } catch (error) {
    console.log("Error:", error);
  }
})();