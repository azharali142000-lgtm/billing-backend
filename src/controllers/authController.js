const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../lib/prisma");
const { verifyFirebaseIdToken } = require("../lib/firebaseAdmin");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateRefreshTokenValue,
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  signAccessToken
} = require("../utils/auth");
const { serializeUser } = require("../utils/serializers");

function normalizeRole(role) {
  if (!role) {
    return null;
  }

  const normalized = String(role).trim().toUpperCase();
  return ["ADMIN", "WORKER"].includes(normalized) ? normalized : null;
}

async function issueSession(user, deviceName = null) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshTokenValue();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      deviceName: deviceName ? String(deviceName).trim() : null,
      expiresAt: getRefreshTokenExpiryDate()
    }
  });

  return {
    accessToken,
    refreshToken
  };
}

function buildAuthResponse(user, session) {
  return {
    user: serializeUser(user),
    token: session.accessToken,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: env.jwtExpiresIn
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (!name || (!phone && !email) || !password) {
    throw new ApiError(400, "name, phone or email, and password are required");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "password must be at least 6 characters long");
  }

  const desiredRole = normalizeRole(role || "WORKER");
  if (!desiredRole) {
    throw new ApiError(400, "role must be either admin or worker");
  }

  const userCount = await prisma.user.count();

  if (userCount > 0) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Only admins can create additional users");
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (_error) {
      throw new ApiError(401, "Invalid or expired token");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: Number(payload.sub) }
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new ApiError(403, "Only admins can create additional users");
    }
  } else if (desiredRole !== "ADMIN") {
    throw new ApiError(400, "The first registered user must have admin role");
  }

  if (phone) {
    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: String(phone).trim() }
    });
    if (existingPhoneUser) {
      throw new ApiError(409, "A user with this phone already exists");
    }
  }

  if (email) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() }
    });
    if (existingEmailUser) {
      throw new ApiError(409, "A user with this email already exists");
    }
  }

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim().toLowerCase() : null,
      passwordHash: await bcrypt.hash(password, env.bcryptSaltRounds),
      role: desiredRole
    }
  });

  const session = await issueSession(user, req.body.deviceName);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: buildAuthResponse(user, session)
  });
});

const login = asyncHandler(async (req, res) => {
  const { identifier, phone, email, password, deviceName } = req.body;
  const normalizedIdentifier = String(identifier || phone || email || "").trim();

  if (!normalizedIdentifier || !password) {
    throw new ApiError(400, "phone/email and password are required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: normalizedIdentifier },
        { email: normalizedIdentifier.toLowerCase() }
      ]
    }
  });

  if (!user) {
    throw new ApiError(401, "Invalid login ID or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This user account is disabled");
  }

  if (!user.passwordHash) {
    throw new ApiError(401, "This account uses OTP login. Use Firebase phone verification.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid login ID or password");
  }

  const session = await issueSession(user, deviceName);

  res.json({
    success: true,
    message: "Login successful",
    data: buildAuthResponse(user, session)
  });
});

const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, name, deviceName } = req.body;

  if (!idToken) {
    throw new ApiError(400, "idToken is required");
  }

  let decodedToken;
  try {
    decodedToken = await verifyFirebaseIdToken(idToken);
  } catch (_error) {
    throw new ApiError(401, "Invalid Firebase ID token");
  }

  const phone = decodedToken.phone_number ? String(decodedToken.phone_number).trim() : null;
  if (!phone) {
    throw new ApiError(400, "Firebase token must include a verified phone number");
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid: decodedToken.uid },
        { phone }
      ]
    }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: String(name || decodedToken.name || phone).trim(),
        phone,
        firebaseUid: decodedToken.uid,
        role: "WORKER"
      }
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: decodedToken.uid,
        phone,
        name: user.name || String(name || decodedToken.name || phone).trim()
      }
    });
  }

  if (!user.isActive) {
    throw new ApiError(403, "This user account is disabled");
  }

  const session = await issueSession(user, deviceName || "Firebase OTP");

  res.json({
    success: true,
    message: "Firebase login successful",
    data: buildAuthResponse(user, session)
  });
});

