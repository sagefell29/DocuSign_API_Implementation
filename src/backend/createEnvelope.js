const axios = require('axios');
const BaseUrl = "https://demo.docusign.net/net";
const accountId = process.env.ACCOUNT_ID;

const createEnvelope = async (props) => {
    const url = `${BaseUrl}/v2.1/accounts/${accountId}/envelopes`;
    const headers = {
      Authorization: `Bearer ${props.accessToken}`,
      "Content-Type": "application/json",
    };
  
    const document = {
      name: props.documentName,
      documentBase64: "base64-encoded-document-here",
      fileExtension: "pdf",
    };
  
    const recipient = {
      email: props.recipientEmail,
      name: props.recipientName,
      roleName: "Signer",
      clientUserId: "1000",
    };
  
    const envelopeDefinition = {
      emailSubject: "Please sign this document",
      documents: [document],
      recipients: {
        signers: [recipient],
      },
      status: "sent",
    };
  
    const response = await axios.post(url, envelopeDefinition, {
      headers: headers,
    });
  
    return response.data.envelopeId;
  };

export default createEnvelope();
  