const admin = require("firebase-admin");

const env = require("../config/env");

let firebaseApp = null;

function isConfigured() {
  return Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey);
}

function getFirebaseAdmin() {
  if (!isConfigured()) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey
      })
    });
  }

  return firebaseApp;
}

async function verifyFirebaseIdToken(idToken) {
  const app = getFirebaseAdmin();
  return app.auth().verifyIdToken(idToken);
}

module.exports = {
  verifyFirebaseIdToken
};
