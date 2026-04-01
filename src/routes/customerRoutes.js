const express = require("express");

const { createCustomer, listCustomers, updateCustomer } = require("../controllers/customerController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "staff"), listCustomers);
router.post("/", authenticate, authorize("admin", "staff"), createCustomer);
router.put("/:id", authenticate, authorize("admin", "staff"), updateCustomer);

module.exports = router;
