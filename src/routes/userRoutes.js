const express = require("express");

const { createUser, listUsers } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { requireActiveSubscription } = require("../middleware/subscription");

const router = express.Router();

router.get("/", authenticate, requireActiveSubscription, authorize("admin"), listUsers);
router.post("/", authenticate, requireActiveSubscription, authorize("admin"), createUser);

module.exports = router;
