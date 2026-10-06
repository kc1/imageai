const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, '.env.google');
const apikeys = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Define the scope for Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const DRIVE_FOLDER_ID = '';

// Function to authorize and get access to Google Drive API
async function authorize() {
    const auth = new google.auth.JWT({
        email: apikeys.client_email,
        key: apikeys.private_key,
        scopes: SCOPES,
    });

    try {
        await auth.authorize();
        return auth;
    } catch (error) {
        throw new Error(`Error authorizing Google Drive API: ${error.message}`);
    }
}

// Function to list available files in Google Drive
async function listFiles(auth, folderId) {
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
        q: folderId
            ? `'${folderId}' in parents and trashed = false`
            : 'trashed = false',
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    const files = response.data.files;
    if (files.length) {
        console.log('Available files:');
        files.forEach(file => {
            console.log(`${file.name} (${file.id})`);
        });
    } else {
        console.log('No files found.');
    }
}

async function uploadFile(localPath, folderId = DRIVE_FOLDER_ID) {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    const requestBody = { name: path.basename(localPath) };
    if (folderId) requestBody.parents = [folderId];

    const uploaded = await drive.files.create({
        requestBody,
        media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(localPath),
        },
        fields: 'id, name',
        supportsAllDrives: true,
    });

    await drive.permissions.create({
        fileId: uploaded.data.id,
        requestBody: { type: 'anyone', role: 'reader' },
        supportsAllDrives: true,
    });

    const { data: file } = await drive.files.get({
        fileId: uploaded.data.id,
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true,
    });

    const result = {
        ...file,
        hotlink: file.webContentLink ||
            `https://drive.google.com/uc?export=download&id=${file.id}`,
    };

    console.log(`Uploaded ${result.name}: ${result.hotlink}`);
    return result;
}

/* if (require.main === module) {
    const [, , localPath, folderId] = process.argv;

    if (!localPath) {
        console.error('Usage: node uploadToDrive.js <local-file> [folder-id]');
        process.exitCode = 1;
    } else {
        uploadFile(localPath, folderId).catch(error => {
            console.error(`Upload failed: ${error.message}`);
            process.exitCode = 1;
        });
    }
}



 */

/* authorize()
    .then(auth => listfiles(auth, drive_folder_id))
    .catch(error => {
        console.error(`error: ${error.message}`);
        process.exitcode = 1;
    }); */


module.exports = {
    uploadFile,
    listFiles,
};