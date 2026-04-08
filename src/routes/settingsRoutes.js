const express = require("express");

const {
  getCompanyProfile,
  getGstSettings,
  updateCompanyProfile,
  updateGstSettings
} = require("../controllers/settingsController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { requireActiveSubscription } = require("../middleware/subscription");

const router = express.Router();

router.get("/company", authenticate, requireActiveSubscription, authorize("admin"), getCompanyProfile);
router.put("/company", authenticate, requireActiveSubscription, authorize("admin"), updateCompanyProfile);
router.get("/gst", authenticate, requireActiveSubscription, authorize("admin"), getGstSettings);
router.put("/gst", authenticate, requireActiveSubscription, authorize("admin"), updateGstSettings);

module.exports = router;
