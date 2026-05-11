const { google } = require('googleapis');

let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_SA_JSON);
} catch (e) {
  console.warn("GOOGLE_SA_JSON is not a valid JSON string or is missing.");
  credentials = {};
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheetsClient = google.sheets({ version: 'v4', auth });

module.exports = sheetsClient;
