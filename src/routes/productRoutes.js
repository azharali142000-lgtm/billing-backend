const express = require("express");

const { createProduct, listProducts, updateProduct } = require("../controllers/productController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "staff"), listProducts);
router.post("/", authenticate, authorize("admin", "staff"), createProduct);
router.put("/:id", authenticate, authorize("admin", "staff"), updateProduct);

module.exports = router;
