const ApiError = require("../utils/ApiError");

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    const normalizedRoles = roles.map((role) => {
      const normalized = String(role).toUpperCase();
      return normalized === "WORKER" ? "STAFF" : normalized;
    });

    if (!normalizedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource"));
    }

    return next();
  };
}

module.exports = {
  authorize
};
