async function getSharedLink(dbx, filePath) {
  try {
    const response = await dbx.sharingCreateSharedLinkWithSettings({
      path: filePath,
    });
    let url = response.result.url.replace('dl=0', 'raw=1');
    return url;

  } catch (error) {
    console.error("Error creating shared link for", filePath, error);
    throw error;
  }
}

module.exports = { getSharedLink };