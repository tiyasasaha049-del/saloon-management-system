import sqlite3
con = sqlite3.connect('lumina_salon.db')
cur = con.cursor()
cur.execute("DELETE FROM products WHERE sku LIKE 'TST-%'")
cur.execute("DELETE FROM inventory_transactions WHERE product_name LIKE 'Test %'")
cur.execute("DELETE FROM purchase_orders WHERE supplier = 'Moroccanoil USA Inc'")
con.commit()
print("Cleaned up test records successfully.")
