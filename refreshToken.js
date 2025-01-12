const fetch = require("node-fetch");

async function refreshDropboxToken() {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token:
      "rz3n5_bhZvgAAAAAAAAAAZMK3Wfc-CV2rxof3x3lMl9zdSFscuUi_Km0XeZEssQb",

    client_id: "4wlwoffttm98qno",
    client_secret: "6xe8cx18dgq5oa5",
  });
    // refresh_token:
    //   "UOMpkiFcvhYAAAAAAAAAAUewQset5jLmSXhR_WhteKBN7CBO8Yvb4F7_TCCe9Nyr",

  try {
    const response = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();
    console.log("New access token:", data.access_token);
    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

refreshDropboxToken();

module.exports = {
  refreshDropboxToken,
};
