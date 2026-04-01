async function getOrCreateCompanyProfile(tx) {
  const existing = await tx.companyProfile.findUnique({
    where: { id: 1 }
  });

  if (existing) {
    return existing;
  }

  return tx.companyProfile.create({
    data: {
      id: 1,
      companyName: "Billr Cloud"
    }
  });
}

module.exports = {
  getOrCreateCompanyProfile
};
