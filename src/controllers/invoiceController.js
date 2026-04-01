const { Prisma } = require("@prisma/client");

const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getOrCreateCompanyProfile } = require("../utils/companyProfile");
const {
  calculateInvoiceTax,
  getOrCreateGstSettings,
  normalizeEditableGstRate
} = require("../utils/gst");
const { buildInvoicePdf } = require("../utils/invoicePdf");
const { serializeInvoice } = require("../utils/serializers");

async function getInvoiceWithRelations(invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return invoice;
}

function normalizeInvoiceItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "customerId and at least one invoice item are required");
  }

  const normalizedItems = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity)
  }));

  if (
    normalizedItems.some(
      (item) =>
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    )
  ) {
    throw new ApiError(400, "Each item must include a valid productId and quantity greater than 0");
  }

  return normalizedItems;
}

function parseDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return undefined;
  }

  const range = {};

  if (startDate) {
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      throw new ApiError(400, "startDate must be a valid date");
    }
    start.setHours(0, 0, 0, 0);
    range.gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) {
      throw new ApiError(400, "endDate must be a valid date");
    }
    end.setHours(23, 59, 59, 999);
    range.lte = end;
  }

  return range;
}

const createInvoice = asyncHandler(async (req, res) => {
  const { customerId, items, gstRate } = req.body;

  if (!customerId) {
    throw new ApiError(400, "customerId and at least one invoice item are required");
  }

  const normalizedItems = normalizeInvoiceItems(items);

  const invoice = await prisma.$transaction(async (tx) => {
    const settings = await getOrCreateGstSettings(tx);
    const customer = await tx.customer.findUnique({
      where: { id: Number(customerId) }
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    const aggregatedItems = normalizedItems.reduce((map, item) => {
      const currentQuantity = map.get(item.productId) || 0;
      map.set(item.productId, currentQuantity + item.quantity);
      return map;
    }, new Map());

    const productIds = [...aggregatedItems.keys()];
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    if (products.length !== productIds.length) {
      throw new ApiError(404, "One or more products were not found");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    let subtotal = new Prisma.Decimal(0);
    const lineItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      subtotal = subtotal.plus(product.price.mul(item.quantity));

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      };
    });

    const taxSummary = calculateInvoiceTax({
      customer,
      settings,
      subtotal,
      userRole: req.user.role,
      invoiceGstRate: normalizeEditableGstRate(gstRate),
      productRates: products.map((product) => product.gstRate)
    });

    const nextBalance = customer.balance.plus(taxSummary.total);

    if (customer.creditLimit.gt(0) && nextBalance.gt(customer.creditLimit)) {
      throw new ApiError(400, "Customer credit limit exceeded");
    }

    const createdInvoice = await tx.invoice.create({
      data: {
        customerId: customer.id,
        userId: req.user.id,
        subtotal,
        gstApplied: taxSummary.gstApplied,
        gstRate: taxSummary.gstRate,
        gstAmount: taxSummary.gstAmount,
        gstType: taxSummary.gstType,
        gstNumber: taxSummary.gstNumber,
        total: taxSummary.total,
        status: "PENDING",
        items: {
          create: lineItems
        }
      },
      include: {
        customer: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    for (const [productId, quantity] of aggregatedItems.entries()) {
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity
          }
        }
      });
    }

    await tx.customer.update({
      where: { id: customer.id },
      data: {
        balance: {
          increment: taxSummary.total
        }
      }
    });

    return createdInvoice;
  });

  res.status(201).json({
    success: true,
    message: "Invoice created successfully",
    data: serializeInvoice(invoice)
  });
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoiceId = Number(req.params.id);
  const { customerId, items, gstRate } = req.body;

  if (!Number.isInteger(invoiceId)) {
    throw new ApiError(400, "Valid invoice id is required");
  }

  if (!customerId) {
    throw new ApiError(400, "customerId and at least one invoice item are required");
  }

  const normalizedItems = normalizeInvoiceItems(items);

  const updatedInvoice = await prisma.$transaction(async (tx) => {
    const settings = await getOrCreateGstSettings(tx);
    const existingInvoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: true
      }
    });

    if (!existingInvoice) {
      throw new ApiError(404, "Invoice not found");
    }

    if (existingInvoice.status === "CANCELLED") {
      throw new ApiError(400, "Cancelled invoices cannot be edited");
    }

    const nextCustomer = await tx.customer.findUnique({
      where: { id: Number(customerId) }
    });

    if (!nextCustomer) {
      throw new ApiError(404, "Customer not found");
    }

    const aggregatedItems = normalizedItems.reduce((map, item) => {
      map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
      return map;
    }, new Map());

    const productIds = [...aggregatedItems.keys()];
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    if (products.length !== productIds.length) {
      throw new ApiError(404, "One or more products were not found");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    let subtotal = new Prisma.Decimal(0);
    const lineItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);
      subtotal = subtotal.plus(product.price.mul(item.quantity));
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      };
    });

    const taxSummary = calculateInvoiceTax({
      customer: nextCustomer,
      settings,
      subtotal,
      userRole: req.user.role,
      invoiceGstRate: normalizeEditableGstRate(gstRate),
      productRates: products.map((product) => product.gstRate)
    });

    const adjustedBalance = existingInvoice.customerId === nextCustomer.id
      ? nextCustomer.balance.minus(existingInvoice.total).plus(taxSummary.total)
      : nextCustomer.balance.plus(taxSummary.total);

    if (nextCustomer.creditLimit.gt(0) && adjustedBalance.gt(nextCustomer.creditLimit)) {
      throw new ApiError(400, "Customer credit limit exceeded");
    }

    for (const item of existingInvoice.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    await tx.customer.update({
      where: { id: existingInvoice.customerId },
      data: {
        balance: {
          decrement: existingInvoice.total
        }
      }
    });

    for (const [productId, quantity] of aggregatedItems.entries()) {
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity
          }
        }
      });
    }

    await tx.customer.update({
      where: { id: nextCustomer.id },
      data: {
        balance: {
          increment: taxSummary.total
        }
      }
    });

    await tx.invoiceItem.deleteMany({
      where: { invoiceId }
    });

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        customerId: nextCustomer.id,
        subtotal,
        gstApplied: taxSummary.gstApplied,
        gstRate: taxSummary.gstRate,
        gstAmount: taxSummary.gstAmount,
        gstType: taxSummary.gstType,
        gstNumber: taxSummary.gstNumber,
        total: taxSummary.total,
        items: {
          create: lineItems
        }
      },
      include: {
        customer: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  });

  res.json({
    success: true,
    message: "Invoice updated successfully",
    data: serializeInvoice(updatedInvoice)
  });
});

