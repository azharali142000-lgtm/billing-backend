function escapePdfText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function invoiceCode(invoice) {
  const date = new Date(invoice.createdAt);
  const year = date.getFullYear();
  const current = String(year % 100).padStart(2, "0");
  const next = String((year + 1) % 100).padStart(2, "0");
  const previous = String((year - 1) % 100).padStart(2, "0");
  const fy = date.getMonth() >= 3 ? `${current}-${next}` : `${previous}-${current}`;
  return `FY/${fy}/${String(invoice.id).padStart(4, "0")}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function currency(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function parseJpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Only JPEG logos are supported for PDF embedding");
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const size = buffer.readUInt16BE(offset + 2);

    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }

    offset += 2 + size;
  }

  throw new Error("Could not determine logo dimensions");
}

function drawText(x, y, text, size = 10, font = "F1") {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`;
}

function drawLine(x1, y1, x2, y2, width = 1) {
  return `${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function drawRect(x, y, width, height, stroke = true, fill = false) {
  const operator = fill && stroke ? "B" : fill ? "f" : "S";
  return `${x} ${y} ${width} ${height} re ${operator}`;
}

function wrapText(text, maxChars = 44) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [];
  }

  const lines = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (next.length <= maxChars) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }

  lines.push(current);
  return lines;
}

function buildInvoicePdf(invoice, companyProfile = {}) {
  const commands = [];
  let logoObject = null;

  if (companyProfile.logoDataUrl) {
    try {
      const base64 = String(companyProfile.logoDataUrl).split(",")[1];
      const logoBuffer = Buffer.from(base64, "base64");
      const dimensions = parseJpegDimensions(logoBuffer);
      logoObject = {
        buffer: logoBuffer,
        width: dimensions.width,
        height: dimensions.height
      };
    } catch (_error) {
      logoObject = null;
    }
  }

  commands.push("0.15 0.23 0.39 RG");
  commands.push("0.15 0.23 0.39 rg");
  commands.push(drawLine(40, 785, 555, 785, 1.6));

  if (logoObject) {
    const targetWidth = 62;
    const targetHeight = (logoObject.height / logoObject.width) * targetWidth;
    commands.push(`q ${targetWidth} 0 0 ${targetHeight} 45 742 cm /Im1 Do Q`);
  } else {
    commands.push(drawRect(45, 730, 62, 44, true, false));
    commands.push(drawText(56, 748, "LOGO", 11, "F2"));
  }

  const companyX = 120;
  commands.push(drawText(companyX, 760, companyProfile.companyName || "Billr Cloud", 17, "F2"));
  let companyY = 744;
  [
    companyProfile.address,
    companyProfile.phone ? `Phone: ${companyProfile.phone}` : null,
    companyProfile.email ? `Email: ${companyProfile.email}` : null,
    companyProfile.gstNumber ? `GSTIN: ${companyProfile.gstNumber}` : null
  ]
    .filter(Boolean)
    .forEach((line) => {
      wrapText(line, 44).forEach((wrapped) => {
        commands.push(drawText(companyX, companyY, wrapped, 9));
        companyY -= 12;
      });
    });

  commands.push(drawText(405, 760, "INVOICE", 18, "F2"));
  commands.push(drawText(405, 742, `Invoice No: ${invoiceCode(invoice)}`, 10));
  commands.push(drawText(405, 728, `Date: ${formatDate(invoice.createdAt)}`, 10));
  commands.push(drawText(405, 714, `Status: ${invoice.status}`, 10, "F2"));

  commands.push(drawRect(40, 650, 515, 52, true, false));
  commands.push(drawText(50, 684, "Bill To", 11, "F2"));
  commands.push(drawText(50, 668, invoice.customer?.name || "-", 12, "F2"));
  if (invoice.customer?.phone) {
    commands.push(drawText(50, 654, `Phone: ${invoice.customer.phone}`, 9));
  }

  commands.push(drawRect(40, 620, 515, 24, true, false));
  commands.push(drawText(52, 628, "Item Name", 10, "F2"));
  commands.push(drawText(320, 628, "Qty", 10, "F2"));
  commands.push(drawText(390, 628, "Price", 10, "F2"));
  commands.push(drawText(475, 628, "Total", 10, "F2"));

  let rowTop = 620;
  (invoice.items || []).forEach((item) => {
    const itemHeight = 24;
    rowTop -= itemHeight;
    commands.push(drawRect(40, rowTop, 515, itemHeight, true, false));
    commands.push(drawText(52, rowTop + 8, item.product?.name || `Product #${item.productId}`, 10));
    commands.push(drawText(322, rowTop + 8, String(item.quantity), 10));
    commands.push(drawText(390, rowTop + 8, currency(item.price), 10));
    commands.push(drawText(475, rowTop + 8, currency(Number(item.price) * Number(item.quantity)), 10));
  });

  const totalsTop = rowTop - 36;
  commands.push(drawText(360, totalsTop, "Subtotal", 10, "F2"));
  commands.push(drawText(470, totalsTop, currency(invoice.subtotal || invoice.total), 10));

  let totalCursor = totalsTop - 16;
  if (invoice.gstApplied) {
    if (invoice.gstType === "IGST") {
      commands.push(drawText(360, totalCursor, `IGST (${Number(invoice.gstRate || 0)}%)`, 10, "F2"));
      commands.push(drawText(470, totalCursor, currency(invoice.gstAmount || 0), 10));
      totalCursor -= 16;
    } else {
      const halfGst = Number(invoice.gstAmount || 0) / 2;
      commands.push(drawText(360, totalCursor, `CGST (${Number(invoice.gstRate || 0) / 2}%)`, 10, "F2"));
      commands.push(drawText(470, totalCursor, currency(halfGst), 10));
      totalCursor -= 16;
      commands.push(drawText(360, totalCursor, `SGST (${Number(invoice.gstRate || 0) / 2}%)`, 10, "F2"));
      commands.push(drawText(470, totalCursor, currency(halfGst), 10));
      totalCursor -= 16;
    }
  }

  commands.push(drawLine(350, totalCursor + 6, 555, totalCursor + 6, 1));
  commands.push(drawText(360, totalCursor - 8, "Final Total", 12, "F2"));
  commands.push(drawText(470, totalCursor - 8, currency(invoice.total), 12, "F2"));

  let footerY = totalCursor - 70;
  commands.push(drawLine(40, footerY + 30, 555, footerY + 30, 1));
  if (companyProfile.bankDetails) {
    commands.push(drawText(50, footerY + 12, "Bank Details", 11, "F2"));
    wrapText(companyProfile.bankDetails, 88).forEach((line, index) => {
      commands.push(drawText(50, footerY - index * 12, line, 9));
    });
    footerY -= wrapText(companyProfile.bankDetails, 88).length * 12 + 16;
  }

  if (companyProfile.termsAndConditions) {
    commands.push(drawText(50, footerY, "Terms & Conditions", 11, "F2"));
    wrapText(companyProfile.termsAndConditions, 88).forEach((line, index) => {
      commands.push(drawText(50, footerY - 14 - index * 12, line, 9));
    });
    footerY -= wrapText(companyProfile.termsAndConditions, 88).length * 12 + 28;
  }

  commands.push(drawText(50, Math.max(42, footerY), "Thank you for your business.", 10, "F2"));

  const stream = commands.join("\n");
  const objects = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");

  const xObjectRef = logoObject ? "/XObject << /Im1 7 0 R >>" : "";
  objects.push(
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${xObjectRef} >> /Contents 6 0 R >> endobj`
  );
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj");
  objects.push(`6 0 obj << /Length ${Buffer.byteLength(stream, "utf8")} >> stream\n${stream}\nendstream endobj`);

  if (logoObject) {
    objects.push(
      `7 0 obj << /Type /XObject /Subtype /Image /Width ${logoObject.width} /Height ${logoObject.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoObject.buffer.length} >> stream\n${logoObject.buffer.toString("binary")}\nendstream endobj`
    );
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${object}\n`;
    if (logoObject && index === objects.length - 1) {
      pdf = Buffer.from(pdf, "binary").toString("binary");
    }
  });

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}

module.exports = {
  buildInvoicePdf
};
