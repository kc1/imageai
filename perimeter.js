const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
// Add JSON middleware
app.use(express.json());

const turf = require("@turf/turf");
require("dotenv").config();
const { MongoClient } = require("mongodb");
var murl = process.env.MONGODB_URI;
const client = new MongoClient(murl);
client.connect();
const database = client.db("mydata");
// let collection = database.collection("alcornGEO");
// let ignorethiszz;
const { fetchMongoDBData } = require("./getMongoData");
let firstNum = 0;
let lastNum = 3;
let myArgs = process.argv.slice(2);
console.log(myArgs);

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

async function upsertOneToBucket(coll, obj) {
  // Remove _id if present so that it doesn't try to update it
  if (obj.hasOwnProperty("_id")) {
    delete obj._id;
  }
  // Use ID as the unique identifier in the filter.
  const filter = { ID: obj.ID };
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
      console.log(obj);
    } else {
      console.log(`No changes made for listing_id: ${obj.listing_id}`);
      console.log(obj);
    }
  } catch (error) {
    console.log(error);
  }
}

async function calculatePerimeterLength(poly1) {
  return turf.length(poly1, { units: "feet" });
}

app.post("/length", async (req, res) => {
  // send in number to process and collection
  try {
    const body = req.body;
    console.log("body:", body);
    // const filterObj = body.filterObj || {};
    const filterObj = {
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
    const num = body.num || 2;
    console.log(filterObj);

    let collection = database.collection("alcornGEO");
    let response = await fetchMongoDBData(filterObj, "alcornGEOtest");
    let properties = response.documents;
    if (!properties || !properties.length) return "No properties to process";

    properties = properties.slice(0, num || properties.length);
    for (let i = 0; i < properties.length; i++) {
      try {
        let property = properties[i];
        const length1 = await calculatePerimeterLength(property.geometry);
        console.log(`Polygon 1 perimeter: ${length1.toFixed(2)} ft`);
        await upsertOneToBucket(collection, { ...property, calculatedPerimeter: length1 });
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
