const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // ← your URI

async function flattenAndOutput(db) {
  const collection = db.collection("alcornms");

  const pipeline = [
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$$ROOT", "$properties"]
        }
      }
    },
    {
      $unset: "properties"
    },
    {
      $out: "alcornms_flattened"   // ← new collection name (avoid generic name)
    }
  ];

  // Run the aggregation – it returns a promise that resolves when complete
  await collection.aggregate(pipeline).toArray(); // or just .next() or nothing if you don't need cursor results

  console.log("Flattening complete. Check collection: alcornms_flattened");
}



(async function main() {
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("mydata");

  try {
    console.log("Connected. Starting flattening...");

    // Quick diagnostic: count source docs
    const count = await db.collection("alcornms").countDocuments({});
    console.log(`Source collection has ${count} documents`);

    if (count === 0) {
      console.log("No documents to process → no output collection will be created.");
      return;
    }

    await flattenAndOutput(db);

    // Optional: verify output count
    const outCount = await db.collection("alcornms_flattened").countDocuments({});
    console.log(`Output collection now has ${outCount} documents`);
  } catch (err) {
    console.error("Error during aggregation:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
})();