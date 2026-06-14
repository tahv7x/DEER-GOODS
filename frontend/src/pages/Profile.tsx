import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Camera, Check, X, Loader2, Lock, ArrowRight, Package, ShieldCheck, Phone
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { updateProfile } from '../services/api';
import apiClient from '../services/api'; // Zdnaha bach n-jbdou l-orders
import supabase from '../config/supabaseClient';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.65, ease },
});

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const shortId = (id: string) => id?.split('-')[0].toUpperCase();

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState((user as any)?.phone || ''); // Zdnaha 3la 9bl WhatsApp
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Data States
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [recentOrder, setRecentOrder] = useState<any>(null);

  if (!user) { navigate('/login'); return null; }

  // ─── NJBDOU REAL DATA ───
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await apiClient.get('/orders/my-orders');
        const orders = Array.isArray(res.data) ? res.data : [];
        
        setOrderCount(orders.length);
        
        const spent = orders.reduce((sum: number, o: any) => sum + (o.status !== 'CANCELED' && o.status !== 'REFUNDED' ? o.totalAmount : 0), 0);
        setTotalSpent(spent);

        if (orders.length > 0) {
          const sorted = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrder(sorted[0]);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchUserStats();

    const fetchSupabaseUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.user_metadata?.phone) {
          setPhone(data.user.user_metadata.phone);
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
      }
    };
    fetchSupabaseUser();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setIsEditing(true);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone); // Zdnaha hna
      if (avatarFile) formData.append('avatar', avatarFile);
      
      const response = await updateProfile(formData);
      const updatedUserObj = response.user;
      
      updateUser({
        ...user,
        name: updatedUserObj.user_metadata?.name || name,
        avatar: updatedUserObj.user_metadata?.avatar_url || avatarPreview,
        phone: updatedUserObj.user_metadata?.phone || phone, // Update context
      } as any);
      
      setIsEditing(false);
      setAvatarFile(null);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save changes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setName(user.name);
    setPhone((user as any)?.phone || '');
    setAvatarPreview(user.avatar || null);
    setAvatarFile(null);
  };

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F1', color: '#1A1410' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; box-shadow: 0 0 0 3px rgba(196,99,28,0.15); }
        button:focus-visible { outline: 2px solid #C4631C; outline-offset: 3px; border-radius: 12px; }
        .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,0,0,0.1) !important; }
        .sign-out-btn:hover { background: #FFE5E5 !important; transform: translateY(-1px); }
        .edit-btn:hover { background: rgba(196,99,28,0.08) !important; }
        .save-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .view-orders-link:hover { gap: 12px !important; }
        .view-orders-link { transition: gap 0.2s ease; }
        .avatar-wrapper { cursor: pointer; transition: transform 0.3s ease; }
        .avatar-wrapper:hover { transform: scale(1.06); }
        .avatar-wrapper:hover .avatar-overlay { opacity: 1 !important; }
        .avatar-overlay { opacity: 0; transition: opacity 0.25s ease; }
        
        .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
        .sidebar-container { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 16px; }
        
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
          .sidebar-container { position: relative; top: 0; z-index: 10; }
        }
        
        @media (max-width: 500px) {
          .personal-info-card { padding: 24px !important; }
          .personal-info-header { flex-direction: column; gap: 12px; align-items: flex-start !important; }
        }
      `}</style>

      <Navbar />

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -16, x: '-50%' }}
            transition={{ duration: 0.4, ease }}
            style={{
              position: 'fixed', top: 0, left: '50%', zIndex: 9999,
              background: '#1A1410', color: '#fff', padding: '13px 20px', borderRadius: 100,
              display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: toast.type === 'success' ? 'rgba(196,99,28,0.2)' : 'rgba(220,50,50,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {toast.type === 'success'
                ? <Check size={13} color="#C4631C" strokeWidth={2.5} />
                : <X size={13} color="#DC3232" strokeWidth={2.5} />}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.01em' }}>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px 100px' }}>

        {/* PAGE HEADER */}
        <motion.div {...stagger(0)} style={{ marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(196,99,28,0.08)', border: '1px solid rgba(196,99,28,0.18)',
            borderRadius: 100, padding: '6px 14px', marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4631C' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C4631C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              My Account
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 5vw, 58px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 14 }}>
            Welcome back,<br />
            <span style={{ color: '#C4631C' }}>{user.name.split(' ')[0]}</span>
          </h1>

          <p style={{ color: '#7A6E64', fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>
            Manage your profile, update personal information, and track your orders below.
          </p>
        </motion.div>

        {/* MAIN GRID */}
        <div className="profile-grid">

          {/* ─── LEFT SIDEBAR ─── */}
          <motion.div {...stagger(1)} className="sidebar-container">

            {/* PROFILE CARD */}
            <div className="hover-lift" style={{
              background: '#fff', borderRadius: 28, padding: 28,
              border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: 450,
            }}>
              {/* Avatar */}
              <div className="avatar-wrapper" style={{ position: 'relative', marginBottom: 20 }} onClick={() => fileInputRef.current?.click()}>
                <div style={{
                  width: 108, height: 108, borderRadius: '50%', background: 'linear-gradient(135deg, #C4631C 0%, #E8A96A 50%, #1A1410 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3,
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%', background: '#FAF7F3', border: '3px solid white',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 700, color: '#C4631C', position: 'relative',
                  }}>
                    {loading && avatarFile ? <Loader2 size={22} className="animate-spin" /> : avatarPreview ? <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                    <div className="avatar-overlay" style={{
                      position: 'absolute', inset: 0, background: 'rgba(26,20,16,0.55)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '50%',
                    }}>
                      <Camera size={18} color="#fff" />
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Change</span>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Name + email */}
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>{user.name}</h2>
              <p style={{ color: '#9E9184', fontSize: 13, marginBottom: 16 }}>{user.email}</p>

              {/* Role badge */}
              <div style={{
                background: '#1A1410', color: '#fff', padding: '6px 14px', borderRadius: 100,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 22,
              }}>{user.role}</div>

              <div style={{ width: '100%', height: 1, background: 'rgba(0,0,0,0.05)', marginBottom: 22 }} />

              {/* REAL STATS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginBottom: 22 }}>
                <div style={{ background: '#FAF7F3', borderRadius: 16, padding: '14px 12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em', fontFamily: "'Playfair Display', serif" }}>{orderCount}</p>
                  <p style={{ fontSize: 10, color: '#9E9184', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Orders</p>
                </div>
                <div style={{ background: '#FAF7F3', borderRadius: 16, padding: '14px 12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.04em', fontFamily: "'Playfair Display', serif", color: '#C4631C' }}>{MAD(totalSpent)}</p>
                  <p style={{ fontSize: 10, color: '#9E9184', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Spent</p>
                </div>
              </div>

              {/* Sign out */}
              <button
                className="sign-out-btn" onClick={logout}
                style={{
                  width: '100%', height: 50, border: '1px solid #FFD4D4', borderRadius: 16, background: '#FFF5F5', color: '#C02020',
                  fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.25s ease',
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* ─── RIGHT CONTENT ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* PERSONAL INFO */}
            <motion.div {...stagger(2)} className="hover-lift" style={{
              background: '#fff', borderRadius: 28, padding: 36, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6 }}>Personal Information</h2>
                  <p style={{ color: '#9E9184', fontSize: 13, lineHeight: 1.6 }}>Update your display name, phone number, and profile photo.</p>
                </div>
                {!isEditing && (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}
                    style={{
                      border: '1px solid rgba(196,99,28,0.25)', background: 'rgba(196,99,28,0.06)', color: '#C4631C', fontWeight: 700, fontSize: 12,
                      padding: '8px 16px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}
                  >Edit</button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Full name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Full Name</label>
                  <input type="text" value={name} disabled={!isEditing} onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', height: 54, padding: '0 18px', borderRadius: 16, border: isEditing ? '1.5px solid #C4631C' : '1.5px solid #EDE8E1', background: isEditing ? '#fff' : '#FAF7F3', fontSize: 15, fontWeight: 500, color: '#1A1410', transition: 'all 0.25s ease' }}
                  />
                </div>

                {/* REAL PHONE NUMBER INPUT */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Phone Number (For WhatsApp/Delivery)</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#9E9184' }}>
                      <Phone size={18} />
                    </div>
                    <input type="tel" placeholder="+212 600 000 000" value={phone} disabled={!isEditing} onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', height: 54, padding: '0 18px 0 46px', borderRadius: 16, border: isEditing ? '1.5px solid #C4631C' : '1.5px solid #EDE8E1', background: isEditing ? '#fff' : '#FAF7F3', fontSize: 15, fontWeight: 500, color: '#1A1410', transition: 'all 0.25s ease' }}
                    />
                  </div>
                </div>

                {/* Email (Locked) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Email Address</label>
                  <div style={{ height: 54, padding: '0 18px', borderRadius: 16, border: '1.5px solid #EDE8E1', background: '#FAF7F3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#6A6058' }}>{user.email}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EDE8E1', borderRadius: 100, padding: '4px 10px' }}>
                      <Lock size={11} color="#9E9184" />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#9E9184', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Locked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 8, height: 0 }} transition={{ duration: 0.3, ease }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                      <button onClick={cancelEdit} disabled={loading} className="hover:!bg-[#F0EBE2]" style={{ flex: 1, height: 54, borderRadius: 16, border: '1.5px solid #EDE8E1', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#6A6058', transition: 'all 0.2s ease' }}>
                        Cancel
                      </button>
                      <button className="save-btn" onClick={handleSave} disabled={loading} style={{ flex: 2, height: 54, border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #1A1410 0%, #332519 100%)', color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 30px rgba(26,20,16,0.22)', transition: 'all 0.25s ease' }}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={15} strokeWidth={2.5} /> Save Changes</>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* REAL RECENT ORDER PREVIEW */}
            <motion.div {...stagger(3)} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              <div className="hover-lift" style={{ background: '#fff', borderRadius: 28, padding: 28, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
                {recentOrder ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FAF7F3', border: '1px solid #EDE8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={18} color="#C4631C" />
                      </div>
                      <span style={{
                        background: recentOrder.status === 'DELIVERED' ? '#EDFDF4' : recentOrder.status === 'CANCELED' ? '#FEF0F0' : '#FFF4E5', 
                        color: recentOrder.status === 'DELIVERED' ? '#1A7A46' : recentOrder.status === 'CANCELED' ? '#A92828' : '#C4631C',
                        fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}>{recentOrder.status}</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#9E9184', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Recent Order</p>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em',  marginBottom: 4 }}>#{shortId(recentOrder.id)}</h3>
                    <p style={{ fontSize: 13, color: '#9E9184', marginBottom: 22 }}>{recentOrder.OrderItem?.length || 0} items · {formatDate(recentOrder.createdAt)}</p>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FAF7F3', border: '1px dashed #EDE8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={18} color="#9E9184" />
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#9E9184', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Recent Order</p>
                    <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: '#1A1410', marginBottom: 4 }}>No orders yet</h3>
                    <p style={{ fontSize: 13, color: '#9E9184', marginBottom: 22 }}>You haven't made any purchases.</p>
                  </>
                )}
                
                <Link to="/orders" className="view-orders-link" style={{ textDecoration: 'none', color: '#C4631C', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.02em' }}>
                  View All Orders <ArrowRight size={14} />
                </Link>
              </div>

              {/* All orders CTA */}
              <div className="hover-lift" style={{ background: 'linear-gradient(145deg, #1A1410 0%, #2E1E12 50%, #1A1410 100%)', borderRadius: 28, padding: 28, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,20,16,0.22)' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(196,99,28,0.12)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>Order History</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.25, marginBottom: 12 }}>Track all your purchases.</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 24 }}>View delivery status, receipts, and full order history.</p>
                  <Link to="/orders" style={{ textDecoration: 'none', background: '#C4631C', color: '#fff', height: 46, padding: '0 22px', borderRadius: 14, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'opacity 0.2s ease' }}>
                    All Orders <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;