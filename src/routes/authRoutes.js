const express = require("express");

const {
  changePassword,
  login,
  logout,
  me,
  refreshSession,
  register
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");

const router = express.Router();

router.post("/signup", register);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.get("/me", authenticate, requireActiveSubscription, me);
router.post("/change-password", authenticate, requireActiveSubscription, changePassword);

module.exports = router;
