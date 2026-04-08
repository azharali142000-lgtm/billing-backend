async function getOrCreateCompanyProfile(tx, company) {
  const existing = await tx.companyProfile.findUnique({
    where: { companyId: company.id }
  });

  if (existing) {
    return existing;
  }

  return tx.companyProfile.create({
    data: {
      companyId: company.id,
      companyName: company.name
    }
  });
}

module.exports = {
  getOrCreateCompanyProfile
};
