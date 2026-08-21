const { createCanvas, loadImage } = require("@napi-rs/canvas");
// Calculate meters per pixel at a specific latitude and zoom level
// Web Mercator maps use square image tiles that are 256 pixels wide:

function getMetersPerPixel(latitude, zoom) {
  const earthCircumference = 40075016.68; // in meters
  const latRad = (latitude * Math.PI) / 180;
  return (earthCircumference * Math.cos(latRad)) / (256 * Math.pow(2, zoom));
}

// Calculate total ground distance across a canvas/image width
function getMapDistanceWidth(latitude, zoom, imageWidthPx) {
  const mPerPx = getMetersPerPixel(latitude, zoom);
  const distanceMeters = mPerPx * imageWidthPx;

  return {
    meters: distanceMeters,
    kilometers: distanceMeters / 1000,
    miles: distanceMeters / 1609.34,
    feet: distanceMeters * 3.28084,
  };
}

// Example usage in Mississippi (34° Lat) at Zoom 16 for an 800px image:
// const distanceInfo = getMapDistanceWidth(34, 16, 800);
// console.log(`Width across map: ${distanceInfo.miles.toFixed(2)} miles (${distanceInfo.meters.toFixed(0)} meters)`);
// Output: Width across map: 0.98 miles (1584 meters)
//
// 1. The Numerator: earthCircumference * Math.cos(latRad)Goal: Calculate the true real-world circumference of the Earth at your specific latitude in meters.earthCircumference: At the Equator, the Earth is roughly $40,075,016.68\text{ meters}$ (~24,901 miles) around.Math.cos(latRad): Web Mercator maps flatten the spherical Earth onto a flat square grid. Because the Earth gets smaller around as you move from the Equator toward the North or South Pole, a line of latitude at $34^\circ\text{ N}$ (like Mississippi) is much shorter than the Equator.At Equator ($0^\circ$): $\cos(0) = 1$ $\rightarrow$ Full circumference ($40,075\text{ km}$).At Mississippi ($34^\circ\text{ N}$): $\cos(34^\circ) \approx 0.829$ $\rightarrow$ Circumference at that ring is smaller ($\approx 33,223\text{ km}$).
// 2. The Denominator: 256 * Math.pow(2, zoom)Goal: Calculate how many total horizontal pixels make up the entire world map at that zoom level.Web Mercator maps use square image tiles that are 256 pixels wide:Math.pow(2, zoom) ($2^{\text{zoom}}$): Calculates how many tiles wide the whole world map is at a given zoom level:Zoom 0: $2^0 = 1$ tile wide ($1 \times 256 = \mathbf{256\text{ total pixels}}$ across the whole world).Zoom 1: $2^1 = 2$ tiles wide ($2 \times 256 = \mathbf{512\text{ total pixels}}$).Zoom 16: $2^{16} = 65,536$ tiles wide ($65,536 \times 256 = \mathbf{16,777,216\text{ total pixels}}$ across the world).


/**
 * Calculates a padded bounding box and GeoJSON bounds feature from a property record.
 * 
 * @param {Object} propertyRecord - GeoJSON Feature or object with geometry.
 * @param {number} [paddingRatio=0.15] - Percentage buffer to add (0.15 = 15%).
 * @returns {Object} Object containing bboxStr, numeric bounds, and mapBoundsGeoJSON feature.
 */
function getPropertyBounds(propertyRecord, paddingRatio = 0.15) {
  if (!propertyRecord) {
    throw new Error("getPropertyBounds: No property record provided.");
  }

  const geometry = propertyRecord.geometry || propertyRecord;

  // 1. Get tight bounding box from geometry array, or fallback to d3.geoBounds
  let minLng, minLat, maxLng, maxLat;
  const existingBbox = geometry.bbox || propertyRecord.bbox;

  if (Array.isArray(existingBbox) && existingBbox.length >= 4) {
    [minLng, minLat, maxLng, maxLat] = existingBbox;
  } else {
    // d3.geoBounds returns [[minLng, minLat], [maxLng, maxLat]]
    const [[d3MinLng, d3MinLat], [d3MaxLng, d3MaxLat]] = d3.geoBounds(geometry);
    minLng = d3MinLng;
    minLat = d3MinLat;
    maxLng = d3MaxLng;
    maxLat = d3MaxLat;
  }

  // 2. Calculate percentage buffer with fallback for point features / zero area
  const lngBuffer = (maxLng - minLng) * paddingRatio || 0.001;
  const latBuffer = (maxLat - minLat) * paddingRatio || 0.001;

  const paddedMinLng = minLng - lngBuffer;
  const paddedMaxLng = maxLng + lngBuffer;
  const paddedMinLat = minLat - latBuffer;
  const paddedMaxLat = maxLat + latBuffer;

  // 3. Format string for Mapbox and ArcGIS REST parameters
  const bboxStr = `${paddedMinLng},${paddedMinLat},${paddedMaxLng},${paddedMaxLat}`;

  // 4. Build MultiPoint GeoJSON target for d3.geoMercator().fitSize()
  const mapBoundsGeoJSON = {
    type: "Feature",
    geometry: {
      type: "MultiPoint",
      coordinates: [
        [paddedMinLng, paddedMinLat],
        [paddedMaxLng, paddedMaxLat],
      ],
    },
  };

  return {
    bboxStr,
    bounds: [paddedMinLng, paddedMinLat, paddedMaxLng, paddedMaxLat],
    mapBoundsGeoJSON,
  };
}

