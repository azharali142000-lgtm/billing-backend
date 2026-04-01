const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getOrCreateCompanyProfile } = require("../utils/companyProfile");
const { getOrCreateGstSettings } = require("../utils/gst");
const { serializeCompanyProfile, serializeGstSettings } = require("../utils/serializers");

const getGstSettings = asyncHandler(async (_req, res) => {
  const settings = await prisma.$transaction(async (tx) => getOrCreateGstSettings(tx));

  res.json({
    success: true,
    data: serializeGstSettings(settings)
  });
});

const getCompanyProfile = asyncHandler(async (_req, res) => {
  const profile = await prisma.$transaction(async (tx) => getOrCreateCompanyProfile(tx));

  res.json({
    success: true,
    data: serializeCompanyProfile(profile)
  });
});

const updateCompanyProfile = asyncHandler(async (req, res) => {
  const {
    companyName,
    logoDataUrl,
    address,
    phone,
    email,
    gstNumber,
    bankDetails,
    termsAndConditions
  } = req.body;

  if (!String(companyName || "").trim()) {
    throw new ApiError(400, "companyName is required");
  }

  if (logoDataUrl && !/^data:image\/jpeg;base64,/i.test(String(logoDataUrl))) {
    throw new ApiError(400, "logoDataUrl must be a JPEG data URL");
  }

  const profile = await prisma.$transaction(async (tx) => {
    await getOrCreateCompanyProfile(tx);

    return tx.companyProfile.update({
      where: { id: 1 },
      data: {
        companyName: String(companyName).trim(),
        logoDataUrl: logoDataUrl ? String(logoDataUrl) : null,
        address: address ? String(address).trim() : null,
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
        gstNumber: gstNumber ? String(gstNumber).trim() : null,
        bankDetails: bankDetails ? String(bankDetails).trim() : null,
        termsAndConditions: termsAndConditions ? String(termsAndConditions).trim() : null
      }
    });
  });

  res.json({
    success: true,
    message: "Company profile updated successfully",
    data: serializeCompanyProfile(profile)
  });
});

const updateGstSettings = asyncHandler(async (req, res) => {
  const {
    gstEnabled,
    gstMode,
    defaultGstRate,
    gstNumber,
    gstType,
    selectedCustomerIds
  } = req.body;

  if (!["ALL", "SELECTED_CUSTOMERS"].includes(String(gstMode || "").toUpperCase())) {
    throw new ApiError(400, "gstMode must be all or selected_customers");
  }

  if (!["CGST_SGST", "IGST"].includes(String(gstType || "").toUpperCase())) {
    throw new ApiError(400, "gstType must be CGST_SGST or IGST");
  }

  const normalizedCustomerIds = Array.isArray(selectedCustomerIds)
    ? selectedCustomerIds.map((id) => Number(id)).filter((id) => Number.isInteger(id))
    : [];

  const settings = await prisma.$transaction(async (tx) => {
    await getOrCreateGstSettings(tx);

    await tx.customer.updateMany({
      data: {
        gstSelected: false
      }
    });

    if (normalizedCustomerIds.length) {
      await tx.customer.updateMany({
        where: {
          id: { in: normalizedCustomerIds }
        },
        data: {
          gstSelected: true
        }
      });
    }

    return tx.gstSettings.update({
      where: { id: 1 },
      data: {
        gstEnabled: Boolean(gstEnabled),
        gstMode: String(gstMode).toUpperCase(),
        defaultGstRate: Number(defaultGstRate || 0),
        gstNumber: gstNumber ? String(gstNumber).trim() : null,
        gstType: String(gstType).toUpperCase()
      }
    });
  });

  res.json({
    success: true,
    message: "GST settings updated successfully",
    data: serializeGstSettings(settings)
  });
});

module.exports = {
  getCompanyProfile,
  getGstSettings,
  updateCompanyProfile,
  updateGstSettings
};
