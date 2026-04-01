const ApiError = require("../utils/ApiError");

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    const normalizedRoles = roles.map((role) => role.toUpperCase());

    if (!normalizedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource"));
    }

    return next();
  };
}

module.exports = {
  authorize
};
