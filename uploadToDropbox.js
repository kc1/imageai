const dropboxV2Api = require('dropbox-v2-api');
const fs = require('fs');
const path = require('path');
const dropboxToken = "sl.CDstoLOwfEsHmwOx3pUe3DuxajGLKTiVlDK8snrIS5bogNHeJ5KTZTVMIqss3iITXUfTWFW28MVnSW8j3Ww9IZPmWj6-TqfNpgOkBIsbmjGE9l7311Vyv7VQIBU7Ou5cqxyWIIjcAJw4";

(async function uploadToDropbox() {
  const filePath = "./water.png";
  const timestamp = Date.now();
  const filename = `${timestamp}_${path.basename(filePath)}`;
  
  const dropbox = dropboxV2Api.authenticate({
    token: dropboxToken
  });

  dropbox({
    resource: 'files/upload',
    parameters: {
      path: `/${filename}` // Correct path format for app folder
    },
    readStream: fs.createReadStream(filePath)
  }, (err, result) => {
    if (err) {
      console.error('Upload failed:', err);
      return;
    }
    console.log('Upload successful:', result);
  });
})();