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

const router = express.Router();

router.get("/", authenticate, authorize("admin", "staff"), listInvoices);
router.post("/", authenticate, authorize("admin", "staff"), createInvoice);
router.put("/:id", authenticate, authorize("admin"), updateInvoice);
router.get("/:id/pdf", authenticate, authorize("admin", "staff"), downloadInvoicePdf);
router.patch("/:id/cancel", authenticate, authorize("admin"), cancelInvoice);

module.exports = router;
