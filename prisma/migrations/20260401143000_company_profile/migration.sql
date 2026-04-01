CREATE TABLE "company_profile" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "company_name" TEXT NOT NULL DEFAULT 'Billr Cloud',
  "logo_data_url" TEXT,
  "address" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "gst_number" TEXT,
  "bank_details" TEXT,
  "terms_and_conditions" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id")
);

INSERT INTO "company_profile" (
  "id",
  "company_name",
  "updated_at"
)
VALUES (
  1,
  'Billr Cloud',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
