const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DocusignStrategy = require("passport-docusign-oauth2").Strategy;

// Function to configure the Express app
function configureApp() {
  const app = express();

  app.use(
    session({
      secret: "mysecret",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());

  return app;
}

// Function to configure the DocuSign OAuth 2.0 strategy for Passport
function configurePassport() {
  passport.use(
    new DocusignStrategy(
      {
        clientID: process.env.DOCSIGN_CLIENT_ID,
        clientSecret: process.env.DOCSIGN_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/docusign/callback",
        scope: "signature",
      },
      (accessToken, refreshToken, profile, done) => {
        // Store the tokens in the session for later use
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
}

// Function to define routes
// Define routes for OAuth authentication and DocuSign API calls
function defineRoutes(app) {
  app.get("/auth/docusign", authenticateDocuSign);
  app.get("/auth/docusign/callback", authenticateDocuSignCallback);
  app.get("/api/docusign/template/", getTemplateDetails);
  app.post("/api/docusign/send-envelope", sendEnvelope);
}

// Function to initiate DocuSign authentication
function authenticateDocuSign(req, res, next) {
  passport.authenticate("docusign")(req, res, next);
}

// Function to handle DocuSign authentication callback
function authenticateDocuSignCallback(req, res, next) {
  passport.authenticate("docusign", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })(req, res, next);
}

// Function to get template details from DocuSign
async function getTemplateDetails(req, res) {
  const accessToken = req.session.accessToken;

  const options = {
    hostname: "demo.docusign.net",
    path: "/restapi/v2.1/templates",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const request = https.get(options, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });
    response.on("end", () => {
      const templates = JSON.parse(data).envelopeTemplates;
      res.render("templates", { templates });
    });
  });

  request.on("error", (error) => {
    console.error(error);
    res.status(500).send("Error retrieving templates");
  });
}

// Function to send envelope using DocuSign
async function sendEnvelope(req, res) {
  const accessToken = req.session.accessToken;
  const { templateId, emailSubject, emailBlurb, recipients } = req.body;

  const options = {
    hostname: "demo.docusign.net",
    path: "/restapi/v2.1/accounts/me/envelopes",
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const payload = {
    templateId,
    emailSubject,
    emailBlurb,
    templateRoles: recipients,
  };

  const envelope = await makeRequest(options, payload);
  res.send(envelope);
}

// Function to make an HTTP request to DocuSign API
function makeRequest(options, payload = null) {
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve(JSON.parse(data));
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (payload) {
      request.write(JSON.stringify(payload));
    }

    request.end();
  });
}

// Export a function that combines all the setup steps
module.exports = function setup() {
  const app = configureApp();
  configurePassport();
  defineRoutes(app);

  return app;
};
