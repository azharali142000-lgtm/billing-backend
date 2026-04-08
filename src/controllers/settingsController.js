const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getOrCreateCompanyProfile } = require("../utils/companyProfile");
const { getOrCreateGstSettings } = require("../utils/gst");
const { serializeCompanyProfile, serializeGstSettings } = require("../utils/serializers");

const getGstSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.$transaction(async (tx) => getOrCreateGstSettings(tx, req.user.companyId));

  res.json({
    success: true,
    data: serializeGstSettings(settings)
  });
});

const getCompanyProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.$transaction(async (tx) => getOrCreateCompanyProfile(tx, req.company));

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
    await getOrCreateCompanyProfile(tx, req.company);
    await tx.company.update({
      where: { id: req.user.companyId },
      data: {
        name: String(companyName).trim()
      }
    });

    return tx.companyProfile.update({
      where: { companyId: req.user.companyId },
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
    await getOrCreateGstSettings(tx, req.user.companyId);

    await tx.customer.updateMany({
      where: {
        companyId: req.user.companyId
      },
      data: {
        gstSelected: false
      }
    });

    if (normalizedCustomerIds.length) {
      await tx.customer.updateMany({
        where: {
          companyId: req.user.companyId,
          id: { in: normalizedCustomerIds }
        },
        data: {
          gstSelected: true
        }
      });
    }

    return tx.gstSettings.update({
      where: { companyId: req.user.companyId },
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
