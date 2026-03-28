const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
// Add JSON middleware
app.use(express.json());

require("dotenv").config();
const { MongoClient } = require("mongodb");
var murl = process.env.MONGODB_URI;
const client = new MongoClient(murl);
client.connect();
const database = client.db("mydata");
const { fetchMongoDBData } = require("./getMongoData");
let firstNum = 0;
let lastNum = 3;
let myArgs = process.argv.slice(2);
console.log(myArgs);

const length = require("@turf/length").default;
const { polygon } = require("@turf/helpers");
async function upsertToBucket(coll, objArr) {
  for (let i = 0; i < objArr.length; i++) {
    const obj = objArr[i];
    // Use listing_id as the unique identifier in the filter.
    const filter = { listing_id: obj.listing_id };
    try {
      const result = await coll.updateOne(
        filter,
        { $set: obj },
        { upsert: true },
      );
      if (result.upsertedCount > 0) {
        console.log(
          `Upsert created a new listing with id: ${result.upsertedId._id}`,
        );
      } else if (result.modifiedCount > 0) {
        console.log(`Updated listing with listing_id: ${obj.listing_id}`);
      } else {
        console.log(`No changes made for listing_id: ${obj.listing_id}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function updateOneToBucket(coll, obj) {
  const originalId = obj._id;
  const filter = originalId
    ? { _id: originalId }
    : obj.myId
    ? { myId: obj.myId }
    : null;

  if (!filter) {
    console.log("Cannot updateOneToBucket: missing _id and myId");
    return;
  }
  console.log("Filter for update:", filter);

  const update = { $set: { calculatedPerimeterFeet: obj.calculatedPerimeterFeet } };
  if (originalId !== undefined) {
    update.$setOnInsert = { _id: originalId };
  }

  try {
    const result = await coll.updateOne(filter, update, { upsert: true });
    if (result.upsertedCount > 0) {
      console.log(`Upsert created a new listing with id: ${result.upsertedId._id}`);
    } else if (result.modifiedCount > 0) {
      console.log(`Updated document with filter: ${JSON.stringify(filter)}`);
      console.log(update.$set);
    } else {
      console.log(`No changes made for filter: ${JSON.stringify(filter)}`);
      console.log(update.$set);
    }
  } catch (error) {
    console.log(error);
  }
}

async function calculatePerimeterLength(polyFeature) {
  return length(polyFeature, { units: "feet" });
}

app.post("/length", async (req, res) => {
  // send in number to process and collection
  try {
    const body = req.body;
    console.log("body:", body);
    // const filterObj = body.filterObj || {};
    const geometryFilter = {
      $or: [
        {
          "geometry.type": "Polygon",
        },
        {
          "geometry.type": "MultiPolygon",
          "geometry.coordinates": {
            $size: 1,
          },
        },
      ],
    };

    const filterObj = {
      $and: [
        geometryFilter,
        { calculatedPerimeterFeet: { $exists: false } },
      ],
    };
    const num = body.num || 2;
    console.log(filterObj);

    let collection = database.collection("alcornGEOtest");
    let response = await fetchMongoDBData(filterObj, "alcornGEOtest");
    let properties = response.documents;
    if (!properties || !properties.length) return "No properties to process";

    properties = properties.slice(0, num || properties.length);
    for (let i = 0; i < properties.length; i++) {
      try {
        let property = properties[i];
        // Convert to a proper Turf Feature (recommended)
        const polyFeature = polygon(property.geometry.coordinates);

        // Calculate perimeter
        const length1 = await calculatePerimeterLength(polyFeature);
        property.calculatedPerimeterFeet = length1;
        console.log(`Polygon 1 perimeter: ${length1.toFixed(2)} ft`);
        await updateOneToBucket(collection, property);
      } catch (err) {
        console.error(`Error processing property with ID ${property.ID}:`, err);
      }
    }

    // await upsertToBucket(collection, myObjArray);
    return res.send("Processing complete");
  } catch (err) {
    console.error("Error in /main route:", err);
    return res
      .status(500)
      .send("An error occurred while processing properties.");
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
