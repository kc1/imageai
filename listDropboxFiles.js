const { Dropbox } = require("dropbox");
const fs = require("fs");
const { refreshDropboxToken } = require("./refreshTokenDropboxOptionhomes");
// Replace with your access token
// const ACCESS_TOKEN =
//   "sl.u.AFcKTTIeMxpwsDcHuki8edGKStcbyEi8NPhlD8uR1cvyH9NjtGOdpeoyDZpNiJFSjyPBynSynsAZOI3ofJNhh_BGTARB-1fAzpYdIT8FeNXPmvRUXw_WLksb_91ipSluBE0nz2bfqGOoNViFxzjNlKU3vfA8LLy4GHbU4vrNXZMFE9lIiTZMt_QzKF05-rjNhYfNUW9Qm-tCKxv04K9ynKh3Cpj_nkW7GvwGZ2deYbwK_Th6jNE92jG55nw3hryJjUTlGdBfcDzUsTKc0Svm2as6o_aGENfNHm2Gk2ibScZaGBXk2oaYHWcvoJKWnGRIv5khDNx0zQlpjE3_FqdPSDIeeA_PBZBsk-9oM5td6nGZ53wHSPIYGELr02Yk5JUS4fLdtfh0o5SobqhERuQAPeILwhAtRFYsqkrAJP-L5LwOV6X4Se2FTT2MAnoE88WpgrbVrIalcEZ2OB3qRkblF1Ynq3UPM6onYdOuN4dCR_pbLk6w97QFFGyLFY-Pi5nrIwzq4hlOKcHdIblBNSR_Z3Mj9lH8IBsjR3-Hx-6tibFz6I76I5KJ8_jb309kiwFlpCw4n_4lTFBXw-uL22LlL-PZLWB5k1-ca_SrsCmp1kRpjL4g6vNCFPXmp__PvGcGqnlGj1wKswTJO2E5--t-lmPpvttYdi9kdobop30o-5xxAzit-BMzubrpr1ttObHBoKCp6b97EWOqfBzmWpVLBvAryJ9RvNv29IUX_kyv-z7VyCQLFtlIjQpn07LZdq4KtqGz7bDmmWeU2tPwft24vOWMHRF5MzRJ3OjJpA3g69FU3xpoldHV0cl-zYdNZm08FGYNEWxRYM_JZ3QEQa7IY8Dl0tbJfTj3Lt2P5gl2xisEWOarQLu7m6mgvsV268_rOYrf8HH5ocE74s_BUXXFYUJfXwJ8SMHsUhOha8JpI1sio0nwzCYeuE2Pmm5W0_uRbYvdOxuUYHTC9uTXLta8e87XGW1O_TQdQWL_hl9vDugO4yX4IXdJ7kGgw6SRniokKEl07au8q2jYb1OMvCnGqpOtO2uUcDxeXDfK96odubsi4VF5FhnVla0v3qiVNqWlILBX-Zmywu2Ao4u8UwE6QQ4fdeaSTTzjrTM5IfMnaCXCWtZkoXG_72dN6tKLxRVfVBNB1_OVfhO3MVptkLB3cUzSJodOtstZS__dTnczdHFqhtHJPlNnCdwVmoGBudLHklmoUtFu5UHkhQMFlugEv1R-8n1tbRNaXLQQYtaTJxe4zBir_7NKdF77stzuHeEXUo3SMC10__pg8LfM13SM1s8sJixXawTtZYwNm4yWjru9Lg";

const alcornFiles = fs
  .readFileSync("./alcornFiles.txt", "utf8")
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

console.log("Alcorn files to delete:", alcornFiles.length);
console.log("Alcorn first record:", alcornFiles[0]);

const deleteByTimestamp = async (requestedTS) => {
  try {
    const data = await refreshDropboxToken();
    const ACCESS_TOKEN = data.access_token;
    const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

    // List all files in the root folder, following Dropbox pagination.
    let folderContent = await dbx.filesListFolder({ path: "", limit: 500 });
    const entries = [...folderContent.result.entries];

    while (folderContent.result.has_more) {
      folderContent = await dbx.filesListFolderContinue({
        cursor: folderContent.result.cursor,
      });
      entries.push(...folderContent.result.entries);
    }

    const images = entries.filter(
      (entry) =>
        entry[".tag"] === "file" && /\.(png|jpe?g|webp|gif)$/i.test(entry.name),
    );

    console.log("Images found:", images.length);
    console.log(
      "Image paths:",
      images.map((entry) => entry.path_display),
    );
    let filteredImages = [];
    for (const image of images) {
      // https://www.dropbox.com/scl/fi/fxqfw6rflt2rd7mhl4906/0170-35-000-003.01-1785687138-water.png?rlkey=csrcfw6f3ad4fhss8uc2h82dy&raw=1
      const ts = image.path_display.match(/-(\d{10})-/);
      if (ts && ts[1] <= requestedTS) filteredImages.push(image);
    }
    console.log(
      "Filtered images:",
      filteredImages.map((entry) => entry.path_display),
    );

    for (let index = 0; index < filteredImages.length; index += 1000) {
      const batch = filteredImages.slice(index, index + 1000);
      const response = await dbx.filesDeleteBatch({
        entries: batch.map((image) => ({ path: image.path_lower })),
      });

      let result = response.result;
      while (result[".tag"] === "async_job_id") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        result = (
          await dbx.filesDeleteBatchCheck({
            async_job_id: result.async_job_id,
          })
        ).result;
      }

      console.log(`Deleted batch: ${index + 1}-${index + batch.length}`);
    }
  } catch (error) {
    console.error(
      "Error:",
      error?.error?.error_summary || error.message || error,
    );
  }
};

function deleteAlcornFiles() {
  (async () => {
    const data = await refreshDropboxToken();
    const ACCESS_TOKEN = data.access_token;
    const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

    for (let index = 0; index < alcornFiles.length; index += 1000) {
      const batch = alcornFiles.slice(index, index + 1000);
      const response = await dbx.filesDeleteBatch({
        entries: batch.map((filename) => ({ path: `/${filename}` })),
      });

      let result = response.result;
      while (result[".tag"] === "async_job_id") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        result = (
          await dbx.filesDeleteBatchCheck({
            async_job_id: result.async_job_id,
          })
        ).result;
      }

      console.log(`Deleted Alcorn batch: ${index + 1}-${index + batch.length}`);
    }
  })();
}

// Uncomment the following line to delete Alcorn files
// deleteAlcornFiles();
// Uncomment the following line to delete files by timestamp
deleteByTimestamp();
