import sys
import os
import uuid
from datetime import datetime
from typing import List, Optional, Any
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database import engine, get_db, Base
from config import HOST, PORT, ALLOWED_ORIGINS, ENVIRONMENT
from models import (
    UserModel, BranchModel, ProductModel, ServiceModel, CustomerModel,
    EmployeeModel, AppointmentModel, AttendanceModel, PayrollModel,
    InvoiceModel, InvoiceItemModel, InventoryTransactionModel,
    PurchaseOrderModel, PurchaseOrderItemModel, DistributorModel,
    HomeServiceModel, ReviewModel, OfferModel, CouponRedemptionModel, NotificationModel,
    AuditLogModel, SettingsModel,
    ProductPartnerModel, PartnershipRequestModel, PartnerProductModel,
    PartnershipCampaignModel, PartnershipCommissionModel, PartnershipPaymentModel,
    PartnershipDocumentModel, PartnershipActivityLogModel
)
from schemas import (
    UserLoginSchema, TokenResponseSchema, UserSchema, UserCreateSchema,
    BranchSchema, ProductSchema, ServiceSchema, CustomerSchema,
    EmployeeSchema, AppointmentSchema, AttendanceSchema, PayrollSchema,
    InvoiceSchema, HomeServiceSchema, ReviewSchema, OfferSchema,
    NotificationSchema, AuditLogSchema, SettingsSchema, InventoryTransactionSchema,
    StockAdjustmentSchema, PurchaseOrderSchema, PurchaseOrderItemSchema, DistributorSchema,
    CouponValidateRequestSchema, CouponValidateResponseSchema,
    CouponReactivateSchema, CouponRedemptionSchema,
    ProductPartnerSchema, PartnershipRequestSchema, PartnerProductSchema,
    PartnershipCampaignSchema, PartnershipCommissionSchema, PartnershipPaymentSchema,
    PartnershipDocumentSchema, PartnershipActivityLogSchema
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_roles
)
from seed import seed_database

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Auto-seed initial data if empty
try:
    with Session(engine) as seed_db:
        seed_database(seed_db)
except Exception as e:
    print(f"[SEED WARNING] Seed failed or tables already populated: {e}")

