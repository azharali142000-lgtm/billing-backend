const express = require("express");

const { createProduct, listProducts, updateProduct } = require("../controllers/productController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "worker"), listProducts);
router.post("/", authenticate, authorize("admin", "worker"), createProduct);
router.put("/:id", authenticate, authorize("admin", "worker"), updateProduct);

module.exports = router;
