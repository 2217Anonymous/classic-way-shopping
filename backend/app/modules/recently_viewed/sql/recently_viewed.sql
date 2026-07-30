CREATE TABLE IF NOT EXISTS recently_viewed (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recently_viewed_customer_product UNIQUE (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS ix_recently_viewed_customer_id ON recently_viewed(customer_id);
CREATE INDEX IF NOT EXISTS ix_recently_viewed_product_id ON recently_viewed(product_id);
CREATE INDEX IF NOT EXISTS ix_recently_viewed_viewed_at ON recently_viewed(viewed_at DESC);
