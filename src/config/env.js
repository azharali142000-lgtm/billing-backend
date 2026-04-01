require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  appBaseUrl: process.env.APP_BASE_URL || "https://app.billr.example",
  frontendUrl: process.env.FRONTEND_URL || "https://app.billr.example",
  apiBaseUrl: process.env.API_BASE_URL || "https://api.billr.example",
  corsOrigins: String(
    process.env.CORS_ORIGINS ||
      "http://localhost:4000,http://localhost:3000,https://app.billr.example"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshTokenExpiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n")
};
