const express = require("express");

const { createProduct, listProducts, updateProduct } = require("../controllers/productController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { requireActiveSubscription } = require("../middleware/subscription");

const router = express.Router();

router.get("/", authenticate, requireActiveSubscription, authorize("admin", "staff"), listProducts);
router.post("/", authenticate, requireActiveSubscription, authorize("admin", "staff"), createProduct);
router.put("/:id", authenticate, requireActiveSubscription, authorize("admin", "staff"), updateProduct);

module.exports = router;
