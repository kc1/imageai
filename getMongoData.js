require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGODB_URI;

/**
 * Fetches data from MongoDB using the native driver
 * @param {Object} filterObj - MongoDB filter object
 * @param {string} coll - Collection name
 * @returns {Promise<Object>} MongoDB response with documents array
 */
async function fetchMongoDBData(filterObj, coll) {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const database = client.db("mydata");
    const collection = database.collection(coll);
    
    const documents = await collection
      .find(filterObj)
      .sort({ list_date: -1 })
      .toArray();
    
    return { documents };
  } catch (error) {
    throw new Error(`MongoDB error: ${error.message}`);
  } finally {
    await client.close();
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