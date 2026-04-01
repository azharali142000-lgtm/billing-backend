const express = require("express");

const { listPayments, recordPayment } = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "staff"), listPayments);
router.post("/", authenticate, authorize("admin", "staff"), recordPayment);

module.exports = router;
