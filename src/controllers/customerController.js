const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { serializeCustomer } = require("../utils/serializers");

const listCustomers = asyncHandler(async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: {
      companyId: req.user.companyId
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({
    success: true,
    data: customers.map(serializeCustomer)
  });
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, address, creditLimit } = req.body;

  if (!name) {
    throw new ApiError(400, "name is required");
  }

  const normalizedPhone = phone ? String(phone).trim() : null;

  if (normalizedPhone) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        companyId: req.user.companyId,
        phone: normalizedPhone
      }
    });

    if (existingCustomer) {
      throw new ApiError(409, "A customer with this phone already exists");
    }
  }

  const customer = await prisma.customer.create({
    data: {
      companyId: req.user.companyId,
      name: String(name).trim(),
      phone: normalizedPhone,
      address: address ? String(address).trim() : null,
      creditLimit: Number(creditLimit || 0)
    }
  });

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: serializeCustomer(customer)
  });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customerId = Number(req.params.id);
  const { name, phone, address, creditLimit } = req.body;

  if (!Number.isInteger(customerId)) {
    throw new ApiError(400, "Valid customer id is required");
  }

  if (!name) {
    throw new ApiError(400, "name is required");
  }

  const existing = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!existing || existing.companyId !== req.user.companyId) {
    throw new ApiError(404, "Customer not found");
  }

  const normalizedPhone = phone ? String(phone).trim() : null;

  if (normalizedPhone) {
    const phoneOwner = await prisma.customer.findFirst({
      where: {
        companyId: req.user.companyId,
        phone: normalizedPhone
      }
    });

    if (phoneOwner && phoneOwner.id !== customerId) {
      throw new ApiError(409, "A customer with this phone already exists");
    }
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: String(name).trim(),
      phone: normalizedPhone,
      address: address ? String(address).trim() : null,
      creditLimit: Number(creditLimit || 0)
    }
  });

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: serializeCustomer(customer)
  });
});

module.exports = {
  createCustomer,
  listCustomers,
  updateCustomer
};
