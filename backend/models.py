from sqlalchemy import Column, Integer, String, Numeric, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Receptionist")  # Super Admin, Branch Manager, Senior Stylist, Receptionist, Customer
    phone = Column(String(50), nullable=True)
    branch_id = Column(String(50), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    branch = relationship("BranchModel", back_populates="users")

class BranchModel(Base):
    __tablename__ = "branches"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), nullable=False, unique=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    manager_name = Column(String(255), nullable=True)
    status = Column(String(50), default="Active")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("UserModel", back_populates="branch")
    employees = relationship("EmployeeModel", back_populates="branch")

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    sku = Column(String(50), nullable=False, unique=True)
    barcode = Column(String(50), nullable=True)
    purchasePrice = Column(Numeric(12, 2), default=0.00)
    costPrice = Column(Numeric(12, 2), default=0.00)
    sellingPrice = Column(Numeric(12, 2), default=0.00)
    retailPrice = Column(Numeric(12, 2), default=0.00)
    tax = Column(Numeric(5, 2), default=18.00)
    stock = Column(Integer, default=0)
    quantity = Column(Integer, default=0)
    minimumStock = Column(Integer, default=5)
    minStockAlert = Column(Integer, default=5)
    batch = Column(String(100), nullable=True)
    expiry = Column(String(50), nullable=True)
    supplier = Column(String(255), nullable=True)
    type = Column(String(50), default="Retail")
    status = Column(String(50), default="Active")
    image = Column(Text, nullable=True)
    images = Column(JSON, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class ServiceModel(Base):
    __tablename__ = "services"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    subCategory = Column(String(100), nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    duration = Column(Integer, default=30)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Active")
    image = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    vipStatus = Column(String(50), default="Standard")
    visitsCount = Column(Integer, default=0)
    totalSpent = Column(Numeric(12, 2), default=0.00)
    lastVisit = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    appointments = relationship("AppointmentModel", back_populates="customer")
    invoices = relationship("InvoiceModel", back_populates="customer")

class EmployeeModel(Base):
    __tablename__ = "employees"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    role = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    joinDate = Column(String(50), nullable=True)
    salary = Column(Numeric(12, 2), default=0.00)
    status = Column(String(50), default="Active")
    avatar = Column(Text, nullable=True)
    specialties = Column(JSON, nullable=True)
    branch_id = Column(String(50), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    branch = relationship("BranchModel", back_populates="employees")
    appointments = relationship("AppointmentModel", back_populates="stylist")
    attendance = relationship("AttendanceModel", back_populates="employee")

class AppointmentModel(Base):
    __tablename__ = "appointments"

    id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customerName = Column(String(255), nullable=False)
    customerPhone = Column(String(50), nullable=True)
    service_id = Column(String(50), ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    serviceName = Column(String(255), nullable=False)
    stylist_id = Column(String(50), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    stylistName = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False, index=True)
    time = Column(String(50), nullable=False)
    duration = Column(Integer, default=30)
    status = Column(String(50), default="Pending", index=True)
    totalPrice = Column(Numeric(12, 2), default=0.00)
    chairNumber = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("CustomerModel", back_populates="appointments")
    service = relationship("ServiceModel")
    stylist = relationship("EmployeeModel", back_populates="appointments")

class AttendanceModel(Base):
    __tablename__ = "attendance"

    id = Column(String(50), primary_key=True, index=True)
    employeeId = Column(String(50), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    employeeName = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False, index=True)
    checkIn = Column(String(50), nullable=True)
    checkOut = Column(String(50), nullable=True)
    status = Column(String(50), default="Present")
    workHours = Column(Numeric(4, 2), default=8.00)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("EmployeeModel", back_populates="attendance")

class PayrollModel(Base):
    __tablename__ = "payroll"

    id = Column(String(50), primary_key=True, index=True)
    employeeId = Column(String(50), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    employeeName = Column(String(255), nullable=False)
    month = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    baseSalary = Column(Numeric(12, 2), default=0.00)
    bonuses = Column(Numeric(12, 2), default=0.00)
    deductions = Column(Numeric(12, 2), default=0.00)
    netSalary = Column(Numeric(12, 2), default=0.00)
    paymentDate = Column(String(50), nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Processed, Paid
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class InvoiceModel(Base):
    __tablename__ = "invoices"

    id = Column(String(50), primary_key=True, index=True)
    invoiceNumber = Column(String(100), nullable=False, unique=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customerName = Column(String(255), nullable=False)
    customerPhone = Column(String(50), nullable=True)
    date = Column(String(50), nullable=False, index=True)
    items = Column(JSON, nullable=False)
    subtotal = Column(Numeric(12, 2), default=0.00)
    discount = Column(Numeric(12, 2), default=0.00)
    couponCode = Column(String(50), nullable=True)
    tax = Column(Numeric(12, 2), default=0.00)
    total = Column(Numeric(12, 2), default=0.00)
    paymentMethod = Column(String(50), default="Cash")
    status = Column(String(50), default="Paid")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("CustomerModel", back_populates="invoices")
    invoice_items = relationship("InvoiceItemModel", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceItemModel(Base):
    __tablename__ = "invoice_items"

    id = Column(String(50), primary_key=True, index=True)
    invoice_id = Column(String(50), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False)  # Service / Product
    item_id = Column(String(50), nullable=True)
    name = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(12, 2), default=0.00)
    total_price = Column(Numeric(12, 2), default=0.00)

    invoice = relationship("InvoiceModel", back_populates="invoice_items")

class InventoryTransactionModel(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String(50), primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    transaction_type = Column(String(50), nullable=False)  # OPENING STOCK, RESTOCK IN, STOCK ADJUSTMENT, RETAIL SALE, SALON CONSUMPTION, RETURN, DAMAGE, TRANSFER
    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reference = Column(String(100), nullable=True)  # Invoice # or PO # or Appointment ID
    notes = Column(Text, nullable=True)
    authorized_user = Column(String(255), nullable=True, default="Alexander Vance")
    branch_id = Column(String(50), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class PurchaseOrderModel(Base):
    __tablename__ = "purchase_orders"

    id = Column(String(50), primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)  # PO-2026-092
    supplier = Column(String(255), nullable=False)
    orderDate = Column(String(50), nullable=False)
    expectedDelivery = Column(String(50), nullable=False)
    itemsCount = Column(Integer, default=1)
    totalCost = Column(Numeric(12, 2), default=0.00)
    status = Column(String(50), default="ORDERED")  # DRAFT, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED, Delivered
    paymentTerms = Column(String(100), default="Net 30 Days")
    notes = Column(Text, nullable=True)
    product_id = Column(String(50), nullable=True)
    product_name = Column(String(255), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("PurchaseOrderItemModel", back_populates="purchase_order", cascade="all, delete-orphan")

class PurchaseOrderItemModel(Base):
    __tablename__ = "purchase_order_items"

    id = Column(String(50), primary_key=True, index=True)
    po_id = Column(String(50), ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(50), nullable=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    unit_cost = Column(Numeric(12, 2), default=0.00)
    total_cost = Column(Numeric(12, 2), default=0.00)

    purchase_order = relationship("PurchaseOrderModel", back_populates="items")


class DistributorModel(Base):
    __tablename__ = "distributors"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    contactPerson = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    leadTimeDays = Column(Integer, default=5)
    category = Column(String(100), nullable=True, default="Hair & Beauty")
    status = Column(String(50), default="Active")
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class HomeServiceModel(Base):
    __tablename__ = "home_services"

    id = Column(String(50), primary_key=True, index=True)
    customerName = Column(String(255), nullable=False)
    customerPhone = Column(String(50), nullable=False)
    serviceName = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    stylistName = Column(String(255), nullable=True)
    date = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    status = Column(String(50), default="Assigned")
    travelCharge = Column(Numeric(12, 2), default=15.00)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class ReviewModel(Base):
    __tablename__ = "reviews"

    id = Column(String(50), primary_key=True, index=True)
    customerName = Column(String(255), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    date = Column(String(50), nullable=False)
    serviceName = Column(String(255), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class OfferModel(Base):
    __tablename__ = "offers"

    id = Column(String(50), primary_key=True, index=True)
    campaign_id = Column(String(50), nullable=True)
    title = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    discount_type = Column(String(50), default="PERCENTAGE")  # PERCENTAGE, FIXED_AMOUNT
    discount_value = Column(Numeric(12, 2), default=15.00)
    discountPercent = Column(Numeric(5, 2), default=15.00)  # For legacy compatibility
    minimum_spend = Column(Numeric(12, 2), default=0.00)
    maximum_discount = Column(Numeric(12, 2), default=0.00)  # 0.00 = No cap
    valid_from = Column(String(50), nullable=True)
    valid_until = Column(String(50), nullable=True)
    validTill = Column(String(50), nullable=True)  # For legacy compatibility
    usage_limit = Column(Integer, default=100)  # 0 = Unlimited
    used_count = Column(Integer, default=0)
    per_customer_limit = Column(Integer, default=1)
    customer_eligibility = Column(String(50), default="ALL_CUSTOMERS")  # ALL_CUSTOMERS, NEW_CUSTOMERS, EXISTING_CUSTOMERS, VIP_CUSTOMERS, LOYALTY_MEMBERS
    applicable_to = Column(String(50), default="ENTIRE_BILL")  # ENTIRE_BILL, SERVICES_ONLY, PRODUCTS_ONLY, SPECIFIC_SERVICE, SPECIFIC_PRODUCT, SPECIFIC_CATEGORY
    applicable_target = Column(String(255), nullable=True)
    status = Column(String(50), default="ACTIVE")  # DRAFT, SCHEDULED, ACTIVE, PAUSED, EXPIRED, DEPLETED
    branch_id = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(String(255), default="Super Admin")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    redemptions = relationship("CouponRedemptionModel", back_populates="coupon", cascade="all, delete-orphan")

class CouponRedemptionModel(Base):
    __tablename__ = "coupon_redemptions"

    id = Column(String(50), primary_key=True, index=True)
    coupon_id = Column(String(50), ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True)
    coupon_code = Column(String(50), nullable=False, index=True)
    customer_id = Column(String(50), nullable=True, index=True)
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    invoice_id = Column(String(50), nullable=True, index=True)
    invoice_number = Column(String(100), nullable=True)
    discount_amount = Column(Numeric(12, 2), default=0.00)
    subtotal_before_discount = Column(Numeric(12, 2), default=0.00)
    final_total = Column(Numeric(12, 2), default=0.00)
    branch_id = Column(String(50), nullable=True)
    authorized_user = Column(String(255), nullable=True)
    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())

    coupon = relationship("OfferModel", back_populates="redemptions")


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    time = Column(String(50), nullable=False)
    read = Column(Boolean, default=False)
    priority = Column(String(50), default="medium")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=True)
    user_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    module = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(String(100), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class SettingsModel(Base):
    __tablename__ = "settings"

    id = Column(String(50), primary_key=True)
    key = Column(String(100), nullable=False, unique=True, index=True)
    value = Column(JSON, nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# =====================================================================
# PRODUCT PARTNERSHIP & BRAND COLLABORATION MODELS
# =====================================================================

class ProductPartnerModel(Base):
    __tablename__ = "product_partners"

    id = Column(String(50), primary_key=True, index=True)
    partner_code = Column(String(50), nullable=False, unique=True, index=True)  # PTN-001
    company_name = Column(String(255), nullable=False, index=True)
    brand_name = Column(String(255), nullable=False, index=True)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    tax_id = Column(String(100), nullable=True)  # GST / Tax Number
    category = Column(String(100), nullable=True, default="Hair Care")
    partnership_type = Column(String(100), default="Product Promotion")  # Product Supply, Product Promotion, Brand Promotion, Retail Partnership, Exclusive Partnership, Co-Marketing, Affiliate / Commission, Event Collaboration
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    commission_type = Column(String(50), default="Percentage")  # Percentage, Fixed, Tiered
    commission_rate = Column(Numeric(5, 2), default=10.00)
    revenue_share = Column(Numeric(5, 2), default=0.00)
    payment_terms = Column(String(100), default="Net 30 Days")
    status = Column(String(50), default="Active")  # Pending, Active, Expired, Suspended, Rejected, Completed
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    contract_url = Column(Text, nullable=True)
    distributor_id = Column(String(50), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner_products = relationship("PartnerProductModel", back_populates="partner", cascade="all, delete-orphan")
    campaigns = relationship("PartnershipCampaignModel", back_populates="partner", cascade="all, delete-orphan")
    commissions = relationship("PartnershipCommissionModel", back_populates="partner", cascade="all, delete-orphan")
    payments = relationship("PartnershipPaymentModel", back_populates="partner", cascade="all, delete-orphan")
    documents = relationship("PartnershipDocumentModel", back_populates="partner", cascade="all, delete-orphan")
    activity_logs = relationship("PartnershipActivityLogModel", back_populates="partner", cascade="all, delete-orphan")

class PartnershipRequestModel(Base):
    __tablename__ = "partnership_requests"

    id = Column(String(50), primary_key=True, index=True)
    request_code = Column(String(50), nullable=False, unique=True, index=True)  # REQ-001
    company_name = Column(String(255), nullable=False)
    brand_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    product_category = Column(String(100), nullable=True)
    partnership_type = Column(String(100), default="Product Promotion")
    proposal = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Under Review, Approved, Rejected
    submitted_date = Column(String(50), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(255), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class PartnerProductModel(Base):
    __tablename__ = "partner_products"

    id = Column(String(50), primary_key=True, index=True)
    partner_id = Column(String(50), ForeignKey("product_partners.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    sku = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    purchase_price = Column(Numeric(12, 2), default=0.00)
    selling_price = Column(Numeric(12, 2), default=0.00)
    commission_rate = Column(Numeric(5, 2), default=10.00)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Active")  # Active, Inactive, Discontinued
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("ProductPartnerModel", back_populates="partner_products")
    product = relationship("ProductModel")

class PartnershipCampaignModel(Base):
    __tablename__ = "partnership_campaigns"

    id = Column(String(50), primary_key=True, index=True)
    campaign_code = Column(String(50), nullable=False, unique=True, index=True)  # CMP-001
    name = Column(String(255), nullable=False)
    partner_id = Column(String(50), ForeignKey("product_partners.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_type = Column(String(100), default="Product Promotion")  # Product Promotion, Festival Campaign, New Product Launch, Social Media Campaign, Salon Promotion, Customer Offer, Bundle Promotion, Event
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    discount = Column(Numeric(5, 2), default=0.00)
    promo_code = Column(String(50), nullable=True)
    target_sales = Column(Numeric(12, 2), default=0.00)
    budget = Column(Numeric(12, 2), default=0.00)
    salon_contribution = Column(Numeric(12, 2), default=0.00)
    partner_contribution = Column(Numeric(12, 2), default=0.00)
    marketing_channels = Column(JSON, nullable=True)  # ["Website", "Salon", "Instagram", etc.]
    product_ids = Column(JSON, nullable=True)  # ["prod-1", "prod-2"]
    status = Column(String(50), default="Active")  # Draft, Scheduled, Active, Completed, Cancelled
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("ProductPartnerModel", back_populates="campaigns")

class PartnershipCommissionModel(Base):
    __tablename__ = "partnership_commissions"

    id = Column(String(50), primary_key=True, index=True)
    partner_id = Column(String(50), ForeignKey("product_partners.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    campaign_id = Column(String(50), ForeignKey("partnership_campaigns.id", ondelete="SET NULL"), nullable=True)
    invoice_id = Column(String(50), ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True)
    invoice_number = Column(String(100), nullable=True)
    sale_amount = Column(Numeric(12, 2), default=0.00)
    commission_rate = Column(Numeric(5, 2), default=10.00)
    commission_amount = Column(Numeric(12, 2), default=0.00)
    period = Column(String(50), nullable=False)  # e.g. "October 2026"
    status = Column(String(50), default="Approved")  # Pending, Calculated, Approved, Rejected, Paid
    payment_status = Column(String(50), default="Pending")  # Pending, Processing, Paid
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("ProductPartnerModel", back_populates="commissions")
    product = relationship("ProductModel")
    campaign = relationship("PartnershipCampaignModel")

class PartnershipPaymentModel(Base):
    __tablename__ = "partnership_payments"

    id = Column(String(50), primary_key=True, index=True)
    payment_code = Column(String(50), nullable=False, unique=True, index=True)  # PAY-1001
    partner_id = Column(String(50), ForeignKey("product_partners.id", ondelete="CASCADE"), nullable=False, index=True)
    commission_id = Column(String(50), nullable=True)
    amount = Column(Numeric(12, 2), default=0.00)
    payment_date = Column(String(50), nullable=False)
    payment_method = Column(String(100), default="Bank Transfer")  # Bank Transfer, UPI, Cheque, Cash, Online Transfer
    reference_number = Column(String(100), nullable=True)
    status = Column(String(50), default="Paid")  # Pending, Processing, Paid, Failed, Cancelled
    notes = Column(Text, nullable=True)
    recorded_by = Column(String(255), default="Finance Admin")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("ProductPartnerModel", back_populates="payments")

class PartnershipDocumentModel(Base):
    __tablename__ = "partnership_documents"

    id = Column(String(50), primary_key=True, index=True)
    partner_id = Column(String(50), ForeignKey("product_partners.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(255), nullable=False)
    document_type = Column(String(100), default="Agreement")  # Agreement, Contract, NDA, Catalog, Certificate
    file_url = Column(Text, nullable=True)
    upload_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("ProductPartnerModel", back_populates="documents")

class PartnershipActivityLogModel(Base):
    __tablename__ = "partnership_activity_logs"

    id = Column(String(50), primary_key=True, index=True)
    partner_id = Column(String(50), ForeignKey("product_partners.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    user_name = Column(String(255), default="System")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("ProductPartnerModel", back_populates="activity_logs")
