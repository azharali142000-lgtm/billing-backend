const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      phone: user.phone
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getRefreshTokenExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresInDays);
  return expiresAt;
}

module.exports = {
  generateRefreshTokenValue,
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  signAccessToken
};
