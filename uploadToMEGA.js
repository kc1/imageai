const { Storage } = require('megajs')

// Node doesn't support top-level await when using CJS
async function megaLogin() {
  console.log('Logging into MEGA...');
  try {
    const storage = await new Storage({
      email: 'realoption11@gmail.com',
      password: 'MegaMega1$'
    }).ready;
    console.log('Successfully logged into MEGA.');
    return storage;
  } catch (error) {
    console.error('Error logging into MEGA:', error);
    process.exit(1);
  }
}



  /* const file = await storage.upload('./toMove.txt', 'Hello world!').complete
  console.log('The file was uploaded!', file) */
/* }()).catch(error => {
  console.error(error)
  process.exit(1)
})
 */


          /*           const buffer = await page.screenshot({
            type: "png",
            fullPage: true,
          });

          console.log(Buffer.isBuffer(buffer)); // true

          const megaStorageClient = await megaStorage();
          const roadUpload = await megaStorageClient.upload(
            { name: roadFile, size: buffer.length },
            buffer,
          ).complete;
          const sharedRoadLink = await roadUpload.link();
          console.log("The file was uploaded to MEGA!", roadUpload.name);
 */



module.exports = {
    megaLogin
}
    