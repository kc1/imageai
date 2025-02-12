const fetch = require("node-fetch");

async function fetchMongoDBData(filterObj, coll) {
  //  1GxuC9AAuc77xJklnS1PSHVKhZUt3QkcOaqdSYRqoeQVrSnf8jtGtLO3zGlNfm4T -- this is the api auth token and cannot be retrieved

  // NOTE - to get the connection string for remote mongo goto realio .env

  // also wisconsinFS.js is in the prefetchcomps project

  var url =
    "https://us-east-1.aws.data.mongodb-api.com/app/data-wygci/endpoint/data/v1/action/find";
  var apiKey =
    "1GxuC9AAuc77xJklnS1PSHVKhZUt3QkcOaqdSYRqoeQVrSnf8jtGtLO3zGlNfm4T";
  var authToken =
    "1GxuC9AAuc77xJklnS1PSHVKhZUt3QkcOaqdSYRqoeQVrSnf8jtGtLO3zGlNfm4T";
  var headers = {
    "Content-Type": "application/json",
    "Access-Control-Request-Headers": "*",
    "api-key": apiKey,
    Authorization: authToken,
  };

  // "collection": "rss1",

  var payload = {
    collection: coll,
    database: "mydata",
    dataSource: "Cluster0",
    filter: filterObj,
    projection: {},
    sort: {
      list_date: -1,
    },
  };

  var options = {
    method: "post",
    headers: headers,
    body: JSON.stringify(payload),
    muteHttpExceptions: false,
  };

  return getMongoData(url, options);
}

async function getMongoData(url, options) {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      const result = await response.text();
      console.log(result);
      const myObjs = JSON.parse(result);
      return myObjs;
    } else {
      console.error(`HTTP error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
// list_date: {
//   $gte: "2022-01-01T00:00:00.000Z",
// },
// limit: 5
function getDaysAgoString(daysBack) {
  const now = new Date();
  const twoDaysAgo = new Date(now.setDate(now.getDate() - daysBack));
  return twoDaysAgo.toISOString();
}

// (async () => {
//   const fiveDaysAgo = getDaysAgoString(5);
//   console.log(fiveDaysAgo);
//   const filterObj = {
//     ContourURL: { $exists: false },
//     WaterURL: { $exists: false },
//     list_date: {
//       $gte:fiveDaysAgo,
//     },
//   };
//   const coll = "wisconsinOnSale";
//   const data = await fetchMongoDBData(filterObj, coll);
//   console.log(data);
// })();

exports.fetchMongoDBData = fetchMongoDBData;
exports.getDaysAgoString = getDaysAgoString;
