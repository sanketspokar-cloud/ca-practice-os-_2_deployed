import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Icons } from './components/Icons';
import { Dashboard } from './pages/Dashboard';
import { ClientsPage } from './pages/ClientsPage';
import { TasksPage } from './pages/TasksPage';
import { CompliancePage } from './pages/CompliancePage';
import { BillingPage } from './pages/BillingPage';
import { AdminUpload } from './pages/AdminUpload';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8,
    textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 4,
    background: active ? '#EEF2FF' : 'transparent',
    color: active ? '#6366F1' : '#64748B',
  }}>
    {icon}
    <span>{label}</span>
  </Link>
);

const AppContent = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menu = [
    { to: "/", icon: <Icons.Dashboard />, label: "Dashboard" },
    { to: "/clients", icon: <Icons.Clients />, label: "Clients" },
    { to: "/tasks", icon: <Icons.Tasks />, label: "Tasks" },
    { to: "/compliance", icon: <Icons.Compliance />, label: "Compliance" },
    { to: "/billing", icon: <Icons.Billing />, label: "Billing" },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: '1px solid #F1F5F9', background: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 32px' }}>
          <div style={{ width: 32, height: 32, background: '#6366F1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icons.AI />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Practice OS</span>
        </div>

        <div style={{ flex: 1 }}>
          {menu.map(item => (
            <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
          ))}
        </div>

        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
          <SidebarLink to="/admin/upload" icon={<Icons.Settings />} label="Admin Portal" active={location.pathname === "/admin/upload"} />
          <button style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8,
            width: '100%', border: 'none', background: 'transparent', fontSize: 14, color: '#64748B', cursor: 'pointer'
          }}>
            <Icons.LogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
        <header style={{ height: 64, borderBottom: '1px solid #F1F5F9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ position: 'relative', width: 400 }}>
             <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}><Icons.Search /></span>
             <input placeholder="Search everywhere..." style={{ width: '100%', padding: '8px 12px 8px 40px', border: '1px solid #F1F5F9', borderRadius: 8, background: '#F8FAFC', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><Icons.Notifications /></button>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>PS</div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsPage onClientClick={() => {}} />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/admin/upload" element={<AdminUpload />} />
          </Routes>
        </main>
      </div>
      <Analytics />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
