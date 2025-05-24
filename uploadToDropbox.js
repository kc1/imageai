const dropboxV2Api = require("dropbox-v2-api");
const fs = require("fs");

async function uploadToDropbox(filename, filePath, dropboxToken) {
  const dropbox = dropboxV2Api.authenticate({
    token: dropboxToken,
  });
  console.log("Uploading to Dropbox:", filename, filePath);

  return new Promise((resolve, reject) => {
    dropbox(
      {
        resource: "files/upload",
        parameters: {
          path: `/${filename}`, // Correct path format for app folder
        },
        readStream: fs.createReadStream(filePath),
      },
      (err, result) => {
        if (err) {
          console.error("Upload failed:", err);
          return reject(err);
        }
        console.log("Upload successful:", result);
        resolve(result);
      }
    );
  });
}

module.exports = {
  uploadToDropbox,
};
