const express = require("express");

const { listPayments, recordPayment } = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "worker"), listPayments);
router.post("/", authenticate, authorize("admin", "worker"), recordPayment);

module.exports = router;
