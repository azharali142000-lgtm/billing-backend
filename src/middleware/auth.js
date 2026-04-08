const jwt = require("jsonwebtoken");

const prisma = require("../lib/prisma");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token is required");
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    include: {
      company: true
    }
  });

  if (!user) {
    throw new ApiError(401, "User for this token no longer exists");
  }

  req.user = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    companyId: user.companyId,
    isActive: user.isActive,
    role: user.role
  };
  req.company = user.company;

  if (!user.isActive) {
    throw new ApiError(403, "This user account is disabled");
  }

  next();
});

module.exports = {
  authenticate
};
