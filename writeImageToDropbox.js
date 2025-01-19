const dropboxV2Api = require("dropbox-v2-api");
const fs = require("fs");
// const path = require("path");
const { refreshDropboxToken } = require("./refreshToken");
// console refreshDropboxToken
// const dropboxToken = "sl.CDstoLOwfEsHmwOx3pUe3DuxajGLKTiVlDK8snrIS5bogNHeJ5KTZTVMIqss3iITXUfTWFW28MVnSW8j3Ww9IZPmWj6-TqfNpgOkBIsbmjGE9l7311Vyv7VQIBU7Ou5cqxyWIIjcAJw4";

async function getYahooShot() {

  const data = await refreshDropboxToken();
  const dropboxToken = data.access_token;
  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: false,
  });
  // return browser;`
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("https://example.com");
  const buffer = await page.screenshot();
  console.log(buffer.toString("base64"));
  await writeToDropbox(buffer, "yahoo2.png", dropboxToken);
  await page.close();
  await browser.close();

};

async function writeToDropbox(buffer, filename, dropboxToken) {
  const dropbox = dropboxV2Api.authenticate({
    token: dropboxToken,
  });

  // Create readable stream from buffer
  const readStream = require("stream").Readable.from(buffer);

  dropbox(
    {
      resource: "files/upload",
      parameters: {
        path: `/${filename}`, // Correct path format for app folder
      },
      // readStream: fs.createReadStream(filePath),
      readStream: readStream,
    },
    (err, result) => {
      if (err) {
        console.error("Upload failed:", err);
        return;
      }
      console.log("Upload successful:", result);
    }
  );

  // const dropboxUploadStream = dropbox(
  //   {
  //     resource: "files/upload",
  //     parameters: {
  //       path: "/dropbox/path/to/file.js",
  //     },
  //   },
  //   (err, result, response) => {
  //     //upload completed
  //   }
  // );

  // fs.createReadStream('path/to/file.js').pipe(dropboxUploadStream);
}

module.exports = {
  writeToDropbox,
};
