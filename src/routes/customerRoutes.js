const express = require("express");

const { createCustomer, listCustomers, updateCustomer } = require("../controllers/customerController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "worker"), listCustomers);
router.post("/", authenticate, authorize("admin", "worker"), createCustomer);
router.put("/:id", authenticate, authorize("admin", "worker"), updateCustomer);

module.exports = router;
