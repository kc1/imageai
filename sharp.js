require('dotenv').config();
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');

function getMapboxStaticUrl(bbox, width, height) {
  if (!Array.isArray(bbox) || bbox.length !== 4) {
    throw new Error('bbox must be an array of four numbers: [minLon, minLat, maxLon, maxLat].');
  }

  const [minLon, minLat, maxLon, maxLat] = bbox.map((value) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error('bbox values must all be numbers.');
    }
    return num;
  });

  const stylePath = 'mapbox/outdoors-v11';
  const bboxStr = `[${minLon},${minLat},${maxLon},${maxLat}]`;

  if (!process.env.MAPBOX_TOKEN) {
    throw new Error('MAPBOX_TOKEN is required in the environment to request Mapbox basemaps.');
  }

  return `https://api.mapbox.com/styles/v1/${stylePath}/static/${bboxStr}/${width}x${height}?access_token=${encodeURIComponent(process.env.MAPBOX_TOKEN)}&attribution=false&logo=false`;
}

async function createPropertyMap(bbox, width = 1200, height = 800) {
  const bboxStr = bbox.join(',');

  // 1. Basemap (Mapbox outdoors-v11)
  const basemapUrl = getMapboxStaticUrl(bbox, width, height);

  // 2. Wetlands Layer (USFWS)
  const wetlandsUrl = `https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png32&transparent=true&f=image`;

  // 3. County Parcel Boundary Layer (Replace with your local county's ArcGIS Parcel export URL)
  // Note: Example endpoint below points to Florida Statewide / County GIS service
//   const parcelUrl = `https://dem.spatiallyenabled.com/arcgis/rest/services/Florida/FL_Parcels/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png32&transparent=true&f=image`;
const parcelUrl = `https://gis.mississippi.edu/server/rest/services/MS_East_Parcels/MapServer/export?bbox=${bboxStr}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=png32&transparent=true&f=image`;

  try {
    console.log('Downloading map layers...');
    const baseRes = await axios.get(basemapUrl, { responseType: 'arraybuffer', validateStatus: () => true });
    const wetRes = await axios.get(wetlandsUrl, { responseType: 'arraybuffer', validateStatus: () => true });
    const parcelRes = await axios.get(parcelUrl, { responseType: 'arraybuffer', validateStatus: () => true }).catch(() => null);

    if (baseRes.status !== 200) {
      throw new Error(`Mapbox basemap request failed with status ${baseRes.status}`);
    }
    if (wetRes.status !== 200) {
      throw new Error(`Wetlands request failed with status ${wetRes.status}`);
    }

    const layersToComposite = [
      { input: Buffer.from(wetRes.data), blend: 'over' }
    ];

    if (parcelRes && parcelRes.status === 200) {
      layersToComposite.push({ input: Buffer.from(parcelRes.data), blend: 'over' });
    } else if (parcelRes) {
      console.warn(`Parcel layer returned status ${parcelRes.status}; skipping parcel overlay.`);
    }

    console.log('Combining Mapbox basemap + wetlands + parcel layers...');
    const finalImage = await sharp(baseRes.data)
      .composite(layersToComposite)
      .png()
      .toBuffer();

    fs.writeFileSync('property_parcels_wetlands.png', finalImage);
    console.log('Successfully created property_parcels_wetlands.png');
  } catch (err) {
    console.error('Error rendering property map:', err.message);
  }
}

// Bounding box: [minLng, minLat, maxLng, maxLat]
// const propertyBBox = [-81.385, 28.535, -81.370, 28.545];
// createPropertyMap(propertyBBox);

module.exports = {
  getMapboxStaticUrl,
  createPropertyMap,
};