const { createCanvas, loadImage } = require("@napi-rs/canvas");
// Calculate meters per pixel at a specific latitude and zoom level
// Web Mercator maps use square image tiles that are 256 pixels wide:

function getMetersPerPixel(latitude, zoom) {
  const earthCircumference = 40075016.68; // in meters
  const latRad = (latitude * Math.PI) / 180;
  return (earthCircumference * Math.cos(latRad)) / (256 * Math.pow(2, zoom));
}

function calculateCenterCoordinates(bbox) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  return { centerLat, centerLng };
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

function getBBoxForZoom(centerLat, centerLng, zoom, widthPx, heightPx) {
  // Earth circumference in meters
  const earthCircumference = 40075016.68;
  const latRad = (centerLat * Math.PI) / 180;

  // Meters per pixel at this zoom level and latitude
  const metersPerPixel =
    (earthCircumference * Math.cos(latRad)) / (256 * Math.pow(2, zoom));

  // Total span in meters across the image width and height
  const halfWidthMeters = (widthPx * metersPerPixel) / 2;
  const halfHeightMeters = (heightPx * metersPerPixel) / 2;

  // Convert meters offset back into degrees (approximate for local bbox)
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(latRad);

  const minLat = centerLat - halfHeightMeters / metersPerDegreeLat;
  const maxLat = centerLat + halfHeightMeters / metersPerDegreeLat;
  const minLng = centerLng - halfWidthMeters / metersPerDegreeLng;
  const maxLng = centerLng + halfWidthMeters / metersPerDegreeLng;

  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

// Generate the bounding box string for Zoom 16:
// const bboxStr = getBBoxForZoom(centerLat, centerLng, targetZoom, width, height);

// const parcelUrl = `https://gis.mississippi.edu/server/rest/services/MS_East_Parcels/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png32&transparent=true&f=image`;

// const fs = require('fs');
// const path = require('path');

// const { createCanvas, loadImage } = require('canvas');

// const { createCanvas, loadImage } = require('canvas');

// Helper to add padding (e.g., 20%) around the property's tight bbox for the view window
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

async function generateCombinedMap(bboxStr, width, height, fullPropertyRecord) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  // 1. Mapbox Basemap & Overlay URLs using your calculated zoom bounding box
  const basemapUrl = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/[${bboxStr}]/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
  const parcelUrl = `https://gis.mississippi.edu/server/rest/services/MS_East_Parcels/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png32&transparent=true&f=image`;
  const wetlandsUrl = `https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png32&transparent=true&f=image`;

  try {
    // 2. Fetch all background layers in parallel
    const [basemapResult, parcelResult, wetlandsResult] =
      await Promise.allSettled([
        loadImage(basemapUrl),
        loadImage(parcelUrl),
        loadImage(wetlandsUrl),
      ]);

    const basemapImg =
      basemapResult.status === "fulfilled" ? basemapResult.value : null;
    const parcelImg =
      parcelResult.status === "fulfilled" ? parcelResult.value : null;
    const wetlandsImg =
      wetlandsResult.status === "fulfilled" ? wetlandsResult.value : null;

    // 3. Draw background layers onto the canvas
    if (basemapImg) {
      ctx.drawImage(basemapImg, 0, 0, width, height);
    }
    if (parcelImg) {
      ctx.drawImage(parcelImg, 0, 0, width, height);
    }
    if (wetlandsImg) {
      ctx.drawImage(wetlandsImg, 0, 0, width, height);
    }

   /*  // 4. Set up D3 projection matching your exact zoom bounding box string
    const [minLng, minLat, maxLng, maxLat] = bboxStr.split(",").map(Number);
    const viewportFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [minLng, minLat],
            [maxLng, minLat],
            [maxLng, maxLat],
            [minLng, maxLat],
            [minLng, minLat],
          ],
        ],
      },
    };
 */
    // 4. Set up D3 projection matched DIRECTLY to the property geometry itself.
    // This forces D3 to center and scale the property right in the middle of the canvas,
    // completely independent of any bbox string discrepancies!
    const projection = d3.geoMercator().fitExtent(
      [
        [50, 50], // Leaves a 50px padding border around the edges of your 1200x800 canvas
        [width - 50, height - 50],
      ],
      fullPropertyRecord.geometry
    );

    const pathGenerator = d3.geoPath().projection(projection).context(ctx);

    // 5. Draw the MultiPolygon property boundary cleanly
    ctx.beginPath();
    pathGenerator(fullPropertyRecord.geometry);

    // Style the property overlay (Red outline & yellow-ish transparent fill)
    ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
    ctx.fill();

    ctx.strokeStyle = "red";
    ctx.lineWidth = 6;
    ctx.stroke();

    return canvas.toBuffer("image/png");
  } catch (err) {
    console.error("Failed to generate property map:", err);
    throw err;
  }
}

module.exports = {
  getMetersPerPixel,
  getMapDistanceWidth,
  getBBoxForZoom,
  generateCombinedMap,
  calculateCenterCoordinates,
};
