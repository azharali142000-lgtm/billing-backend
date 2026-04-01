function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role.toLowerCase(),
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

function serializeCustomer(customer) {
  return {
    ...customer,
    balance: Number(customer.balance),
    creditLimit: Number(customer.creditLimit)
  };
}

function serializeProduct(product) {
  return {
    ...product,
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

function serializePayment(payment) {
  return {
    ...payment,
    amount: Number(payment.amount)
  };
}

module.exports = {
  serializeCustomer,
  serializeCompanyProfile,
  serializeGstSettings,
  serializeInvoice,
  serializePayment,
  serializeProduct,
  serializeUser
};