const refreshSession = asyncHandler(async (req, res) => {
  const { refreshToken, deviceName } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "refreshToken is required");
  }

  const existing = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashRefreshToken(refreshToken)
    },
    include: {
      user: true
    }
  });

  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  if (!existing.user.isActive) {
    throw new ApiError(403, "This user account is disabled");
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: {
      revokedAt: new Date()
    }
  });

  const session = await issueSession(existing.user, deviceName || existing.deviceName);

  res.json({
    success: true,
    message: "Session refreshed successfully",
    data: buildAuthResponse(existing.user, session)
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashRefreshToken(refreshToken),
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  res.json({
    success: true,
    data: serializeUser(user)
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new ApiError(400, "currentPassword, newPassword, and confirmNewPassword are required");
  }

  if (String(newPassword).length < 6) {
    throw new ApiError(400, "new password must be at least 6 characters long");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "new password and confirm password must match");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (!user.passwordHash) {
    throw new ApiError(400, "This account uses OTP login and does not support password change");
  }
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, env.bcryptSaltRounds)
    }
  });

  res.json({
    success: true,
    message: "Password changed successfully"
  });
});

const listWorkers = asyncHandler(async (_req, res) => {
  const workers = await prisma.user.findMany({
    where: { role: "WORKER" },
    orderBy: { createdAt: "desc" }
  });

  res.json({
    success: true,
    data: workers.map(serializeUser)
  });
});

const createWorker = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || (!phone && !email) || !password) {
    throw new ApiError(400, "name, phone or email, and password are required");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "password must be at least 6 characters long");
  }

  if (phone) {
    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: String(phone).trim() }
    });
    if (existingPhoneUser) {
      throw new ApiError(409, "A user with this phone already exists");
    }
  }

  if (email) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() }
    });
    if (existingEmailUser) {
      throw new ApiError(409, "A user with this email already exists");
    }
  }

  const worker = await prisma.user.create({
    data: {
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim().toLowerCase() : null,
      passwordHash: await bcrypt.hash(password, env.bcryptSaltRounds),
      role: "WORKER"
    }
  });

  res.status(201).json({
    success: true,
    message: "Worker created successfully",
    data: serializeUser(worker)
  });
});

const resetWorkerPassword = asyncHandler(async (req, res) => {
  const workerId = Number(req.params.id);
  const { newPassword } = req.body;

  if (!Number.isInteger(workerId) || !newPassword) {
    throw new ApiError(400, "Valid worker id and newPassword are required");
  }

  if (String(newPassword).length < 6) {
    throw new ApiError(400, "new password must be at least 6 characters long");
  }

  const worker = await prisma.user.findUnique({
    where: { id: workerId }
  });

  if (!worker || worker.role !== "WORKER") {
    throw new ApiError(404, "Worker not found");
  }

  await prisma.user.update({
    where: { id: workerId },
    data: {
      passwordHash: await bcrypt.hash(newPassword, env.bcryptSaltRounds)
    }
  });

  res.json({
    success: true,
    message: "Worker password reset successfully"
  });
});

const disableWorker = asyncHandler(async (req, res) => {
  const workerId = Number(req.params.id);

  if (!Number.isInteger(workerId)) {
    throw new ApiError(400, "Valid worker id is required");
  }

  const worker = await prisma.user.findUnique({
    where: { id: workerId }
  });

  if (!worker || worker.role !== "WORKER") {
    throw new ApiError(404, "Worker not found");
  }

  const updatedWorker = await prisma.user.update({
    where: { id: workerId },
    data: {
      isActive: false
    }
  });

  res.json({
    success: true,
    message: "Worker disabled successfully",
    data: serializeUser(updatedWorker)
  });
});

module.exports = {
  changePassword,
  createWorker,
  disableWorker,
  firebaseLogin,
  login,
  listWorkers,
  logout,
  me,
  refreshSession,
  resetWorkerPassword,
  register
};
