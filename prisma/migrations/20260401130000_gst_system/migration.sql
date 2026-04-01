-- CreateEnum
CREATE TYPE "GstMode" AS ENUM ('ALL', 'SELECTED_CUSTOMERS');

-- CreateEnum
CREATE TYPE "GstType" AS ENUM ('CGST_SGST', 'IGST');

-- AlterTable
ALTER TABLE "customers"
  ADD COLUMN "gst_selected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "products"
  ADD COLUMN "gst_rate" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "invoices"
  ADD COLUMN "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "gst_applied" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "gst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN "gst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "gst_type" "GstType",
  ADD COLUMN "gst_number" TEXT;

-- CreateTable
CREATE TABLE "gst_settings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "gst_enabled" BOOLEAN NOT NULL DEFAULT false,
  "gst_mode" "GstMode" NOT NULL DEFAULT 'ALL',
  "default_gst_rate" DECIMAL(5,2) NOT NULL DEFAULT 18,
  "gst_number" TEXT,
  "gst_type" "GstType" NOT NULL DEFAULT 'CGST_SGST',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "gst_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "gst_settings" (
  "id",
  "gst_enabled",
  "gst_mode",
  "default_gst_rate",
  "gst_type",
  "updated_at"
)
VALUES (
  1,
  false,
  'ALL',
  18,
  'CGST_SGST',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
