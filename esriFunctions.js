const { queryFeatures } = require("@esri/arcgis-rest-feature-service");
const { ApiKeyManager } = require("@esri/arcgis-rest-request");
const { fetchMongoDBData } = require("./getMongoData.js");
const fs = require("fs");
const dns = require("dns");
require("dotenv").config();
if (
  typeof process.env.MONGODB_URI === "string" &&
  process.env.MONGODB_URI.startsWith("mongodb+srv://")
) {
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);
}

function createMongoClient(runLabel) {
  const { MongoClient } = require("mongodb");
  const options = {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 5),
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    waitQueueTimeoutMS: 10000,
  };
  console.log(`[MongoDB] Creating client for ${runLabel}`);
  return new MongoClient(process.env.MONGODB_URI, options);
}

function logMongoClientState(client, label) {
  const serverCount = client.topology?.description?.servers?.size ?? 0;
  console.log(`[MongoDB] ${label} | knownServers=${serverCount}`);
}
// No API key needed for public services like USFWS Wetlands
const authentication = ApiKeyManager.fromKey(""); // leave empty

async function getWetlands(
  xmin = -71.75, // longitude
  ymin = 42.25, // latitude
  xmax = -71.65, // longitude
  ymax = 42.35, // latitude
) {
  const url =
    "https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0";

  try {
    const response = await queryFeatures({
      url,
      authentication,
      where: "1=1", // Get everything in the geometry
      geometry: {
        xmin: xmin,
        ymin: ymin,
        xmax: xmax,
        ymax: ymax,
        spatialReference: { wkid: 4326 },
      },
      geometryType: "esriGeometryEnvelope",
      spatialRel: "esriSpatialRelIntersects",
      returnGeometry: true,
      outFields: "*", // All attributes
      f: "geojson", // Important: request GeoJSON
    });

    console.log(`✅ Found ${response.features.length} wetland features`);

    // Save as GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: response.features,
    };

    fs.writeFileSync("wetlands.geojson", JSON.stringify(geojson, null, 2));
    console.log("💾 Saved to wetlands.geojson");

    return geojson;
  } catch (error) {
    console.error("❌ Error querying wetlands:", error);
  }
}

const MONGO_DB_NAME = "mydata";
mongoClient = createMongoClient("buildScreenshotsFromLink");
// const filterObj = { $or: [{ PARNO: PARNO }, { parcel: parcel }] };
const filterObj = {};
(async () => {
  await mongoClient.connect();
  logMongoClientState(mongoClient, "Connected in takeScreenShots");
  const database = mongoClient.db(MONGO_DB_NAME);
  let collection = database.collection("alcornMERGED2subset");

  let response = await fetchMongoDBData(filterObj, collection);
  let properties = response.documents.slice(0, 1);
  if (!properties || !properties.length) {
    console.log("No properties to process");
    return;
  }
/*   geometry
Object

bbox
Array (4)
0
-88.39314830682733
1
34.988264047845014
2
-88.39025947027349
3
34.98891529553087 */
  for (let i = 0; i < properties.length; i++) {
    let property = properties[i];
    const boundingBox = property.geometry.bbox; 
    console.log(boundingBox);
    await getWetlands(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    // await getWetlands();
    console.log(`Processed property ${i + 1} of ${properties.length}`);
  }
})();

module.exports = {
  getWetlands,
};
