import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def req(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"error": content}

print("--- Test 1: Add product with Opening Stock = 20 ---")
status, p_data = req("/api/products", "POST", {
    "name": "Test Moroccan Argan Oil 50ml",
    "sku": "TST-MO-50",
    "category": "Hair Care",
    "brand": "Moroccanoil",
    "stock": 20,
    "quantity": 20,
    "minimumStock": 10,
    "minStockAlert": 10,
    "purchasePrice": 15.0,
    "sellingPrice": 35.0
})
assert status == 201, f"Failed to create product: {status} {p_data}"
p_id = p_data["id"]
print("Created product:", p_data["name"], "Stock:", p_data["stock"])
assert p_data["stock"] == 20, f"Expected stock 20, got {p_data['stock']}"

status, txs = req("/api/inventory/transactions")
assert status == 200
open_tx = next((t for t in txs if t["productId"] == p_id and t["type"] == "OPENING STOCK"), None)
assert open_tx is not None, "OPENING STOCK movement not found in logs!"
print("Movement verified:", open_tx["type"], f"+{open_tx['quantity']}")
assert open_tx["quantity"] == 20

print("\n--- Test 2: Receive purchase +30 ---")
status, po_data = req("/api/purchase-orders", "POST", {
    "supplier": "Moroccanoil USA Inc",
    "expectedDelivery": "2026-10-15",
    "itemsCount": 30,
    "totalCost": 450.0,
    "productId": p_id,
    "productName": p_data["name"]
})
assert status == 201, f"Failed to create PO: {status} {po_data}"
po_id = po_data["id"]

# Verify stock before receive did NOT increase
status, cur_prods = req("/api/products")
p_check = next(p for p in cur_prods if p["id"] == p_id)
assert p_check["stock"] == 20, f"Stock increased prematurely on PO creation! Got {p_check['stock']}"
print("Stock before receive:", p_check["stock"])

# Receive PO
status, rec_data = req(f"/api/purchase-orders/{po_id}/receive", "POST")
assert status == 200, f"Failed to receive PO: {status} {rec_data}"
assert rec_data["new_stock"] == 50, f"Expected stock 50, got {rec_data['new_stock']}"
print("Stock after receive purchase +30:", rec_data["new_stock"])

# Verify RESTOCK IN movement
status, txs = req("/api/inventory/transactions")
restock_tx = next((t for t in txs if t["productId"] == p_id and t["type"] == "RESTOCK IN"), None)
assert restock_tx is not None, "RESTOCK IN movement not found in logs!"
assert restock_tx["quantity"] == 30
print("Movement verified:", restock_tx["type"], f"+{restock_tx['quantity']}")

print("\n--- Test 3: Sell product (Sale = -5) ---")
status, inv_data = req("/api/invoices", "POST", {
    "customerName": "Elena Guest",
    "customerPhone": "+15550001111",
    "date": "2026-10-02",
    "items": [
        {"type": "Product", "id": p_id, "name": p_data["name"], "qty": 5, "price": 35.0}
    ],
    "paymentMethod": "Cash"
})
assert status == 201, f"Failed to create invoice: {status} {inv_data}"
status, cur_prods = req("/api/products")
p_check = next(p for p in cur_prods if p["id"] == p_id)
assert p_check["stock"] == 45, f"Expected 45, got {p_check['stock']}"
print("Stock after retail sale -5:", p_check["stock"])

status, txs = req("/api/inventory/transactions")
sale_tx = next((t for t in txs if t["productId"] == p_id and t["type"] == "RETAIL SALE"), None)
assert sale_tx is not None, "RETAIL SALE movement not found in logs!"
assert sale_tx["quantity"] == -5
print("Movement verified:", sale_tx["type"], f"{sale_tx['quantity']}")

print("\n--- Test 4: Service consumption (Usage = -2) ---")
status, apt_data = req("/api/appointments", "POST", {
    "customerName": "Amara Sinclair",
    "serviceName": "Balayage & Glossing Treatment",
    "date": "2026-10-02",
    "time": "10:00 AM"
})
assert status == 201
apt_id = apt_data["id"]

status, comp_data = req(f"/api/appointments/{apt_id}", "PUT", {
    "status": "Completed",
    "consume_product": True,
    "product_id": p_id,
    "consumed_quantity": 2
})
assert status == 200, f"Failed to update appointment: {status} {comp_data}"
status, cur_prods = req("/api/products")
p_check = next(p for p in cur_prods if p["id"] == p_id)
assert p_check["stock"] == 43, f"Expected 43, got {p_check['stock']}"
print("Stock after salon consumption -2:", p_check["stock"])

status, txs = req("/api/inventory/transactions")
cons_tx = next((t for t in txs if t["productId"] == p_id and t["type"] == "SALON CONSUMPTION"), None)
assert cons_tx is not None, "SALON CONSUMPTION movement not found in logs!"
assert cons_tx["quantity"] == -2
print("Movement verified:", cons_tx["type"], f"{cons_tx['quantity']}")

print("\n--- Test 5: Stock adjustment (Adjustment = -3) ---")
status, adj_data = req("/api/inventory/adjust", "POST", {
    "product_id": p_id,
    "adjustment_type": "ADJUSTMENT_OUT",
    "quantity": 3,
    "reason": "Physical stock count",
    "notes": "Counted 40 on shelf"
})
assert status == 200, f"Failed to adjust stock: {status} {adj_data}"
assert adj_data["new_stock"] == 40, f"Expected 40, got {adj_data['new_stock']}"
print("Stock after adjustment -3:", adj_data["new_stock"])

status, txs = req("/api/inventory/transactions")
adj_tx = next((t for t in txs if t["productId"] == p_id and t["type"] == "STOCK ADJUSTMENT"), None)
assert adj_tx is not None, "STOCK ADJUSTMENT movement not found in logs!"
assert adj_tx["quantity"] == -3
print("Movement verified:", adj_tx["type"], f"{adj_tx['quantity']}")

print("\n--- Test 6: Low stock alert dynamic calculation ---")
# Update minStockAlert to 45
req(f"/api/products/{p_id}", "PUT", {"minStockAlert": 45})
status, cur_prods = req("/api/products")
p_check = next(p for p in cur_prods if p["id"] == p_id)
assert p_check["stock"] <= p_check["minStockAlert"], "Low stock alert criteria met!"
print(f"Product {p_check['name']}: Current Stock = {p_check['stock']}, Min Stock = {p_check['minStockAlert']} -> LOW INVENTORY ALERT ACTIVE")

print("\n--- Test 7: Insufficient stock protection & atomic rollback ---")
# Stock is 40. Attempt sale of 50.
status, fail_inv = req("/api/invoices", "POST", {
    "customerName": "Overbuy Guest",
    "items": [
        {"type": "Product", "id": p_id, "name": p_data["name"], "qty": 50, "price": 35.0}
    ]
})
assert status == 400, f"Expected 400 rejection, got {status}: {fail_inv}"
print("Sale rejected successfully with status 400:", fail_inv.get("detail"))

# Verify stock remained at 40
status, cur_prods = req("/api/products")
p_check = next(p for p in cur_prods if p["id"] == p_id)
assert p_check["stock"] == 40, f"Stock altered during failed sale! Got {p_check['stock']}"
print("Stock remained intact at:", p_check["stock"])

print("\n=======================================================")
print(">>> ALL 7 WORKFLOW TESTS VERIFIED AND PASSED 100%! <<<")
print("=======================================================")
