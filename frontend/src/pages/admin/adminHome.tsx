import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Tags, PackageOpen, Users, LogOut, ArrowLeft, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminHome: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // ─── STATE DYAL MENU MOBILE ───
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 🚨 ZEDNA 'Bespoke Orders' HNA 🚨
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag size={18} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags size={18} /> },
    { name: 'Orders', path: '/admin/orders', icon: <PackageOpen size={18} /> },
    { name: 'Custom Orders', path: '/admin/custom-orders', icon: <Sparkles size={18} /> }, // 👈 LINK JDID
    { name: 'Customers', path: '/admin/customers', icon: <Users size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  // ─── L-MO7TAWA DYAL SIDEBAR (Bach man3awdohch 2 mrat) ───
  const SidebarContent = () => (
    <>
      <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" onClick={closeMobileMenu} style={{ textDecoration: 'none', color: '#FDFCF9' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700 }}>
              DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
            </span>
          </Link>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8E80', marginTop: 4 }}>
            Admin Panel
          </p>
        </div>
        {/* Zerr dyal tsdd l-menu f mobile */}
        <button onClick={closeMobileMenu} className="md:hidden text-[#9C8E80] hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          // L'logique bash n3erfou wash l'lien "Active" (Bdelna chwiya bash mayb9ash bug m3a /admin)
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(`${item.path}`));
          
          return (
            <Link key={item.name} to={item.path} onClick={closeMobileMenu} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none',
              borderRadius: 10, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.2s',
              background: isActive ? '#C4631C' : 'transparent',
              color: isActive ? '#FDFCF9' : '#9C8E80'
            }} className="hover:!text-[#FDFCF9]">
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(253,252,249,0.1)' }}>
        <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', color: '#9C8E80', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }} className="hover:!text-[#FDFCF9]">
          <ArrowLeft size={18} /> Back to Shop
        </Link>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', color: '#E24B4B', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:!bg-red-500/10 hover:!rounded-xl">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDFCF9] text-[#1C1712]">
      
      {/* ─── MOBILE HEADER (Kiban gha f t-telifoun) ─── */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#1C1712] text-[#FDFCF9] sticky top-0 z-40 shadow-md">
        <Link to="/" style={{ textDecoration: 'none', color: '#FDFCF9' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 700 }}>
            DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
          </span>
        </Link>
        <button onClick={() => setIsMobileOpen(true)} className="text-[#9C8E80] hover:text-white p-1">
          <Menu size={24} />
        </button>
      </header>

      {/* ─── MOBILE DRAWER (Sidebar f t-telifoun b animation) ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* L-k7oliya li kat-ghatti s-site mli ki t7el l-menu */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            {/* S-sidebar kat-khrej mn l-issr */}
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#1C1712] text-[#FDFCF9] z-50 flex flex-col md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── DESKTOP SIDEBAR (Kiban gha f l-PC) ─── */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#1C1712] text-[#FDFCF9] sticky top-0 h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Pading t-9add f t-telifoun w l-pc */}
        <div className="flex-1 p-4 sm:p-8 md:p-10 overflow-x-hidden">
          <Outlet /> 
        </div>
      </main>

    </div>
  );
};

export default AdminHome;