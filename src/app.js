const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const distCandidates = [
  path.join(__dirname, "..", "dist"),
  path.join(__dirname, "..", "mobile-app", "dist")
];
const rootDist = distCandidates[0];
const mobileDist = distCandidates[1];
const mobilePackageJson = path.join(__dirname, "..", "mobile-app", "package.json");

function copyDir(source, target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(source, target, { recursive: true });
}

function ensureFrontendDist() {
  const rootIndex = path.join(rootDist, "index.html");
  const mobileIndex = path.join(mobileDist, "index.html");

  if (fs.existsSync(rootIndex)) {
    return rootDist;
  }

  if (fs.existsSync(mobileIndex)) {
    copyDir(mobileDist, rootDist);
    return rootDist;
  }

  if (!fs.existsSync(mobilePackageJson)) {
    return rootDist;
  }

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const installResult = spawnSync(npmCmd, ["--prefix", "mobile-app", "install"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit"
  });

  if (installResult.status !== 0) {
    return rootDist;
  }

  const buildResult = spawnSync(npmCmd, ["--prefix", "mobile-app", "run", "build"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit"
  });

  if (buildResult.status !== 0 || !fs.existsSync(mobileIndex)) {
    return rootDist;
  }

  copyDir(mobileDist, rootDist);
  return rootDist;
}

const distPath = ensureFrontendDist();
const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);

app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
