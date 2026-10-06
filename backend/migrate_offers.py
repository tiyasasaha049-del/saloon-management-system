import sqlite3

con = sqlite3.connect('lumina_salon.db')
cur = con.cursor()

# 1. Inspect existing columns of offers
existing_cols = [r[1] for r in cur.execute('PRAGMA table_info(offers);').fetchall()]
print("Existing columns in offers:", existing_cols)

new_cols = [
    ("campaign_id", "VARCHAR(50)"),
    ("description", "TEXT"),
    ("discount_type", "VARCHAR(50) DEFAULT 'PERCENTAGE'"),
    ("discount_value", "NUMERIC(12, 2) DEFAULT 15.00"),
    ("minimum_spend", "NUMERIC(12, 2) DEFAULT 0.00"),
    ("maximum_discount", "NUMERIC(12, 2) DEFAULT 0.00"),
    ("valid_from", "VARCHAR(50)"),
    ("valid_until", "VARCHAR(50)"),
    ("usage_limit", "INTEGER DEFAULT 100"),
    ("used_count", "INTEGER DEFAULT 0"),
    ("per_customer_limit", "INTEGER DEFAULT 1"),
    ("customer_eligibility", "VARCHAR(50) DEFAULT 'ALL_CUSTOMERS'"),
    ("applicable_to", "VARCHAR(50) DEFAULT 'ENTIRE_BILL'"),
    ("applicable_target", "VARCHAR(255)"),
    ("branch_id", "VARCHAR(50)"),
    ("notes", "TEXT"),
    ("created_by", "VARCHAR(255) DEFAULT 'Super Admin'"),
    ("updatedAt", "DATETIME")
]

for col_name, col_type in new_cols:
    if col_name not in existing_cols:
        cur.execute(f"ALTER TABLE offers ADD COLUMN {col_name} {col_type};")
        print(f"Added column {col_name} to offers")

# 2. Create coupon_redemptions table if not exists
cur.execute("""
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id VARCHAR(50) PRIMARY KEY,
    coupon_id VARCHAR(50) NOT NULL,
    coupon_code VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    invoice_id VARCHAR(50),
    invoice_number VARCHAR(100),
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    subtotal_before_discount NUMERIC(12, 2) DEFAULT 0.00,
    final_total NUMERIC(12, 2) DEFAULT 0.00,
    branch_id VARCHAR(50),
    authorized_user VARCHAR(255),
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(coupon_id) REFERENCES offers(id) ON DELETE CASCADE
);
""")
print("Created coupon_redemptions table.")

# 3. Update existing records with rich, valid data so no values are ever undefined
cur.execute("""
UPDATE offers 
SET 
    description = COALESCE(description, '20% off on premium salon hair & skin services'),
    discount_type = 'PERCENTAGE',
    discount_value = 20.00,
    minimum_spend = 1000.00,
    maximum_discount = 500.00,
    valid_from = '2026-09-01',
    valid_until = '2026-11-30',
    validTill = '2026-11-30',
    usage_limit = 100,
    used_count = 37,
    per_customer_limit = 1,
    customer_eligibility = 'ALL_CUSTOMERS',
    applicable_to = 'ENTIRE_BILL',
    status = 'ACTIVE'
WHERE code = 'AUTUMN20';
""")

cur.execute("""
UPDATE offers 
SET 
    description = COALESCE(description, 'Special 15% welcome privilege for new guests'),
    discount_type = 'PERCENTAGE',
    discount_value = 15.00,
    minimum_spend = 1000.00,
    maximum_discount = 500.00,
    valid_from = '2026-09-01',
    valid_until = '2026-12-31',
    validTill = '2026-12-31',
    usage_limit = 100,
    used_count = 12,
    per_customer_limit = 1,
    customer_eligibility = 'NEW_CUSTOMERS',
    applicable_to = 'ENTIRE_BILL',
    status = 'ACTIVE'
WHERE code = 'WELCOME15';
""")

con.commit()
print("Migration completed successfully!")
