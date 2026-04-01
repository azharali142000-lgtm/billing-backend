CREATE INDEX "invoices_created_at_idx" ON "invoices"("created_at");

CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

CREATE INDEX "invoices_customer_id_created_at_idx" ON "invoices"("customer_id", "created_at");
