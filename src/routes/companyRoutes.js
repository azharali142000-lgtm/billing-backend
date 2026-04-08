const express = require("express");

const { authenticate } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");
const asyncHandler = require("../utils/asyncHandler");
const { serializeCompany } = require("../utils/serializers");

const router = express.Router();

router.get(
  "/",
  authenticate,
  requireActiveSubscription,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Company loaded successfully",
      data: serializeCompany(req.company)
    });
  })
);

module.exports = router;
