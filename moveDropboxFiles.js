const dotenv = require("dotenv");
const { Dropbox } = require("dropbox");
const fs = require("fs/promises");
const pLimit = require("p-limit");

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.dropbox" });

const destination = new Dropbox({
  clientId: process.env.DEST_DROPBOX_APP_KEY,
  clientSecret: process.env.DEST_DROPBOX_APP_SECRET,
  refreshToken: process.env.DEST_DROPBOX_REFRESH_TOKEN,
});

const destinationFolder = "/Screenshot2";
// Higher concurrency is possible because we aren't transferring raw bytes
const limit = pLimit(15);

function getFileName(fileUrl) {
  return decodeURIComponent(new URL(fileUrl).pathname.split("/").pop());
}

async function transferDirect(fileUrl, attempt = 1) {
  const fileName = getFileName(fileUrl);
  // Convert standard shared link to a direct download URL
  const directUrl = fileUrl.replace(/\?dl=0$/, "") + "?dl=1";

  try {
    // Tells Dropbox backend to download directly from the URL
    const response = await destination.filesSaveUrl({
      path: `${destinationFolder}/${fileName}`,
      url: directUrl,
    });

    console.log(`Queued transfer for: ${fileName}`);
    return response.result;
  } catch (error) {
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
      return transferDirect(fileUrl, attempt + 1);
    }
    console.error(`Failed: ${fileUrl}`, error.error ?? error);
    return null;
  }
}

async function main() {
  const fileUrls = (await fs.readFile("./toMove.txt", "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  await destination.filesCreateFolderV2({ path: destinationFolder }).catch((err) => {
    if (!err.error?.error_summary?.startsWith("path/conflict")) throw err;
  });

  await Promise.all(fileUrls.map((url) => limit(() => transferDirect(url))));
  console.log("All transfer jobs submitted to Dropbox!");
}

main().catch(console.error);