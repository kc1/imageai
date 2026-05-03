require("dotenv").config();
const { MongoClient } = require("mongodb");
var murl = process.env.MONGODB_URI;
const MONGO_MAX_POOL_SIZE = Number(process.env.MONGO_MAX_POOL_SIZE || 5);

function createMongoClient() {
  return new MongoClient(murl, {
    maxPoolSize: MONGO_MAX_POOL_SIZE,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    waitQueueTimeoutMS: 10000,
  });
}
// let ignorethiszz;
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
        { upsert: true }
      );
      if (result.upsertedCount > 0) {
        console.log(
          `Upsert created a new listing with id: ${result.upsertedId._id}`
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
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      console.log(
        `Upsert created a new listing with id: ${result.upsertedId._id}`
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

exports.handler = async function (event, context) {
  const myObjArray = JSON.parse(event.body);
  console.log(myObjArray);
  const client = createMongoClient();
  await client.connect();
  const database = client.db("mydata");
  const collection = database.collection("bucket1");

  try {
    await upsertToBucket(collection, myObjArray);
  } finally {
    await client.close();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: myObjArray,
    }),
  };
};

exports.upsertOneToBucket = upsertOneToBucket;
