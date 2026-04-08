const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { serializeProduct } = require("../utils/serializers");

const listProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      companyId: req.user.companyId
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({
    success: true,
    data: products.map(serializeProduct)
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, stock, gstRate } = req.body;

  if (price === undefined || price === null) {
    throw new ApiError(400, "price is required");
  }

  const normalizedPrice = Number(price);
  const normalizedStock = stock === undefined || stock === null || stock === "" ? 0 : Number(stock);
  const normalizedGstRate =
    req.user.role === "ADMIN" && gstRate !== undefined && gstRate !== null && gstRate !== ""
      ? Number(gstRate)
      : null;

  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    throw new ApiError(400, "price must be greater than 0");
  }

  if (!Number.isInteger(normalizedStock) || normalizedStock < 0) {
    throw new ApiError(400, "stock must be a non-negative integer");
  }

  if (normalizedGstRate !== null && (!Number.isFinite(normalizedGstRate) || normalizedGstRate < 0)) {
    throw new ApiError(400, "gstRate must be 0 or greater");
  }

  const product = await prisma.product.create({
    data: {
      companyId: req.user.companyId,
      name: name ? String(name).trim() : null,
      unit: req.body.unit ? String(req.body.unit).trim() : null,
      price: normalizedPrice,
      gstRate: normalizedGstRate,
      stock: normalizedStock
    }
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: serializeProduct(product)
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  const { name, price, stock, gstRate } = req.body;

  if (!Number.isInteger(productId)) {
    throw new ApiError(400, "Valid product id is required");
  }

  if (price === undefined || price === null) {
    throw new ApiError(400, "price is required");
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!existing || existing.companyId !== req.user.companyId) {
    throw new ApiError(404, "Product not found");
  }

  const normalizedPrice = Number(price);
  const normalizedStock = stock === undefined || stock === null || stock === "" ? existing.stock : Number(stock);
  const normalizedGstRate =
    req.user.role === "ADMIN" && gstRate !== undefined && gstRate !== null && gstRate !== ""
      ? Number(gstRate)
      : existing.gstRate;

  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    throw new ApiError(400, "price must be greater than 0");
  }

  if (!Number.isInteger(normalizedStock)) {
    throw new ApiError(400, "stock must be an integer");
  }

  if (normalizedGstRate !== null && (!Number.isFinite(normalizedGstRate) || normalizedGstRate < 0)) {
    throw new ApiError(400, "gstRate must be 0 or greater");
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: name ? String(name).trim() : null,
      unit: req.body.unit === undefined ? existing.unit : req.body.unit ? String(req.body.unit).trim() : null,
      price: normalizedPrice,
      gstRate: normalizedGstRate,
      stock: normalizedStock
    }
  });

  res.json({
    success: true,
    message: "Product updated successfully",
    data: serializeProduct(product)
  });
});

module.exports = {
  createProduct,
  listProducts,
  updateProduct
};
