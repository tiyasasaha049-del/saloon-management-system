import uuid
from sqlalchemy.orm import Session
from models import (
    UserModel, BranchModel, ServiceModel, ProductModel, CustomerModel,
    EmployeeModel, OfferModel, NotificationModel, AuditLogModel, SettingsModel,
    DistributorModel, ProductPartnerModel, PartnershipRequestModel, PartnerProductModel,
    PartnershipCampaignModel, PartnershipCommissionModel, PartnershipPaymentModel,
    PartnershipDocumentModel, PartnershipActivityLogModel
)
from auth import get_password_hash

def seed_database(db: Session):
    # Seed Branch
    main_branch = db.query(BranchModel).filter(BranchModel.code == "BH-FLAGSHIP").first()
    if not main_branch:
        main_branch = BranchModel(
            id="br-001",
            name="Beverly Hills Flagship",
            code="BH-FLAGSHIP",
            address="9684 Wilshire Blvd",
            city="Beverly Hills",
            phone="+1 (310) 555-0199",
            email="beverly@luminaluxe.com",
            manager_name="Elena Rostova",
            status="Active"
        )
        db.add(main_branch)
        db.commit()

    # Seed Default Users
    users_data = [
        {"username": "admin", "email": "admin@luminaluxe.com", "name": "Alexander Vance", "role": "Super Admin"},
        {"username": "manager", "email": "manager@luminaluxe.com", "name": "Elena Rostova", "role": "Branch Manager"},
        {"username": "stylist", "email": "stylist@luminaluxe.com", "name": "Jean-Luc Piccard", "role": "Senior Stylist"},
        {"username": "receptionist", "email": "receptionist@luminaluxe.com", "name": "Sophia Martinez", "role": "Receptionist"},
        {"username": "customer", "email": "customer@luminaluxe.com", "name": "Ananya Sharma", "role": "Customer"},
    ]

    for u in users_data:
        existing = db.query(UserModel).filter(UserModel.username == u["username"]).first()
        if not existing:
            new_user = UserModel(
                id=f"usr-{uuid.uuid4().hex[:8]}",
                username=u["username"],
                email=u["email"],
                password_hash=get_password_hash("password123"),
                name=u["name"],
                role=u["role"],
                phone="+1 (555) 019-2831",
                branch_id=main_branch.id,
                is_active=True
            )
            db.add(new_user)
    db.commit()

    # Seed Initial Services if empty
    if db.query(ServiceModel).count() == 0:
        initial_services = [
            {"id": "srv-001", "name": "Haute Couture Hair Cut & Styling", "category": "Hair", "subCategory": "Cut & Styling", "price": 120.00, "duration": 60, "description": "Precision haircut tailored to facial anatomy followed by blow dry styling."},
            {"id": "srv-002", "name": "Balayage & Glossing Treatment", "category": "Hair", "subCategory": "Coloring", "price": 280.00, "duration": 150, "description": "Hand-painted dimensional highlights with custom gloss finish."},
            {"id": "srv-003", "name": "Keratin Silk Smoothing", "category": "Hair", "subCategory": "Treatments", "price": 350.00, "duration": 180, "description": "Frizz elimination and deep conditioning silk infusion."},
            {"id": "srv-004", "name": "Hydra-Radiance Diamond Facial", "category": "Skin & Spa", "subCategory": "Facial", "price": 195.00, "duration": 75, "description": "Advanced hydro-dermabrasion infused with hyaluronic peptides."},
            {"id": "srv-005", "name": "Gel Couture Manicure & Hand Spa", "category": "Nails", "subCategory": "Manicure", "price": 85.00, "duration": 45, "description": "Exfoliating hand treatment with gel enamel polish application."}
        ]
        for s in initial_services:
            db.add(ServiceModel(**s))
        db.commit()

    # Seed Initial Products if empty
    if db.query(ProductModel).count() == 0:
        initial_products = [
            {"id": "prod-001", "name": "Luxe Argan Elixir Serum 100ml", "brand": "Lumina Luxe", "category": "Hair Care", "sku": "LL-HAIR-001", "purchasePrice": 25.00, "sellingPrice": 65.00, "stock": 42, "quantity": 42, "minimumStock": 10},
            {"id": "prod-002", "name": "Keratin Repair Shampoo 500ml", "brand": "Lumina Luxe", "category": "Hair Care", "sku": "LL-HAIR-002", "purchasePrice": 18.00, "sellingPrice": 48.00, "stock": 35, "quantity": 35, "minimumStock": 10},
            {"id": "prod-003", "name": "Caviar Moisture Mask 250g", "brand": "Kérastase", "category": "Hair Care", "sku": "KER-MASK-01", "purchasePrice": 45.00, "sellingPrice": 110.00, "stock": 18, "quantity": 18, "minimumStock": 5},
            {"id": "prod-004", "name": "Diamond Radiance Serum 30ml", "brand": "Lumina Skin", "category": "Skin Care", "sku": "LL-SKIN-001", "purchasePrice": 55.00, "sellingPrice": 140.00, "stock": 14, "quantity": 14, "minimumStock": 5}
        ]
        for p in initial_products:
            db.add(ProductModel(**p))
        db.commit()

    # Seed Initial Customers if empty
    if db.query(CustomerModel).count() == 0:
        initial_customers = [
            {"id": "cust-001", "name": "Ananya Sharma", "phone": "+1 (555) 234-5678", "email": "ananya@example.com", "gender": "Female", "vipStatus": "Gold VIP", "visitsCount": 12, "totalSpent": 1850.00, "lastVisit": "2026-09-28"},
            {"id": "cust-002", "name": "Marcus Vance", "phone": "+1 (555) 876-5432", "email": "marcus@example.com", "gender": "Male", "vipStatus": "Platinum VIP", "visitsCount": 24, "totalSpent": 3400.00, "lastVisit": "2026-09-30"},
            {"id": "cust-003", "name": "Sophia Bennett", "phone": "+1 (555) 345-6789", "email": "sophia.b@example.com", "gender": "Female", "vipStatus": "Silver", "visitsCount": 5, "totalSpent": 620.00, "lastVisit": "2026-09-20"}
        ]
        for c in initial_customers:
            db.add(CustomerModel(**c))
        db.commit()

    # Seed Initial Employees if empty
    if db.query(EmployeeModel).count() == 0:
        initial_employees = [
            {"id": "emp-001", "name": "Jean-Luc Piccard", "role": "Senior Stylist", "designation": "Master Hair Architect", "phone": "+1 (555) 111-2222", "email": "jeanluc@luminaluxe.com", "salary": 6500.00, "status": "Active", "specialties": ["Balayage", "Haute Cut", "Keratin"], "branch_id": main_branch.id},
            {"id": "emp-002", "name": "Elena Rostova", "role": "Branch Manager", "designation": "General Operations Manager", "phone": "+1 (555) 333-4444", "email": "elena@luminaluxe.com", "salary": 7500.00, "status": "Active", "specialties": ["Management", "Client Relations"], "branch_id": main_branch.id},
            {"id": "emp-003", "name": "Sophia Martinez", "role": "Receptionist", "designation": "Concierge Specialist", "phone": "+1 (555) 555-6666", "email": "sophia@luminaluxe.com", "salary": 4200.00, "status": "Active", "specialties": ["POS Billing", "Scheduling"], "branch_id": main_branch.id}
        ]
        for e in initial_employees:
            db.add(EmployeeModel(**e))
        db.commit()

    # Seed Offers if empty
    if db.query(OfferModel).count() == 0:
        initial_offers = [
            {
                "id": "off-001",
                "title": "Autumn Glamour Festival",
                "code": "AUTUMN20",
                "description": "20% off on luxury salon hair, styling and skin services",
                "discount_type": "PERCENTAGE",
                "discount_value": 20.0,
                "discountPercent": 20.0,
                "minimum_spend": 1000.0,
                "maximum_discount": 500.0,
                "valid_from": "2026-09-01",
                "valid_until": "2026-11-30",
                "validTill": "2026-11-30",
                "usage_limit": 100,
                "used_count": 37,
                "per_customer_limit": 1,
                "customer_eligibility": "ALL_CUSTOMERS",
                "applicable_to": "ENTIRE_BILL",
                "status": "ACTIVE"
            },
            {
                "id": "off-002",
                "title": "First Time VIP Welcome",
                "code": "WELCOME15",
                "description": "Exclusive 15% welcome discount for new first-time salon guests",
                "discount_type": "PERCENTAGE",
                "discount_value": 15.0,
                "discountPercent": 15.0,
                "minimum_spend": 1000.0,
                "maximum_discount": 500.0,
                "valid_from": "2026-09-01",
                "valid_until": "2026-12-31",
                "validTill": "2026-12-31",
                "usage_limit": 100,
                "used_count": 12,
                "per_customer_limit": 1,
                "customer_eligibility": "NEW_CUSTOMERS",
                "applicable_to": "ENTIRE_BILL",
                "status": "ACTIVE"
            },
            {
                "id": "off-003",
                "title": "Couture Bridal Party Privilege",
                "code": "VIP25",
                "description": "Flat ₹500 off on bridal & makeover packages above ₹2500",
                "discount_type": "FIXED_AMOUNT",
                "discount_value": 500.0,
                "discountPercent": 20.0,
                "minimum_spend": 2500.0,
                "maximum_discount": 500.0,
                "valid_from": "2026-09-15",
                "valid_until": "2026-12-31",
                "validTill": "2026-12-31",
                "usage_limit": 50,
                "used_count": 18,
                "per_customer_limit": 1,
                "customer_eligibility": "VIP_CUSTOMERS",
                "applicable_to": "SERVICES_ONLY",
                "status": "ACTIVE"
            }
        ]
        for o in initial_offers:
            db.add(OfferModel(**o))
        db.commit()


    # Ensure demo inventory products exist
    demo_products = [
        {
            "id": "prod-1",
            "name": "Moroccanoil Treatment Original (100ml)",
            "brand": "Moroccanoil",
            "category": "Hair Care",
            "sku": "MO-TR-100",
            "purchasePrice": 24.0,
            "sellingPrice": 48.0,
            "stock": 28,
            "quantity": 28,
            "minStockAlert": 10,
            "minimumStock": 10,
            "supplier": "Moroccanoil USA Inc"
        },
        {
            "id": "prod-2",
            "name": "Olaplex No. 3 Hair Perfector",
            "brand": "Olaplex",
            "category": "Hair Care",
            "sku": "OLA-03-100",
            "purchasePrice": 16.5,
            "sellingPrice": 32.0,
            "stock": 19,
            "quantity": 19,
            "minStockAlert": 8,
            "minimumStock": 8,
            "supplier": "Olaplex Global Distribution"
        },
        {
            "id": "prod-3",
            "name": "L'Oréal Majirel Color Tube #7.1",
            "brand": "L'Oréal Professionnel",
            "category": "Hair Care",
            "sku": "LOR-MAJ-71",
            "purchasePrice": 18.0,
            "sellingPrice": 42.0,
            "stock": 22,
            "quantity": 22,
            "minStockAlert": 10,
            "minimumStock": 10,
            "supplier": "L'Oréal Luxury Pro Division"
        },
        {
            "id": "prod-6",
            "name": "OPI GelColor Alpine Snow & Nail Strengthener",
            "brand": "OPI Professional",
            "category": "Nails",
            "sku": "OPI-GEL-AS",
            "purchasePrice": 11.0,
            "sellingPrice": 24.0,
            "stock": 3,
            "quantity": 3,
            "minStockAlert": 8,
            "minimumStock": 8,
            "supplier": "OPI Nail Distributors USA"
        }
    ]
    for dp in demo_products:
        p_exist = db.query(ProductModel).filter(ProductModel.id == dp["id"]).first()
        if not p_exist:
            db.add(ProductModel(**dp))
    db.commit()

    # Seed Inventory Transactions if empty
    from models import InventoryTransactionModel, PurchaseOrderModel
    if db.query(InventoryTransactionModel).count() == 0:
        demo_txs = [
            {
                "id": "log-1",
                "product_id": "prod-3",
                "product_name": "L'Oréal Majirel Color Tube #7.1",
                "transaction_type": "SALON CONSUMPTION",
                "quantity": -1,
                "previous_stock": 23,
                "new_stock": 22,
                "reference": "APT-1082 (Balayage formula)",
                "authorized_user": "Julian Vance",
                "notes": "Used during Balayage service"
            },
            {
                "id": "log-2",
                "product_id": "prod-1",
                "product_name": "Moroccanoil Treatment Original (100ml)",
                "transaction_type": "RETAIL SALE",
                "quantity": -2,
                "previous_stock": 30,
                "new_stock": 28,
                "reference": "INV-2026-004",
                "authorized_user": "Sophia Chen",
                "notes": "Sold via POS"
            },
            {
                "id": "log-3",
                "product_id": "prod-2",
                "product_name": "Olaplex No. 3 Hair Perfector",
                "transaction_type": "RESTOCK IN",
                "quantity": 15,
                "previous_stock": 4,
                "new_stock": 19,
                "reference": "PO-2026-092",
                "authorized_user": "Victoria Sterling",
                "notes": "Shipment received"
            }
        ]
        for tx in demo_txs:
            db.add(InventoryTransactionModel(**tx))
        db.commit()

    # Seed Purchase Orders if empty
    if db.query(PurchaseOrderModel).count() == 0:
        demo_pos = [
            {
                "id": "po-1",
                "code": "PO-2026-092",
                "supplier": "L'Oréal Luxury Pro Division",
                "orderDate": "2026-09-26",
                "expectedDelivery": "2026-10-02",
                "itemsCount": 45,
                "totalCost": 1480.0,
                "status": "RECEIVED",
                "paymentTerms": "Net 30 Days"
            },
            {
                "id": "po-2",
                "code": "PO-2026-095",
                "supplier": "OPI Nail Distributors USA",
                "orderDate": "2026-09-29",
                "expectedDelivery": "2026-10-04",
                "itemsCount": 24,
                "totalCost": 320.0,
                "status": "ORDERED",
                "paymentTerms": "Prepaid CC",
                "product_id": "prod-6",
                "product_name": "OPI GelColor Alpine Snow & Nail Strengthener"
            }
        ]
        for po in demo_pos:
            db.add(PurchaseOrderModel(**po))
        db.commit()

    # Seed Distributors if empty
    if db.query(DistributorModel).count() == 0:
        initial_distributors = [
            {
                "id": "dist-001",
                "name": "L'Oréal Luxury Pro Division",
                "contactPerson": "Jean-Marc Laurent",
                "phone": "+1 (555) 349-2041",
                "email": "orders@loreal-luxurypro.com",
                "address": "10 Hudson Yards, New York, NY 10001",
                "leadTimeDays": 4,
                "category": "Hair Care & Color",
                "status": "Active",
                "notes": "Primary supplier for Majirel, Serie Expert, and SteamPod lines."
            },
            {
                "id": "dist-002",
                "name": "Olaplex Global Distribution",
                "contactPerson": "Sarah Jenkins",
                "phone": "+1 (555) 482-9012",
                "email": "supply@olaplexdistribution.com",
                "address": "1187 Coast Village Rd, Santa Barbara, CA 93108",
                "leadTimeDays": 5,
                "category": "Bond Building & Repair",
                "status": "Active",
                "notes": "Authorized distributor for salon backbar No. 1, 2 and retail No. 3-8."
            },
            {
                "id": "dist-003",
                "name": "OPI Nail Distributors USA",
                "contactPerson": "David Kim",
                "phone": "+1 (555) 671-8843",
                "email": "orders@opidistributors-usa.com",
                "address": "4500 Park Granada, Calabasas, CA 91302",
                "leadTimeDays": 3,
                "category": "Nails & Lacquers",
                "status": "Active",
                "notes": "GelColor, Infinite Shine, ProSpa manicure lines."
            },
            {
                "id": "dist-004",
                "name": "Dermalogica Direct USA",
                "contactPerson": "Elena Fischer",
                "phone": "+1 (555) 893-1120",
                "email": "concierge@dermalogicadirect.com",
                "address": "1 Dermalogica Way, Carson, CA 90746",
                "leadTimeDays": 6,
                "category": "Skin Care & Peels",
                "status": "Active",
                "notes": "Professional skin treatment backbar systems & Daily Microfoliant."
            },
            {
                "id": "dist-005",
                "name": "Moroccanoil USA Inc",
                "contactPerson": "Marcus Sterling",
                "phone": "+1 (555) 219-7754",
                "email": "wholesale@moroccanoil-usa.com",
                "address": "135 E 57th St, New York, NY 10022",
                "leadTimeDays": 4,
                "category": "Argan Oil & Styling",
                "status": "Active",
                "notes": "Moroccanoil Treatment, Moisture Repair, and Glimmer Shine."
            }
        ]
        for d in initial_distributors:
            db.add(DistributorModel(**d))
        db.commit()

    # Seed Initial Product Partners if empty
    if db.query(ProductPartnerModel).count() == 0:
        initial_partners = [
            {
                "id": "ptn-001",
                "partner_code": "PTN-001",
                "company_name": "L'Oréal Luxe India Pvt Ltd",
                "brand_name": "L'Oréal Professionnel",
                "contact_person": "Vikram Malhotra",
                "phone": "+91 98201 54321",
                "email": "partnerships@loreal.in",
                "website": "https://www.lorealprofessionnel.in",
                "address": "B-Wing, Marathon Futurex, Lower Parel",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "tax_id": "27AABCL1234F1Z8",
                "category": "Hair Care & Color",
                "partnership_type": "Product Promotion",
                "start_date": "2026-01-01",
                "end_date": "2027-12-31",
                "commission_type": "Percentage",
                "commission_rate": 10.0,
                "revenue_share": 12.5,
                "payment_terms": "Net 30 Days",
                "status": "Active",
                "description": "Strategic salon partnership for Majirel luxury color bar and Serie Expert retail showcase.",
                "notes": "Top tier platinum collaboration partner. Co-branded styling events quarterly.",
                "logo_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "ptn-002",
                "partner_code": "PTN-002",
                "company_name": "Olaplex Global Beauty Distribution",
                "brand_name": "Olaplex",
                "contact_person": "Sarah Jenkins",
                "phone": "+91 98112 34567",
                "email": "collaborations@olaplex.com",
                "website": "https://olaplex.com",
                "address": "Level 8, Cyber City",
                "city": "Gurugram",
                "state": "Haryana",
                "country": "India",
                "tax_id": "06AABCO9876K1Z3",
                "category": "Bond Building & Repair",
                "partnership_type": "Retail Partnership",
                "start_date": "2026-02-15",
                "end_date": "2027-02-14",
                "commission_type": "Percentage",
                "commission_rate": 12.0,
                "revenue_share": 15.0,
                "payment_terms": "Net 15 Days",
                "status": "Active",
                "description": "Exclusive backbar bond multiplier services and client take-home No.3 retail display.",
                "notes": "High retail conversion. Weekly staff masterclasses included.",
                "logo_url": "https://images.unsplash.com/photo-1608248597359-54859a850125?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "ptn-003",
                "partner_code": "PTN-003",
                "company_name": "Moroccanoil India Direct",
                "brand_name": "Moroccanoil",
                "contact_person": "Marcus Sterling",
                "phone": "+91 97170 88990",
                "email": "salonconnect@moroccanoil.com",
                "website": "https://www.moroccanoil.com",
                "address": "401, Bandra Kurla Complex",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "tax_id": "27AABCM6543Q1Z2",
                "category": "Argan Oil & Styling",
                "partnership_type": "Co-Marketing",
                "start_date": "2026-03-01",
                "end_date": "2026-12-31",
                "commission_type": "Percentage",
                "commission_rate": 10.0,
                "revenue_share": 10.0,
                "payment_terms": "Net 30 Days",
                "status": "Active",
                "description": "Moroccanoil signature blow-dry lounge and gift bundle collaborations.",
                "notes": "Co-funding in-salon digital signage and client sampling sachets.",
                "logo_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "ptn-004",
                "partner_code": "PTN-004",
                "company_name": "Kérastase Luxury Paris Division",
                "brand_name": "Kérastase",
                "contact_person": "Camille Bernard",
                "phone": "+91 99887 66554",
                "email": "camille@kerastase.in",
                "website": "https://www.kerastase.in",
                "address": "UB City, Vittal Mallya Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "country": "India",
                "tax_id": "29AABCK4321P1Z9",
                "category": "Luxury Hair Care",
                "partnership_type": "Exclusive Partnership",
                "start_date": "2026-04-01",
                "end_date": "2028-03-31",
                "commission_type": "Percentage",
                "commission_rate": 15.0,
                "revenue_share": 18.0,
                "payment_terms": "Net 45 Days",
                "status": "Active",
                "description": "Kérastase Fusio-Dose diagnostic bar and bespoke Caviar treatments.",
                "notes": "Premier luxury hair care partner with 15% salon margin commission.",
                "logo_url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "ptn-005",
                "partner_code": "PTN-005",
                "company_name": "Dyson Technology India Pvt Ltd",
                "brand_name": "Dyson Professional",
                "contact_person": "Aditya Rao",
                "phone": "+91 91234 56780",
                "email": "prohair@dyson.in",
                "website": "https://www.dyson.in",
                "address": "DLF Horizon Centre, Golf Course Rd",
                "city": "Gurugram",
                "state": "Haryana",
                "country": "India",
                "tax_id": "06AABCD1122E1Z5",
                "category": "Hair Styling Technology",
                "partnership_type": "Brand Promotion",
                "start_date": "2026-05-01",
                "end_date": "2027-04-30",
                "commission_type": "Percentage",
                "commission_rate": 8.0,
                "revenue_share": 8.0,
                "payment_terms": "Net 15 Days",
                "status": "Active",
                "description": "Supersonic R and Corrale professional stations equipped across all stylist chairs.",
                "notes": "Stylists earn referral bonuses when clients purchase styling tools.",
                "logo_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80"
            }
        ]
        for p in initial_partners:
            db.add(ProductPartnerModel(**p))
        db.commit()

    # Seed Partnership Requests if empty
    if db.query(PartnershipRequestModel).count() == 0:
        initial_requests = [
            {
                "id": "req-001",
                "request_code": "REQ-001",
                "company_name": "Forest Essentials Ayurveda",
                "brand_name": "Forest Essentials",
                "contact_person": "Pooja Singhania",
                "phone": "+91 98450 12345",
                "email": "retail@forestessentials.com",
                "website": "https://www.forestessentialsindia.com",
                "product_category": "Organic Hair & Scalp Oils",
                "partnership_type": "Co-Marketing",
                "proposal": "Launch a traditional Ayurvedic Head Massage & Soundarya hair oil ritual within salon private spa suites.",
                "status": "Pending",
                "submitted_date": "2026-09-25",
                "review_notes": "Very strong brand synergy with our VIP wellness clientele. Evaluating salon spa menu integration."
            },
            {
                "id": "req-002",
                "request_code": "REQ-002",
                "company_name": "Wella Company India",
                "brand_name": "Wella Professionals",
                "contact_person": "Karan Kapoor",
                "phone": "+91 98765 43210",
                "email": "karan.kapoor@wella.com",
                "website": "https://www.wella.com",
                "product_category": "Hair Color & Care",
                "partnership_type": "Product Supply",
                "proposal": "Supply Koleston Perfect Me+ color tubes with 12% retail margin and dedicated master colorist training.",
                "status": "Under Review",
                "submitted_date": "2026-09-29",
                "review_notes": "Proposal reviewed with head stylist Jean-Luc. Testing shade swatch durability."
            },
            {
                "id": "req-003",
                "request_code": "REQ-003",
                "company_name": "GHD Hair UK & India",
                "brand_name": "GHD Professional",
                "contact_person": "Rachel Scott",
                "phone": "+91 99100 22334",
                "email": "rachel@ghdhair.com",
                "website": "https://www.ghdhair.com",
                "product_category": "Electrical Hair Styling",
                "partnership_type": "Retail Partnership",
                "proposal": "Partner for GHD Chronos styler retail display and bridal styling workshop sponsorship.",
                "status": "Approved",
                "submitted_date": "2026-09-18",
                "review_notes": "Approved by management. Converting into active partnership agreement.",
                "reviewed_by": "Alexander Vance"
            }
        ]
        for r in initial_requests:
            db.add(PartnershipRequestModel(**r))
        db.commit()

    # Seed Partner Products (Linked to existing ProductModel products without duplicating!)
    if db.query(PartnerProductModel).count() == 0:
        partner_products_data = [
            {
                "id": "pprd-001",
                "partner_id": "ptn-001",
                "product_id": "prod-3",  # Existing L'Oréal Majirel Color Tube #7.1
                "product_name": "L'Oréal Majirel Color Tube #7.1",
                "sku": "LOR-MAJ-71",
                "category": "Hair Care",
                "brand": "L'Oréal Professionnel",
                "purchase_price": 18.0,
                "selling_price": 42.0,
                "commission_rate": 10.0,
                "start_date": "2026-01-01",
                "end_date": "2027-12-31",
                "status": "Active"
            },
            {
                "id": "pprd-002",
                "partner_id": "ptn-002",
                "product_id": "prod-2",  # Existing Olaplex No. 3 Hair Perfector
                "product_name": "Olaplex No. 3 Hair Perfector",
                "sku": "OLA-03-100",
                "category": "Hair Care",
                "brand": "Olaplex",
                "purchase_price": 16.5,
                "selling_price": 32.0,
                "commission_rate": 12.0,
                "start_date": "2026-02-15",
                "end_date": "2027-02-14",
                "status": "Active"
            },
            {
                "id": "pprd-003",
                "partner_id": "ptn-003",
                "product_id": "prod-1",  # Existing Moroccanoil Treatment Original
                "product_name": "Moroccanoil Treatment Original (100ml)",
                "sku": "MO-TR-100",
                "category": "Hair Care",
                "brand": "Moroccanoil",
                "purchase_price": 24.0,
                "selling_price": 48.0,
                "commission_rate": 10.0,
                "start_date": "2026-03-01",
                "end_date": "2026-12-31",
                "status": "Active"
            },
            {
                "id": "pprd-004",
                "partner_id": "ptn-004",
                "product_id": "prod-003",  # Existing Caviar Moisture Mask
                "product_name": "Caviar Moisture Mask 250g",
                "sku": "KER-MASK-01",
                "category": "Hair Care",
                "brand": "Kérastase",
                "purchase_price": 45.0,
                "selling_price": 110.0,
                "commission_rate": 15.0,
                "start_date": "2026-04-01",
                "end_date": "2028-03-31",
                "status": "Active"
            }
        ]
        for pp in partner_products_data:
            db.add(PartnerProductModel(**pp))
        db.commit()

    # Seed Partnership Campaigns if empty
    if db.query(PartnershipCampaignModel).count() == 0:
        campaigns_data = [
            {
                "id": "cmp-001",
                "campaign_code": "CMP-001",
                "name": "L'Oréal Autumn Gloss & Glow",
                "partner_id": "ptn-001",
                "campaign_type": "Product Promotion",
                "start_date": "2026-09-01",
                "end_date": "2026-10-31",
                "description": "Special promotion bundling Majirel hair color services with complimentary Serie Expert conditioning gloss.",
                "discount": 15.0,
                "promo_code": "LOREALGLOW",
                "target_sales": 150000.0,
                "budget": 25000.0,
                "salon_contribution": 10000.0,
                "partner_contribution": 15000.0,
                "marketing_channels": ["Website", "Salon", "Instagram", "WhatsApp"],
                "product_ids": ["prod-3"],
                "status": "Active"
            },
            {
                "id": "cmp-002",
                "campaign_code": "CMP-002",
                "name": "Olaplex Healthy Hair Bond Week",
                "partner_id": "ptn-002",
                "campaign_type": "Salon Promotion",
                "start_date": "2026-10-01",
                "end_date": "2026-10-20",
                "description": "Complimentary No.1 & No.2 bond strengthener add-on for any full color transformation or balayage booking.",
                "discount": 10.0,
                "promo_code": "OLABOND",
                "target_sales": 80000.0,
                "budget": 18000.0,
                "salon_contribution": 6000.0,
                "partner_contribution": 12000.0,
                "marketing_channels": ["Instagram", "In-Salon Display", "Email"],
                "product_ids": ["prod-2"],
                "status": "Active"
            },
            {
                "id": "cmp-003",
                "campaign_code": "CMP-003",
                "name": "Moroccanoil Argan Silk Hydration Fest",
                "partner_id": "ptn-003",
                "campaign_type": "Festival Campaign",
                "start_date": "2026-10-15",
                "end_date": "2026-11-15",
                "description": "Festive season gift boxes featuring Moroccanoil treatment and luminous hairspray with free scalp massage.",
                "discount": 12.0,
                "promo_code": "ARGANFEST",
                "target_sales": 120000.0,
                "budget": 20000.0,
                "salon_contribution": 8000.0,
                "partner_contribution": 12000.0,
                "marketing_channels": ["Salon", "WhatsApp", "SMS", "In-Salon Display"],
                "product_ids": ["prod-1"],
                "status": "Scheduled"
            }
        ]
        for c in campaigns_data:
            db.add(PartnershipCampaignModel(**c))
        db.commit()

    # Seed Partnership Commissions if empty
    if db.query(PartnershipCommissionModel).count() == 0:
        commissions_data = [
            {
                "id": "com-1001",
                "partner_id": "ptn-001",
                "product_id": "prod-3",
                "campaign_id": "cmp-001",
                "invoice_number": "INV-2026-0001",
                "sale_amount": 50000.0,
                "commission_rate": 10.0,
                "commission_amount": 5000.0,
                "period": "September 2026",
                "status": "Approved",
                "payment_status": "Paid",
                "notes": "Commission calculated for September salon promo color units."
            },
            {
                "id": "com-1002",
                "partner_id": "ptn-002",
                "product_id": "prod-2",
                "campaign_id": "cmp-002",
                "invoice_number": "INV-2026-0002",
                "sale_amount": 38400.0,
                "commission_rate": 12.0,
                "commission_amount": 4608.0,
                "period": "September 2026",
                "status": "Approved",
                "payment_status": "Paid",
                "notes": "September Olaplex No.3 take-home product sales commission."
            },
            {
                "id": "com-1003",
                "partner_id": "ptn-001",
                "product_id": "prod-3",
                "campaign_id": "cmp-001",
                "invoice_number": "INV-2026-0003",
                "sale_amount": 75000.0,
                "commission_rate": 10.0,
                "commission_amount": 7500.0,
                "period": "October 2026",
                "status": "Approved",
                "payment_status": "Pending",
                "notes": "October first fortnight Majirel promotion sales."
            },
            {
                "id": "com-1004",
                "partner_id": "ptn-003",
                "product_id": "prod-1",
                "campaign_id": "cmp-003",
                "invoice_number": "INV-2026-0004",
                "sale_amount": 48000.0,
                "commission_rate": 10.0,
                "commission_amount": 4800.0,
                "period": "October 2026",
                "status": "Calculated",
                "payment_status": "Pending",
                "notes": "Moroccanoil festive preorder sales."
            }
        ]
        for cm in commissions_data:
            db.add(PartnershipCommissionModel(**cm))
        db.commit()

    # Seed Partnership Payments if empty
    if db.query(PartnershipPaymentModel).count() == 0:
        payments_data = [
            {
                "id": "pay-1001",
                "payment_code": "PAY-1001",
                "partner_id": "ptn-001",
                "commission_id": "com-1001",
                "amount": 5000.0,
                "payment_date": "2026-09-30",
                "payment_method": "Bank Transfer",
                "reference_number": "NEFT-HDFC-9928114",
                "status": "Paid",
                "notes": "Monthly settlement for September 2026 product commission.",
                "recorded_by": "Alexander Vance"
            },
            {
                "id": "pay-1002",
                "payment_code": "PAY-1002",
                "partner_id": "ptn-002",
                "commission_id": "com-1002",
                "amount": 4608.0,
                "payment_date": "2026-10-01",
                "payment_method": "UPI",
                "reference_number": "UPI-ICICI-8827361",
                "status": "Paid",
                "notes": "September commission payout to Olaplex distribution account.",
                "recorded_by": "Alexander Vance"
            }
        ]
        for py in payments_data:
            db.add(PartnershipPaymentModel(**py))
        db.commit()

    # Seed Partnership Documents if empty
    if db.query(PartnershipDocumentModel).count() == 0:
        docs_data = [
            {
                "id": "doc-1001",
                "partner_id": "ptn-001",
                "document_name": "L'Oréal Master Partnership Agreement 2026-2027.pdf",
                "document_type": "Agreement",
                "file_url": "https://luminaluxe.com/docs/partnerships/loreal-contract-2026.pdf",
                "upload_date": "2026-01-05",
                "notes": "Fully countersigned agreement with 10% commission and quarterly review clauses."
            },
            {
                "id": "doc-1002",
                "partner_id": "ptn-002",
                "document_name": "Olaplex Authorized Salon Certificate & NDA.pdf",
                "document_type": "Certificate",
                "file_url": "https://luminaluxe.com/docs/partnerships/olaplex-cert-2026.pdf",
                "upload_date": "2026-02-20",
                "notes": "Authorized Premier Salon Partner badge and salon display collateral guidelines."
            }
        ]
        for d in docs_data:
            db.add(PartnershipDocumentModel(**d))
        db.commit()

    # Seed Partnership Activity Logs if empty
    if db.query(PartnershipActivityLogModel).count() == 0:
        activity_data = [
            {
                "id": "act-1001",
                "partner_id": "ptn-001",
                "action": "Partner Created",
                "details": "L'Oréal Professionnel onboarded with 10% base commission agreement.",
                "user_name": "Alexander Vance"
            },
            {
                "id": "act-1002",
                "partner_id": "ptn-001",
                "action": "Product Linked",
                "details": "Linked product L'Oréal Majirel Color Tube #7.1 (SKU: LOR-MAJ-71).",
                "user_name": "Alexander Vance"
            },
            {
                "id": "act-1003",
                "partner_id": "ptn-001",
                "action": "Campaign Created",
                "details": "Launched L'Oréal Autumn Gloss & Glow promotion.",
                "user_name": "Elena Rostova"
            },
            {
                "id": "act-1004",
                "partner_id": "ptn-001",
                "action": "Payment Completed",
                "details": "Disbursed ₹5,000 commission payout via Bank Transfer (Ref: NEFT-HDFC-9928114).",
                "user_name": "Alexander Vance"
            }
        ]
        for a in activity_data:
            db.add(PartnershipActivityLogModel(**a))
        db.commit()


