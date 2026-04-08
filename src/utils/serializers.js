function serializeUser(user) {
  const normalizedRole = String(user.role || "").toLowerCase();
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    companyId: user.companyId,
    role: normalizedRole === "worker" ? "staff" : normalizedRole,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

function serializeCustomer(customer) {
  return {
    ...customer,
    companyId: customer.companyId,
    balance: Number(customer.balance),
    creditLimit: Number(customer.creditLimit)
  };
}

function serializeProduct(product) {
  return {
    ...product,
    companyId: product.companyId,
    price: Number(product.price),
    gstRate: product.gstRate === null || product.gstRate === undefined ? null : Number(product.gstRate)
  };
}

function serializeInvoice(invoice) {
  return {
    ...invoice,
    subtotal: Number(invoice.subtotal || 0),
    gstRate: Number(invoice.gstRate || 0),
    gstAmount: Number(invoice.gstAmount || 0),
    total: Number(invoice.total),
    customer: invoice.customer ? serializeCustomer(invoice.customer) : undefined,
    user: invoice.user ? serializeUser(invoice.user) : undefined,
    items: invoice.items
      ? invoice.items.map((item) => ({
          ...item,
          price: Number(item.price),
          product: item.product ? serializeProduct(item.product) : undefined
        }))
      : undefined
  };
}

function serializeGstSettings(settings) {
  return {
    ...settings,
    defaultGstRate: Number(settings.defaultGstRate)
  };
}

function serializeCompanyProfile(profile) {
  return {
    ...profile
  };
}

function serializeCompany(company) {
  return {
    id: company.id,
    name: company.name,
    subscriptionStatus: String(company.subscriptionStatus || "").toLowerCase(),
    expiryDate: company.expiryDate,
    maxAdmins: company.maxAdmins
  };
}

function serializePayment(payment) {
  return {
    ...payment,
    amount: Number(payment.amount)
  };
}

module.exports = {
  serializeCustomer,
  serializeCompanyProfile,
  serializeCompany,
  serializeGstSettings,
  serializeInvoice,
  serializePayment,
  serializeProduct,
  serializeUser
};