app = FastAPI(
    title="Lumina Luxe Salon Enterprise ERP API",
    description="Production Ready FastAPI & MySQL/SQLAlchemy Backend with JWT Security & Operational Integrity",
    version="3.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Audit Log function
def create_audit_record(db: Session, action: str, module: str, details: str, user: Optional[UserModel] = None, entity_type: str = "", entity_id: str = ""):
    log_id = f"aud-{uuid.uuid4().hex[:8]}"
    db_log = AuditLogModel(
        id=log_id,
        user_id=user.id if user else "system",
        user_name=user.name if user else "System",
        role=user.role if user else "System",
        action=action,
        module=module,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(db_log)
    db.commit()

# Helper Invoice Number Generator
def generate_invoice_number(db: Session) -> str:
    current_year = datetime.utcnow().strftime("%Y")
    count = db.query(InvoiceModel).filter(InvoiceModel.invoiceNumber.like(f"INV-{current_year}-%")).count()
    return f"INV-{current_year}-{String(count + 1).zfill(4) if 'String' in globals() else str(count + 1).zfill(4)}"

# ==================== ROOT & HEALTH CHECK ====================
@app.get("/")
def read_root():
    return {
        "app": "Lumina Luxe Salon Enterprise ERP API",
        "status": "Online",
        "version": "3.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Salon ERP Backend API"}

@app.get("/api/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(func.now())
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# ==================== AUTHENTICATION API ====================
@app.post("/api/auth/login", response_model=TokenResponseSchema)
def login(credentials: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(
        or_(UserModel.username == credentials.username, UserModel.email == credentials.username)
    ).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    token = create_access_token({"sub": user.id, "username": user.username, "role": user.role})
    create_audit_record(db, "LOGIN", "Auth", f"User {user.username} logged in successfully", user=user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserSchema)
def get_current_user_profile(current_user: UserModel = Depends(get_current_user)):
    return current_user

@app.get("/api/users", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager"]))):
    return db.query(UserModel).all()

@app.post("/api/users", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreateSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin"]))):
    existing = db.query(UserModel).filter(
        or_(UserModel.username == user_in.username, UserModel.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    usr_id = f"usr-{uuid.uuid4().hex[:8]}"
    db_user = UserModel(
        id=usr_id,
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        phone=user_in.phone,
        branch_id=user_in.branch_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    create_audit_record(db, "CREATE_USER", "Users", f"Created user {user_in.username} ({user_in.role})", user=current_user, entity_id=usr_id)
    return db_user

# ==================== BRANCHES API ====================
@app.get("/api/branches", response_model=List[BranchSchema])
def get_branches(db: Session = Depends(get_db)):
    return db.query(BranchModel).all()

@app.post("/api/branches", response_model=BranchSchema, status_code=status.HTTP_201_CREATED)
def create_branch(branch: BranchSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin"]))):
    br_id = branch.id or f"br-{uuid.uuid4().hex[:8]}"
    db_branch = BranchModel(
        id=br_id,
        name=branch.name,
        code=branch.code,
        address=branch.address,
        city=branch.city,
        phone=branch.phone,
        email=branch.email,
        manager_name=branch.manager_name,
        status=branch.status or "Active"
    )
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

# ==================== PRODUCTS API ====================
@app.get("/api/products", response_model=List[ProductSchema])
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductModel)
    if search:
        query = query.filter(or_(ProductModel.name.ilike(f"%{search}%"), ProductModel.sku.ilike(f"%{search}%")))
    if category:
        query = query.filter(ProductModel.category == category)
    return query.all()

@app.post("/api/products", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager"]))):
    prod_id = product.id or f"prod-{uuid.uuid4().hex[:8]}"
    db_product = ProductModel(
        id=prod_id,
        name=product.name,
        brand=product.brand,
        category=product.category,
        subcategory=product.subcategory,
        sku=product.sku or f"SKU-{uuid.uuid4().hex[:6].upper()}",
        barcode=product.barcode,
        purchasePrice=product.purchasePrice or 0.0,
        costPrice=product.costPrice or product.purchasePrice or 0.0,
        sellingPrice=product.sellingPrice or 0.0,
        retailPrice=product.retailPrice or product.sellingPrice or 0.0,
        tax=product.tax or 18.0,
        stock=product.stock or product.quantity or 0,
        quantity=product.stock or product.quantity or 0,
        minimumStock=product.minimumStock or 5,
        minStockAlert=product.minStockAlert or product.minimumStock or 5,
        batch=product.batch,
        expiry=product.expiry,
        supplier=product.supplier,
        type=product.type or "Retail",
        status=product.status or "Active",
        image=product.image,
        images=product.images or ([product.image] if product.image else [])
    )
    db.add(db_product)
    
    # If opening stock > 0, create OPENING STOCK inventory transaction
    init_stock = int(db_product.stock or 0)
    if init_stock > 0:
        tx_id = f"itx-{uuid.uuid4().hex[:8]}"
        tx = InventoryTransactionModel(
            id=tx_id,
            product_id=db_product.id,
            product_name=db_product.name,
            transaction_type="OPENING STOCK",
            quantity=init_stock,
            previous_stock=0,
            new_stock=init_stock,
            reference="Initial Stock Setup",
            notes=f"Opening stock initialized at {init_stock} units",
            authorized_user=current_user.name
        )
        db.add(tx)

    db.commit()
    db.refresh(db_product)

    create_audit_record(db, "CREATE_PRODUCT", "Inventory", f"Created product {product.name} (Opening Stock: {init_stock})", user=current_user, entity_id=prod_id)
    return db_product


@app.put("/api/products/{product_id}")
def update_product(product_id: str, product_data: dict, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager"]))):
    db_prod = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Product not found")

    data = product_data
    if "stock" in data and data["stock"] != db_prod.stock:
        # Record inventory adjustment transaction
        diff = data["stock"] - db_prod.stock
        tx_type = "RESTOCK" if diff > 0 else "ADJUSTMENT"
        tx = InventoryTransactionModel(
            id=f"itx-{uuid.uuid4().hex[:8]}",
            product_id=db_prod.id,
            product_name=db_prod.name,
            transaction_type=tx_type,
            quantity=abs(diff),
            previous_stock=db_prod.stock,
            new_stock=data["stock"],
            notes=f"Stock updated manually by {current_user.name}"
        )
        db.add(tx)

    for key, value in data.items():
        if hasattr(db_prod, key):
            setattr(db_prod, key, value)

    db.commit()
    db.refresh(db_prod)
    return db_prod

@app.delete("/api/products/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager"]))):
    db_prod = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_prod)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}

# ==================== INVENTORY TRANSACTIONS & STOCK CONTROL API ====================
@app.get("/api/inventory/transactions")
def get_inventory_transactions(db: Session = Depends(get_db)):
    txs = db.query(InventoryTransactionModel).order_by(InventoryTransactionModel.createdAt.desc()).all()
    results = []
    for t in txs:
        date_str = t.createdAt.strftime("%Y-%m-%d %I:%M %p") if t.createdAt else datetime.utcnow().strftime("%Y-%m-%d %I:%M %p")
        results.append({
            "id": t.id,
            "date": date_str,
            "productId": t.product_id,
            "productName": t.product_name,
            "type": t.transaction_type,
            "quantity": t.quantity,
            "loggedBy": t.authorized_user or "System",
            "reference": t.reference or "Manual Entry",
            "previous_stock": t.previous_stock,
            "new_stock": t.new_stock,
            "notes": t.notes or ""
        })
    return results

@app.post("/api/inventory/adjust", status_code=status.HTTP_200_OK)
def adjust_inventory_stock(adj: StockAdjustmentSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    prod = db.query(ProductModel).filter(ProductModel.id == adj.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    old_stock = prod.stock or 0
    adj_qty = int(adj.quantity)
    if adj_qty <= 0:
        raise HTTPException(status_code=400, detail="Adjustment quantity must be greater than zero")

    if adj.adjustment_type in ["ADJUSTMENT_IN", "IN", "RESTOCK"]:
        delta = adj_qty
        new_stock = old_stock + adj_qty
    elif adj.adjustment_type in ["ADJUSTMENT_OUT", "OUT", "DAMAGE", "SHRINKAGE"]:
        if old_stock < adj_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for adjustment. Available: {old_stock}, Requested deduction: {adj_qty}."
            )
        delta = -adj_qty
        new_stock = old_stock - adj_qty
    else:
        raise HTTPException(status_code=400, detail="Invalid adjustment type")

    # Atomic update
    prod.stock = new_stock
    prod.quantity = new_stock

    tx_id = f"itx-{uuid.uuid4().hex[:8]}"
    tx = InventoryTransactionModel(
        id=tx_id,
        product_id=prod.id,
        product_name=prod.name,
        transaction_type="STOCK ADJUSTMENT",
        quantity=delta,
        previous_stock=old_stock,
        new_stock=new_stock,
        reference=adj.reason or "Stock Adjustment",
        notes=adj.notes or f"Reason: {adj.reason}",
        authorized_user=current_user.name
    )
    db.add(tx)
    db.commit()
    db.refresh(prod)
    db.refresh(tx)

    create_audit_record(
        db,
        "STOCK_ADJUSTMENT",
        "Inventory",
        f"Adjusted {prod.name}: {old_stock} -> {new_stock} ({delta:+d} units). Reason: {adj.reason}",
        user=current_user,
        entity_id=prod.id
    )

    return {
        "message": "Stock adjusted successfully",
        "product_id": prod.id,
        "previous_stock": old_stock,
        "new_stock": new_stock,
        "quantity_delta": delta,
        "transaction_id": tx_id
    }

# ==================== PURCHASE ORDERS API ====================
@app.get("/api/purchase-orders")
def get_purchase_orders(db: Session = Depends(get_db)):
    pos = db.query(PurchaseOrderModel).order_by(PurchaseOrderModel.createdAt.desc()).all()
    results = []
    for p in pos:
        results.append({
            "id": p.id,
            "code": p.code,
            "supplier": p.supplier,
            "orderDate": p.orderDate,
            "expectedDelivery": p.expectedDelivery,
            "itemsCount": p.itemsCount,
            "totalCost": float(p.totalCost or 0.0),
            "status": p.status,
            "paymentTerms": p.paymentTerms or "Net 30 Days",
            "productId": p.product_id,
            "productName": p.product_name,
            "notes": p.notes or ""
        })
    return results

@app.post("/api/purchase-orders", status_code=status.HTTP_201_CREATED)
def create_purchase_order(po_in: PurchaseOrderSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    po_id = po_in.id or f"po-{uuid.uuid4().hex[:8]}"
    year = datetime.utcnow().strftime("%Y")
    count = db.query(PurchaseOrderModel).count()
    po_code = po_in.code or f"PO-{year}-{str(count + 1).zfill(3)}"
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    db_po = PurchaseOrderModel(
        id=po_id,
        code=po_code,
        supplier=po_in.supplier,
        orderDate=po_in.orderDate or today_str,
        expectedDelivery=po_in.expectedDelivery or today_str,
        itemsCount=po_in.itemsCount or 1,
        totalCost=float(po_in.totalCost or 0.0),
        status="ORDERED",  # Creating PO must NOT increase stock
        paymentTerms=po_in.paymentTerms or "Net 30 Days",
        product_id=po_in.product_id or po_in.productId,
        product_name=po_in.product_name or po_in.productName,
        notes=po_in.notes or ""
    )
    db.add(db_po)
    db.commit()
    db.refresh(db_po)

    create_audit_record(
        db,
        "CREATE_PURCHASE_ORDER",
        "Purchase Orders",
        f"Dispatched PO {po_code} to {po_in.supplier} for {po_in.itemsCount} units (Status: ORDERED - Stock unaffected)",
        user=current_user,
        entity_id=po_id
    )

    return {
        "id": db_po.id,
        "code": db_po.code,
        "supplier": db_po.supplier,
        "orderDate": db_po.orderDate,
        "expectedDelivery": db_po.expectedDelivery,
        "itemsCount": db_po.itemsCount,
        "totalCost": float(db_po.totalCost or 0.0),
        "status": db_po.status,
        "paymentTerms": db_po.paymentTerms,
        "productId": db_po.product_id,
        "productName": db_po.product_name
    }

@app.post("/api/purchase-orders/{po_id}/receive")
def receive_purchase_order(po_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    po = db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    if po.status in ["RECEIVED", "Delivered"]:
        raise HTTPException(status_code=400, detail="Purchase order has already been received")

    # Match product
    target_prod = None
    if po.product_id:
        target_prod = db.query(ProductModel).filter(ProductModel.id == po.product_id).first()
    if not target_prod and po.product_name:
        target_prod = db.query(ProductModel).filter(ProductModel.name.ilike(f"%{po.product_name}%")).first()
    if not target_prod:
        # Match by supplier or first product of supplier
        target_prod = db.query(ProductModel).filter(ProductModel.supplier.ilike(f"%{po.supplier.split()[0]}%")).first()
    if not target_prod:
        target_prod = db.query(ProductModel).first()

    qty_to_add = int(po.itemsCount or 0)
    old_stock = target_prod.stock if target_prod else 0
    new_stock = old_stock + qty_to_add

    if target_prod:
        target_prod.stock = new_stock
        target_prod.quantity = new_stock

    po.status = "RECEIVED"

    # Log inventory transaction: RESTOCK IN +qty
    tx_id = f"itx-{uuid.uuid4().hex[:8]}"
    tx = InventoryTransactionModel(
        id=tx_id,
        product_id=target_prod.id if target_prod else "prod-gen",
        product_name=target_prod.name if target_prod else f"Shipment ({po.supplier})",
        transaction_type="RESTOCK IN",
        quantity=qty_to_add,
        previous_stock=old_stock,
        new_stock=new_stock,
        reference=po.code,
        notes=f"Received PO shipment from {po.supplier}",
        authorized_user=current_user.name
    )
    db.add(tx)
    db.commit()
    db.refresh(po)
    if target_prod:
        db.refresh(target_prod)

    create_audit_record(
        db,
        "RECEIVE_PURCHASE_ORDER",
        "Inventory",
        f"Received PO {po.code} (+{qty_to_add} units for {target_prod.name if target_prod else po.supplier}). New Stock: {new_stock}",
        user=current_user,
        entity_id=po.id
    )

    return {
        "message": "Purchase order received and stock replenished",
        "po_id": po.id,
        "code": po.code,
        "status": po.status,
        "product_id": target_prod.id if target_prod else None,
        "product_name": target_prod.name if target_prod else None,
        "previous_stock": old_stock,
        "new_stock": new_stock,
        "quantity_added": qty_to_add
    }

# ==================== DISTRIBUTORS / SUPPLIERS API ====================
@app.get("/api/distributors")
def get_distributors(db: Session = Depends(get_db)):
    distributors = db.query(DistributorModel).order_by(DistributorModel.name.asc()).all()
    results = []
    for d in distributors:
        results.append({
            "id": d.id,
            "name": d.name,
            "contactPerson": d.contactPerson or "",
            "phone": d.phone or "",
            "email": d.email or "",
            "address": d.address or "",
            "leadTimeDays": d.leadTimeDays or 5,
            "category": d.category or "Hair & Beauty",
            "status": d.status or "Active",
            "notes": d.notes or "",
            "createdAt": d.createdAt.isoformat() if d.createdAt else None
        })
    return results

@app.post("/api/distributors", status_code=status.HTTP_201_CREATED)
def create_distributor(dist: DistributorSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    # Check if duplicate name
    existing = db.query(DistributorModel).filter(func.lower(DistributorModel.name) == func.lower(dist.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Distributor '{dist.name}' already exists")

    dist_id = dist.id or f"dist-{uuid.uuid4().hex[:8]}"
    db_dist = DistributorModel(
        id=dist_id,
        name=dist.name.strip(),
        contactPerson=dist.contactPerson.strip() if dist.contactPerson else "",
        phone=dist.phone.strip() if dist.phone else "",
        email=dist.email.strip() if dist.email else "",
        address=dist.address.strip() if dist.address else "",
        leadTimeDays=int(dist.leadTimeDays or 5),
        category=dist.category or "Hair & Beauty",
        status=dist.status or "Active",
        notes=dist.notes or ""
    )
    db.add(db_dist)
    db.commit()
    db.refresh(db_dist)

    create_audit_record(
        db,
        "CREATE_DISTRIBUTOR",
        "Suppliers",
        f"Registered new authorized distributor '{db_dist.name}'",
        user=current_user,
        entity_id=dist_id
    )

    return {
        "id": db_dist.id,
        "name": db_dist.name,
        "contactPerson": db_dist.contactPerson,
        "phone": db_dist.phone,
        "email": db_dist.email,
        "address": db_dist.address,
        "leadTimeDays": db_dist.leadTimeDays,
        "category": db_dist.category,
        "status": db_dist.status,
        "notes": db_dist.notes
    }

@app.put("/api/distributors/{distributor_id}")
def update_distributor(distributor_id: str, dist: DistributorSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_dist = db.query(DistributorModel).filter(DistributorModel.id == distributor_id).first()
    if not db_dist:
        raise HTTPException(status_code=404, detail="Distributor not found")

    old_name = db_dist.name
    new_name = dist.name.strip() if dist.name else old_name

    # Check for name conflict if changed
    if new_name.lower() != old_name.lower():
        existing = db.query(DistributorModel).filter(func.lower(DistributorModel.name) == func.lower(new_name)).first()
        if existing and existing.id != distributor_id:
            raise HTTPException(status_code=400, detail=f"Distributor '{new_name}' already exists")

    db_dist.name = new_name
    if dist.contactPerson is not None:
        db_dist.contactPerson = dist.contactPerson.strip()
    if dist.phone is not None:
        db_dist.phone = dist.phone.strip()
    if dist.email is not None:
        db_dist.email = dist.email.strip()
    if dist.address is not None:
        db_dist.address = dist.address.strip()
    if dist.leadTimeDays is not None:
        db_dist.leadTimeDays = int(dist.leadTimeDays)
    if dist.category is not None:
        db_dist.category = dist.category
    if dist.status is not None:
        db_dist.status = dist.status
    if dist.notes is not None:
        db_dist.notes = dist.notes

    db.commit()
    db.refresh(db_dist)

    create_audit_record(
        db,
        "UPDATE_DISTRIBUTOR",
        "Suppliers",
        f"Updated authorized distributor '{old_name}' -> '{db_dist.name}'",
        user=current_user,
        entity_id=distributor_id
    )

    return {
        "id": db_dist.id,
        "name": db_dist.name,
        "contactPerson": db_dist.contactPerson,
        "phone": db_dist.phone,
        "email": db_dist.email,
        "address": db_dist.address,
        "leadTimeDays": db_dist.leadTimeDays,
        "category": db_dist.category,
        "status": db_dist.status,
        "notes": db_dist.notes
    }

@app.delete("/api/distributors/{distributor_id}")
def delete_distributor(distributor_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_dist = db.query(DistributorModel).filter(DistributorModel.id == distributor_id).first()
    if not db_dist:
        raise HTTPException(status_code=404, detail="Distributor not found")

    dist_name = db_dist.name
    db.delete(db_dist)
    db.commit()

    create_audit_record(
        db,
        "DELETE_DISTRIBUTOR",
        "Suppliers",
        f"Deleted authorized distributor '{dist_name}'",
        user=current_user,
        entity_id=distributor_id
    )

    return {"message": f"Distributor '{dist_name}' deleted successfully", "id": distributor_id}


# ==================== SERVICES API ====================
@app.get("/api/services")
def get_services(db: Session = Depends(get_db)):
    srvs = db.query(ServiceModel).all()
    results = []
    for s in srvs:
        is_home = True if ("Home" in str(s.category) or "Home" in str(s.description) or "Express" in str(s.name)) else False
        results.append({
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "subCategory": s.subCategory or "",
            "price": float(s.price),
            "duration": s.duration,
            "durationMinutes": s.duration,
            "description": s.description or "",
            "status": s.status or "Active",
            "image": s.image or "",
            "homeServiceEligible": is_home,
            "serviceType": "Available for Home Service" if is_home else "In-Salon Suite Only"
        })
    return results

@app.post("/api/services", status_code=status.HTTP_201_CREATED)
def create_service(service: ServiceSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    srv_id = service.id or f"srv-{uuid.uuid4().hex[:8]}"
    dur = service.durationMinutes or service.duration or 30
    db_srv = ServiceModel(
        id=srv_id,
        name=service.name,
        category=service.category,
        subCategory=service.subCategory or "",
        price=service.price,
        duration=dur,
        description=service.description or "",
        status=service.status or "Active",
        image=service.image or ""
    )
    db.add(db_srv)
    db.commit()
    db.refresh(db_srv)

    is_home = bool(service.homeServiceEligible or ("Home" in str(service.category)))
    return {
        "id": db_srv.id,
        "name": db_srv.name,
        "category": db_srv.category,
        "subCategory": db_srv.subCategory,
        "price": float(db_srv.price),
        "duration": db_srv.duration,
        "durationMinutes": db_srv.duration,
        "description": db_srv.description,
        "status": db_srv.status,
        "image": db_srv.image,
        "homeServiceEligible": is_home,
        "serviceType": service.serviceType or ("Available for Home Service" if is_home else "In-Salon Suite Only")
    }

@app.put("/api/services/{service_id}")
def update_service(service_id: str, service: ServiceSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_srv = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not db_srv:
        raise HTTPException(status_code=404, detail="Service not found")
    data = service.dict(exclude_unset=True)
    if "durationMinutes" in data and "duration" not in data:
        data["duration"] = data["durationMinutes"]
    for key, value in data.items():
        if hasattr(db_srv, key):
            setattr(db_srv, key, value)
    db.commit()
    db.refresh(db_srv)
    return {
        "id": db_srv.id,
        "name": db_srv.name,
        "category": db_srv.category,
        "subCategory": db_srv.subCategory,
        "price": float(db_srv.price),
        "duration": db_srv.duration,
        "durationMinutes": db_srv.duration,
        "description": db_srv.description,
        "status": db_srv.status,
        "image": db_srv.image,
        "homeServiceEligible": service.homeServiceEligible,
        "serviceType": service.serviceType
    }

@app.delete("/api/services/{service_id}")
def delete_service(service_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_srv = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not db_srv:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(db_srv)
    db.commit()
    return {"message": "Service deleted"}

# ==================== CUSTOMERS API ====================
@app.get("/api/customers", response_model=List[CustomerSchema])
def get_customers(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CustomerModel)
    if search:
        query = query.filter(or_(CustomerModel.name.ilike(f"%{search}%"), CustomerModel.phone.ilike(f"%{search}%")))
    return query.all()

@app.post("/api/customers", response_model=CustomerSchema, status_code=status.HTTP_201_CREATED)
def create_customer(cust: CustomerSchema, db: Session = Depends(get_db)):
    cust_id = cust.id or f"cust-{uuid.uuid4().hex[:8]}"
    db_cust = CustomerModel(
        id=cust_id,
        name=cust.name,
        phone=cust.phone,
        email=cust.email,
        gender=cust.gender,
        vipStatus=cust.vipStatus or "Standard",
        visitsCount=cust.visitsCount or 1,
        totalSpent=cust.totalSpent or 0.0,
        lastVisit=cust.lastVisit or datetime.utcnow().strftime("%Y-%m-%d"),
        notes=cust.notes
    )
    db.add(db_cust)
    db.commit()
    db.refresh(db_cust)
    return db_cust

@app.put("/api/customers/{customer_id}")
def update_customer(customer_id: str, cust: CustomerSchema, db: Session = Depends(get_db)):
    db_cust = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not db_cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in cust.dict(exclude_unset=True).items():
        if hasattr(db_cust, key):
            setattr(db_cust, key, value)
    db.commit()
    db.refresh(db_cust)
    return db_cust

@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_cust = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not db_cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_cust)
    db.commit()
    return {"message": "Customer deleted"}

# ==================== EMPLOYEES API ====================
@app.get("/api/employees")
def get_employees(db: Session = Depends(get_db)):
    emps = db.query(EmployeeModel).all()
    results = []
    for emp in emps:
        specs = emp.specialties if isinstance(emp.specialties, list) else []
        results.append({
            "id": emp.id,
            "name": emp.name,
            "role": emp.role,
            "designation": emp.designation or emp.role,
            "phone": emp.phone or "+1 (555) 000-0000",
            "email": emp.email or f"{emp.name.lower().replace(' ', '.')}@luminaluxe.com",
            "joinDate": emp.joinDate or "2023-01-01",
            "joiningDate": emp.joinDate or "2023-01-01",
            "salary": float(emp.salary or 4000.0),
            "baseSalary": float(emp.salary or 4000.0),
            "commissionRate": 18,
            "commission": 18,
            "status": emp.status or "Active",
            "avatar": emp.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            "specialties": specs,
            "skills": specs,
            "branch_id": emp.branch_id,
            "branch": "Beverly Hills Flagship",
            "workingHours": "10:00 AM - 07:00 PM",
            "shift": "10:00 AM - 07:00 PM",
            "homeServiceEligible": True,
            "rating": 4.96,
            "completedBookings": 120,
            "station": "Chair #1 (Color Master)"
        })
    return results

@app.post("/api/employees", status_code=status.HTTP_201_CREATED)
def create_employee(emp: EmployeeSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    emp_id = emp.id or f"emp-{uuid.uuid4().hex[:8]}"

    specs = []
    if isinstance(emp.skills, list) and emp.skills:
        specs = emp.skills
    elif isinstance(emp.skills, str) and emp.skills:
        specs = [s.strip() for s in emp.skills.split(",") if s.strip()]
    elif isinstance(emp.specialties, list):
        specs = emp.specialties

    sal = float(emp.salary or emp.baseSalary or 4000.0)
    j_date = emp.joinDate or emp.joiningDate or datetime.utcnow().strftime("%Y-%m-%d")
    desig = emp.designation or emp.role or "Senior Stylist"

    db_emp = EmployeeModel(
        id=emp_id,
        name=emp.name,
        role=emp.role or desig,
        designation=desig,
        phone=emp.phone or "",
        email=emp.email or "",
        joinDate=j_date,
        salary=sal,
        status=emp.status or "Active",
        avatar=emp.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        specialties=specs,
        branch_id=emp.branch_id
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)

    return {
        "id": db_emp.id,
        "name": db_emp.name,
        "role": db_emp.role,
        "designation": db_emp.designation,
        "phone": db_emp.phone,
        "email": db_emp.email,
        "joinDate": db_emp.joinDate,
        "joiningDate": db_emp.joinDate,
        "salary": float(db_emp.salary),
        "baseSalary": float(db_emp.salary),
        "commissionRate": 18,
        "commission": 18,
        "status": db_emp.status,
        "avatar": db_emp.avatar,
        "specialties": specs,
        "skills": specs,
        "branch": emp.branch or "Beverly Hills Flagship",
        "workingHours": emp.workingHours or emp.shift or "10:00 AM - 07:00 PM",
        "shift": emp.shift or emp.workingHours or "10:00 AM - 07:00 PM",
        "homeServiceEligible": True,
        "rating": 4.95,
        "completedBookings": 0,
        "station": "Chair #1"
    }

@app.put("/api/employees/{employee_id}")
def update_employee(employee_id: str, emp: EmployeeSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_emp = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    data = emp.dict(exclude_unset=True)
    if "baseSalary" in data and "salary" not in data:
        data["salary"] = data["baseSalary"]
    if "joiningDate" in data and "joinDate" not in data:
        data["joinDate"] = data["joiningDate"]
    if "skills" in data and "specialties" not in data:
        data["specialties"] = data["skills"] if isinstance(data["skills"], list) else [s.strip() for s in str(data["skills"]).split(",") if s.strip()]

    for key, val in data.items():
        if hasattr(db_emp, key):
            setattr(db_emp, key, val)
    db.commit()
    db.refresh(db_emp)
    return {"message": "Employee updated successfully"}

@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_emp = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_emp)
    db.commit()
    return {"message": "Employee deleted"}

# ==================== APPOINTMENTS API ====================
@app.get("/api/appointments")
def get_appointments(date: Optional[str] = None, status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AppointmentModel)
    if date:
        query = query.filter(AppointmentModel.date == date)
    if status_filter:
        query = query.filter(AppointmentModel.status == status_filter)
    appts = query.order_by(AppointmentModel.createdAt.desc()).all()
    results = []
    for a in appts:
        srv_names = [s.strip() for s in a.serviceName.split(",")] if a.serviceName else ["Salon Service"]
        results.append({
            "id": a.id,
            "code": f"APT-{a.id[-4:].upper()}",
            "customerId": a.customer_id,
            "customer_id": a.customer_id,
            "customerName": a.customerName,
            "customerPhone": a.customerPhone or "+1 (555) 234-8901",
            "serviceId": a.service_id,
            "service_id": a.service_id,
            "serviceName": a.serviceName,
            "serviceNames": srv_names,
            "stylistId": a.stylist_id,
            "stylist_id": a.stylist_id,
            "stylistName": a.stylistName,
            "date": a.date,
            "time": a.time,
            "duration": a.duration,
            "durationMinutes": a.duration,
            "status": a.status,
            "totalPrice": float(a.totalPrice or 0.0),
            "price": float(a.totalPrice or 0.0),
            "station": a.chairNumber or "Chair #1",
            "chairNumber": a.chairNumber or "Chair #1",
            "branch": "Beverly Hills Flagship",
            "type": "Home Service" if "Home" in str(a.chairNumber) or "Home" in str(a.notes) else "In-Salon",
            "paymentStatus": "Paid" if a.status == "Completed" else "Pending",
            "notes": a.notes or "",
            "reminderSent": True,
            "createdAt": a.createdAt.isoformat() if a.createdAt else None
        })
    return results

@app.post("/api/appointments", status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentSchema, db: Session = Depends(get_db)):
    srv_name = appointment.serviceName
    if (not srv_name or srv_name == "Salon Service") and appointment.serviceNames:
        srv_name = ", ".join(appointment.serviceNames)
    if not srv_name:
        srv_name = "Salon Service"

    cust_name = appointment.customerName or "Walk-in Guest"
    styl_name = appointment.stylistName or "Julian Vance"

    appt_id = appointment.id or f"apt-{uuid.uuid4().hex[:8]}"
    price_val = float(appointment.price or appointment.totalPrice or 0.0)
    dur_val = int(appointment.durationMinutes or appointment.duration or 30)
    station_val = appointment.station or appointment.chairNumber or "Chair #1"

    db_appt = AppointmentModel(
        id=appt_id,
        customer_id=appointment.customer_id or appointment.customerId,
        customerName=cust_name,
        customerPhone=appointment.customerPhone or "",
        service_id=appointment.service_id or appointment.serviceId,
        serviceName=srv_name,
        stylist_id=appointment.stylist_id or appointment.stylistId,
        stylistName=styl_name,
        date=appointment.date,
        time=appointment.time,
        duration=dur_val,
        status=appointment.status or "Confirmed",
        totalPrice=price_val,
        chairNumber=station_val,
        notes=appointment.notes or ""
    )
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)

    srv_names = [s.strip() for s in db_appt.serviceName.split(",")] if db_appt.serviceName else [srv_name]
    return {
        "id": db_appt.id,
        "code": f"APT-{db_appt.id[-4:].upper()}",
        "customerId": db_appt.customer_id,
        "customer_id": db_appt.customer_id,
        "customerName": db_appt.customerName,
        "customerPhone": db_appt.customerPhone,
        "serviceId": db_appt.service_id,
        "service_id": db_appt.service_id,
        "serviceName": db_appt.serviceName,
        "serviceNames": srv_names,
        "stylistId": db_appt.stylist_id,
        "stylist_id": db_appt.stylist_id,
        "stylistName": db_appt.stylistName,
        "date": db_appt.date,
        "time": db_appt.time,
        "duration": db_appt.duration,
        "durationMinutes": db_appt.duration,
        "status": db_appt.status,
        "totalPrice": float(db_appt.totalPrice or 0.0),
        "price": float(db_appt.totalPrice or 0.0),
        "station": db_appt.chairNumber or "Chair #1",
        "chairNumber": db_appt.chairNumber or "Chair #1",
        "branch": appointment.branch or "Beverly Hills Flagship",
        "type": appointment.type or ("Home Service" if "Home" in str(db_appt.chairNumber) else "In-Salon"),
        "paymentStatus": "Pending",
        "notes": db_appt.notes or "",
        "reminderSent": True,
        "createdAt": db_appt.createdAt.isoformat() if db_appt.createdAt else None
    }


@app.put("/api/appointments/{appt_id}")
def update_appointment(appt_id: str, data: dict, db: Session = Depends(get_db)):
    db_appt = db.query(AppointmentModel).filter(AppointmentModel.id == appt_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Check for service consumption / product usage
    # Either explicit product_id & quantity or default service formulation
    if data.get("consume_product") or data.get("product_id") or (data.get("status") == "Completed" and data.get("consumed_quantity")):
        p_id = data.get("product_id")
        consume_qty = int(data.get("consumed_quantity") or data.get("product_qty") or 1)
        p_name = data.get("product_name")
        prod = None
        if p_id:
            prod = db.query(ProductModel).filter(ProductModel.id == p_id).first()
        if not prod and p_name:
            prod = db.query(ProductModel).filter(ProductModel.name.ilike(f"%{p_name}%")).first()
        if not prod:
            # If no product specified, match by service type (e.g., L'Oréal Majirel Color Tube #7.1 for hair/color)
            if "Color" in str(db_appt.serviceName) or "Balayage" in str(db_appt.serviceName):
                prod = db.query(ProductModel).filter(ProductModel.id == "prod-3").first()
            elif "Manicure" in str(db_appt.serviceName) or "Nail" in str(db_appt.serviceName):
                prod = db.query(ProductModel).filter(ProductModel.id == "prod-6").first()

        if prod and consume_qty > 0:
            old_stock = prod.stock or 0
            new_stock = max(0, old_stock - consume_qty)
            prod.stock = new_stock
            prod.quantity = new_stock

            tx_id = f"itx-{uuid.uuid4().hex[:8]}"
            tx = InventoryTransactionModel(
                id=tx_id,
                product_id=prod.id,
                product_name=prod.name,
                transaction_type="SALON CONSUMPTION",
                quantity=-consume_qty,
                previous_stock=old_stock,
                new_stock=new_stock,
                reference=f"APT-{db_appt.id[-4:].upper()}",
                notes=f"Consumed during {db_appt.serviceName} for {db_appt.customerName}",
                authorized_user=db_appt.stylistName or "Julian Vance"
            )
            db.add(tx)
            create_audit_record(
                db,
                "SALON_CONSUMPTION",
                "Inventory",
                f"Consumed {consume_qty} unit(s) of {prod.name} for appointment APT-{db_appt.id[-4:].upper()}",
                entity_id=db_appt.id
            )

    for key, val in data.items():
        if key not in ["consume_product", "product_id", "consumed_quantity", "product_qty", "product_name"] and hasattr(db_appt, key):
            setattr(db_appt, key, val)

    db.commit()
    db.refresh(db_appt)
    return db_appt


@app.delete("/api/appointments/{appt_id}")
def delete_appointment(appt_id: str, db: Session = Depends(get_db)):
    db_appt = db.query(AppointmentModel).filter(AppointmentModel.id == appt_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(db_appt)
    db.commit()
    return {"message": "Appointment deleted"}

# ==================== ATTENDANCE API ====================
@app.get("/api/attendance")
def get_attendance(date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AttendanceModel)
    if date:
        query = query.filter(AttendanceModel.date == date)
    return query.all()

@app.post("/api/attendance", status_code=status.HTTP_201_CREATED)
def create_attendance(att: AttendanceSchema, db: Session = Depends(get_db)):
    att_id = att.id or f"att-{uuid.uuid4().hex[:8]}"
    db_att = AttendanceModel(
        id=att_id,
        employeeId=att.employeeId,
        employeeName=att.employeeName,
        date=att.date,
        checkIn=att.checkIn,
        checkOut=att.checkOut,
        status=att.status or "Present",
        workHours=att.workHours or 8.0
    )
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

# ==================== PAYROLL API ====================
@app.get("/api/payroll")
def get_payroll(db: Session = Depends(get_db)):
    return db.query(PayrollModel).all()

@app.post("/api/payroll", status_code=status.HTTP_201_CREATED)
def create_payroll(pay: PayrollSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager"]))):
    pay_id = pay.id or f"pay-{uuid.uuid4().hex[:8]}"
    db_pay = PayrollModel(
        id=pay_id,
        employeeId=pay.employeeId,
        employeeName=pay.employeeName,
        month=pay.month,
        year=pay.year,
        baseSalary=pay.baseSalary or 0.0,
        bonuses=pay.bonuses or 0.0,
        deductions=pay.deductions or 0.0,
        netSalary=pay.netSalary or 0.0,
        paymentDate=pay.paymentDate or datetime.utcnow().strftime("%Y-%m-%d"),
        status=pay.status or "Paid"
    )
    db.add(db_pay)
    db.commit()
    db.refresh(db_pay)
    return db_pay

# ==================== INVOICES / POS BILLING API ====================
@app.get("/api/invoices")
def get_invoices(db: Session = Depends(get_db)):
    return db.query(InvoiceModel).all()

@app.post("/api/invoices", status_code=status.HTTP_201_CREATED)
def create_invoice(inv: InvoiceSchema, db: Session = Depends(get_db)):
    # Server-side Invoice Number & Transactional Inventory Control
    year = datetime.utcnow().strftime("%Y")
    count = db.query(InvoiceModel).count()
    inv_num = inv.invoiceNumber or f"INV-{year}-{str(count + 1).zfill(4)}"
    inv_id = inv.id or f"inv-{uuid.uuid4().hex[:8]}"

    # Pre-validation: Verify sufficient stock for all product items before any updates
    product_deductions = []
    if inv.items:
        for item in inv.items:
            is_prod = False
            if isinstance(item, dict):
                is_prod = item.get("type") in ["Product", "product"] or item.get("item_type") in ["Product", "product"]
            elif hasattr(item, "item_type"):
                is_prod = item.item_type in ["Product", "product"]
            
            if is_prod:
                p_id = item.get("id") or item.get("item_id") or item.get("productId") if isinstance(item, dict) else getattr(item, "item_id", None)
                qty = int(item.get("qty") or item.get("quantity") or 1) if isinstance(item, dict) else int(getattr(item, "quantity", 1))
                p_name = item.get("name") if isinstance(item, dict) else getattr(item, "name", "Product")
                
                prod = None
                if p_id:
                    prod = db.query(ProductModel).filter(ProductModel.id == p_id).first()
                if not prod and p_name:
                    prod = db.query(ProductModel).filter(ProductModel.name.ilike(f"%{p_name}%")).first()

                if prod:
                    available = prod.stock or 0
                    if available < qty:
                        db.rollback()
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Insufficient stock for {prod.name}. Available: {available}, Requested: {qty}."
                        )
                    product_deductions.append((prod, qty))

    # Apply atomic deductions and log RETAIL SALE transactions
    for prod, qty in product_deductions:
        old_stock = prod.stock or 0
        new_stock = old_stock - qty
        prod.stock = new_stock
        prod.quantity = new_stock

        tx_id = f"itx-{uuid.uuid4().hex[:8]}"
        tx = InventoryTransactionModel(
            id=tx_id,
            product_id=prod.id,
            product_name=prod.name,
            transaction_type="RETAIL SALE",
            quantity=-qty,  # Negative quantity for sales
            previous_stock=old_stock,
            new_stock=new_stock,
            reference=inv_num,
            notes=f"Retail Sale via Invoice {inv_num}",
            authorized_user="Staff Cashier"
        )
        db.add(tx)


# Helper Coupon & Campaign Services
def compute_coupon_status(offer: OfferModel) -> str:
    raw_status = (offer.status or "ACTIVE").upper()
    if raw_status in ["PAUSED", "DRAFT", "ARCHIVED"]:
        return raw_status

    if offer.usage_limit and offer.usage_limit > 0:
        if (offer.used_count or 0) >= offer.usage_limit:
            return "DEPLETED"

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if offer.valid_from and today_str < offer.valid_from:
        return "SCHEDULED"
    valid_until = offer.valid_until or offer.validTill
    if valid_until and today_str > valid_until:
        return "EXPIRED"

    return "ACTIVE"


def format_offer_dict(offer: OfferModel) -> dict:
    computed = compute_coupon_status(offer)
    val = float(offer.discount_value or offer.discountPercent or 0.0)
    d_type = (offer.discount_type or "PERCENTAGE").upper()
    min_spend = float(offer.minimum_spend or 0.0)
    max_disc = float(offer.maximum_discount or 0.0)
    u_limit = offer.usage_limit or 0
    u_count = offer.used_count or 0
    per_cust = offer.per_customer_limit or 1

    return {
        "id": offer.id,
        "title": offer.title,
        "campaign_name": offer.title,
        "campaignName": offer.title,
        "code": offer.code,
        "description": offer.description or "",
        "discountType": d_type,
        "discount_type": d_type,
        "discountValue": val,
        "discount_value": val,
        "discountPercent": val if d_type in ["PERCENTAGE", "PERCENT"] else 0.0,
        "minSpend": min_spend,
        "minimum_spend": min_spend,
        "maxDiscount": max_disc,
        "maximum_discount": max_disc,
        "validFrom": offer.valid_from,
        "valid_from": offer.valid_from,
        "validTill": offer.valid_until or offer.validTill,
        "valid_until": offer.valid_until or offer.validTill,
        "usageLimit": u_limit,
        "usage_limit": u_limit,
        "maxUsage": u_limit,
        "usedCount": u_count,
        "used_count": u_count,
        "usageCount": u_count,
        "perCustomerLimit": per_cust,
        "per_customer_limit": per_cust,
        "customerEligibility": offer.customer_eligibility or "ALL_CUSTOMERS",
        "customer_eligibility": offer.customer_eligibility or "ALL_CUSTOMERS",
        "applicableTo": offer.applicable_to or "ENTIRE_BILL",
        "applicable_to": offer.applicable_to or "ENTIRE_BILL",
        "applicableTarget": offer.applicable_target or "",
        "status": computed,
        "raw_status": offer.status or "ACTIVE",
        "notes": offer.notes or "",
        "createdBy": offer.created_by or "Super Admin",
        "createdAt": offer.createdAt.isoformat() if offer.createdAt else None,
        "updatedAt": offer.updatedAt.isoformat() if offer.updatedAt else None
    }


def validate_coupon_logic(
    db: Session,
    code: str,
    customer_id: Optional[str] = None,
    customer_phone: Optional[str] = None,
    customer_name: Optional[str] = None,
    items: Optional[List[Any]] = None,
    subtotal: float = 0.0
) -> dict:
    if not code or not code.strip():
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "Coupon code is required."}

    clean_code = code.strip().upper()
    offer = db.query(OfferModel).filter(func.upper(OfferModel.code) == clean_code).first()
    if not offer:
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": f"Coupon code '{clean_code}' does not exist."}

    # Status check
    current_status = compute_coupon_status(offer)
    if current_status == "PAUSED":
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is currently paused."}
    if current_status == "DRAFT":
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is in draft mode and cannot be used."}
    if current_status == "SCHEDULED":
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": f"This coupon is scheduled and will be active from {offer.valid_from}."}
    if current_status == "EXPIRED":
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon has expired."}
    if current_status == "DEPLETED":
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon has reached its maximum usage limit."}
    if current_status != "ACTIVE":
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": f"Coupon is not active ({current_status})."}

    # Find customer record if possible
    cust = None
    if customer_id:
        cust = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not cust and customer_phone:
        cust = db.query(CustomerModel).filter(CustomerModel.phone == customer_phone).first()
    if not cust and customer_name:
        cust = db.query(CustomerModel).filter(CustomerModel.name.ilike(customer_name)).first()

    # Customer Eligibility checks
    eligibility = (offer.customer_eligibility or "ALL_CUSTOMERS").upper()
    if eligibility == "NEW_CUSTOMERS":
        is_existing = False
        if cust:
            if (cust.visitsCount or 0) > 0 or float(cust.totalSpent or 0.0) > 0:
                is_existing = True
        c_filter = []
        if customer_id:
            c_filter.append(InvoiceModel.customer_id == customer_id)
        if customer_phone:
            c_filter.append(InvoiceModel.customerPhone == customer_phone)
        if c_filter:
            prior_invoices = db.query(InvoiceModel).filter(or_(*c_filter)).count()
            if prior_invoices > 0:
                is_existing = True
        
        if is_existing:
            return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is available for new customers only."}

    elif eligibility == "EXISTING_CUSTOMERS":
        is_existing = False
        if cust and ((cust.visitsCount or 0) > 0 or float(cust.totalSpent or 0.0) > 0):
            is_existing = True
        c_filter = []
        if customer_id:
            c_filter.append(InvoiceModel.customer_id == customer_id)
        if customer_phone:
            c_filter.append(InvoiceModel.customerPhone == customer_phone)
        if c_filter and db.query(InvoiceModel).filter(or_(*c_filter)).count() > 0:
            is_existing = True
        if not is_existing:
            return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is available for existing customers only."}

    elif eligibility == "VIP_CUSTOMERS":
        is_vip = False
        if cust:
            v_status = str(cust.vipStatus or "").upper()
            if v_status in ["VIP", "PLATINUM", "DIAMOND", "GOLD"]:
                is_vip = True
        if not is_vip:
            return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is exclusive to VIP customers."}

    elif eligibility == "LOYALTY_MEMBERS":
        is_member = False
        if cust:
            v_status = str(cust.vipStatus or "").upper()
            if v_status != "STANDARD" or (cust.visitsCount or 0) > 1:
                is_member = True
        if not is_member:
            return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is exclusive to Loyalty Club members."}

    # Per-Customer Usage Limit
    per_cust_limit = offer.per_customer_limit or 1
    if per_cust_limit > 0:
        filters = []
        if customer_id:
            filters.append(CouponRedemptionModel.customer_id == customer_id)
        if customer_phone:
            filters.append(CouponRedemptionModel.customer_phone == customer_phone)
        if cust:
            filters.append(CouponRedemptionModel.customer_id == cust.id)
            if cust.phone:
                filters.append(CouponRedemptionModel.customer_phone == cust.phone)
        
        if filters:
            redemption_count = db.query(CouponRedemptionModel).filter(
                CouponRedemptionModel.coupon_id == offer.id,
                or_(*filters)
            ).count()
            if redemption_count >= per_cust_limit:
                return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "You have already used this coupon."}

    # Applicable Item Restrictions & Eligible Subtotal
    applicable_to = (offer.applicable_to or "ENTIRE_BILL").upper()
    eligible_amount = 0.0
    items_list = items or []

    if not items_list:
        eligible_amount = float(subtotal or 0.0)
    else:
        for item in items_list:
            i_price = float(item.get("price") or item.get("unit_price") or 0.0) if isinstance(item, dict) else float(getattr(item, "price", 0.0) or getattr(item, "unit_price", 0.0))
            i_qty = int(item.get("qty") or item.get("quantity") or 1) if isinstance(item, dict) else int(getattr(item, "quantity", 1))
            item_line_total = i_price * i_qty
            i_type = (item.get("type") or item.get("item_type") or "") if isinstance(item, dict) else (getattr(item, "type", "") or getattr(item, "item_type", ""))
            i_name = (item.get("name") or "") if isinstance(item, dict) else getattr(item, "name", "")
            i_cat = (item.get("category") or "") if isinstance(item, dict) else getattr(item, "category", "")

            if applicable_to == "ENTIRE_BILL":
                eligible_amount += item_line_total
            elif applicable_to == "SERVICES_ONLY":
                if str(i_type).lower() in ["service", "services"]:
                    eligible_amount += item_line_total
            elif applicable_to == "PRODUCTS_ONLY":
                if str(i_type).lower() in ["product", "products", "retail"]:
                    eligible_amount += item_line_total
            elif applicable_to == "SPECIFIC_SERVICE":
                target = (offer.applicable_target or "").lower()
                if (str(i_type).lower() in ["service", "services"]) and (target in i_name.lower()):
                    eligible_amount += item_line_total
            elif applicable_to == "SPECIFIC_PRODUCT":
                target = (offer.applicable_target or "").lower()
                if (str(i_type).lower() in ["product", "products", "retail"]) and (target in i_name.lower()):
                    eligible_amount += item_line_total
            elif applicable_to == "SPECIFIC_CATEGORY":
                target = (offer.applicable_target or "").lower()
                if target in str(i_cat).lower() or target in str(i_name).lower():
                    eligible_amount += item_line_total
            else:
                eligible_amount += item_line_total

    if applicable_to == "SERVICES_ONLY" and eligible_amount <= 0:
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is applicable to salon services only."}
    if applicable_to == "PRODUCTS_ONLY" and eligible_amount <= 0:
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": "This coupon is applicable to retail products only."}
    if applicable_to in ["SPECIFIC_SERVICE", "SPECIFIC_PRODUCT"] and eligible_amount <= 0:
        return {"valid": False, "discount": 0.0, "finalAmount": subtotal, "message": f"This coupon is not applicable to the selected items (applies to {offer.applicable_target or 'specific items'})."}

    # Minimum spend check
    min_spend = float(offer.minimum_spend or 0.0)
    if min_spend > 0 and eligible_amount < min_spend:
        return {
            "valid": False,
            "discount": 0.0,
            "finalAmount": subtotal,
            "message": f"Minimum spend of ₹{int(min_spend):,} is required."
        }

    # Calculate discount
    discount_val = float(offer.discount_value or offer.discountPercent or 0.0)
    d_type = (offer.discount_type or "PERCENTAGE").upper()
    if d_type in ["PERCENTAGE", "PERCENT"]:
        calculated_discount = (eligible_amount * discount_val) / 100.0
    else: # FIXED_AMOUNT
        calculated_discount = discount_val

    # Never allow discount to exceed eligible cart amount
    calculated_discount = min(calculated_discount, eligible_amount)

    # Maximum discount cap
    max_cap = float(offer.maximum_discount or 0.0)
    if max_cap > 0 and calculated_discount > max_cap:
        calculated_discount = max_cap

    calculated_discount = round(calculated_discount, 2)
    final_amount = max(0.0, round(float(subtotal or eligible_amount) - calculated_discount, 2))

    return {
        "valid": True,
        "coupon_id": offer.id,
        "code": offer.code,
        "discount": calculated_discount,
        "finalAmount": final_amount,
        "message": f"Coupon '{offer.code}' applied! Saved ₹{calculated_discount:,.2f}",
        "coupon": format_offer_dict(offer),
        "coupon_model": offer
    }


    # Server-side subtotal & total recalculation for financial security
    calculated_subtotal = 0.0
    for item in inv.items:
        if isinstance(item, dict):
            price = float(item.get("price") or item.get("unit_price") or 0.0)
            qty = int(item.get("qty") or item.get("quantity") or 1)
            calculated_subtotal += price * qty

    # Coupon validation & redemption handling (Production-grade, server-side validated)
    server_discount = 0.0
    validated_coupon = None
    if inv.couponCode and inv.couponCode.strip():
        val_res = validate_coupon_logic(
            db=db,
            code=inv.couponCode.strip(),
            customer_id=inv.customer_id,
            customer_phone=inv.customerPhone,
            customer_name=inv.customerName,
            items=inv.items,
            subtotal=calculated_subtotal
        )
        if not val_res.get("valid"):
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=val_res.get("message") or "Invalid coupon code"
            )
        server_discount = float(val_res.get("discount", 0.0))
        validated_coupon = val_res.get("coupon_model")
    else:
        server_discount = min(calculated_subtotal, float(inv.discount or 0.0))

    tax_amount = max(0.0, (calculated_subtotal - server_discount) * 0.18)
    final_total = max(0.0, (calculated_subtotal - server_discount) + tax_amount)

    db_inv = InvoiceModel(
        id=inv_id,
        invoiceNumber=inv_num,
        customer_id=inv.customer_id,
        customerName=inv.customerName,
        customerPhone=inv.customerPhone,
        date=inv.date or datetime.utcnow().strftime("%Y-%m-%d"),
        items=inv.items,
        subtotal=calculated_subtotal or inv.subtotal,
        discount=server_discount,
        couponCode=validated_coupon.code if validated_coupon else (inv.couponCode or ""),
        tax=tax_amount if tax_amount > 0 else inv.tax,
        total=final_total if final_total > 0 else inv.total,
        paymentMethod=inv.paymentMethod or "Cash",
        status=inv.status or "Paid"
    )
    db.add(db_inv)

    # Double-Redemption Protection: record redemption atomically within transaction
    if validated_coupon:
        redemption_id = f"red-{uuid.uuid4().hex[:8]}"
        db_redemption = CouponRedemptionModel(
            id=redemption_id,
            coupon_id=validated_coupon.id,
            coupon_code=validated_coupon.code,
            customer_id=inv.customer_id,
            customer_name=inv.customerName,
            customer_phone=inv.customerPhone,
            invoice_id=inv_id,
            invoice_number=inv_num,
            discount_amount=server_discount,
            subtotal_before_discount=calculated_subtotal,
            final_total=final_total,
            authorized_user="Staff Cashier"
        )
        db.add(db_redemption)
        validated_coupon.used_count = (validated_coupon.used_count or 0) + 1
        create_audit_record(
            db,
            "COUPON_REDEEMED",
            "Coupons",
            f"Coupon {validated_coupon.code} redeemed on invoice {inv_num} for ₹{server_discount:,.2f} discount",
            entity_type="Coupon",
            entity_id=validated_coupon.id
        )

    # Update Customer Spend & Visits
    if inv.customerPhone:
        cust = db.query(CustomerModel).filter(
            or_(CustomerModel.phone == inv.customerPhone, CustomerModel.name == inv.customerName)
        ).first()
        if cust:
            cust.visitsCount = (cust.visitsCount or 0) + 1
            cust.totalSpent = float(cust.totalSpent or 0.0) + final_total
            cust.lastVisit = inv.date or datetime.utcnow().strftime("%Y-%m-%d")

    # Automatic Partner Commission Calculation for Partner Products in Invoice
    if inv.items:
        current_period = datetime.utcnow().strftime("%B %Y")
        for item in inv.items:
            is_prod = False
            if isinstance(item, dict):
                is_prod = item.get("type") in ["Product", "product"] or item.get("item_type") in ["Product", "product"]
            elif hasattr(item, "item_type"):
                is_prod = item.item_type in ["Product", "product"]

            if is_prod:
                p_id = item.get("id") or item.get("item_id") or item.get("productId") if isinstance(item, dict) else getattr(item, "item_id", None)
                p_name = item.get("name") if isinstance(item, dict) else getattr(item, "name", "")
                p_price = float(item.get("price") or item.get("unit_price") or 0.0) if isinstance(item, dict) else float(getattr(item, "unit_price", 0.0))
                p_qty = int(item.get("qty") or item.get("quantity") or 1) if isinstance(item, dict) else int(getattr(item, "quantity", 1))
                item_sale_total = p_price * p_qty

                # Look up partner_product
                partner_prod = None
                if p_id:
                    partner_prod = db.query(PartnerProductModel).filter(PartnerProductModel.product_id == p_id, PartnerProductModel.status == "Active").first()
                if not partner_prod and p_name:
                    partner_prod = db.query(PartnerProductModel).filter(PartnerProductModel.product_name.ilike(f"%{p_name}%"), PartnerProductModel.status == "Active").first()

                if partner_prod and partner_prod.partner_id:
                    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == partner_prod.partner_id, ProductPartnerModel.status == "Active").first()
                    if partner:
                        comm_rate = float(partner_prod.commission_rate or partner.commission_rate or 10.0)
                        comm_amount = round(item_sale_total * comm_rate / 100.0, 2)
                        comm_id = f"com-{uuid.uuid4().hex[:8]}"
                        db_comm = PartnershipCommissionModel(
                            id=comm_id,
                            partner_id=partner.id,
                            product_id=partner_prod.product_id,
                            invoice_id=inv_id,
                            invoice_number=inv_num,
                            sale_amount=item_sale_total,
                            commission_rate=comm_rate,
                            commission_amount=comm_amount,
                            period=current_period,
                            status="Calculated",
                            payment_status="Pending",
                            notes=f"Auto-calculated on {p_qty}x {partner_prod.product_name} via Invoice {inv_num}"
                        )
                        db.add(db_comm)

    db.commit()
    db.refresh(db_inv)
    return db_inv

# ==================== HOME SERVICES API ====================
@app.get("/api/home-services")
def get_home_services(db: Session = Depends(get_db)):
    return db.query(HomeServiceModel).all()

@app.post("/api/home-services", status_code=status.HTTP_201_CREATED)
def create_home_service(hs: HomeServiceSchema, db: Session = Depends(get_db)):
    hs_id = hs.id or f"hs-{uuid.uuid4().hex[:8]}"
    db_hs = HomeServiceModel(
        id=hs_id,
        customerName=hs.customerName,
        customerPhone=hs.customerPhone,
        serviceName=hs.serviceName,
        address=hs.address,
        stylistName=hs.stylistName,
        date=hs.date,
        time=hs.time,
        status=hs.status or "Assigned",
        travelCharge=hs.travelCharge or 15.0
    )
    db.add(db_hs)
    db.commit()
    db.refresh(db_hs)
    return db_hs

# ==================== REVIEWS API ====================
@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db)):
    return db.query(ReviewModel).all()

@app.post("/api/reviews", status_code=status.HTTP_201_CREATED)
def create_review(rev: ReviewSchema, db: Session = Depends(get_db)):
    rev_id = rev.id or f"rev-{uuid.uuid4().hex[:8]}"
    db_rev = ReviewModel(
        id=rev_id,
        customerName=rev.customerName,
        rating=rev.rating,
        comment=rev.comment,
        date=rev.date or datetime.utcnow().strftime("%Y-%m-%d"),
        serviceName=rev.serviceName
    )
    db.add(db_rev)
    db.commit()
    db.refresh(db_rev)
    return db_rev

# ==================== OFFERS / CAMPAIGNS & PROMO VOUCHERS API ====================
@app.get("/api/offers")
@app.get("/api/coupons")
def get_offers(db: Session = Depends(get_db)):
    offers = db.query(OfferModel).order_by(OfferModel.createdAt.desc()).all()
    return [format_offer_dict(o) for o in offers]

@app.get("/api/offers/{offer_id}")
@app.get("/api/coupons/{offer_id}")
def get_single_offer(offer_id: str, db: Session = Depends(get_db)):
    offer = db.query(OfferModel).filter(OfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Coupon/Offer not found")
    return format_offer_dict(offer)

@app.post("/api/coupons/validate", response_model=CouponValidateResponseSchema)
def validate_coupon_endpoint(req: CouponValidateRequestSchema, db: Session = Depends(get_db)):
    c_id = req.customer_id or req.customerId
    c_name = req.customer_name or req.customerName
    c_phone = req.customer_phone or req.customerPhone
    result = validate_coupon_logic(
        db=db,
        code=req.code,
        customer_id=c_id,
        customer_phone=c_phone,
        customer_name=c_name,
        items=req.items,
        subtotal=req.subtotal or 0.0
    )
    return {
        "valid": result.get("valid", False),
        "code": req.code,
        "discount": float(result.get("discount", 0.0)),
        "finalAmount": float(result.get("finalAmount", req.subtotal or 0.0)),
        "message": result.get("message", ""),
        "coupon": result.get("coupon")
    }

@app.post("/api/offers", status_code=status.HTTP_201_CREATED)
@app.post("/api/coupons", status_code=status.HTTP_201_CREATED)
def create_offer(off: OfferSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager", "Marketing Manager", "Owner"]))):
    clean_code = off.code.strip().upper()
    existing = db.query(OfferModel).filter(func.upper(OfferModel.code) == clean_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon code '{clean_code}' already exists. Please choose or generate a unique code."
        )

    off_id = off.id or f"off-{uuid.uuid4().hex[:8]}"
    d_type = (off.discount_type or off.discountType or "PERCENTAGE").upper()
    d_val = float(off.discount_value if off.discount_value is not None else (off.discountValue or off.discountPercent or 15.0))
    min_spend = float(off.minimum_spend if off.minimum_spend is not None else (off.minSpend or 0.0))
    max_disc = float(off.maximum_discount if off.maximum_discount is not None else (off.maxDiscount or 0.0))
    v_from = off.valid_from or off.validFrom or datetime.utcnow().strftime("%Y-%m-%d")
    v_until = off.valid_until or off.validUntil or off.validTill or "2026-12-31"

    if v_from and v_until and v_until < v_from:
        raise HTTPException(status_code=400, detail="Valid Until date cannot be earlier than Valid From date.")

    u_limit = int(off.usage_limit if off.usage_limit is not None else (off.usageLimit or off.maxUsage or 100))
    p_cust = int(off.per_customer_limit if off.per_customer_limit is not None else (off.perCustomerLimit or 1))

    db_off = OfferModel(
        id=off_id,
        campaign_id=off.campaign_id or f"cmp-{uuid.uuid4().hex[:6]}",
        title=off.title,
        code=clean_code,
        description=off.description or "",
        discount_type=d_type,
        discount_value=d_val,
        discountPercent=d_val if d_type in ["PERCENTAGE", "PERCENT"] else 0.0,
        minimum_spend=min_spend,
        maximum_discount=max_disc,
        valid_from=v_from,
        valid_until=v_until,
        validTill=v_until,
        usage_limit=u_limit,
        used_count=0,
        per_customer_limit=p_cust,
        customer_eligibility=off.customer_eligibility or off.customerEligibility or "ALL_CUSTOMERS",
        applicable_to=off.applicable_to or off.applicableTo or "ENTIRE_BILL",
        applicable_target=off.applicable_target or off.applicableTarget or "",
        status=(off.status or "ACTIVE").upper(),
        branch_id=off.branch_id,
        notes=off.notes or "",
        created_by=current_user.name if current_user else "Super Admin"
    )
    db.add(db_off)
    db.commit()
    db.refresh(db_off)

    create_audit_record(
        db,
        "COUPON_CREATED",
        "Marketing",
        f"Coupon '{clean_code}' created for campaign '{db_off.title}' with {d_type} {d_val}",
        user=current_user,
        entity_type="Coupon",
        entity_id=db_off.id
    )

    return format_offer_dict(db_off)

@app.put("/api/offers/{offer_id}")
@app.put("/api/coupons/{offer_id}")
def update_offer(offer_id: str, data: dict, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager", "Marketing Manager", "Owner"]))):
    offer = db.query(OfferModel).filter(OfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Coupon/Offer not found")

    old_status = offer.status
    if "title" in data:
        offer.title = data["title"]
    if "description" in data:
        offer.description = data["description"]
    if "discount_type" in data or "discountType" in data:
        offer.discount_type = (data.get("discount_type") or data.get("discountType")).upper()
    if "discount_value" in data or "discountValue" in data:
        val = float(data.get("discount_value") or data.get("discountValue") or 0.0)
        offer.discount_value = val
        if (offer.discount_type or "PERCENTAGE").upper() in ["PERCENTAGE", "PERCENT"]:
            offer.discountPercent = val
    if "minimum_spend" in data or "minSpend" in data:
        offer.minimum_spend = float(data.get("minimum_spend") or data.get("minSpend") or 0.0)
    if "maximum_discount" in data or "maxDiscount" in data:
        offer.maximum_discount = float(data.get("maximum_discount") or data.get("maxDiscount") or 0.0)
    if "valid_from" in data or "validFrom" in data:
        offer.valid_from = data.get("valid_from") or data.get("validFrom")
    if "valid_until" in data or "validUntil" in data or "validTill" in data:
        v_u = data.get("valid_until") or data.get("validUntil") or data.get("validTill")
        offer.valid_until = v_u
        offer.validTill = v_u
    if "usage_limit" in data or "usageLimit" in data or "maxUsage" in data:
        offer.usage_limit = int(data.get("usage_limit") or data.get("usageLimit") or data.get("maxUsage") or 0)
    if "per_customer_limit" in data or "perCustomerLimit" in data:
        offer.per_customer_limit = int(data.get("per_customer_limit") or data.get("perCustomerLimit") or 1)
    if "customer_eligibility" in data or "customerEligibility" in data:
        offer.customer_eligibility = data.get("customer_eligibility") or data.get("customerEligibility")
    if "applicable_to" in data or "applicableTo" in data:
        offer.applicable_to = data.get("applicable_to") or data.get("applicableTo")
    if "applicable_target" in data or "applicableTarget" in data:
        offer.applicable_target = data.get("applicable_target") or data.get("applicableTarget")
    if "status" in data:
        offer.status = str(data["status"]).upper()
    if "notes" in data:
        offer.notes = data["notes"]

    offer.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(offer)

    create_audit_record(
        db,
        "COUPON_UPDATED",
        "Marketing",
        f"Coupon '{offer.code}' updated (Status: {old_status} -> {offer.status})",
        user=current_user,
        entity_type="Coupon",
        entity_id=offer.id
    )

    return format_offer_dict(offer)

@app.post("/api/offers/{offer_id}/reactivate")
@app.post("/api/coupons/{offer_id}/reactivate")
def reactivate_offer(offer_id: str, data: CouponReactivateSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager", "Marketing Manager", "Owner"]))):
    offer = db.query(OfferModel).filter(OfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Coupon/Offer not found")

    if data.valid_until < data.valid_from:
        raise HTTPException(status_code=400, detail="New Valid Until date must be on or after Valid From date.")

    offer.valid_from = data.valid_from
    offer.valid_until = data.valid_until
    offer.validTill = data.valid_until
    if data.usage_limit is not None and data.usage_limit > 0:
        offer.usage_limit = data.usage_limit
    offer.status = "ACTIVE"
    offer.updatedAt = datetime.utcnow()

    db.commit()
    db.refresh(offer)

    create_audit_record(
        db,
        "COUPON_REACTIVATED",
        "Marketing",
        f"Coupon '{offer.code}' reactivated until {data.valid_until}",
        user=current_user,
        entity_type="Coupon",
        entity_id=offer.id
    )

    return format_offer_dict(offer)

@app.post("/api/offers/{offer_id}/pause")
@app.post("/api/coupons/{offer_id}/pause")
def pause_offer(offer_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager", "Marketing Manager", "Owner"]))):
    offer = db.query(OfferModel).filter(OfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Coupon/Offer not found")

    offer.status = "PAUSED"
    offer.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(offer)

    create_audit_record(
        db,
        "COUPON_PAUSED",
        "Marketing",
        f"Coupon '{offer.code}' was paused",
        user=current_user,
        entity_type="Coupon",
        entity_id=offer.id
    )
    return format_offer_dict(offer)

@app.post("/api/offers/{offer_id}/activate")
@app.post("/api/coupons/{offer_id}/activate")
def activate_offer(offer_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Branch Manager", "Marketing Manager", "Owner"]))):
    offer = db.query(OfferModel).filter(OfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Coupon/Offer not found")

    offer.status = "ACTIVE"
    offer.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(offer)

    create_audit_record(
        db,
        "COUPON_ACTIVATED",
        "Marketing",
        f"Coupon '{offer.code}' was activated",
        user=current_user,
        entity_type="Coupon",
        entity_id=offer.id
    )
    return format_offer_dict(offer)

@app.delete("/api/offers/{offer_id}")
@app.delete("/api/coupons/{offer_id}")
def delete_or_archive_offer(offer_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin", "Owner"]))):
    offer = db.query(OfferModel).filter(OfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Coupon/Offer not found")

    # Safety: If coupon has historical redemptions, never delete it; soft-delete/archive it.
    redemption_count = db.query(CouponRedemptionModel).filter(CouponRedemptionModel.coupon_id == offer_id).count()
    if redemption_count > 0:
        offer.status = "ARCHIVED"
        offer.updatedAt = datetime.utcnow()
        db.commit()
        create_audit_record(
            db,
            "COUPON_ARCHIVED",
            "Marketing",
            f"Coupon '{offer.code}' archived (preserved {redemption_count} redemptions)",
            user=current_user,
            entity_type="Coupon",
            entity_id=offer.id
        )
        return {"message": "Coupon has historical redemptions and was safely archived."}
    else:
        db.delete(offer)
        db.commit()
        create_audit_record(
            db,
            "COUPON_DELETED",
            "Marketing",
            f"Coupon '{offer.code}' deleted",
            user=current_user,
            entity_type="Coupon",
            entity_id=offer_id
        )
        return {"message": "Coupon deleted successfully."}

@app.get("/api/coupons/redemptions")
def get_coupon_redemptions(coupon_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CouponRedemptionModel)
    if coupon_id:
        query = query.filter(CouponRedemptionModel.coupon_id == coupon_id)
    return query.order_by(CouponRedemptionModel.redeemed_at.desc()).all()

@app.get("/api/coupons/analytics")
def get_coupon_analytics(db: Session = Depends(get_db)):
    offers = db.query(OfferModel).all()
    redemptions = db.query(CouponRedemptionModel).all()

    total_campaigns = len({o.campaign_id for o in offers if o.campaign_id}) or len(offers)
    total_coupons = len(offers)

    active_count = 0
    expired_count = 0
    unused_count = 0

    for o in offers:
        st = compute_coupon_status(o)
        if st == "ACTIVE":
            active_count += 1
        elif st == "EXPIRED":
            expired_count += 1
        if (o.used_count or 0) == 0:
            unused_count += 1

    total_redemptions = len(redemptions)
    total_discount_given = sum(float(r.discount_amount or 0.0) for r in redemptions)
    revenue_generated = sum(float(r.final_total or 0.0) for r in redemptions)
    avg_discount = (total_discount_given / total_redemptions) if total_redemptions > 0 else 0.0

    most_used = None
    if offers:
        sorted_by_use = sorted(offers, key=lambda x: (x.used_count or 0), reverse=True)
        if sorted_by_use and (sorted_by_use[0].used_count or 0) > 0:
            most_used = {
                "code": sorted_by_use[0].code,
                "title": sorted_by_use[0].title,
                "used_count": sorted_by_use[0].used_count
            }

    return {
        "total_campaigns": total_campaigns,
        "active_campaigns": active_count,
        "expired_campaigns": expired_count,
        "total_coupons": total_coupons,
        "total_redemptions": total_redemptions,
        "total_discount_given": round(total_discount_given, 2),
        "revenue_generated": round(revenue_generated, 2),
        "average_discount": round(avg_discount, 2),
        "most_used_coupon": most_used,
        "unused_coupons": unused_count
    }

# ==================== NOTIFICATIONS API ====================
@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(NotificationModel).all()

@app.post("/api/notifications", status_code=status.HTTP_201_CREATED)
def create_notification(notif: NotificationSchema, db: Session = Depends(get_db)):
    notif_id = notif.id or f"notif-{uuid.uuid4().hex[:8]}"
    db_notif = NotificationModel(
        id=notif_id,
        title=notif.title,
        message=notif.message,
        time=notif.time or datetime.utcnow().strftime("%I:%M %p"),
        read=notif.read,
        priority=notif.priority or "medium"
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

# ==================== AUDIT LOGS API ====================
@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLogModel).order_by(AuditLogModel.createdAt.desc()).all()

@app.post("/api/audit-logs", status_code=status.HTTP_201_CREATED)
def log_audit_event(log: AuditLogSchema, db: Session = Depends(get_db)):
    log_id = log.id or f"aud-{uuid.uuid4().hex[:8]}"
    db_log = AuditLogModel(
        id=log_id,
        user_id=log.user_id,
        user_name=log.user_name,
        role=log.role,
        action=log.action,
        module=log.module,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        details=log.details,
        ip_address=log.ip_address,
        timestamp=log.timestamp or datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# ==================== SETTINGS API ====================
@app.get("/api/settings")
def get_all_settings(db: Session = Depends(get_db)):
    return db.query(SettingsModel).all()

@app.post("/api/settings")
def save_setting(sett: SettingsSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(require_roles(["Super Admin"]))):
    db_sett = db.query(SettingsModel).filter(SettingsModel.key == sett.key).first()
    if db_sett:
        db_sett.value = sett.value
    else:
        db_sett = SettingsModel(
            id=f"set-{uuid.uuid4().hex[:8]}",
            key=sett.key,
            value=sett.value
        )
        db.add(db_sett)
    db.commit()
    db.refresh(db_sett)
    return db_sett

# =====================================================================
# PRODUCT PARTNERSHIP & BRAND COLLABORATION REST APIS
# =====================================================================

def format_partner_response(partner: ProductPartnerModel, db: Session):
    products = db.query(PartnerProductModel).filter(PartnerProductModel.partner_id == partner.id).all()
    campaigns = db.query(PartnershipCampaignModel).filter(PartnershipCampaignModel.partner_id == partner.id).all()
    commissions = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.partner_id == partner.id).all()
    payments = db.query(PartnershipPaymentModel).filter(PartnershipPaymentModel.partner_id == partner.id).all()

    total_sales = sum(float(c.sale_amount or 0.0) for c in commissions)
    total_commission = sum(float(c.commission_amount or 0.0) for c in commissions)
    paid_commission = sum(float(p.amount or 0.0) for p in payments if p.status == "Paid")
    pending_commission = max(0.0, total_commission - paid_commission)
    active_campaigns = sum(1 for cmp in campaigns if cmp.status == "Active")

    return {
        "id": partner.id,
        "partner_code": partner.partner_code,
        "company_name": partner.company_name,
        "brand_name": partner.brand_name,
        "contact_person": partner.contact_person or "",
        "phone": partner.phone or "",
        "email": partner.email or "",
        "website": partner.website or "",
        "address": partner.address or "",
        "city": partner.city or "",
        "state": partner.state or "",
        "country": partner.country or "India",
        "tax_id": partner.tax_id or "",
        "category": partner.category or "Hair Care",
        "partnership_type": partner.partnership_type or "Product Promotion",
        "start_date": partner.start_date or "",
        "end_date": partner.end_date or "",
        "commission_type": partner.commission_type or "Percentage",
        "commission_rate": float(partner.commission_rate or 10.0),
        "revenue_share": float(partner.revenue_share or 0.0),
        "payment_terms": partner.payment_terms or "Net 30 Days",
        "status": partner.status or "Active",
        "description": partner.description or "",
        "notes": partner.notes or "",
        "logo_url": partner.logo_url or "",
        "contract_url": partner.contract_url or "",
        "distributor_id": partner.distributor_id,
        "products_count": len(products),
        "active_campaigns_count": active_campaigns,
        "total_sales": round(total_sales, 2),
        "commission_earned": round(total_commission, 2),
        "pending_commission": round(pending_commission, 2),
        "createdAt": partner.createdAt.isoformat() if partner.createdAt else None
    }

# 1. Partner Listing & Details
@app.get("/api/product-partners")
def get_product_partners(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    partnership_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductPartnerModel)
    if status and status != "ALL":
        query = query.filter(ProductPartnerModel.status == status)
    if category and category != "ALL":
        query = query.filter(ProductPartnerModel.category == category)
    if partnership_type and partnership_type != "ALL":
        query = query.filter(ProductPartnerModel.partnership_type == partnership_type)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                ProductPartnerModel.company_name.ilike(s),
                ProductPartnerModel.brand_name.ilike(s),
                ProductPartnerModel.contact_person.ilike(s),
                ProductPartnerModel.partner_code.ilike(s),
                ProductPartnerModel.category.ilike(s)
            )
        )
    partners = query.order_by(ProductPartnerModel.partner_code.asc()).all()
    return [format_partner_response(p, db) for p in partners]

@app.post("/api/product-partners", status_code=status.HTTP_201_CREATED)
def create_product_partner(
    partner_in: ProductPartnerSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Auto-generate partner code if missing
    count = db.query(ProductPartnerModel).count()
    partner_code = partner_in.partner_code or f"PTN-{str(count + 1).zfill(3)}"
    p_id = partner_in.id or f"ptn-{uuid.uuid4().hex[:8]}"

    db_partner = ProductPartnerModel(
        id=p_id,
        partner_code=partner_code,
        company_name=partner_in.company_name,
        brand_name=partner_in.brand_name,
        contact_person=partner_in.contact_person,
        phone=partner_in.phone,
        email=partner_in.email,
        website=partner_in.website,
        address=partner_in.address,
        city=partner_in.city,
        state=partner_in.state,
        country=partner_in.country or "India",
        tax_id=partner_in.tax_id,
        category=partner_in.category or "Hair Care",
        partnership_type=partner_in.partnership_type or "Product Promotion",
        start_date=partner_in.start_date,
        end_date=partner_in.end_date,
        commission_type=partner_in.commission_type or "Percentage",
        commission_rate=partner_in.commission_rate if partner_in.commission_rate is not None else 10.0,
        revenue_share=partner_in.revenue_share if partner_in.revenue_share is not None else 0.0,
        payment_terms=partner_in.payment_terms or "Net 30 Days",
        status=partner_in.status or "Active",
        description=partner_in.description,
        notes=partner_in.notes,
        logo_url=partner_in.logo_url,
        contract_url=partner_in.contract_url,
        distributor_id=partner_in.distributor_id
    )
    db.add(db_partner)

    # Initial Activity Log
    act = PartnershipActivityLogModel(
        id=f"act-{uuid.uuid4().hex[:8]}",
        partner_id=p_id,
        action="Partner Created",
        details=f"Partner {db_partner.brand_name} ({partner_code}) onboarded by {current_user.name if current_user else 'Admin'}",
        user_name=current_user.name if current_user else "Admin"
    )
    db.add(act)

    create_audit_record(
        db,
        "PARTNER_CREATED",
        "Product Partnership",
        f"Created partner {db_partner.brand_name} ({partner_code})",
        user=current_user,
        entity_type="ProductPartner",
        entity_id=p_id
    )
    db.commit()
    db.refresh(db_partner)
    return format_partner_response(db_partner, db)

@app.get("/api/product-partners/{id}")
def get_product_partner_details(id: str, db: Session = Depends(get_db)):
    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    base_data = format_partner_response(partner, db)
    products = db.query(PartnerProductModel).filter(PartnerProductModel.partner_id == partner.id).all()
    campaigns = db.query(PartnershipCampaignModel).filter(PartnershipCampaignModel.partner_id == partner.id).all()
    commissions = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.partner_id == partner.id).order_by(PartnershipCommissionModel.createdAt.desc()).all()
    payments = db.query(PartnershipPaymentModel).filter(PartnershipPaymentModel.partner_id == partner.id).order_by(PartnershipPaymentModel.payment_date.desc()).all()
    documents = db.query(PartnershipDocumentModel).filter(PartnershipDocumentModel.partner_id == partner.id).all()
    activities = db.query(PartnershipActivityLogModel).filter(PartnershipActivityLogModel.partner_id == partner.id).order_by(PartnershipActivityLogModel.createdAt.desc()).all()

    base_data["products"] = [
        {
            "id": p.id,
            "product_id": p.product_id,
            "product_name": p.product_name,
            "sku": p.sku,
            "category": p.category,
            "brand": p.brand,
            "purchase_price": float(p.purchase_price or 0.0),
            "selling_price": float(p.selling_price or 0.0),
            "commission_rate": float(p.commission_rate or 10.0),
            "status": p.status,
            "stock": p.product.stock if p.product else 0
        } for p in products
    ]
    base_data["campaigns"] = [
        {
            "id": c.id,
            "campaign_code": c.campaign_code,
            "name": c.name,
            "campaign_type": c.campaign_type,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "discount": float(c.discount or 0.0),
            "promo_code": c.promo_code,
            "target_sales": float(c.target_sales or 0.0),
            "budget": float(c.budget or 0.0),
            "status": c.status
        } for c in campaigns
    ]
    base_data["commissions"] = [
        {
            "id": cm.id,
            "invoice_number": cm.invoice_number,
            "sale_amount": float(cm.sale_amount or 0.0),
            "commission_rate": float(cm.commission_rate or 10.0),
            "commission_amount": float(cm.commission_amount or 0.0),
            "period": cm.period,
            "status": cm.status,
            "payment_status": cm.payment_status,
            "notes": cm.notes
        } for cm in commissions
    ]
    base_data["payments"] = [
        {
            "id": py.id,
            "payment_code": py.payment_code,
            "amount": float(py.amount or 0.0),
            "payment_date": py.payment_date,
            "payment_method": py.payment_method,
            "reference_number": py.reference_number,
            "status": py.status,
            "notes": py.notes
        } for py in payments
    ]
    base_data["documents"] = [
        {
            "id": d.id,
            "document_name": d.document_name,
            "document_type": d.document_type,
            "file_url": d.file_url,
            "upload_date": d.upload_date,
            "notes": d.notes
        } for d in documents
    ]
    base_data["activity_logs"] = [
        {
            "id": a.id,
            "action": a.action,
            "details": a.details,
            "user_name": a.user_name,
            "createdAt": a.createdAt.isoformat() if a.createdAt else None
        } for a in activities
    ]
    return base_data

@app.put("/api/product-partners/{id}")
def update_product_partner(
    id: str,
    partner_in: ProductPartnerSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    old_status = partner.status
    partner.company_name = partner_in.company_name
    partner.brand_name = partner_in.brand_name
    partner.contact_person = partner_in.contact_person
    partner.phone = partner_in.phone
    partner.email = partner_in.email
    partner.website = partner_in.website
    partner.address = partner_in.address
    partner.city = partner_in.city
    partner.state = partner_in.state
    partner.country = partner_in.country or "India"
    partner.tax_id = partner_in.tax_id
    partner.category = partner_in.category
    partner.partnership_type = partner_in.partnership_type
    partner.start_date = partner_in.start_date
    partner.end_date = partner_in.end_date
    partner.commission_type = partner_in.commission_type
    partner.commission_rate = partner_in.commission_rate
    partner.revenue_share = partner_in.revenue_share
    partner.payment_terms = partner_in.payment_terms
    partner.status = partner_in.status
    partner.description = partner_in.description
    partner.notes = partner_in.notes
    if partner_in.logo_url:
        partner.logo_url = partner_in.logo_url

    if old_status != partner.status:
        act = PartnershipActivityLogModel(
            id=f"act-{uuid.uuid4().hex[:8]}",
            partner_id=partner.id,
            action="Status Updated",
            details=f"Partnership status changed from {old_status} to {partner.status}",
            user_name=current_user.name if current_user else "Admin"
        )
        db.add(act)

    create_audit_record(
        db,
        "PARTNER_UPDATED",
        "Product Partnership",
        f"Updated partner details for {partner.brand_name} ({partner.partner_code})",
        user=current_user,
        entity_type="ProductPartner",
        entity_id=partner.id
    )
    db.commit()
    db.refresh(partner)
    return format_partner_response(partner, db)

@app.delete("/api/product-partners/{id}")
def delete_or_deactivate_partner(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Business Rule 11: If historical transactions exist, deactivate rather than hard delete
    comm_count = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.partner_id == id).count()
    pmt_count = db.query(PartnershipPaymentModel).filter(PartnershipPaymentModel.partner_id == id).count()

    if comm_count > 0 or pmt_count > 0:
        partner.status = "Suspended"
        act = PartnershipActivityLogModel(
            id=f"act-{uuid.uuid4().hex[:8]}",
            partner_id=partner.id,
            action="Partnership Suspended",
            details="Partner deactivated and set to Suspended due to historical transaction records.",
            user_name=current_user.name if current_user else "Admin"
        )
        db.add(act)
        create_audit_record(
            db,
            "PARTNER_SUSPENDED",
            "Product Partnership",
            f"Suspended partner {partner.brand_name} due to historical transactions",
            user=current_user,
            entity_type="ProductPartner",
            entity_id=id
        )
        db.commit()
        return {"status": "deactivated", "message": f"Partner has {comm_count} transactions. Status changed to Suspended."}
    else:
        create_audit_record(
            db,
            "PARTNER_DELETED",
            "Product Partnership",
            f"Deleted partner {partner.brand_name} ({partner.partner_code})",
            user=current_user,
            entity_type="ProductPartner",
            entity_id=id
        )
        db.delete(partner)
        db.commit()
        return {"status": "deleted", "message": "Partner deleted successfully"}

# 2. Partnership Requests
@app.get("/api/partnership-requests")
def get_partnership_requests(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PartnershipRequestModel)
    if status and status != "ALL":
        query = query.filter(PartnershipRequestModel.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                PartnershipRequestModel.company_name.ilike(s),
                PartnershipRequestModel.brand_name.ilike(s),
                PartnershipRequestModel.contact_person.ilike(s),
                PartnershipRequestModel.request_code.ilike(s)
            )
        )
    return query.order_by(PartnershipRequestModel.createdAt.desc()).all()

@app.post("/api/partnership-requests", status_code=status.HTTP_201_CREATED)
def create_partnership_request(req_in: PartnershipRequestSchema, db: Session = Depends(get_db)):
    count = db.query(PartnershipRequestModel).count()
    req_code = req_in.request_code or f"REQ-{str(count + 1).zfill(3)}"
    r_id = req_in.id or f"req-{uuid.uuid4().hex[:8]}"

    db_req = PartnershipRequestModel(
        id=r_id,
        request_code=req_code,
        company_name=req_in.company_name,
        brand_name=req_in.brand_name,
        contact_person=req_in.contact_person,
        phone=req_in.phone,
        email=req_in.email,
        website=req_in.website,
        product_category=req_in.product_category or "Hair Care",
        partnership_type=req_in.partnership_type or "Product Promotion",
        proposal=req_in.proposal,
        status="Pending",
        submitted_date=req_in.submitted_date or datetime.utcnow().strftime("%Y-%m-%d"),
        review_notes=req_in.review_notes
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@app.post("/api/partnership-requests/{id}/approve")
def approve_partnership_request(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    req = db.query(PartnershipRequestModel).filter(PartnershipRequestModel.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Partnership request not found")

    req.status = "Approved"
    req.reviewed_by = current_user.name if current_user else "Admin"

    # Automatically create Product Partner from approved request
    count = db.query(ProductPartnerModel).count()
    partner_code = f"PTN-{str(count + 1).zfill(3)}"
    p_id = f"ptn-{uuid.uuid4().hex[:8]}"

    db_partner = ProductPartnerModel(
        id=p_id,
        partner_code=partner_code,
        company_name=req.company_name,
        brand_name=req.brand_name,
        contact_person=req.contact_person,
        phone=req.phone,
        email=req.email,
        website=req.website,
        category=req.product_category or "Hair Care",
        partnership_type=req.partnership_type or "Product Promotion",
        start_date=datetime.utcnow().strftime("%Y-%m-%d"),
        commission_type="Percentage",
        commission_rate=10.0,
        status="Active",
        description=req.proposal,
        notes=f"Converted from approved request {req.request_code}"
    )
    db.add(db_partner)

    # Activity log
    act = PartnershipActivityLogModel(
        id=f"act-{uuid.uuid4().hex[:8]}",
        partner_id=p_id,
        action="Partnership Approved",
        details=f"Partnership request {req.request_code} approved by {current_user.name if current_user else 'Admin'}",
        user_name=current_user.name if current_user else "Admin"
    )
    db.add(act)

    create_audit_record(
        db,
        "PARTNERSHIP_APPROVED",
        "Product Partnership",
        f"Approved request {req.request_code} and created partner {db_partner.brand_name} ({partner_code})",
        user=current_user,
        entity_type="PartnershipRequest",
        entity_id=req.id
    )
    db.commit()
    db.refresh(db_partner)
    return {"message": "Partnership approved successfully", "partner": format_partner_response(db_partner, db)}

@app.post("/api/partnership-requests/{id}/reject")
def reject_partnership_request(
    id: str,
    notes_in: dict = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    req = db.query(PartnershipRequestModel).filter(PartnershipRequestModel.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Partnership request not found")

    req.status = "Rejected"
    req.reviewed_by = current_user.name if current_user else "Admin"
    if notes_in and "notes" in notes_in:
        req.review_notes = notes_in["notes"]

    create_audit_record(
        db,
        "PARTNERSHIP_REJECTED",
        "Product Partnership",
        f"Rejected partnership request {req.request_code}",
        user=current_user,
        entity_type="PartnershipRequest",
        entity_id=req.id
    )
    db.commit()
    db.refresh(req)
    return req

# 3. Partner Products
@app.get("/api/partner-products")
def get_partner_products(
    partner_id: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PartnerProductModel)
    if partner_id and partner_id != "ALL":
        query = query.filter(PartnerProductModel.partner_id == partner_id)
    if category and category != "ALL":
        query = query.filter(PartnerProductModel.category == category)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                PartnerProductModel.product_name.ilike(s),
                PartnerProductModel.sku.ilike(s),
                PartnerProductModel.brand.ilike(s)
            )
        )
    pps = query.all()
    results = []
    for pp in pps:
        partner = pp.partner
        product = pp.product
        # Calculate product sales and commission
        prod_commissions = db.query(PartnershipCommissionModel).filter(
            PartnershipCommissionModel.partner_id == pp.partner_id,
            PartnershipCommissionModel.product_id == pp.product_id
        ).all()
        total_prod_sales = sum(float(c.sale_amount or 0.0) for c in prod_commissions)

        results.append({
            "id": pp.id,
            "partner_id": pp.partner_id,
            "partner_name": partner.brand_name if partner else "Unknown Partner",
            "company_name": partner.company_name if partner else "",
            "product_id": pp.product_id,
            "product_name": pp.product_name,
            "sku": pp.sku or (product.sku if product else ""),
            "category": pp.category or (product.category if product else ""),
            "brand": pp.brand or (product.brand if product else ""),
            "purchase_price": float(pp.purchase_price or (product.purchasePrice if product else 0.0)),
            "selling_price": float(pp.selling_price or (product.sellingPrice if product else 0.0)),
            "commission_rate": float(pp.commission_rate or 10.0),
            "stock": product.stock if product else 0,
            "sales": round(total_prod_sales, 2),
            "start_date": pp.start_date or "",
            "end_date": pp.end_date or "",
            "status": pp.status or "Active",
            "createdAt": pp.createdAt.isoformat() if pp.createdAt else None
        })
    return results

@app.post("/api/partner-products", status_code=status.HTTP_201_CREATED)
def link_partner_product(
    pp_in: PartnerProductSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Business Rule 1: A partner must exist before products can be linked
    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == pp_in.partner_id).first()
    if not partner:
        raise HTTPException(status_code=400, detail="Partner does not exist")

    # Business Rule 2: Reuse existing product without duplicating
    product = db.query(ProductModel).filter(ProductModel.id == pp_in.product_id).first()
    if not product and pp_in.sku:
        product = db.query(ProductModel).filter(ProductModel.sku == pp_in.sku).first()

    if not product:
        # Create product in ProductModel to maintain integrity with Inventory & Product Sales
        p_id = pp_in.product_id or f"prod-{uuid.uuid4().hex[:8]}"
        product = ProductModel(
            id=p_id,
            name=pp_in.product_name,
            brand=pp_in.brand or partner.brand_name,
            category=pp_in.category or partner.category or "Hair Care",
            sku=pp_in.sku or f"SKU-{uuid.uuid4().hex[:6].upper()}",
            purchasePrice=pp_in.purchase_price or 0.0,
            sellingPrice=pp_in.selling_price or 0.0,
            stock=20,
            quantity=20,
            minimumStock=5,
            supplier=partner.company_name
        )
        db.add(product)
        db.flush()

    # Check if relationship already exists
    existing = db.query(PartnerProductModel).filter(
        PartnerProductModel.partner_id == partner.id,
        PartnerProductModel.product_id == product.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product is already linked to this partner")

    pp_id = pp_in.id or f"pprd-{uuid.uuid4().hex[:8]}"
    db_pp = PartnerProductModel(
        id=pp_id,
        partner_id=partner.id,
        product_id=product.id,
        product_name=product.name,
        sku=product.sku,
        category=product.category,
        brand=product.brand or partner.brand_name,
        purchase_price=pp_in.purchase_price or float(product.purchasePrice or 0.0),
        selling_price=pp_in.selling_price or float(product.sellingPrice or 0.0),
        commission_rate=pp_in.commission_rate if pp_in.commission_rate is not None else float(partner.commission_rate or 10.0),
        start_date=pp_in.start_date,
        end_date=pp_in.end_date,
        status=pp_in.status or "Active"
    )
    db.add(db_pp)

    act = PartnershipActivityLogModel(
        id=f"act-{uuid.uuid4().hex[:8]}",
        partner_id=partner.id,
        action="Product Linked",
        details=f"Linked product {product.name} (SKU: {product.sku}) with {db_pp.commission_rate}% commission",
        user_name=current_user.name if current_user else "Admin"
    )
    db.add(act)

    create_audit_record(
        db,
        "PARTNER_PRODUCT_LINKED",
        "Product Partnership",
        f"Linked product {product.name} to {partner.brand_name}",
        user=current_user,
        entity_type="PartnerProduct",
        entity_id=pp_id
    )
    db.commit()
    db.refresh(db_pp)
    return {
        "id": db_pp.id,
        "partner_id": db_pp.partner_id,
        "partner_name": partner.brand_name,
        "product_id": db_pp.product_id,
        "product_name": db_pp.product_name,
        "sku": db_pp.sku,
        "category": db_pp.category,
        "brand": db_pp.brand,
        "purchase_price": float(db_pp.purchase_price or 0.0),
        "selling_price": float(db_pp.selling_price or 0.0),
        "commission_rate": float(db_pp.commission_rate or 10.0),
        "stock": product.stock,
        "status": db_pp.status
    }

@app.delete("/api/partner-products/{id}")
def unlink_partner_product(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    pp = db.query(PartnerProductModel).filter(PartnerProductModel.id == id).first()
    if not pp:
        raise HTTPException(status_code=404, detail="Partner product link not found")

    partner = pp.partner
    prod_name = pp.product_name
    db.delete(pp)

    if partner:
        act = PartnershipActivityLogModel(
            id=f"act-{uuid.uuid4().hex[:8]}",
            partner_id=partner.id,
            action="Product Unlinked",
            details=f"Unlinked product {prod_name}",
            user_name=current_user.name if current_user else "Admin"
        )
        db.add(act)

    create_audit_record(
        db,
        "PARTNER_PRODUCT_UNLINKED",
        "Product Partnership",
        f"Unlinked product {prod_name}",
        user=current_user,
        entity_type="PartnerProduct",
        entity_id=id
    )
    db.commit()
    return {"message": "Product unlinked successfully"}

# 4. Campaigns API
@app.get("/api/partnership-campaigns")
def get_partnership_campaigns(
    partner_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PartnershipCampaignModel)
    if partner_id and partner_id != "ALL":
        query = query.filter(PartnershipCampaignModel.partner_id == partner_id)
    if status and status != "ALL":
        query = query.filter(PartnershipCampaignModel.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                PartnershipCampaignModel.name.ilike(s),
                PartnershipCampaignModel.campaign_code.ilike(s),
                PartnershipCampaignModel.promo_code.ilike(s)
            )
        )
    campaigns = query.order_by(PartnershipCampaignModel.createdAt.desc()).all()
    results = []
    for c in campaigns:
        partner = c.partner
        # Calculate actual sales linked to this campaign
        cmp_commissions = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.campaign_id == c.id).all()
        actual_sales = sum(float(cm.sale_amount or 0.0) for cm in cmp_commissions)

        results.append({
            "id": c.id,
            "campaign_code": c.campaign_code,
            "name": c.name,
            "partner_id": c.partner_id,
            "partner_name": partner.brand_name if partner else "Unknown",
            "campaign_type": c.campaign_type,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "description": c.description or "",
            "discount": float(c.discount or 0.0),
            "promo_code": c.promo_code or "",
            "target_sales": float(c.target_sales or 0.0),
            "actual_sales": round(actual_sales, 2),
            "budget": float(c.budget or 0.0),
            "salon_contribution": float(c.salon_contribution or 0.0),
            "partner_contribution": float(c.partner_contribution or 0.0),
            "marketing_channels": c.marketing_channels or [],
            "product_ids": c.product_ids or [],
            "status": c.status or "Active",
            "createdAt": c.createdAt.isoformat() if c.createdAt else None
        })
    return results

@app.post("/api/partnership-campaigns", status_code=status.HTTP_201_CREATED)
def create_partnership_campaign(
    c_in: PartnershipCampaignSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Business Rules 3 & 4: Inactive or expired partner cannot receive new campaign assignments
    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == c_in.partner_id).first()
    if not partner:
        raise HTTPException(status_code=400, detail="Selected partner does not exist")
    if partner.status != "Active":
        raise HTTPException(status_code=400, detail=f"Cannot create campaign for partner with status: {partner.status}")

    count = db.query(PartnershipCampaignModel).count()
    campaign_code = c_in.campaign_code or f"CMP-{str(count + 1).zfill(3)}"
    c_id = c_in.id or f"cmp-{uuid.uuid4().hex[:8]}"

    db_cmp = PartnershipCampaignModel(
        id=c_id,
        campaign_code=campaign_code,
        name=c_in.name,
        partner_id=c_in.partner_id,
        campaign_type=c_in.campaign_type or "Product Promotion",
        start_date=c_in.start_date,
        end_date=c_in.end_date,
        description=c_in.description,
        discount=c_in.discount or 0.0,
        promo_code=c_in.promo_code,
        target_sales=c_in.target_sales or 0.0,
        budget=c_in.budget or 0.0,
        salon_contribution=c_in.salon_contribution or 0.0,
        partner_contribution=c_in.partner_contribution or 0.0,
        marketing_channels=c_in.marketing_channels or [],
        product_ids=c_in.product_ids or [],
        status=c_in.status or "Active"
    )
    db.add(db_cmp)

    act = PartnershipActivityLogModel(
        id=f"act-{uuid.uuid4().hex[:8]}",
        partner_id=partner.id,
        action="Campaign Created",
        details=f"Launched joint campaign '{db_cmp.name}' ({campaign_code})",
        user_name=current_user.name if current_user else "Admin"
    )
    db.add(act)

    create_audit_record(
        db,
        "CAMPAIGN_CREATED",
        "Product Partnership",
        f"Created campaign {db_cmp.name} ({campaign_code}) with {partner.brand_name}",
        user=current_user,
        entity_type="PartnershipCampaign",
        entity_id=c_id
    )
    db.commit()
    db.refresh(db_cmp)
    return db_cmp

@app.put("/api/partnership-campaigns/{id}")
def update_partnership_campaign(
    id: str,
    c_in: PartnershipCampaignSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    cmp = db.query(PartnershipCampaignModel).filter(PartnershipCampaignModel.id == id).first()
    if not cmp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    cmp.name = c_in.name
    cmp.campaign_type = c_in.campaign_type
    cmp.start_date = c_in.start_date
    cmp.end_date = c_in.end_date
    cmp.description = c_in.description
    cmp.discount = c_in.discount
    cmp.promo_code = c_in.promo_code
    cmp.target_sales = c_in.target_sales
    cmp.budget = c_in.budget
    cmp.salon_contribution = c_in.salon_contribution
    cmp.partner_contribution = c_in.partner_contribution
    cmp.marketing_channels = c_in.marketing_channels
    cmp.product_ids = c_in.product_ids
    cmp.status = c_in.status

    db.commit()
    db.refresh(cmp)
    return cmp

@app.delete("/api/partnership-campaigns/{id}")
def delete_partnership_campaign(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    cmp = db.query(PartnershipCampaignModel).filter(PartnershipCampaignModel.id == id).first()
    if not cmp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    create_audit_record(
        db,
        "CAMPAIGN_DELETED",
        "Product Partnership",
        f"Deleted campaign {cmp.name}",
        user=current_user,
        entity_type="PartnershipCampaign",
        entity_id=id
    )
    db.delete(cmp)
    db.commit()
    return {"message": "Campaign deleted successfully"}

# 5. Commission Management
@app.get("/api/partnership-commissions")
def get_partnership_commissions(
    partner_id: Optional[str] = None,
    status: Optional[str] = None,
    period: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PartnershipCommissionModel)
    if partner_id and partner_id != "ALL":
        query = query.filter(PartnershipCommissionModel.partner_id == partner_id)
    if status and status != "ALL":
        query = query.filter(PartnershipCommissionModel.status == status)
    if period and period != "ALL":
        query = query.filter(PartnershipCommissionModel.period == period)

    commissions = query.order_by(PartnershipCommissionModel.createdAt.desc()).all()
    results = []
    for cm in commissions:
        partner = cm.partner
        product = cm.product
        campaign = cm.campaign
        results.append({
            "id": cm.id,
            "partner_id": cm.partner_id,
            "partner_name": partner.brand_name if partner else "Unknown",
            "product_id": cm.product_id,
            "product_name": product.name if product else "Multiple Products",
            "campaign_id": cm.campaign_id,
            "campaign_name": campaign.name if campaign else "Standard Sales",
            "invoice_id": cm.invoice_id,
            "invoice_number": cm.invoice_number or "",
            "sale_amount": float(cm.sale_amount or 0.0),
            "commission_rate": float(cm.commission_rate or 10.0),
            "commission_amount": float(cm.commission_amount or 0.0),
            "period": cm.period,
            "status": cm.status,
            "payment_status": cm.payment_status,
            "notes": cm.notes or "",
            "createdAt": cm.createdAt.isoformat() if cm.createdAt else None
        })
    return results

@app.post("/api/partnership-commissions", status_code=status.HTTP_201_CREATED)
def create_partnership_commission(
    cm_in: PartnershipCommissionSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Commission Calculation: Commission = Sale Amount * Commission Rate / 100
    calc_rate = cm_in.commission_rate if cm_in.commission_rate is not None else 10.0
    calc_amount = round(cm_in.sale_amount * calc_rate / 100.0, 2) if cm_in.commission_amount <= 0 else cm_in.commission_amount

    cm_id = cm_in.id or f"com-{uuid.uuid4().hex[:8]}"
    db_cm = PartnershipCommissionModel(
        id=cm_id,
        partner_id=cm_in.partner_id,
        product_id=cm_in.product_id,
        campaign_id=cm_in.campaign_id,
        invoice_id=cm_in.invoice_id,
        invoice_number=cm_in.invoice_number or "",
        sale_amount=cm_in.sale_amount,
        commission_rate=calc_rate,
        commission_amount=calc_amount,
        period=cm_in.period or datetime.utcnow().strftime("%B %Y"),
        status=cm_in.status or "Approved",
        payment_status=cm_in.payment_status or "Pending",
        notes=cm_in.notes
    )
    db.add(db_cm)
    db.commit()
    db.refresh(db_cm)
    return db_cm

@app.post("/api/partnership-commissions/{id}/approve")
def approve_commission(
    id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    cm = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.id == id).first()
    if not cm:
        raise HTTPException(status_code=404, detail="Commission record not found")

    cm.status = "Approved"
    create_audit_record(
        db,
        "COMMISSION_APPROVED",
        "Product Partnership",
        f"Approved commission ₹{float(cm.commission_amount):,.2f} for {cm.partner.brand_name if cm.partner else 'Partner'}",
        user=current_user,
        entity_type="PartnershipCommission",
        entity_id=id
    )
    db.commit()
    db.refresh(cm)
    return cm

@app.post("/api/partnership-commissions/{id}/pay")
def pay_commission(
    id: str,
    payment_info: dict,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Business Rule 6: Commission payment should not be marked as paid without a payment record
    cm = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.id == id).first()
    if not cm:
        raise HTTPException(status_code=404, detail="Commission record not found")

    count = db.query(PartnershipPaymentModel).count()
    pay_code = f"PAY-{str(count + 1).zfill(4)}"
    p_id = f"pay-{uuid.uuid4().hex[:8]}"

    amount_to_pay = float(payment_info.get("amount") or cm.commission_amount or 0.0)

    db_pay = PartnershipPaymentModel(
        id=p_id,
        payment_code=pay_code,
        partner_id=cm.partner_id,
        commission_id=cm.id,
        amount=amount_to_pay,
        payment_date=payment_info.get("payment_date") or datetime.utcnow().strftime("%Y-%m-%d"),
        payment_method=payment_info.get("payment_method") or "Bank Transfer",
        reference_number=payment_info.get("reference_number") or f"REF-{uuid.uuid4().hex[:8].upper()}",
        status="Paid",
        notes=payment_info.get("notes") or f"Payout for commission {cm.id} ({cm.period})",
        recorded_by=current_user.name if current_user else "Finance Admin"
    )
    db.add(db_pay)

    cm.status = "Paid"
    cm.payment_status = "Paid"

    # Activity log for partner
    act = PartnershipActivityLogModel(
        id=f"act-{uuid.uuid4().hex[:8]}",
        partner_id=cm.partner_id,
        action="Payment Disbursed",
        details=f"Paid ₹{amount_to_pay:,.2f} commission ({db_pay.payment_method} Ref: {db_pay.reference_number})",
        user_name=current_user.name if current_user else "Finance Admin"
    )
    db.add(act)

    create_audit_record(
        db,
        "COMMISSION_PAID",
        "Product Partnership",
        f"Disbursed payment {pay_code} of ₹{amount_to_pay:,.2f} to {cm.partner.brand_name if cm.partner else 'Partner'}",
        user=current_user,
        entity_type="PartnershipPayment",
        entity_id=p_id
    )
    db.commit()
    return {"message": "Payment recorded and commission marked as Paid", "payment": db_pay}

# 6. Partnership Payments
@app.get("/api/partnership-payments")
def get_partnership_payments(
    partner_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PartnershipPaymentModel)
    if partner_id and partner_id != "ALL":
        query = query.filter(PartnershipPaymentModel.partner_id == partner_id)

    payments = query.order_by(PartnershipPaymentModel.payment_date.desc()).all()
    results = []
    for py in payments:
        partner = py.partner
        results.append({
            "id": py.id,
            "payment_code": py.payment_code,
            "partner_id": py.partner_id,
            "partner_name": partner.brand_name if partner else "Unknown",
            "commission_id": py.commission_id,
            "amount": float(py.amount or 0.0),
            "payment_date": py.payment_date,
            "payment_method": py.payment_method,
            "reference_number": py.reference_number or "",
            "status": py.status,
            "notes": py.notes or "",
            "recorded_by": py.recorded_by or "Finance Admin",
            "createdAt": py.createdAt.isoformat() if py.createdAt else None
        })
    return results

@app.post("/api/partnership-payments", status_code=status.HTTP_201_CREATED)
def record_partnership_payment(
    p_in: PartnershipPaymentSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    count = db.query(PartnershipPaymentModel).count()
    pay_code = p_in.payment_code or f"PAY-{str(count + 1).zfill(4)}"
    p_id = p_in.id or f"pay-{uuid.uuid4().hex[:8]}"

    db_pay = PartnershipPaymentModel(
        id=p_id,
        payment_code=pay_code,
        partner_id=p_in.partner_id,
        commission_id=p_in.commission_id,
        amount=p_in.amount,
        payment_date=p_in.payment_date or datetime.utcnow().strftime("%Y-%m-%d"),
        payment_method=p_in.payment_method or "Bank Transfer",
        reference_number=p_in.reference_number,
        status=p_in.status or "Paid",
        notes=p_in.notes,
        recorded_by=current_user.name if current_user else "Finance Admin"
    )
    db.add(db_pay)

    # If linked to commission, update commission status
    if p_in.commission_id:
        cm = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.id == p_in.commission_id).first()
        if cm:
            cm.status = "Paid"
            cm.payment_status = "Paid"

    partner = db.query(ProductPartnerModel).filter(ProductPartnerModel.id == p_in.partner_id).first()
    if partner:
        act = PartnershipActivityLogModel(
            id=f"act-{uuid.uuid4().hex[:8]}",
            partner_id=partner.id,
            action="Payment Completed",
            details=f"Recorded payout of ₹{p_in.amount:,.2f} via {db_pay.payment_method} (Ref: {db_pay.reference_number})",
            user_name=current_user.name if current_user else "Finance Admin"
        )
        db.add(act)

    create_audit_record(
        db,
        "PAYMENT_RECORDED",
        "Product Partnership",
        f"Recorded payment of ₹{p_in.amount:,.2f} for {partner.brand_name if partner else 'Partner'}",
        user=current_user,
        entity_type="PartnershipPayment",
        entity_id=p_id
    )
    db.commit()
    db.refresh(db_pay)
    return db_pay

# 7. Partnership Reports & Analytics
@app.get("/api/partnership-reports/overview")
def get_partnership_reports_overview(db: Session = Depends(get_db)):
    total_partners = db.query(ProductPartnerModel).count()
    active_partners = db.query(ProductPartnerModel).filter(ProductPartnerModel.status == "Active").count()
    pending_requests = db.query(PartnershipRequestModel).filter(PartnershipRequestModel.status.in_(["Pending", "Under Review"])).count()
    partner_products_count = db.query(PartnerProductModel).count()
    active_campaigns = db.query(PartnershipCampaignModel).filter(PartnershipCampaignModel.status == "Active").count()

    commissions = db.query(PartnershipCommissionModel).all()
    payments = db.query(PartnershipPaymentModel).all()

    total_sales = sum(float(c.sale_amount or 0.0) for c in commissions)
    commission_earned = sum(float(c.commission_amount or 0.0) for c in commissions)
    total_paid = sum(float(p.amount or 0.0) for p in payments if p.status == "Paid")
    pending_commission = max(0.0, commission_earned - total_paid)

    # Monthly Trends
    periods = {}
    for cm in commissions:
        p = cm.period or "Other"
        if p not in periods:
            periods[p] = {"period": p, "sales": 0.0, "commission": 0.0}
        periods[p]["sales"] += float(cm.sale_amount or 0.0)
        periods[p]["commission"] += float(cm.commission_amount or 0.0)

    # Top Partners
    partners = db.query(ProductPartnerModel).all()
    top_partners = []
    for p in partners:
        p_comms = [c for c in commissions if c.partner_id == p.id]
        p_sales = sum(float(c.sale_amount or 0.0) for c in p_comms)
        p_comm = sum(float(c.commission_amount or 0.0) for c in p_comms)
        top_partners.append({
            "id": p.id,
            "name": p.brand_name,
            "sales": round(p_sales, 2),
            "commission": round(p_comm, 2),
            "status": p.status
        })
    top_partners.sort(key=lambda x: x["sales"], reverse=True)

    return {
        "total_partners": total_partners,
        "active_partners": active_partners,
        "pending_requests": pending_requests,
        "partner_products_count": partner_products_count,
        "active_campaigns": active_campaigns,
        "total_partner_sales": round(total_sales, 2),
        "commission_earned": round(commission_earned, 2),
        "pending_commission": round(pending_commission, 2),
        "monthly_trend": list(periods.values()),
        "top_partners": top_partners[:5]
    }

@app.get("/api/partnership-reports/partner-performance")
def get_partner_performance_report(db: Session = Depends(get_db)):
    partners = db.query(ProductPartnerModel).all()
    report = []
    for p in partners:
        prods = db.query(PartnerProductModel).filter(PartnerProductModel.partner_id == p.id).all()
        comms = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.partner_id == p.id).all()
        cmps = db.query(PartnershipCampaignModel).filter(PartnershipCampaignModel.partner_id == p.id).all()
        sales = sum(float(c.sale_amount or 0.0) for c in comms)
        commission = sum(float(c.commission_amount or 0.0) for c in comms)

        report.append({
            "partner_id": p.id,
            "partner_code": p.partner_code,
            "partner_name": p.brand_name,
            "company_name": p.company_name,
            "category": p.category,
            "products_count": len(prods),
            "campaigns_count": len(cmps),
            "orders_count": len(comms),
            "sales": round(sales, 2),
            "commission": round(commission, 2),
            "commission_rate": float(p.commission_rate or 10.0),
            "status": p.status,
            "performance": "High" if sales >= 100000 else ("Medium" if sales >= 40000 else "Standard")
        })
    return report

@app.get("/api/partnership-reports/product-performance")
def get_product_performance_report(db: Session = Depends(get_db)):
    partner_products = db.query(PartnerProductModel).all()
    report = []
    for pp in partner_products:
        partner = pp.partner
        product = pp.product
        comms = db.query(PartnershipCommissionModel).filter(
            PartnershipCommissionModel.partner_id == pp.partner_id,
            PartnershipCommissionModel.product_id == pp.product_id
        ).all()
        revenue = sum(float(c.sale_amount or 0.0) for c in comms)
        commission = sum(float(c.commission_amount or 0.0) for c in comms)
        unit_price = float(pp.selling_price or (product.sellingPrice if product else 1.0)) or 1.0
        units_sold = int(revenue / unit_price) if unit_price > 0 else 0
        purchase_cost = float(pp.purchase_price or (product.purchasePrice if product else 0.0)) * units_sold
        profit = max(0.0, revenue - purchase_cost - commission)

        report.append({
            "product_id": pp.product_id,
            "product_name": pp.product_name,
            "partner_name": partner.brand_name if partner else "",
            "sku": pp.sku,
            "units_sold": units_sold,
            "revenue": round(revenue, 2),
            "commission": round(commission, 2),
            "profit": round(profit, 2),
            "stock": product.stock if product else 0
        })
    return report

@app.get("/api/partnership-reports/campaign-performance")
def get_campaign_performance_report(db: Session = Depends(get_db)):
    campaigns = db.query(PartnershipCampaignModel).all()
    report = []
    for c in campaigns:
        partner = c.partner
        comms = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.campaign_id == c.id).all()
        revenue = sum(float(cm.sale_amount or 0.0) for cm in comms)
        commission = sum(float(cm.commission_amount or 0.0) for cm in comms)
        target = float(c.target_sales or 1.0)
        conversion = round(min(100.0, (revenue / target) * 100.0), 1) if target > 0 else 0.0

        report.append({
            "campaign_id": c.id,
            "campaign_code": c.campaign_code,
            "campaign_name": c.name,
            "partner_name": partner.brand_name if partner else "",
            "campaign_type": c.campaign_type,
            "target_sales": target,
            "sales": round(revenue, 2),
            "orders": len(comms),
            "commission": round(commission, 2),
            "conversion_pct": conversion,
            "status": c.status
        })
    return report

@app.get("/api/partnership-reports/commission-report")
def get_commission_report(db: Session = Depends(get_db)):
    partners = db.query(ProductPartnerModel).all()
    report = []
    for p in partners:
        comms = db.query(PartnershipCommissionModel).filter(PartnershipCommissionModel.partner_id == p.id).all()
        pmts = db.query(PartnershipPaymentModel).filter(PartnershipPaymentModel.partner_id == p.id).all()

        total_sales = sum(float(c.sale_amount or 0.0) for c in comms)
        total_commission = sum(float(c.commission_amount or 0.0) for c in comms)
        paid = sum(float(py.amount or 0.0) for py in pmts if py.status == "Paid")
        pending = max(0.0, total_commission - paid)

        report.append({
            "partner_id": p.id,
            "partner_name": p.brand_name,
            "sales": round(total_sales, 2),
            "commission_rate": float(p.commission_rate or 10.0),
            "commission": round(total_commission, 2),
            "paid": round(paid, 2),
            "pending": round(pending, 2),
            "payment_terms": p.payment_terms
        })
    return report

if __name__ == "__main__":
    import uvicorn
    print(f"[FASTAPI SERVER] Starting Lumina Luxe Enterprise API on http://{HOST}:{PORT}")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
