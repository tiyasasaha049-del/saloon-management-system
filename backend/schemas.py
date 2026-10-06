from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any, Union
from datetime import datetime

# Authentication Schemas
class UserLoginSchema(BaseModel):
    username: str
    password: str

class UserSchema(BaseModel):
    id: str
    username: str
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    branch_id: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class UserCreateSchema(BaseModel):
    username: str
    email: str
    password: str
    name: str
    role: str = "Receptionist"
    phone: Optional[str] = ""
    branch_id: Optional[str] = None

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSchema

# Branch Schema
class BranchSchema(BaseModel):
    id: Optional[str] = None
    name: str
    code: str
    address: str
    city: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    manager_name: Optional[str] = ""
    status: Optional[str] = "Active"

    class Config:
        from_attributes = True

# Product Schema
class ProductSchema(BaseModel):
    id: Optional[str] = None
    name: str
    brand: Optional[str] = ""
    category: str
    subcategory: Optional[str] = ""
    sku: str
    barcode: Optional[str] = ""
    purchasePrice: Optional[float] = 0.0
    costPrice: Optional[float] = 0.0
    sellingPrice: Optional[float] = 0.0
    retailPrice: Optional[float] = 0.0
    tax: Optional[float] = 18.0
    stock: Optional[int] = 0
    quantity: Optional[int] = 0
    minimumStock: Optional[int] = 5
    minStockAlert: Optional[int] = 5
    batch: Optional[str] = ""
    expiry: Optional[str] = ""
    supplier: Optional[str] = ""
    type: Optional[str] = "Retail"
    status: Optional[str] = "Active"
    image: Optional[str] = ""
    images: Optional[List[str]] = Field(default_factory=list)

    class Config:
        from_attributes = True

