const { Dropbox } = require("dropbox");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.dropbox" });

const source = new Dropbox({
  clientId: process.env.SOURCE_DROPBOX_APP_KEY,
  clientSecret: process.env.SOURCE_DROPBOX_APP_SECRET,
  refreshToken: process.env.SOURCE_DROPBOX_REFRESH_TOKEN,
});

// Set to "" if your app key has App Folder access (screen is the root)
// Set to "/Apps/screen" if your app key has Full Dropbox access
const BASE_PATH = ""; 

// Extract filenames from toDelete.txt
const targetFilenames = new Set(
  fs
    .readFileSync("./toDelete.txt", "utf8")
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      try {
        return decodeURIComponent(new URL(row).pathname.split("/").pop());
      } catch {
        return row;
      }
    })
    .filter(Boolean)
);

console.log(`Target filenames in toDelete.txt: ${targetFilenames.size}`);

(async () => {
  console.log("Fetching list of existing files from Dropbox...");

  // Map of filename -> exact Dropbox path_lower
  const existingFiles = new Map();

  let response = await source.filesListFolder({
    path: BASE_PATH,
    recursive: true,
  });

  let entries = response.result.entries;

  while (true) {
    for (const entry of entries) {
      if (entry[".tag"] === "file") {
        existingFiles.set(entry.name, entry.path_lower);
      }
    }

    if (!response.result.has_more) break;

    response = await source.filesListFolderContinue({
      cursor: response.result.cursor,
    });
    entries = response.result.entries;
  }

  console.log(`Found ${existingFiles.size} total existing files in Dropbox.`);

  // Filter to only files that actually exist right now
  const pathsToDelete = [];
  for (const filename of targetFilenames) {
    if (existingFiles.has(filename)) {
      pathsToDelete.push(existingFiles.get(filename));
    }
  }

  console.log(`Existing files matching toDelete.txt: ${pathsToDelete.length}`);
  console.log(`Already deleted / Missing: ${targetFilenames.size - pathsToDelete.length}`);

  if (pathsToDelete.length === 0) {
    console.log("No files left to delete!");
    return;
  }

  // Delete remaining existing files in batches of 1000
  const BATCH_SIZE = 1000;
  for (let i = 0; i < pathsToDelete.length; i += BATCH_SIZE) {
    const batch = pathsToDelete.slice(i, i + BATCH_SIZE);

    const response = await source.filesDeleteBatch({
      entries: batch.map((path) => ({ path })),
    });

    let result = response.result;
    while (result[".tag"] === "async_job_id") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      result = (
        await source.filesDeleteBatchCheck({
          async_job_id: result.async_job_id,
        })
      ).result;
    }

    console.log(`Deleted batch ${i + 1} to ${i + batch.length}`);
  }

  console.log("Finished deleting existing files.");
})();
// const testFile ="https://www.dropbox.com/scl/fi/v0dmhphdkm7nt13pcrcga/3770-36-000-001.00-1787906544-building.png?rlkey=4gw1slvu2jbmko137b3n492pb&raw=1";

/* const fileName = decodeURIComponent(
  new URL(testFile).pathname.split("/").pop(),
);
// const destinationFolder = "/Screenshot2";
// const destinationPath = `${destinationFolder}/${fileName}`;

async function deleteFile(destinationPath) {
  const sharedFile = await source.sharingGetSharedLinkFile({
    url: testFile,
  });

  const fileBinary = sharedFile.result.fileBinary;
  const contents = Buffer.isBuffer(fileBinary)
    ? fileBinary
    : Buffer.from(await fileBinary.arrayBuffer());

  try {
    await destination.filesCreateFolderV2({ path: destinationFolder });
  } catch (error) {
    const summary = error.error?.error_summary ?? "";
    if (!summary.startsWith("path/conflict")) {
      throw error;
    }
  }

  const uploaded = await destination.filesUpload({
    path: destinationPath,
    contents,
    mode: { ".tag": "overwrite" },
  });

  console.log("Uploaded:", uploaded.result.path_display);
  return uploaded.result;
}
 */
/* 
deleteFiles()
  .then((metadata) => {
    console.log(`Deleted: ${metadata.path_display}`);
  })
  .catch((error) => {
    console.error("Copy failed:", error.error ?? error);
  });
 */