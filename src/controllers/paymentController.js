const { Prisma } = require("@prisma/client");

const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { serializePayment } = require("../utils/serializers");

const recordPayment = asyncHandler(async (req, res) => {
  const { customerId, amount, method } = req.body;

  if (!customerId || amount === undefined || amount === null || !method) {
    throw new ApiError(400, "customerId, amount, and method are required");
  }

  let normalizedAmount;
  try {
    normalizedAmount = new Prisma.Decimal(amount);
  } catch (_error) {
    throw new ApiError(400, "amount must be a valid number");
  }

  if (normalizedAmount.lte(0)) {
    throw new ApiError(400, "amount must be greater than 0");
  }

  const payment = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: Number(customerId) }
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    if (normalizedAmount.gt(customer.balance)) {
      throw new ApiError(400, "Payment amount cannot exceed the current balance");
    }

    const createdPayment = await tx.payment.create({
      data: {
        customerId: customer.id,
        amount: normalizedAmount,
        method: String(method).trim()
      }
    });

    await tx.customer.update({
      where: { id: customer.id },
      data: {
        balance: {
          decrement: normalizedAmount
        }
      }
    });

    return createdPayment;
  });

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: serializePayment(payment)
  });
});

module.exports = {
  listPayments: asyncHandler(async (_req, res) => {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        customer: true
      }
    });

    res.json({
      success: true,
      data: payments.map((payment) => ({
        ...serializePayment(payment),
        customerName: payment.customer.name
      }))
    });
  }),
  recordPayment
};
