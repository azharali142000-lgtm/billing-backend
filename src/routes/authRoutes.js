const express = require("express");

const {
  changePassword,
  createWorker,
  disableWorker,
  firebaseLogin,
  login,
  listWorkers,
  logout,
  me,
  refreshSession,
  register,
  resetWorkerPassword
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/firebase-login", firebaseLogin);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/change-password", authenticate, changePassword);
router.get("/workers", authenticate, authorize("admin"), listWorkers);
router.post("/workers", authenticate, authorize("admin"), createWorker);
router.post("/workers/:id/reset-password", authenticate, authorize("admin"), resetWorkerPassword);
router.patch("/workers/:id/disable", authenticate, authorize("admin"), disableWorker);

module.exports = router;
