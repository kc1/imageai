const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // ← your URI

async function mergeCollections(sourceCollection) {
  // Define the aggregation pipeline

  const pipeline = [
    {
      $lookup: {
        from: "alcornTAX",
        localField: "PARNO",
        foreignField: "parcelNumber",
        as: "taxData",
      },
    },
    {
      $unwind: {
        path: "$taxData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              $unsetField: {
                field: "_id", // ← the field name to remove
                input: "$taxData", // ← the object from which to remove it
              },
            },
          ],
        },
      },
    },
    {
      $unset: "taxData", // optional but recommended cleanup
    },
    {
      $out: "alcornMERGED",
    },
  ];

  // Run the aggregation – it returns a promise that resolves when complete
  await sourceCollection.aggregate(pipeline).toArray(); // or just .next() or nothing if you don't need cursor results
}

(async function main() {
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("mydata");
  // set up source collection reference
  const sourceCollection = db.collection("alcornGEO");

  try {
    console.log("Connected. Starting merge , this will take a moment...");

    // Quick diagnostic: count source docs
    // const count = await db.collection("alcornGEO").countDocuments({});
    const count = await sourceCollection.countDocuments({});
    console.log(`Source collection has ${count} documents`);

    if (count === 0) {
      console.log(
        "No documents to process → no output collection will be created.",
      );
      return;
    }

    await mergeCollections(sourceCollection);

    // Optional: verify output count
    const outCount = await db.collection("alcornMERGED").countDocuments({});
    console.log(`Output collection now has ${outCount} documents`);
  } catch (err) {
    console.error("Error during aggregation:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
})();