# Service Schema
class ServiceSchema(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    subCategory: Optional[str] = ""
    price: float
    duration: Optional[int] = 30
    durationMinutes: Optional[int] = 30
    description: Optional[str] = ""
    status: Optional[str] = "Active"
    image: Optional[str] = ""
    serviceType: Optional[str] = "In-Salon Suite Only"
    homeServiceEligible: Optional[bool] = False

    class Config:
        from_attributes = True
        extra = "allow"

# Customer Schema
class CustomerSchema(BaseModel):
    id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = ""
    gender: Optional[str] = ""
    vipStatus: Optional[str] = "Standard"
    visitsCount: Optional[int] = 0
    totalSpent: Optional[float] = 0.0
    lastVisit: Optional[str] = ""
    notes: Optional[str] = ""

    class Config:
        from_attributes = True
        extra = "allow"

# Employee Schema
class EmployeeSchema(BaseModel):
    id: Optional[str] = None
    name: str
    role: Optional[str] = "Senior Stylist"
    designation: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    joinDate: Optional[str] = ""
    joiningDate: Optional[str] = ""
    salary: Optional[float] = 0.0
    baseSalary: Optional[float] = 0.0
    status: Optional[str] = "Active"
    avatar: Optional[str] = ""
    specialties: Optional[List[str]] = Field(default_factory=list)
    skills: Optional[Any] = Field(default_factory=list)
    branch_id: Optional[str] = None
    branch: Optional[str] = "Beverly Hills Flagship"
    workingHours: Optional[str] = "10:00 AM - 07:00 PM"
    shift: Optional[str] = "10:00 AM - 07:00 PM"
    commissionRate: Optional[float] = 18.0

    class Config:
        from_attributes = True
        extra = "allow"

# Appointment Schema
class AppointmentSchema(BaseModel):
    id: Optional[str] = None
    customer_id: Optional[str] = None
    customerId: Optional[str] = None
    customerName: Optional[str] = "Guest Client"
    customerPhone: Optional[str] = ""
    service_id: Optional[str] = None
    serviceId: Optional[str] = None
    serviceName: Optional[str] = "Salon Service"
    serviceNames: Optional[List[str]] = Field(default_factory=list)
    stylist_id: Optional[str] = None
    stylistId: Optional[str] = None
    stylistName: Optional[str] = "Staff Stylist"
    date: str
    time: str
    duration: Optional[int] = 30
    durationMinutes: Optional[int] = 30
    status: Optional[str] = "Pending"
    totalPrice: Optional[float] = 0.0
    price: Optional[float] = 0.0
    chairNumber: Optional[str] = ""
    station: Optional[str] = ""
    branch: Optional[str] = "Beverly Hills Flagship"
    type: Optional[str] = "In-Salon"
    notes: Optional[str] = ""

    class Config:
        from_attributes = True
        extra = "allow"


# Attendance Schema
class AttendanceSchema(BaseModel):
    id: Optional[str] = None
    employeeId: str
    employeeName: str
    date: str
    checkIn: Optional[str] = ""
    checkOut: Optional[str] = ""
    status: Optional[str] = "Present"
    workHours: Optional[float] = 8.0

    class Config:
        from_attributes = True

# Payroll Schema
class PayrollSchema(BaseModel):
    id: Optional[str] = None
    employeeId: str
    employeeName: str
    month: str
    year: int
    baseSalary: Optional[float] = 0.0
    bonuses: Optional[float] = 0.0
    deductions: Optional[float] = 0.0
    netSalary: Optional[float] = 0.0
    paymentDate: Optional[str] = ""
    status: Optional[str] = "Pending"

    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceItemSchema(BaseModel):
    id: Optional[str] = None
    item_type: str = "Service"
    item_id: Optional[str] = None
    name: str
    quantity: int = 1
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class InvoiceSchema(BaseModel):
    id: Optional[str] = None
    invoiceNumber: Optional[str] = None
    customer_id: Optional[str] = None
    customerName: str
    customerPhone: Optional[str] = ""
    date: Optional[str] = None
    items: List[Any]
    subtotal: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    couponCode: Optional[str] = ""
    tax: Optional[float] = 0.0
    total: Optional[float] = 0.0
    paymentMethod: Optional[str] = "Cash"
    status: Optional[str] = "Paid"

    class Config:
        from_attributes = True

# Inventory Transaction Schema
class InventoryTransactionSchema(BaseModel):
    id: Optional[str] = None
    product_id: str
    product_name: str
    transaction_type: str
    quantity: int
    previous_stock: int
    new_stock: int
    reference: Optional[str] = ""
    notes: Optional[str] = ""
    authorized_user: Optional[str] = "Alexander Vance"
    branch_id: Optional[str] = None
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class StockAdjustmentSchema(BaseModel):
    product_id: str
    adjustment_type: str  # ADJUSTMENT_IN or ADJUSTMENT_OUT
    quantity: int
    reason: Optional[str] = "Physical stock count"
    notes: Optional[str] = ""

class PurchaseOrderItemSchema(BaseModel):
    id: Optional[str] = None
    po_id: Optional[str] = None
    product_id: Optional[str] = None
    product_name: str
    quantity: int = 1
    unit_cost: Optional[float] = 0.0
    total_cost: Optional[float] = 0.0

    class Config:
        from_attributes = True

class PurchaseOrderSchema(BaseModel):
    id: Optional[str] = None
    code: Optional[str] = None
    supplier: str
    orderDate: Optional[str] = None
    expectedDelivery: str
    itemsCount: Optional[int] = 1
    totalCost: Optional[float] = 0.0
    status: Optional[str] = "ORDERED"
    paymentTerms: Optional[str] = "Net 30 Days"
    notes: Optional[str] = ""
    product_id: Optional[str] = None
    productId: Optional[str] = None
    product_name: Optional[str] = None
    productName: Optional[str] = None
    items: Optional[List[PurchaseOrderItemSchema]] = Field(default_factory=list)

    class Config:
        from_attributes = True
        extra = "allow"

# Distributor / Supplier Schema
class DistributorSchema(BaseModel):
    id: Optional[str] = None
    name: str
    contactPerson: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    leadTimeDays: Optional[int] = 5
    category: Optional[str] = "Hair & Beauty"
    status: Optional[str] = "Active"
    notes: Optional[str] = ""

    class Config:
        from_attributes = True
        extra = "allow"


# Home Service Schema
class HomeServiceSchema(BaseModel):
    id: Optional[str] = None
    customerName: str
    customerPhone: str
    serviceName: str
    address: str
    stylistName: Optional[str] = ""
    date: str
    time: str
    status: Optional[str] = "Assigned"
    travelCharge: Optional[float] = 15.0

    class Config:
        from_attributes = True

# Review Schema
class ReviewSchema(BaseModel):
    id: Optional[str] = None
    customerName: str
    rating: int = 5
    comment: Optional[str] = ""
    date: str
    serviceName: Optional[str] = ""

    class Config:
        from_attributes = True

# Offer / Campaign / Promo Coupon Schemas
class OfferSchema(BaseModel):
    id: Optional[str] = None
    campaign_id: Optional[str] = None
    title: str
    code: str
    description: Optional[str] = ""
    discount_type: Optional[str] = "PERCENTAGE"
    discountType: Optional[str] = None
    discount_value: Optional[float] = 15.0
    discountValue: Optional[float] = None
    discountPercent: Optional[float] = None
    minimum_spend: Optional[float] = 0.0
    minSpend: Optional[float] = None
    maximum_discount: Optional[float] = 0.0
    maxDiscount: Optional[float] = None
    valid_from: Optional[str] = None
    validFrom: Optional[str] = None
    valid_until: Optional[str] = None
    validUntil: Optional[str] = None
    validTill: Optional[str] = None
    usage_limit: Optional[int] = 100
    usageLimit: Optional[int] = None
    maxUsage: Optional[int] = None
    used_count: Optional[int] = 0
    usedCount: Optional[int] = None
    usageCount: Optional[int] = None
    per_customer_limit: Optional[int] = 1
    perCustomerLimit: Optional[int] = None
    customer_eligibility: Optional[str] = "ALL_CUSTOMERS"
    customerEligibility: Optional[str] = None
    applicable_to: Optional[str] = "ENTIRE_BILL"
    applicableTo: Optional[str] = None
    applicable_target: Optional[str] = ""
    applicableTarget: Optional[str] = ""
    status: Optional[str] = "ACTIVE"
    active: Optional[bool] = None
    branch_id: Optional[str] = None
    notes: Optional[str] = ""
    created_by: Optional[str] = "Super Admin"

    class Config:
        from_attributes = True
        extra = "allow"

class CouponValidateRequestSchema(BaseModel):
    code: str
    customer_id: Optional[str] = None
    customerId: Optional[str] = None
    customer_name: Optional[str] = ""
    customerName: Optional[str] = ""
    customer_phone: Optional[str] = ""
    customerPhone: Optional[str] = ""
    subtotal: Optional[float] = 0.0
    items: Optional[List[Any]] = Field(default_factory=list)

class CouponValidateResponseSchema(BaseModel):
    valid: bool
    code: Optional[str] = ""
    discount: float = 0.0
    finalAmount: float = 0.0
    message: str = ""
    coupon: Optional[Any] = None

class CouponReactivateSchema(BaseModel):
    valid_from: str
    valid_until: str
    usage_limit: Optional[int] = None

class CouponRedemptionSchema(BaseModel):
    id: Optional[str] = None
    coupon_id: str
    coupon_code: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    discount_amount: float = 0.0
    subtotal_before_discount: float = 0.0
    final_total: float = 0.0
    branch_id: Optional[str] = None
    authorized_user: Optional[str] = None
    redeemed_at: Optional[Any] = None

    class Config:
        from_attributes = True


# Notification Schema
class NotificationSchema(BaseModel):
    id: Optional[str] = None
    title: str
    message: str
    time: str
    read: bool = False
    priority: Optional[str] = "medium"

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogSchema(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    role: Optional[str] = None
    action: str
    module: str
    entity_type: Optional[str] = ""
    entity_id: Optional[str] = ""
    details: str
    ip_address: Optional[str] = ""
    timestamp: str

    class Config:
        from_attributes = True

# Settings Schema
class SettingsSchema(BaseModel):
    id: Optional[str] = None
    key: str
    value: Union[dict, list, str, int, float, bool]

    class Config:
        from_attributes = True

# =====================================================================
# PRODUCT PARTNERSHIP & BRAND COLLABORATION SCHEMAS
# =====================================================================

class ProductPartnerSchema(BaseModel):
    id: Optional[str] = None
    partner_code: Optional[str] = None
    company_name: str
    brand_name: str
    contact_person: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    website: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    country: Optional[str] = "India"
    tax_id: Optional[str] = ""
    category: Optional[str] = "Hair Care"
    partnership_type: Optional[str] = "Product Promotion"
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    commission_type: Optional[str] = "Percentage"
    commission_rate: Optional[float] = 10.0
    revenue_share: Optional[float] = 0.0
    payment_terms: Optional[str] = "Net 30 Days"
    status: Optional[str] = "Active"
    description: Optional[str] = ""
    notes: Optional[str] = ""
    logo_url: Optional[str] = ""
    contract_url: Optional[str] = ""
    distributor_id: Optional[str] = None
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnershipRequestSchema(BaseModel):
    id: Optional[str] = None
    request_code: Optional[str] = None
    company_name: str
    brand_name: str
    contact_person: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    website: Optional[str] = ""
    product_category: Optional[str] = "Hair Care"
    partnership_type: Optional[str] = "Product Promotion"
    proposal: Optional[str] = ""
    status: Optional[str] = "Pending"
    submitted_date: Optional[str] = ""
    review_notes: Optional[str] = ""
    reviewed_by: Optional[str] = ""
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnerProductSchema(BaseModel):
    id: Optional[str] = None
    partner_id: str
    product_id: str
    product_name: str
    sku: Optional[str] = ""
    category: Optional[str] = ""
    brand: Optional[str] = ""
    purchase_price: Optional[float] = 0.0
    selling_price: Optional[float] = 0.0
    commission_rate: Optional[float] = 10.0
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    status: Optional[str] = "Active"
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnershipCampaignSchema(BaseModel):
    id: Optional[str] = None
    campaign_code: Optional[str] = None
    name: str
    partner_id: str
    campaign_type: Optional[str] = "Product Promotion"
    start_date: str
    end_date: str
    description: Optional[str] = ""
    discount: Optional[float] = 0.0
    promo_code: Optional[str] = ""
    target_sales: Optional[float] = 0.0
    budget: Optional[float] = 0.0
    salon_contribution: Optional[float] = 0.0
    partner_contribution: Optional[float] = 0.0
    marketing_channels: Optional[List[str]] = Field(default_factory=list)
    product_ids: Optional[List[str]] = Field(default_factory=list)
    status: Optional[str] = "Active"
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnershipCommissionSchema(BaseModel):
    id: Optional[str] = None
    partner_id: str
    product_id: Optional[str] = None
    campaign_id: Optional[str] = None
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = ""
    sale_amount: float = 0.0
    commission_rate: float = 10.0
    commission_amount: float = 0.0
    period: str = "October 2026"
    status: Optional[str] = "Approved"
    payment_status: Optional[str] = "Pending"
    notes: Optional[str] = ""
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnershipPaymentSchema(BaseModel):
    id: Optional[str] = None
    payment_code: Optional[str] = None
    partner_id: str
    commission_id: Optional[str] = None
    amount: float
    payment_date: str
    payment_method: Optional[str] = "Bank Transfer"
    reference_number: Optional[str] = ""
    status: Optional[str] = "Paid"
    notes: Optional[str] = ""
    recorded_by: Optional[str] = "Finance Admin"
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnershipDocumentSchema(BaseModel):
    id: Optional[str] = None
    partner_id: str
    document_name: str
    document_type: Optional[str] = "Agreement"
    file_url: Optional[str] = ""
    upload_date: Optional[str] = ""
    notes: Optional[str] = ""
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

class PartnershipActivityLogSchema(BaseModel):
    id: Optional[str] = None
    partner_id: str
    action: str
    details: str
    user_name: Optional[str] = "System"
    createdAt: Optional[Any] = None

    class Config:
        from_attributes = True
        extra = "allow"

