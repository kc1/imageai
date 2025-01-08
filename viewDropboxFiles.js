const { Dropbox } = require("dropbox");
const fs = require("fs");
const { refreshDropboxToken } = require("./refreshToken");
// Replace with your access token
// const ACCESS_TOKEN =
//   "sl.u.AFcKTTIeMxpwsDcHuki8edGKStcbyEi8NPhlD8uR1cvyH9NjtGOdpeoyDZpNiJFSjyPBynSynsAZOI3ofJNhh_BGTARB-1fAzpYdIT8FeNXPmvRUXw_WLksb_91ipSluBE0nz2bfqGOoNViFxzjNlKU3vfA8LLy4GHbU4vrNXZMFE9lIiTZMt_QzKF05-rjNhYfNUW9Qm-tCKxv04K9ynKh3Cpj_nkW7GvwGZ2deYbwK_Th6jNE92jG55nw3hryJjUTlGdBfcDzUsTKc0Svm2as6o_aGENfNHm2Gk2ibScZaGBXk2oaYHWcvoJKWnGRIv5khDNx0zQlpjE3_FqdPSDIeeA_PBZBsk-9oM5td6nGZ53wHSPIYGELr02Yk5JUS4fLdtfh0o5SobqhERuQAPeILwhAtRFYsqkrAJP-L5LwOV6X4Se2FTT2MAnoE88WpgrbVrIalcEZ2OB3qRkblF1Ynq3UPM6onYdOuN4dCR_pbLk6w97QFFGyLFY-Pi5nrIwzq4hlOKcHdIblBNSR_Z3Mj9lH8IBsjR3-Hx-6tibFz6I76I5KJ8_jb309kiwFlpCw4n_4lTFBXw-uL22LlL-PZLWB5k1-ca_SrsCmp1kRpjL4g6vNCFPXmp__PvGcGqnlGj1wKswTJO2E5--t-lmPpvttYdi9kdobop30o-5xxAzit-BMzubrpr1ttObHBoKCp6b97EWOqfBzmWpVLBvAryJ9RvNv29IUX_kyv-z7VyCQLFtlIjQpn07LZdq4KtqGz7bDmmWeU2tPwft24vOWMHRF5MzRJ3OjJpA3g69FU3xpoldHV0cl-zYdNZm08FGYNEWxRYM_JZ3QEQa7IY8Dl0tbJfTj3Lt2P5gl2xisEWOarQLu7m6mgvsV268_rOYrf8HH5ocE74s_BUXXFYUJfXwJ8SMHsUhOha8JpI1sio0nwzCYeuE2Pmm5W0_uRbYvdOxuUYHTC9uTXLta8e87XGW1O_TQdQWL_hl9vDugO4yX4IXdJ7kGgw6SRniokKEl07au8q2jYb1OMvCnGqpOtO2uUcDxeXDfK96odubsi4VF5FhnVla0v3qiVNqWlILBX-Zmywu2Ao4u8UwE6QQ4fdeaSTTzjrTM5IfMnaCXCWtZkoXG_72dN6tKLxRVfVBNB1_OVfhO3MVptkLB3cUzSJodOtstZS__dTnczdHFqhtHJPlNnCdwVmoGBudLHklmoUtFu5UHkhQMFlugEv1R-8n1tbRNaXLQQYtaTJxe4zBir_7NKdF77stzuHeEXUo3SMC10__pg8LfM13SM1s8sJixXawTtZYwNm4yWjru9Lg";

(async () => {
  try {
    const data = await refreshDropboxToken();
    const ACCESS_TOKEN = data.access_token;
    const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

    // List files in the root folder
    const folderContent = await dbx.filesListFolder({ path: "" });


    console.log("Files in folder:", folderContent.entries);

    // Download specific file
    const filePath = "/Wisconsin-Ashland-18012340000-01-07-2025-contours.png";
    const response = await dbx.filesDownload({ path: filePath });

    // Save the file locally
    fs.writeFileSync(
      response.result.name,
      response.result.fileBinary,
      "binary"
    );
    console.log(`File downloaded: ${response.result.name}`);
  } catch (error) {
    console.error("Error:", error);
  }
})();
