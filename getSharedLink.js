async function getSharedLink(dbx, filePath) {
  try {
    const response = await dbx.sharingCreateSharedLinkWithSettings({
      path: filePath,
    });
    return response.result.url;
  } catch (error) {
    console.error("Error creating shared link for", filePath, error);
    throw error;
  }
}

module.exports = { getSharedLink };