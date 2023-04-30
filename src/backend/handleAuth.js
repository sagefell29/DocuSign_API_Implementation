import axios from "axios";

const IntegratorKey = process.env.DOCSIGN_CLIENT_ID;
const ClientSecret = process.env.DOCSIGN_CLIENT_SECRET;
const accountId = process.env.ACCOUNT_ID;
const RedirectURI = "http://localhost:3000/";
const BaseUrl = "https://demo.docusign.net/net/";
const Authurl = "https://account-d.docusign.com/oauth/";
const Scopes = ["signature"];

const state = Math.floor(Math.random() * 16777215);

const authenticateWithDocuSign = () => {
  
  const url =
    `${Authurl}+auth?response_type=code&` +
    `scope=${Scopes.join("+")}&client_id=${IntegratorKey}&` +
    `state=${state}` +
    `redirect_uri=${RedirectURI}`;

  window.location.href = url;
};

const exchangeCodeForToken = async (code, state) => {
  const url = `${Authurl}token`;
  const data = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: RedirectURI,
    state: state,
  };
  const headers = {
    Authorization: `Basic ${IntegratorKey}:${ClientSecret}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  try {
    const response = await axios.post(
      url,
      new URLSearchParams(data).toString(),
      {
        headers: headers,
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(error);
    throw new Error("Error exchanging code for token");
  }
};

const waitForAuthentication = async () => {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (window.location.href.indexOf(RedirectURI) !== -1) {
        clearInterval(intervalId);
        const code = new URLSearchParams(window.location.search).get("code");
        resolve(code);
      }
    }, 1000);
  });
};

const handleAuthClick = async () => {
  // Authenticate with DocuSign to get an access token
  await authenticateWithDocuSign();

  // Wait for user to authenticate and return to the application
  const code = await waitForAuthentication();

  // Exchange the code for an access token
  const accessToken = await exchangeCodeForToken(code);
  return accessToken;

  //   // Create an envelope and send it to the recipient
  //   const envelopeId = await createEnvelope(
  //     accessToken,
  //     "Document.pdf",
  //     "recipient@example.com"
  //   );

  //   console.log("Envelope created with ID:", envelopeId);
};

export default handleAuthClick;
