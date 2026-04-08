const express = require("express");

const {
  cancelInvoice,
  createInvoice,
  downloadInvoicePdf,
  listInvoices,
  updateInvoice
} = require("../controllers/invoiceController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { requireActiveSubscription } = require("../middleware/subscription");

const router = express.Router();

router.get("/", authenticate, requireActiveSubscription, authorize("admin", "staff"), listInvoices);
router.post("/", authenticate, requireActiveSubscription, authorize("admin", "staff"), createInvoice);
router.put("/:id", authenticate, requireActiveSubscription, authorize("admin"), updateInvoice);
router.get("/:id/pdf", authenticate, requireActiveSubscription, authorize("admin", "staff"), downloadInvoicePdf);
router.patch("/:id/cancel", authenticate, requireActiveSubscription, authorize("admin"), cancelInvoice);

module.exports = router;
