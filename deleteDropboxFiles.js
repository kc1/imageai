const { Dropbox } = require("dropbox");
const fs = require("fs");
// const { refreshDropboxToken } = require("./refreshTokenDropboxOptionhomes");
// Replace with your access token
// const ACCESS_TOKEN =
//   "sl.u.AFcKTTIeMxpwsDcHuki8edGKStcbyEi8NPhlD8uR1cvyH9NjtGOdpeoyDZpNiJFSjyPBynSynsAZOI3ofJNhh_BGTARB-1fAzpYdIT8FeNXPmvRUXw_WLksb_91ipSluBE0nz2bfqGOoNViFxzjNlKU3vfA8LLy4GHbU4vrNXZMFE9lIiTZMt_QzKF05-rjNhYfNUW9Qm-tCKxv04K9ynKh3Cpj_nkW7GvwGZ2deYbwK_Th6jNE92jG55nw3hryJjUTlGdBfcDzUsTKc0Svm2as6o_aGENfNHm2Gk2ibScZaGBXk2oaYHWcvoJKWnGRIv5khDNx0zQlpjE3_FqdPSDIeeA_PBZBsk-9oM5td6nGZ53wHSPIYGELr02Yk5JUS4fLdtfh0o5SobqhERuQAPeILwhAtRFYsqkrAJP-L5LwOV6X4Se2FTT2MAnoE88WpgrbVrIalcEZ2OB3qRkblF1Ynq3UPM6onYdOuN4dCR_pbLk6w97QFFGyLFY-Pi5nrIwzq4hlOKcHdIblBNSR_Z3Mj9lH8IBsjR3-Hx-6tibFz6I76I5KJ8_jb309kiwFlpCw4n_4lTFBXw-uL22LlL-PZLWB5k1-ca_SrsCmp1kRpjL4g6vNCFPXmp__PvGcGqnlGj1wKswTJO2E5--t-lmPpvttYdi9kdobop30o-5xxAzit-BMzubrpr1ttObHBoKCp6b97EWOqfBzmWpVLBvAryJ9RvNv29IUX_kyv-z7VyCQLFtlIjQpn07LZdq4KtqGz7bDmmWeU2tPwft24vOWMHRF5MzRJ3OjJpA3g69FU3xpoldHV0cl-zYdNZm08FGYNEWxRYM_JZ3QEQa7IY8Dl0tbJfTj3Lt2P5gl2xisEWOarQLu7m6mgvsV268_rOYrf8HH5ocE74s_BUXXFYUJfXwJ8SMHsUhOha8JpI1sio0nwzCYeuE2Pmm5W0_uRbYvdOxuUYHTC9uTXLta8e87XGW1O_TQdQWL_hl9vDugO4yX4IXdJ7kGgw6SRniokKEl07au8q2jYb1OMvCnGqpOtO2uUcDxeXDfK96odubsi4VF5FhnVla0v3qiVNqWlILBX-Zmywu2Ao4u8UwE6QQ4fdeaSTTzjrTM5IfMnaCXCWtZkoXG_72dN6tKLxRVfVBNB1_OVfhO3MVptkLB3cUzSJodOtstZS__dTnczdHFqhtHJPlNnCdwVmoGBudLHklmoUtFu5UHkhQMFlugEv1R-8n1tbRNaXLQQYtaTJxe4zBir_7NKdF77stzuHeEXUo3SMC10__pg8LfM13SM1s8sJixXawTtZYwNm4yWjru9Lg";

const dotenv = require("dotenv");
const { exit } = require("process");

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.dropbox" });

const source = new Dropbox({
  clientId: process.env.SOURCE_DROPBOX_APP_KEY,
  clientSecret: process.env.SOURCE_DROPBOX_APP_SECRET,
  refreshToken: process.env.SOURCE_DROPBOX_REFRESH_TOKEN,
});

const filesToDelete = fs
  .readFileSync("./toDelete.txt", "utf8")
  .split(/\r?\n/)
  .map((row) => row.trim())
  .filter(Boolean)
  .map((row) => {
    try {
      return decodeURIComponent(new URL(row).pathname.split("/").pop());
    } catch {
      return null;
    }
  })
  .filter(Boolean);

console.log("Files to delete:", filesToDelete.length);
console.log("First record:", filesToDelete[0]);

// exit();
// function deleteFiles() {
  (async () => {

    for (let index = 0; index < filesToDelete.length; index += 1000) {
      const batch = filesToDelete.slice(index, index + 1000);
      const response = await source.filesDeleteBatch({
        entries: batch.map((filename) => ({ path: `/${filename}` })),
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

      console.log(`Deleted files batch: ${index + 1}-${index + batch.length}`);
    }
  })();
// }

// deleteFiles();

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