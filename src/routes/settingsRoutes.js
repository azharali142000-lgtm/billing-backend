const express = require("express");

const {
  getCompanyProfile,
  getGstSettings,
  updateCompanyProfile,
  updateGstSettings
} = require("../controllers/settingsController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/company", authenticate, authorize("admin"), getCompanyProfile);
router.put("/company", authenticate, authorize("admin"), updateCompanyProfile);
router.get("/gst", authenticate, authorize("admin"), getGstSettings);
router.put("/gst", authenticate, authorize("admin"), updateGstSettings);

module.exports = router;