const cancelInvoice = asyncHandler(async (req, res) => {
  const invoiceId = Number(req.params.id);

  if (!Number.isInteger(invoiceId)) {
    throw new ApiError(400, "Valid invoice id is required");
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        customer: true
      }
    });

    if (!existing) {
      throw new ApiError(404, "Invoice not found");
    }

    if (existing.status === "CANCELLED") {
      throw new ApiError(400, "Invoice is already cancelled");
    }

    for (const item of existing.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    await tx.customer.update({
      where: { id: existing.customerId },
      data: {
        balance: {
          decrement: existing.total
        }
      }
    });

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "CANCELLED"
      },
      include: {
        customer: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  });

  res.json({
    success: true,
    message: "Invoice cancelled successfully",
    data: serializeInvoice(invoice)
  });
});

module.exports = {
  cancelInvoice,
  createInvoice,
  downloadInvoicePdf: asyncHandler(async (req, res) => {
    const invoiceId = Number(req.params.id);

    if (!Number.isInteger(invoiceId)) {
      throw new ApiError(400, "Valid invoice id is required");
    }

    const invoice = await getInvoiceWithRelations(invoiceId);
    const companyProfile = await prisma.$transaction(async (tx) => getOrCreateCompanyProfile(tx));
    const pdfBuffer = buildInvoicePdf(invoice, companyProfile);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="invoice-${invoice.id}.pdf"`);
    res.send(pdfBuffer);
  }),
  updateInvoice,
  listInvoices: asyncHandler(async (req, res) => {
    const customerId =
      req.query.customerId === undefined ? undefined : Number(req.query.customerId);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;
    const createdAt = parseDateRange(req.query.startDate, req.query.endDate);

    if (customerId !== undefined && !Number.isInteger(customerId)) {
      throw new ApiError(400, "customerId must be a valid integer");
    }

    const where = {
      ...(Number.isInteger(customerId) ? { customerId } : {}),
      ...(createdAt ? { createdAt } : {})
    };

    const [totalCount, invoices] = await prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: true,
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: invoices.map(serializeInvoice),
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.max(Math.ceil(totalCount / limit), 1)
      }
    });
  })
};
