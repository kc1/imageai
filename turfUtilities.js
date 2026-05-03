const buffer = require("@turf/buffer").default; // Note: may need .default depending on version
// OR
// const buffer = require('@turf/buffer');


async function addBuffer(geojsonObj, distance, units) {
  
  var buffered = buffer(geojsonObj, distance, { units });
  const geoJsonObj = buffered.geometry;
  const encoded = encodeURIComponent(JSON.stringify(geoJsonObj));

  return `http://geojson.io/#data=data:application/json,${encoded}`;

 };

module.exports = {
  addBuffer
};

