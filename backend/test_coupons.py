import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"

def http_req(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            try:
                return status, json.loads(content)
            except:
                return status, content
    except urllib.error.HTTPError as e:
        status = e.code
        content = e.read().decode("utf-8")
        try:
            return status, json.loads(content)
        except:
            return status, content
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("========== STARTING AUTOMATED COUPON TEST SUITE ==========")
    passed = 0
    total = 0

    # Test 1: Create WELCOME15 (or TEST_W15)
    total += 1
    code = "TEST_W15"
    payload = {
        "code": code,
        "title": "Welcome 15 Test Campaign",
        "description": "15% off welcome offer",
        "discount_type": "PERCENTAGE",
        "discount_value": 15.0,
        "minimum_spend": 1000.0,
        "maximum_discount": 500.0,
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "usage_limit": 100,
        "per_customer_limit": 1,
        "customer_eligibility": "ALL_CUSTOMERS",
        "applicable_to": "ENTIRE_BILL",
        "status": "ACTIVE"
    }
    status, res = http_req("POST", "/coupons", payload)
    if status == 201:
        print(f"TEST 1 PASSED: Created coupon {code} successfully (Status {status})")
        passed += 1
    elif status == 400 and "already exists" in str(res):
        print(f"TEST 1 PASSED: Coupon {code} exists and uniqueness check works.")
        passed += 1
    else:
        print(f"TEST 1 FAILED: {status} {res}")

    # Test 2: Cart = 800 (Min spend 1000 required)
    total += 1
    val_payload = {
        "code": code,
        "subtotal": 800.0,
        "items": [{"name": "Haircut", "type": "Service", "price": 800.0, "qty": 1}]
    }
    status, data = http_req("POST", "/coupons/validate", val_payload)
    if status == 200 and not data.get("valid") and "1,000" in data.get("message", ""):
        print(f"TEST 2 PASSED: Cart ₹800 rejected due to min spend: {data.get('message')}")
        passed += 1
    else:
        print(f"TEST 2 FAILED: Expected rejection, got {status} {data}")

    # Test 3: Cart = 2500 -> 15% = 375 discount
    total += 1
    val_payload = {
        "code": code,
        "subtotal": 2500.0,
        "items": [{"name": "Hair Spa", "type": "Service", "price": 2500.0, "qty": 1}]
    }
    status, data = http_req("POST", "/coupons/validate", val_payload)
    if status == 200 and data.get("valid") and data.get("discount") == 375.0:
        print(f"TEST 3 PASSED: Cart ₹2,500 yielded 15% = ₹{data.get('discount')} discount (Final: ₹{data.get('finalAmount')})")
        passed += 1
    else:
        print(f"TEST 3 FAILED: {status} {data}")

    # Test 4: Cart = 5000 -> 15% is 750, but max cap is 500
    total += 1
    val_payload = {
        "code": code,
        "subtotal": 5000.0,
        "items": [{"name": "Balayage Package", "type": "Service", "price": 5000.0, "qty": 1}]
    }
    status, data = http_req("POST", "/coupons/validate", val_payload)
    if status == 200 and data.get("valid") and data.get("discount") == 500.0:
        print(f"TEST 4 PASSED: Cart ₹5,000 capped discount at ₹{data.get('discount')} (Final: ₹{data.get('finalAmount')})")
        passed += 1
    else:
        print(f"TEST 4 FAILED: Expected ₹500 cap, got {status} {data}")

    # Test 5: Expired coupon
    total += 1
    exp_code = "TEST_EXPIRED"
    http_req("POST", "/coupons", {
        "code": exp_code,
        "title": "Expired Promo",
        "discount_type": "PERCENTAGE",
        "discount_value": 20.0,
        "valid_from": "2024-01-01",
        "valid_until": "2024-05-01",
        "status": "ACTIVE"
    })
    status, data = http_req("POST", "/coupons/validate", {"code": exp_code, "subtotal": 2000.0})
    if status == 200 and not data.get("valid") and "expired" in data.get("message", "").lower():
        print(f"TEST 5 PASSED: Expired coupon rejected: {data.get('message')}")
        passed += 1
    else:
        print(f"TEST 5 FAILED: {status} {data}")

    # Test 6: Scheduled coupon (valid_from in future)
    total += 1
    sched_code = "TEST_SCHED"
    http_req("POST", "/coupons", {
        "code": sched_code,
        "title": "Future Promo",
        "discount_type": "PERCENTAGE",
        "discount_value": 20.0,
        "valid_from": "2028-01-01",
        "valid_until": "2028-12-31",
        "status": "ACTIVE"
    })
    status, data = http_req("POST", "/coupons/validate", {"code": sched_code, "subtotal": 2000.0})
    if status == 200 and not data.get("valid") and "scheduled" in data.get("message", "").lower():
        print(f"TEST 6 PASSED: Scheduled coupon rejected: {data.get('message')}")
        passed += 1
    else:
        print(f"TEST 6 FAILED: {status} {data}")

    # Test 7: Usage limit reached (DEPLETED)
    total += 1
    dep_code = "TEST_DEPLETED"
    http_req("POST", "/coupons", {
        "code": dep_code,
        "title": "Depleted Promo",
        "discount_type": "PERCENTAGE",
        "discount_value": 10.0,
        "usage_limit": 1,
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "status": "ACTIVE"
    })
    # Use it once to reach limit of 1
    http_req("POST", "/invoices", {
        "customerName": "Depletion Guest",
        "customerPhone": "+91 99999 44444",
        "items": [{"name": "Wash", "type": "Service", "price": 500.0, "qty": 1}],
        "couponCode": dep_code,
        "paymentMethod": "Cash"
    })
    status, data = http_req("POST", "/coupons/validate", {"code": dep_code, "subtotal": 2000.0})
    if status == 200 and not data.get("valid") and "usage limit" in data.get("message", "").lower():
        print(f"TEST 7 PASSED: Depleted coupon rejected: {data.get('message')}")
        passed += 1
    else:
        print(f"TEST 7 FAILED: {status} {data}")

    # Test 8: New customer coupon used by existing customer
    total += 1
    newcust_code = "TEST_NEWCUST"
    http_req("POST", "/coupons", {
        "code": newcust_code,
        "title": "New Clients Only",
        "discount_type": "PERCENTAGE",
        "discount_value": 25.0,
        "customer_eligibility": "NEW_CUSTOMERS",
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "status": "ACTIVE"
    })
    status, data = http_req("POST", "/coupons/validate", {
        "code": newcust_code,
        "customer_phone": "+1 (555) 234-8901",
        "customer_name": "Elena Rostova",
        "subtotal": 2000.0
    })
    if status == 200 and not data.get("valid") and "new customers only" in data.get("message", "").lower():
        print(f"TEST 8 PASSED: New customer coupon rejected for existing client: {data.get('message')}")
        passed += 1
    else:
        print(f"TEST 8 FAILED: {status} {data}")

    # Test 9: Customer usage limit = 1. Customer uses coupon once. Second attempt rejected.
    total += 1
    per_cust_code = "TEST_PERCUST1"
    http_req("POST", "/coupons", {
        "code": per_cust_code,
        "title": "One Time Per Client",
        "discount_type": "PERCENTAGE",
        "discount_value": 20.0,
        "per_customer_limit": 1,
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "status": "ACTIVE"
    })
    inv_status, inv_res = http_req("POST", "/invoices", {
        "customerName": "Test Customer One",
        "customerPhone": "+91 99999 11111",
        "items": [{"name": "Hair Cut", "type": "Service", "price": 1000.0, "qty": 1}],
        "couponCode": per_cust_code,
        "paymentMethod": "Cash"
    })
    if inv_status == 201:
        s2, d2 = http_req("POST", "/coupons/validate", {
            "code": per_cust_code,
            "customer_phone": "+91 99999 11111",
            "subtotal": 1000.0
        })
        if not d2.get("valid") and "already used" in d2.get("message", "").lower():
            print(f"TEST 9 PASSED: Second attempt rejected by per-customer limit: {d2.get('message')}")
            passed += 1
        else:
            print(f"TEST 9 FAILED: Expected per-customer rejection, got {d2}")
    else:
        print(f"TEST 9 FAILED: Invoice creation failed {inv_status} {inv_res}")

    # Test 10: Coupon applied in POS. Payment / Invoice fails -> Redemption NOT recorded.
    total += 1
    fail_code = "TEST_FAIL_TX"
    http_req("POST", "/coupons", {
        "code": fail_code,
        "title": "Rollback Test",
        "discount_type": "PERCENTAGE",
        "discount_value": 10.0,
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "status": "ACTIVE"
    })
    fail_status, fail_inv = http_req("POST", "/invoices", {
        "customerName": "Fail Test Guest",
        "customerPhone": "+91 99999 22222",
        "items": [{"id": "prod-1", "name": "L'Oréal Shampoo", "type": "Product", "price": 50.0, "qty": 99999}],
        "couponCode": fail_code,
        "paymentMethod": "Cash"
    })
    _, red_res = http_req("GET", "/coupons/redemptions")
    reds = [r for r in red_res if r.get("coupon_code") == fail_code]
    if fail_status == 400 and len(reds) == 0:
        print(f"TEST 10 PASSED: Failed checkout rolled back cleanly, 0 redemptions recorded.")
        passed += 1
    else:
        print(f"TEST 10 FAILED: Expected rollback, got {fail_status}, red count: {len(reds)}")

    # Test 11: Coupon applied. Payment succeeds -> Redemption recorded.
    total += 1
    succ_code = "TEST_SUCC_TX"
    http_req("POST", "/coupons", {
        "code": succ_code,
        "title": "Success Checkout Test",
        "discount_type": "PERCENTAGE",
        "discount_value": 15.0,
        "minimum_spend": 500.0,
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "status": "ACTIVE"
    })
    succ_status, succ_inv = http_req("POST", "/invoices", {
        "customerName": "Success Guest",
        "customerPhone": "+91 99999 33333",
        "items": [{"name": "Facial", "type": "Service", "price": 1000.0, "qty": 1}],
        "couponCode": succ_code,
        "paymentMethod": "Credit Card"
    })
    _, red_res = http_req("GET", "/coupons/redemptions")
    reds = [r for r in red_res if r.get("coupon_code") == succ_code]
    if succ_status == 201 and len(reds) == 1:
        print(f"TEST 11 PASSED: Successful invoice created & redemption recorded: {reds[0].get('invoice_number')} (Discount: ₹{reds[0].get('discount_amount')})")
        passed += 1
    else:
        print(f"TEST 11 FAILED: {succ_status}, red count: {len(reds)}")

    # Test 13: Pause coupon -> Immediately rejected in POS
    total += 1
    pause_code = "TEST_PAUSE_TX"
    _, cr = http_req("POST", "/coupons", {
        "code": pause_code,
        "title": "Pause Test",
        "discount_type": "PERCENTAGE",
        "discount_value": 10.0,
        "valid_from": "2026-01-01",
        "valid_until": "2026-12-31",
        "status": "ACTIVE"
    })
    cid = cr.get("id")
    http_req("POST", f"/coupons/{cid}/pause")
    s_pause, d_pause = http_req("POST", "/coupons/validate", {"code": pause_code, "subtotal": 1000.0})
    if not d_pause.get("valid") and "paused" in d_pause.get("message", "").lower():
        print(f"TEST 13 PASSED: Paused coupon immediately rejected in POS: {d_pause.get('message')}")
        passed += 1
    else:
        print(f"TEST 13 FAILED: Expected paused rejection, got {d_pause}")

    # Test 14: Reactivate coupon
    total += 1
    s_react, rdata = http_req("POST", f"/coupons/{cid}/reactivate", {
        "valid_from": "2026-01-01",
        "valid_until": "2027-01-01",
        "usage_limit": 200
    })
    _, val_after = http_req("POST", "/coupons/validate", {"code": pause_code, "subtotal": 1000.0})
    if s_react == 200 and rdata.get("status") == "ACTIVE" and val_after.get("valid"):
        print(f"TEST 14 PASSED: Reactivated coupon successfully usable again: {val_after.get('message')}")
        passed += 1
    else:
        print(f"TEST 14 FAILED: {s_react} {rdata}")

    # Test Analytics: Database backed analytics
    total += 1
    s_ana, adata = http_req("GET", "/coupons/analytics")
    if s_ana == 200:
        print(f"ANALYTICS CHECK: Total Coupons: {adata.get('total_coupons')}, Total Redemptions: {adata.get('total_redemptions')}, Discount: ₹{adata.get('total_discount_given')}, Revenue: ₹{adata.get('revenue_generated')}")
        passed += 1
    else:
        print(f"ANALYTICS FAILED: {s_ana}")

    print(f"\n========== TEST SUITE COMPLETED: {passed}/{total} PASSED ==========")
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
