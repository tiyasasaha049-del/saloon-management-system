import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SalonProvider, useSalon } from './context/SalonContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { QuickBookingModal } from './components/QuickBookingModal';
import { ReceiptModal } from './components/ReceiptModal';

import { DashboardView } from './views/DashboardView';
import { AppointmentsView } from './views/AppointmentsView';
import { HomeServicesView } from './views/Schedule';
import { BillingPOSView } from './views/BillingPOSView';
import { CustomersView } from './views/CustomersView';
import { EmployeesView } from './views/EmployeesView';
import { AttendanceView } from './views/AttendanceView';
import { ServicesView } from './views/ServicesView';
import { ProductsView } from './views/ProductsView';
import { InventoryView } from './views/InventoryView';
import { ReviewsView } from './views/ReviewsView';
import { LoyaltyView } from './views/LoyaltyView';
import { OffersView } from './views/OffersView';
import { NotificationsView } from './views/NotificationsView';
import { ReportsView } from './views/ReportsView';
import { SettingsAuditView } from './views/SettingsAuditView';
import { SalaryPayrollView } from './views/SalaryPayrollView';
import ProductPartnershipView from './views/ProductPartnershipView';

import './App.css';

const MainViewSwitcher = () => {
  const { activeView, currentUser, switchRole } = useSalon();

  // Role authorization checking
  const isCustomerRole = currentUser.role === 'Customer';

  // If customer visits admin-only setting or reports
  if (isCustomerRole && ['inventory', 'reports', 'settings', 'attendance', 'employees', 'payroll'].includes(activeView)) {
    return (
      <div className="view-wrapper" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="luxe-card" style={{ maxWidth: 500, margin: '0 auto', padding: '40px 30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 10 }}>Managerial Permission Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            You are currently browsing under the <strong>VIP Customer</strong> role. This section contains confidential salon payroll, supplier purchase orders and security audit trails.
          </p>
          <button className="btn btn-gold" onClick={() => switchRole('Super Admin')}>
            Switch to Super Admin Role to View
          </button>
        </div>
      </div>
    );
  }

  switch (activeView) {
    case 'dashboard':
      return <DashboardView />;
    case 'appointments':
      return <AppointmentsView />;
    case 'homeservice':
    case 'homeservices':
    case 'home-service':
    case 'schedule':
    case 'schedules':
      return <HomeServicesView />;
    case 'billing':
    case 'pos':
      return <BillingPOSView />;
    case 'customers':
      return <CustomersView />;
    case 'employees':
    case 'employees-directory':
      return <EmployeesView />;
    case 'attendance':
    case 'employees-attendance':
      return <AttendanceView />;
    case 'payroll':
    case 'salary':
    case 'employees-payroll':
      return <SalaryPayrollView />;
    case 'services':
      return <ServicesView />;
    case 'products':
      return <ProductsView />;
    case 'inventory':
      return <InventoryView />;
    case 'suppliers':
    case 'purchases':
      return <InventoryView />;
    case 'product-sales':
      return <BillingPOSView />;
    case 'product-partnership':
    case 'product-partnership-brands':
    case 'product-partnership-requests':
    case 'product-partnership-products':
    case 'product-partnership-campaigns':
    case 'product-partnership-commission':
    case 'product-partnership-payments':
    case 'product-partnership-reports':
      return <ProductPartnershipView />;
    case 'reviews':
      return <ReviewsView />;
    case 'loyalty':
      return <LoyaltyView />;
    case 'offers':
      return <OffersView />;
    case 'notifications':
      return <NotificationsView />;
    case 'reports':
      return <ReportsView />;
    case 'settings':
      return <SettingsAuditView />;
    default:
      return <DashboardView />;
  }
};

function App() {
  return (
    <AuthProvider>
      <SalonProvider>
        <div className="app-container">
          <Sidebar />
          <main className="app-main">
            <Navbar />
            <MainViewSwitcher />
          </main>

          {/* Global Modals */}
          <QuickBookingModal />
          <ReceiptModal />
        </div>
      </SalonProvider>
    </AuthProvider>
  );
}

export default App;

