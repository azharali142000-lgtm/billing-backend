const ApiError = require("../utils/ApiError");

function requireActiveSubscription(req, _res, next) {
  if (!req.company) {
    return next(new ApiError(401, "Company context is required"));
  }

  const subscriptionStatus = String(req.company.subscriptionStatus || "").toUpperCase();
  const expiryDate = req.company.expiryDate ? new Date(req.company.expiryDate) : null;

  if (!["ACTIVE", "TRIAL"].includes(subscriptionStatus)) {
    return next(new ApiError(402, "Company subscription is not active"));
  }

  if (!expiryDate || Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
    return next(new ApiError(402, "Company subscription has expired"));
  }

  return next();
}

module.exports = {
  requireActiveSubscription
};
