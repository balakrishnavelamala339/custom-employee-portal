const axios = require('axios');
const { getZohoAccessToken } = require('./zohoService');

// Maps a role-permission "appKey" to its Zoho API base path
const APP_ENDPOINTS = {
  zoho_people: '/people/api',
  zoho_crm: '/crm/v5',
  zoho_desk: '/desk/api/v1',
  zoho_books: '/books/v3',
};

async function proxyZohoRequest(appKey, path, method = 'GET', data = null, params = {}) {
  const basePath = APP_ENDPOINTS[appKey];
  if (!basePath) throw new Error(`Unknown Zoho app: ${appKey}`);

  const accessToken = await getZohoAccessToken();

  const response = await axios({
    url: `${process.env.ZOHO_API_DOMAIN}${basePath}${path}`,
    method,
    data,
    params,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  return response.data;
}

module.exports = { proxyZohoRequest, APP_ENDPOINTS };
