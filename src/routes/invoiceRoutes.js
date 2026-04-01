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

router.get("/", authenticate, authorize("admin", "worker"), listInvoices);
router.post("/", authenticate, authorize("admin", "worker"), createInvoice);
router.put("/:id", authenticate, authorize("admin"), updateInvoice);
router.get("/:id/pdf", authenticate, authorize("admin", "worker"), downloadInvoicePdf);
router.patch("/:id/cancel", authenticate, authorize("admin"), cancelInvoice);

module.exports = router;
