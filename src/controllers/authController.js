const bcrypt = require("bcrypt");

const prisma = require("../lib/prisma");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateRefreshTokenValue,
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  signAccessToken
} = require("../utils/auth");
const { serializeCompany, serializeUser } = require("../utils/serializers");

function normalizeRole(role) {
  const normalized = String(role || "STAFF").trim().toUpperCase();
  if (normalized === "WORKER") {
    return "STAFF";
  }
  return ["ADMIN", "STAFF"].includes(normalized) ? normalized : null;
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

function buildAuthResponse(user, company, session) {
  return {
    user: serializeUser(user),
    company: serializeCompany(company),
    token: session.accessToken,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: env.jwtExpiresIn
  };
}

function trialExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);
  return expiresAt;
}

async function ensureEmailAvailable(email, companyId = null) {
  const existingUser = await prisma.user.findFirst({
    where: companyId
      ? { companyId, email }
      : { email }
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }
}

async function ensureAdminLimit(companyId, desiredRole) {
  if (desiredRole !== "ADMIN") {
    return;
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  const adminCount = await prisma.user.count({
    where: {
      companyId,
      role: "ADMIN",
      isActive: true
    }
  });

  if (adminCount >= company.maxAdmins) {
    throw new ApiError(400, `This company can have only ${company.maxAdmins} admins`);
  }
}

const register = asyncHandler(async (req, res) => {
  const { companyName, name, email, password, phone, deviceName } = req.body;

  if (!companyName || !name || !email || !password) {
    throw new ApiError(400, "companyName, name, email, and password are required");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "password must be at least 6 characters long");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  await ensureEmailAvailable(normalizedEmail);

  const { company, user } = await prisma.$transaction(async (tx) => {
    const createdCompany = await tx.company.create({
      data: {
        name: String(companyName).trim(),
        subscriptionStatus: "TRIAL",
        expiryDate: trialExpiryDate()
      }
    });

    await tx.gstSettings.create({
      data: {
        companyId: createdCompany.id
      }
    });

    await tx.companyProfile.create({
      data: {
        companyId: createdCompany.id,
        companyName: String(companyName).trim()
      }
    });

    const createdUser = await tx.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        passwordHash: await bcrypt.hash(password, env.bcryptSaltRounds),
        companyId: createdCompany.id,
        role: "ADMIN"
      }
    });

    return {
      company: createdCompany,
      user: createdUser
    };
  });

  const session = await issueSession(user, deviceName);

  res.status(201).json({
    success: true,
    message: "Company and admin account created successfully",
    data: buildAuthResponse(user, company, session)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, identifier, password, deviceName } = req.body;
  const normalizedEmail = String(email || identifier || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail
    },
    include: {
      company: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found. Create a company account first.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This user account is disabled");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const session = await issueSession(user, deviceName);

  res.json({
    success: true,
    message: "Login successful",
    data: buildAuthResponse(user, user.company, session)
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
      user: {
        include: {
          company: true
        }
      }
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
    data: buildAuthResponse(existing.user, existing.user.company, session)
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
    where: { id: req.user.id },
    include: {
      company: true
    }
  });

  res.json({
    success: true,
    data: {
      user: serializeUser(user),
      company: serializeCompany(user.company)
    }
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

const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
      companyId: req.user.companyId
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({
    success: true,
    data: users.map(serializeUser)
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email, and password are required");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "password must be at least 6 characters long");
  }

  const desiredRole = normalizeRole(role || "STAFF");
  if (!desiredRole) {
    throw new ApiError(400, "role must be admin or staff");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  await ensureEmailAvailable(normalizedEmail, req.user.companyId);
  await ensureAdminLimit(req.user.companyId, desiredRole);

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : null,
      passwordHash: await bcrypt.hash(password, env.bcryptSaltRounds),
      companyId: req.user.companyId,
      role: desiredRole
    }
  });

  res.status(201).json({
    success: true,
    message: `${desiredRole === "ADMIN" ? "Admin" : "Staff"} created successfully`,
    data: serializeUser(user)
  });
});

module.exports = {
  changePassword,
  createUser,
  listUsers,
  login,
  logout,
  me,
  refreshSession,
  register
};
