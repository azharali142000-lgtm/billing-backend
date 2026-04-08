const { Prisma } = require("@prisma/client");

async function getOrCreateGstSettings(tx, companyId) {
  const existing = await tx.gstSettings.findUnique({
    where: { companyId }
  });

  if (existing) {
    return existing;
  }

  return tx.gstSettings.create({
    data: { companyId }
  });
}

function shouldApplyGst(settings, customer) {
  if (!settings?.gstEnabled) {
    return false;
  }

  if (settings.gstMode === "ALL") {
    return true;
  }

  return Boolean(customer?.gstSelected);
}

function normalizeEditableGstRate(rawRate) {
  if (rawRate === undefined || rawRate === null || rawRate === "") {
    return null;
  }

  return new Prisma.Decimal(rawRate);
}

function calculateInvoiceTax({
  customer,
  settings,
  subtotal,
  userRole,
  invoiceGstRate,
  productRates
}) {
  const gstApplied = shouldApplyGst(settings, customer);

  if (!gstApplied) {
    return {
      gstApplied: false,
      gstRate: new Prisma.Decimal(0),
      gstAmount: new Prisma.Decimal(0),
      gstType: null,
      gstNumber: null,
      total: subtotal
    };
  }

  let effectiveRate = new Prisma.Decimal(settings.defaultGstRate);

  if (userRole === "ADMIN" && invoiceGstRate !== null) {
    effectiveRate = invoiceGstRate;
  } else {
    const productRate = productRates.find((rate) => rate !== null);
    if (productRate !== undefined) {
      effectiveRate = productRate || effectiveRate;
    }
  }

  const gstAmount = subtotal.mul(effectiveRate).div(100);
  return {
    gstApplied: true,
    gstRate: effectiveRate,
    gstAmount,
    gstType: settings.gstType,
    gstNumber: settings.gstNumber || null,
    total: subtotal.plus(gstAmount)
  };
}

module.exports = {
  calculateInvoiceTax,
  getOrCreateGstSettings,
  normalizeEditableGstRate,
  shouldApplyGst
};
