const fetch = require("node-fetch");

async function getAPN() {
  // var selection = SpreadsheetApp.getSelection();
  // var activerow = selection.getCurrentCell().getRow();
  // var sheet = SpreadsheetApp.getActiveSheet();

  // const json = sheet2Json(sheet);
  // const myRow = json[activerow - 2];
  // const myRow = getSelectedRowObject();
  const lat = myRow.lat;
  const lon = myRow.lon;
  // Logger.log(encodedLink);

  // API endpoint and request options
  // var url = `https://realio1-c51a04e6b1da.herokuapp.com/getAPN?lat=33.129297104&lon=-86.479067`;

  // var url = `https://realio.onrender.com/getAPN?lat=${lat}&lon=${lon}`;

  const url =
    "https://comfy-crisp-d74946.netlify.app/.netlify/functions/getAPN";

  const payload = {
    lat: lat,
    lon: lon,
    message: "Hello World",
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  // const responseData = JSON.parse(response.getContentText());
  // Logger.log(responseData);

  // return responseData;

  try {
    // Make the API request
    //   const response = UrlFetchApp.fetch(url, options);
    const response = await fetch(url, options);

    // Parse the JSON response if it is JSON
    var result = JSON.parse(response.getContentText());

    // Log the result
    Logger.log(result.message);

    const APN = result.message.APN;
    const APN2 = result.message.APN2;
    const GEOM = result.message.GEOM;

    var AN = updateCell(sheet, myRow, "APN", APN);
    var AE = updateCell(sheet, myRow, "APN2", APN2);
    var AP = updateCell(sheet, myRow, "GEOM", GEOM);
  } catch (error) {
    // Log any errors
    Logger.log(error);
  }
}

function extractAPN() {

  const myRow = getSelectedRowObject();
  console.log(myRow);
  const myUrl = myRow.AAlink;
  // const myUrl = "https://www.realtor.com/realestateandhomes-detail/55470-State-Highway-171_Seneca_WI_00000_M91305-68892?from=srp"

  var url = "https://realio.onrender.com/detailPageData?val=" + myUrl;

  var options = {
    "method": "GET",
    "headers": {
      "Accept": "application/json"
    }
  };

  var response = UrlFetchApp.fetch(url, options);

  const mydata = JSON.parse(response);
  //  console.log(JSON.stringify(response))


  // console.log(mydata.data.props.pageProps);
  // console.log(mydata.data.props.pageProps.initialReduxState.propertyDetails.description);
  console.log(mydata.data.props.pageProps.initialReduxState.propertyDetails);

  const prompt = "Extract 'Parcel Number' and return the Number only from the following:";

  const resp = makeHuggingfacePostRequest(JSON.stringify(mydata.data.props.pageProps.initialReduxState.propertyDetails), prompt)


  const output = JSON.parse(resp)
  const parcelNumber = output.response;
  const stripped = parcelNumber.replace(/(<([^>]+)>)/ig, '');


  Logger.log("Parcel Number: " + stripped);

  var sheet = SpreadsheetApp.getActiveSheet();

  var ud = updateCell(sheet, myRow, 'APN2', stripped);

}
