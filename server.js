const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = __dirname;
const rootDist = path.join(projectRoot, "dist");
const mobileDist = path.join(projectRoot, "mobile-app", "dist");
const mobilePackageJson = path.join(projectRoot, "mobile-app", "package.json");

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
    return;
  }

  if (fs.existsSync(mobileIndex)) {
    copyDir(mobileDist, rootDist);
    return;
  }

  if (!fs.existsSync(mobilePackageJson)) {
    return;
  }

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const installResult = spawnSync(npmCmd, ["--prefix", "mobile-app", "install"], {
    cwd: projectRoot,
    stdio: "inherit"
  });

  if (installResult.status !== 0) {
    return;
  }

  const buildResult = spawnSync(npmCmd, ["--prefix", "mobile-app", "run", "build"], {
    cwd: projectRoot,
    stdio: "inherit"
  });

  if (buildResult.status !== 0 || !fs.existsSync(mobileIndex)) {
    return;
  }

  copyDir(mobileDist, rootDist);
}

ensureFrontendDist();
require("./src/server");
