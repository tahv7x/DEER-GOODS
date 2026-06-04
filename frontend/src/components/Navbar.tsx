import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import supabase from '../config/supabaseClient';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const Navbar: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [adminLoading, setAdminLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (!user) {
          const supaUser = session.user;
          const { data: dbUser } = await supabase
            .from('User')
            .select('role')
            .eq('email', supaUser.email)
            .single();

          const realRole = dbUser?.role || 'CUSTOMER';
          const userName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'User';
          const avatar = supaUser.user_metadata?.avatar_url || '';

          login(session.access_token, {
            id: supaUser.id,
            name: userName,
            email: supaUser.email || '',
            role: realRole, 
            avatar: avatar
          });

          if (['/login', '/register', '/'].includes(location.pathname)) {
            if (realRole === 'ADMIN') {
              navigate('/admin');
            } else {
              navigate('/shop');
            }
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, login, navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Supabase signout skipped");
    }
    logout();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenus = () => { setProfileOpen(false); setMenuOpen(false); };

  const goToAdmin = () => {
    setAdminLoading(true);
    setTimeout(() => {
      setAdminLoading(false);
      closeMenus();
      navigate('/admin');
    }, 600);
  };

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    ...(user && user.role !== 'ADMIN' ? [{ to: '/orders', label: 'My Orders' }] : []),
    { to: '/custom-orders', label: 'Custom Orders' },
    { to: '/about', label: 'Our Story' },
  ];

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#FDFCF9',
        borderBottom: '1px solid #E5E0D8',
        transition: 'box-shadow 0.3s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(28,23,18,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

            {/* ── Logo ── */}
            <Link to="/" onClick={closeMenus} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 20, fontWeight: 700,
                color: '#1C1712', letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}>
                DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
              </span>
              <span style={{
                fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase',
                fontWeight: 700, color: '#9C8E80',
                background: '#F0EBE2', padding: '3px 8px', borderRadius: 99,
                whiteSpace: 'nowrap',
              }}>STORE</span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 32, flex: 1, justifyContent: 'center' }}>              {navLinks.map(l => (
                <Link key={l.to} to={l.to} style={{
                  textDecoration: 'none', fontSize: 11, letterSpacing: '0.16em',
                  textTransform: 'uppercase', fontWeight: 600,
                  color: location.pathname === l.to ? '#C4631C' : '#7A6F62',
                  transition: 'color 0.2s', position: 'relative', padding: '6px 0',
                }} className="hover:!text-[#C4631C]">
                  {l.label}
                  {location.pathname === l.to && (
                    <motion.div layoutId="activeLine"
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#C4631C' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right Actions ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => { closeMenus(); openCart(); }}
                style={{
                  position: 'relative', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 9, lineHeight: 0,
                  color: '#7A6F62', borderRadius: 10, transition: 'color 0.2s',
                }}
                className="hover:!text-[#C4631C]"
                aria-label="Open cart"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span key="badge"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 17, height: 17, background: '#C4631C',
                        color: '#fff', fontSize: 9, fontWeight: 700,
                        borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #FDFCF9',
                      }}
                    >{totalItems > 9 ? '9+' : totalItems}</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Divider — desktop only */}
              <div className="hidden md:block" style={{ width: 1, height: 22, background: '#E5E0D8', margin: '0 4px' }} />

              {/* Profile / Auth — desktop only */}
              {user ? (
                <div ref={profileRef} className="hidden md:block" style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: profileOpen ? '#F0EBE2' : 'transparent',
                      border: `1px solid ${profileOpen ? '#E5E0D8' : 'transparent'}`,
                      borderRadius: 10, padding: '6px 10px 6px 8px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    className="hover:!bg-[#F0EBE2] hover:!border-[#E5E0D8]"
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: '#1C1712', color: '#FDFCF9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0, overflow: 'hidden',
                    }}>
                      {user.avatar
                        ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1712', maxWidth: 80, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} style={{ color: '#9C8E80', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.16, ease }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                          width: 230, background: '#FDFCF9',
                          border: '1px solid #E5E0D8', borderRadius: 16, overflow: 'hidden',
                          boxShadow: '0 16px 48px rgba(28,23,18,0.14)', zIndex: 200,
                        }}
                      >
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EBE2', background: '#FAFAF8' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1712', marginBottom: 2 }}>{user.name}</p>
                          <p style={{ fontSize: 11, color: '#9C8E80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                        </div>
                        
                        <div style={{ padding: '8px' }}>
                          {user.role === 'ADMIN' ? (
                            <motion.button 
                              onClick={goToAdmin}
                              disabled={adminLoading}
                              whileTap={!adminLoading ? { scale: 0.98 } : {}}
                              style={{
                                width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
                                background: '#1C1712', border: 'none', cursor: adminLoading ? 'not-allowed' : 'pointer', fontSize: 13, color: '#FDFCF9',
                                borderRadius: 8, transition: 'background 0.15s', textAlign: 'left', marginBottom: 4,
                                fontWeight: 600, opacity: adminLoading ? 0.8 : 1
                              }} 
                              className="hover:!bg-[#C4631C]"
                            >
                              {adminLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} style={{ color: '#FDFCF9' }} />}
                              {adminLoading ? 'Opening...' : 'Admin Dashboard'}
                            </motion.button>
                          ) : (
                            /* ─── 7IYEDNA MY ORDERS MN HNA ─── */
                            [{ to: '/profile', icon: <User size={15} style={{ color: '#9C8E80' }} />, label: 'Profile Settings' }]
                             .map(item => (
                               <Link key={item.to} to={item.to} onClick={closeMenus} style={{ textDecoration: 'none' }}>
                                 <button style={{
                                   width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
                                   background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#3A322A',
                                   borderRadius: 8, transition: 'background 0.15s', textAlign: 'left',
                                 }} className="hover:!bg-[#F0EBE2]">
                                   {item.icon} {item.label}
                                 </button>
                               </Link>
                             ))
                          )}
                        </div>

                        <div style={{ padding: '8px', borderTop: '1px solid #F0EBE2' }}>
                          <button onClick={handleLogout} style={{
                            width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A92828',
                            borderRadius: 8, transition: 'background 0.15s', textAlign: 'left',
                          }} className="hover:!bg-red-50">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6 }}>
                  <Link to="/login" onClick={closeMenus} style={{
                    textDecoration: 'none', padding: '8px 12px', borderRadius: 8,
                    fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                    fontWeight: 700, color: '#7A6F62', transition: 'color 0.2s',
                  }} className="hover:!text-[#1C1712]">Sign In</Link>
                  <Link to="/register" onClick={closeMenus} style={{
                    textDecoration: 'none', padding: '9px 16px', background: '#C4631C', color: '#FDFCF9',
                    borderRadius: 9, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                    transition: 'background 0.2s', whiteSpace: 'nowrap',
                  }} className="hover:!bg-[#1C1712]">Create Account</Link>
                </div>
              )}

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6F62', padding: 8, lineHeight: 0, marginLeft: 2 }}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* ── Mobile Menu ── */}
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden', borderTop: '1px solid #E5E0D8' }}
              >
                <div style={{ padding: '14px 0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {navLinks.map(l => (
                    <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
                      textDecoration: 'none', padding: '11px 4px', fontSize: 14, fontWeight: 600,
                      color: location.pathname === l.to ? '#C4631C' : '#3A322A',
                      letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>{l.label}</span>
                      {location.pathname === l.to && (
                        <motion.div layoutId="mobileActiveDot"
                          style={{ width: 5, height: 5, borderRadius: '50%', background: '#C4631C' }}
                        />
                      )}
                    </Link>
                  ))}

                  <div style={{ height: 1, background: '#E5E0D8', margin: '8px 0' }} />

                  {user ? (
                    <>
                      <div style={{ padding: '8px 4px 10px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1712' }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: '#9C8E80' }}>{user.email}</p>
                      </div>

                      {user.role === 'ADMIN' ? (
                        <button 
                          onClick={goToAdmin} 
                          disabled={adminLoading}
                          style={{ 
                            background: 'none', border: 'none', textAlign: 'left', cursor: adminLoading ? 'not-allowed' : 'pointer',
                            padding: '10px 4px', fontSize: 13, color: '#C4631C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                            opacity: adminLoading ? 0.7 : 1
                          }}
                        >
                          {adminLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                          {adminLoading ? 'Opening...' : 'Admin Dashboard'}
                        </button>
                      ) : (
                        /* ─── 7IYEDNA MY ORDERS MN HNA TA HIA ─── */
                        <>
                          <Link to="/profile" onClick={closeMenus} style={{ textDecoration: 'none', padding: '10px 4px', fontSize: 13, color: location.pathname === '/profile' ? '#C4631C' : '#3A322A', fontWeight: 600 }}>Profile Settings</Link>
                        </>
                      )}

                      <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 4px', fontSize: 13, color: '#A92828', cursor: 'pointer', fontWeight: 600 }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={closeMenus} style={{ textDecoration: 'none', padding: '10px 4px', fontSize: 13, fontWeight: 600, color: '#3A322A' }}>
                        Sign In
                      </Link>
                      <Link to="/register" onClick={closeMenus} style={{
                        textDecoration: 'none', padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#FDFCF9',
                        background: '#C4631C', borderRadius: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
                        textAlign: 'center', marginTop: 6, display: 'block',
                      }}>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
      
      <div style={{ height: 60, width: '100%' }} />
    </>
  );
};

export default Navbar;