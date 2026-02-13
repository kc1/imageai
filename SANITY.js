const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Add JSON middleware
app.use(express.json());



const dropboxV2Api = require("dropbox-v2-api");
const { Dropbox } = require("dropbox");
require("dotenv").config();
const { MongoClient } = require("mongodb");
var murl = process.env.MONGODB_URI;
const client = new MongoClient(murl);
client.connect();
const database = client.db("mydata");
let collection = database.collection("bucket1");
let firstNum = 0;
let myArgs = process.argv.slice(2);
console.log(myArgs);
let lastNum = myArgs.pop();
console.log("Last number:", lastNum);

// (async () => {
app.post("/main", async (req, res) => {

  try {
    console.log("request recieved");
    return res.send("Hello World");
  } catch (error) {
    console.log("Error:", error);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

