const { ImgurClient } = require("imgur");
const { createReadStream } = require("fs");
const { readFile } = require("fs/promises");
const axios = require("axios");

const ImgurAnonymousUploader = require("imgur-anonymous-uploader");
// Initialize the client with your Imgur Client ID
const client = new ImgurClient({ clientId: "kcsmith1" });
const uploader = new ImgurAnonymousUploader("kcsmith1");

async function basicUploadPngToImgur(filePath) {
  try {
    const response = await uploader.upload(filePath);
    console.log(response.url);
    return response.url;
  } catch (error) {
    console.error("Upload failed:", error.message);
  }
}

async function uploadImageToImgBB(filePath) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Set IMGBB_API_KEY in the environment before uploading.");
  }

  try {
    const image = await readFile(filePath);
    const form = new URLSearchParams({ image: image.toString("base64") });
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      form,
      {
        params: { key: apiKey },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
    const imageUrl = response.data?.data?.url;
    if (!imageUrl) {
      throw new Error(response.data?.error?.message || "No image URL in response.");
    }

    console.log("ImgBB URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    throw new Error(`ImgBB upload failed: ${message}`);
  }
}

async function uploadPngToImgur(filePath) {
  try {
    const response = await client.upload({
      image: createReadStream(filePath),
      type: "stream",
    });

    if (!response.success || !response.data?.link) {
      const headers = response.headers || {};
      const reset = Number(headers["x-ratelimit-userreset"]);
      const rateLimitDetails = [
        headers["retry-after"] &&
          `retry after ${headers["retry-after"]} seconds`,
        headers["x-ratelimit-userremaining"] &&
          `user requests remaining: ${headers["x-ratelimit-userremaining"]}`,
        Number.isFinite(reset) &&
          reset > 0 &&
          `user limit resets at ${new Date(reset * 1000).toISOString()}`,
      ].filter(Boolean);
      const apiMessage =
        response.data?.error?.message || response.data?.message;
      const details = [apiMessage, ...rateLimitDetails]
        .filter(Boolean)
        .join("; ");

      throw new Error(
        `Imgur upload failed with status ${response.status}${details ? `: ${details}` : ""}`,
      );
    }

    // Returns the direct URL of the uploaded image
    console.log("Image URL:", response.data.link);
    return response.data.link;
  } catch (error) {
    console.error("Upload failed:", error.message);
  }
}

// Call the function with the path to your PNG file
// uploadPngToImgur('./path/to/image.png');
// 9b227b307574d33011ca056734cf302d

module.exports = {
  uploadPngToImgur,
  basicUploadPngToImgur,
  uploadImageToImgBB,
};