function getPaddedBboxStr(propertyGeojson, paddingFactor = 0.2) {
  const [minLng, minLat, maxLng, maxLat] = propertyGeojson.geometry.bbox;

  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;

  const paddedMinLng = minLng - lngSpan * paddingFactor;
  const paddedMaxLng = maxLng + lngSpan * paddingFactor;
  const paddedMinLat = minLat - latSpan * paddingFactor;
  const paddedMaxLat = maxLat + latSpan * paddingFactor;

  // Return as string for your Mapbox/ArcGIS URL requests
  return `${paddedMinLng},${paddedMinLat},${paddedMaxLng},${paddedMaxLat}`;
}

const d3 = require("d3-geo");


function processToBlueShades(image, width, height) {
  // Create an offscreen canvas for pixel manipulation
  const offCanvas = createCanvas(width, height);
  const offCtx = offCanvas.getContext("2d");

  // Draw the original image onto the offscreen canvas
  offCtx.drawImage(image, 0, 0, width, height);

  // Get raw pixel RGBA data
  const imgData = offCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];

    // Skip transparent background pixels
    if (alpha === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate perceived brightness (luminance)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // Map brightness to shades of blue (retaining transparency/opacity):
    data[i]     = Math.floor(brightness * 0.15);                  // Red (very low)
    data[i + 1] = Math.floor(brightness * 0.45);                  // Green (mid-low)
    data[i + 2] = Math.floor(120 + (brightness * 0.53));          // Blue (dominant)
  }

  // Put transformed pixels back into the offscreen canvas
  offCtx.putImageData(imgData, 0, 0);
  return offCanvas;
}

async function generateCombinedMap(fullPropertyRecord, width = 1200, height = 800) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const { bboxStr, mapBoundsGeoJSON } = getPropertyBounds(fullPropertyRecord, 0.15);
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  // Layer URLs
  const basemapUrl = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/[${bboxStr}]/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
  const parcelUrl = `https://gis.mississippi.edu/server/rest/services/MS_East_Parcels/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=3857&size=${width},${height}&format=png32&transparent=true&f=image`;
  const wetlandsUrl = `https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=3857&size=${width},${height}&format=png32&transparent=true&f=image`;
  const floodUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=3857&size=${width},${height}&format=png32&transparent=true&layers=show:28&f=image`;

  // Fetch images in parallel
  const [basemapResult, parcelResult, wetlandsResult, floodResult] =
    await Promise.allSettled([
      loadImage(basemapUrl),
      loadImage(parcelUrl),
      loadImage(wetlandsUrl),
      loadImage(floodUrl),
    ]);

  // 1. Draw Basemap
  if (basemapResult.status === "fulfilled" && basemapResult.value) {
    ctx.drawImage(basemapResult.value, 0, 0, width, height);
  }

  // 2. Draw Parcels
  if (parcelResult.status === "fulfilled" && parcelResult.value) {
    ctx.drawImage(parcelResult.value, 0, 0, width, height);
  }

  // 3. Draw Wetlands (Recolored to Shades of Blue)
  if (wetlandsResult.status === "fulfilled" && wetlandsResult.value) {
    const blueWetlandsCanvas = processToBlueShades(wetlandsResult.value, width, height);
    ctx.drawImage(blueWetlandsCanvas, 0, 0, width, height);
  }

  // 4. Draw Flood Layer
  if (floodResult.status === "fulfilled" && floodResult.value) {
    // Note: Pass floodResult through recolorToBlueShades(...) here as well if you want flood blue too
    const blueFloodCanvas = recolorToBlueShades(floodResult.value, width, height);
    ctx.drawImage(blueFloodCanvas, 0, 0, width, height);
  }

  // --- D3 Boundary Drawing ---
  const projection = d3
    .geoMercator()
    .fitSize([width, height], mapBoundsGeoJSON);

  const pathGenerator = d3.geoPath().projection(projection).context(ctx);

  // Stroke the property boundary
  ctx.beginPath();
  pathGenerator(fullPropertyRecord.geometry);
  ctx.strokeStyle = "blue"; // Changed to red so it stands out against blue wetlands!
  ctx.lineWidth = 6;
  ctx.stroke();

  return canvas.toBuffer("image/png");
}

module.exports = {
  getMetersPerPixel,
  generateCombinedMap,
};
