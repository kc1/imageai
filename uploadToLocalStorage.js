const fs = require("fs");

const location = process.env.location || "local";
const storageFolder = "/home/kc/storage/";

async function uploadToLocalStorage(filePath) {
  if (location === "production") {
      
  } else {
  }
}


module.exports = {
  uploadToLocalStorage,
};
