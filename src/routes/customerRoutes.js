const express = require("express");

const { createCustomer, listCustomers, updateCustomer } = require("../controllers/customerController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { requireActiveSubscription } = require("../middleware/subscription");

const router = express.Router();

router.get("/", authenticate, requireActiveSubscription, authorize("admin", "staff"), listCustomers);
router.post("/", authenticate, requireActiveSubscription, authorize("admin", "staff"), createCustomer);
router.put("/:id", authenticate, requireActiveSubscription, authorize("admin", "staff"), updateCustomer);

module.exports = router;
