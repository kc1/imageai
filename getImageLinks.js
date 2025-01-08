const { Dropbox } = require("dropbox");
const fs = require("fs");
const { refreshDropboxToken } = require("./refreshToken");

async function getDropboxSharedLinks() {
  try {
    const data = await refreshDropboxToken();
    const ACCESS_TOKEN = data.access_token;
    // const ACCESS_TOKEN = "sl.CEFGkIuyZS1zB2W8J0kY0FPIA8Lk3gmdAjPm1o5X0xbHpVXGpYMi9dfNl8aMPzGHo7UNT_bFIvm2COL0s7G1K_G3lvwmJBmn27TuqWLQY38bhx6tZyTHKWnO4oOz6CXzKo7b01GdtJkWgOA";
    // 
// I think I need to get new refresh token now that I've changed scopes

    const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

    // List files in app folder
    const filesList = await dbx.filesListFolder({
      path: ''
    });
    console.log('Files:', filesList.result.entries);
    // return
    // Create shared links for each file
    const sharedLinks = await Promise.all(
      filesList.result.entries.map(async (file) => {
        try {
          const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
            path: file.path_display,
            settings: {
              requested_visibility: 'public'
            }
          });
          return {
            name: file.name,
            url: shareResponse.result.url.replace('?dl=0', '?raw=1') // Direct download link
          };
        } catch (error) {
          if (error.status === 409) {
            // Link already exists, get existing link
            const existingLinks = await dbx.sharingListSharedLinks({
              path: file.path_display
            });
            return {
              name: file.name,
              url: existingLinks.result.links[0].url.replace('?dl=0', '?raw=1')
            };
          }
          throw error;
        }
      })
    );

    return sharedLinks;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
getDropboxSharedLinks()
  .then(links => console.log('Shared Links:', links))
  .catch(error => console.error('Failed to get links:', error));
