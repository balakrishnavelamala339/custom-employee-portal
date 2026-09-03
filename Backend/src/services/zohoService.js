const axios = require('axios');

let cachedToken = null;
let tokenExpiresAt = 0; // epoch ms

async function getZohoAccessToken() {
  const now = Date.now();

  // Reuse cached token if still valid (60s safety buffer)
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
      null,
      {
        params: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      }
    );

    cachedToken = response.data.access_token;
    // Zoho tokens typically last 3600s
    tokenExpiresAt = now + (response.data.expires_in || 3600) * 1000;

    return cachedToken;
  } catch (error) {
    console.error('Failed to retrieve Zoho Access Token:', error.response?.data || error.message);
    throw new Error('Zoho authentication failed');
  }
}

module.exports = { getZohoAccessToken };
