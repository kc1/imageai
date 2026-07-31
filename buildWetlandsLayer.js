const { ogr2ogr } = require('ogr2ogr');

/**
 * Extract wetlands that intersect a WGS-84 bounding box from an FWS GeoPackage.
 *
 * @param {string} gpkgPath   Path to the .gpkg file
 * @param {[number, number, number, number]} bbox  [xmin, ymin, xmax, ymax] in EPSG:4326
 * @param {string} [layerName='MS_Wetlands']  Layer inside the GeoPackage
 * @returns {Promise<object>}  GeoJSON FeatureCollection
 */
async function extractPropertyWetlands(gpkgPath, bbox, layerName = 'MS_Wetlands') {
  const [xmin, ymin, xmax, ymax] = bbox;

  if (xmax < xmin) {
    throw new Error(`Invalid bbox: xmax (${xmax}) < xmin (${xmin})`);
  }

  const { data, cmd, details } = await ogr2ogr(gpkgPath, {
    format: 'GeoJSON',
    options: [
      '-spat', String(xmin), String(ymin), String(xmax), String(ymax),
      '-spat_srs', 'EPSG:4326',
      // '-t_srs', 'EPSG:4326',   // uncomment if you also want geometries in WGS84
      layerName,
    ],
  });

  // Uncomment for debugging:
  // console.log('Command executed:', cmd);
  // if (details) console.warn(details);

  return data;
}

// Example usage
(async () => {
  try {
    const bbox = [
      -88.63842118902124,  // xmin
       34.083711760935884, // ymin
      -88.63088696172585,  // xmax
       34.08573076787991,  // ymax
    ];

    const geojson = await extractPropertyWetlands(
      './MS_geopackage_wetlands.gpkg',
      bbox
    );

    console.log(`Found ${geojson.features.length} features`);
    // Optional: write to disk
    // const fs = require('fs').promises;
    // await fs.writeFile('property_wetlands.geojson', JSON.stringify(geojson, null, 2));
  } catch (err) {
    console.error(err);
  }
});

module.exports = { extractPropertyWetlands };