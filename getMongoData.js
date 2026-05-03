require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_MAX_POOL_SIZE = Number(process.env.MONGO_MAX_POOL_SIZE || 5);

/**
 * Fetches data from MongoDB using the native driver
 * @param {Object} filterObj - MongoDB filter object
 * @param {string|Object} coll - Collection name or Mongo collection object
 * @returns {Promise<Object>} MongoDB response with documents array
 */
async function fetchMongoDBData(filterObj, coll) {
  const isCollectionObject =
    coll && typeof coll === "object" && typeof coll.find === "function";
  const isCollectionName = typeof coll === "string" && coll.trim();
  let client = null;
  let collection = null;
  
  try {
    if (isCollectionObject) {
      collection = coll;
    } else if (isCollectionName) {
      client = new MongoClient(MONGO_URI, {
        maxPoolSize: MONGO_MAX_POOL_SIZE,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10000,
        waitQueueTimeoutMS: 10000,
      });
      await client.connect();
      collection = client.db("mydata").collection(coll);
    } else {
      throw new Error(
        "collection must be a non-empty string or a Mongo collection object",
      );
    }

    const documents = await collection
      .find(filterObj)
      // .sort({ list_date: -1 })
      .toArray();
    
    return { documents };
  } catch (error) {
    throw new Error(`MongoDB error: ${error.message}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Generates ISO string for a date N days ago
 * @param {number} daysBack - Number of days to go back
 * @returns {string} ISO string of the calculated date
 */
function getDaysAgoString(daysBack) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  return pastDate.toISOString();
}

// Example usage:
// const fiveDaysAgo = getDaysAgoString(5);
// const filterObj = {
//   ContourURL: { $exists: false },
//   WaterURL: { $exists: false },
//   list_date: { $gte: fiveDaysAgo }
// };
// const data = await fetchMongoDBData(filterObj, "wisconsinOnSale");

module.exports = {
  fetchMongoDBData,
  getDaysAgoString
};