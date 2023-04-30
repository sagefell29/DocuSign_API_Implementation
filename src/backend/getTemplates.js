const axios = require('axios');

const getTemplates = async (accessToken) => {
  const url = "https://demo.docusign.net/restapi/v2.1/accounts/me/templates";
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data.templates;
  } catch (error) {
    console.error("Error fetching templates:", error.response.data);
    return [];
  }
};

module.exports = { getTemplates };