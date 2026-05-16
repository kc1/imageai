const buffer = require("@turf/buffer").default; // Note: may need .default depending on version
// OR
// const buffer = require('@turf/buffer');


async function buildGEOJSONIOurl(geojsonObj) {
  console.log("Building GEOJSON.IO URL for GeoJSON object:", JSON.stringify(geojsonObj));

  try {
    const jsonString = JSON.stringify(geojsonObj);
    const encoded = encodeURIComponent(jsonString);
    const url = `http://127.0.0.1:8080/#data=data:application/json,${encoded}`;
    // const url = `https://geojson.io/#data=data:application/json,${encoded}`;
    
    console.log("Generated URL:", url);
    return url;
  } catch (err) {
    console.error("Error building geojson.io URL:", err);
    throw err;
  }
}


async function addBuffer(geojsonObj, distance, units) {
  
  var buffered = buffer(geojsonObj, distance, { units });
  const geoJsonObj = buffered.geometry;
  // const encoded = encodeURIComponent(JSON.stringify(geoJsonObj));

  // return `http://geojson.io/#data=data:application/json,${encoded}`;
  return geoJsonObj;
 };

module.exports = {
  addBuffer,
  buildGEOJSONIOurl
};

