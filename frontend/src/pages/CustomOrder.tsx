import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UploadCloud, Loader2, Check, X, Image as ImageIcon, ArrowRight, FileText, Compass, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';
const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const shortId = (id: string) => id.split('-')[0].toUpperCase();

interface CustomOrder {
  id: string;
  description: string;
  imageUrl: string | null;
  estimatedPrice: number | null;
  status: string;
  createdAt: string;
}

const STATUS_THEMES: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  'PENDING': { bg: '#FFF9E6', text: '#B35B1B', border: '#FFE6CC', accent: '#C4631C' },
  'QUOTED': { bg: '#EBF5FF', text: '#1E40AF', border: '#BFDBFE', accent: '#2563EB' },
  'ACCEPTED': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', accent: '#10B981' },
  'REJECTED': { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5', accent: '#EF4444' },
};

const ClientCustomOrders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form & Feedback States
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(500); // 👈 L'BUDGET PAR DEFAUT WLLA 500 DH
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // SUPER AESTHETIC FEEDBACK STATES
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionErrorId, setActionErrorId] = useState<string | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/custom-orders/my-requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        
        setSubmitLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
        const finalDescription = `${description.trim()}\n\n[💰 Budget ciblé : ${MAD(budget)}]`;

        const formData = new FormData();
        formData.append('description', finalDescription);
        
        if (imageFile) {
            formData.append('image', imageFile); // Smiya khassha tkon 'image'
        }

        await apiClient.post('/custom-orders', formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
        });

        setDescription('');
        setBudget(500);
        setImageFile(null);
        setImagePreview(null);
        
        setSuccessMsg('Request submitted successfully! Our studio team will review your specs.');
        setTimeout(() => setSuccessMsg(''), 5000);
        
        fetchRequests();
        } catch (error) {
        console.error("Submission Error:", error);
        setErrorMsg('Unable to transmit request. Please check your image size or connection.');
        setTimeout(() => setErrorMsg(''), 6000);
        } finally {
        setSubmitLoading(false);
        }
    };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    setActionErrorId(null);
    try {
      await apiClient.put(`/custom-orders/${id}/status`, { status: nextStatus });
      fetchRequests();
    } catch (err) {
      setActionErrorId(id);
      setTimeout(() => setActionErrorId(null), 5000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', color: '#1A1410', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <style>{`
        .custom-textarea::-webkit-scrollbar { width: 4px; }
        .custom-textarea::-webkit-scrollbar-thumb { background: rgba(196,99,28,0.2); border-radius: 4px; }
        .history-pane::-webkit-scrollbar { width: 6px; }
        .history-pane::-webkit-scrollbar-thumb { background: rgba(26,20,16,0.1); border-radius: 10px; }
        
        /* JRARA (Slider) CUSTOM STYLES */
        .premium-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #EDE8E1;
          border-radius: 4px;
          outline: none;
          transition: background 0.2s;
        }
        .premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #C4631C;
          cursor: pointer;
          border: 4px solid #fff;
          box-shadow: 0 4px 10px rgba(196,99,28,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 14px rgba(196,99,28,0.4);
        }
        
        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0)); opacity: 0; transition: opacity 0.2s; }
        .glow-btn:hover::after { opacity: 1; }
      `}</style>

      {/* FLOATING AESTHETIC NOTIFICATIONS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }} 
            animate={{ opacity: 1, y: 20, scale: 1, x: '-50%' }} 
            exit={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ 
              position: 'fixed', top: 0, left: '50%', zIndex: 9999,
              background: 'rgba(236, 253, 245, 0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(16, 185, 129, 0.3)', color: '#065F46', 
              padding: '16px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, 
              display: 'flex', gap: 12, alignItems: 'center',
              boxShadow: '0 16px 40px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={14} color="#fff" strokeWidth={3} />
            </div>
            <p>{successMsg}</p>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }} 
            animate={{ opacity: 1, y: 20, scale: 1, x: '-50%' }} 
            exit={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ 
              position: 'fixed', top: 0, left: '50%', zIndex: 9999,
              background: 'rgba(254, 242, 242, 0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(239, 68, 68, 0.3)', color: '#991B1B', 
              padding: '16px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, 
              display: 'flex', gap: 12, alignItems: 'center',
              boxShadow: '0 16px 40px rgba(239, 68, 68, 0.15)'
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <p>{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', padding: '50px 40px 80px', width: '100%' }}>
        
        {/* Header Premium Section */}
        <div style={{ marginBottom: 48, textAlign: 'left' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(196,99,28,0.06)', border: '1px solid rgba(196,99,28,0.15)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
            <Sparkles size={13} color="#C4631C" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C4631C', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Atelier Maison</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 600, color: '#1A1410', marginBottom: 12, letterSpacing: '-0.02em' }}>
            Bespoke Orders & Custom Specs
          </h1>
          <p style={{ fontSize: 15, color: '#7A6E64', maxWidth: 640, lineHeight: 1.6 }}>
            Collaborate directly with our leather artisans. Submit detailed references, sketch concepts, or descriptions to construct your unique heritage piece.
          </p>
        </div>

        {/* Asymmetric Split Panel Layout */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          
          {/* LEFT PANEL: CRAFT FORM */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '5 1 480px', background: '#ffffff', padding: 40, borderRadius: 24, border: '1px solid #E5DED5', boxShadow: '0 10px 40px rgba(26,20,16,0.02)' }}
          >
            <div style={{ borderBottom: '1px solid #FAF8F5', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
                Configure Specification
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {/* JRARA (SLIDER) SECTION UPDATED */}
              <div style={{ background: '#FAF8F5', padding: 24, borderRadius: 16, border: '1px solid #EDE8E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Target Budget
                  </label>
                  <motion.div 
                    key={budget}
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 22, fontWeight: 700, color: '#C4631C', fontFamily: "'Playfair Display', serif" }}
                  >
                    {MAD(budget)}
                  </motion.div>
                </div>
                
                <input 
                  type="range" 
                  min="150" 
                  max="1500" 
                  step="50" 
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="premium-slider"
                  style={{ 
                    // (budget - min) / (max - min) * 100
                    // (budget - 150) / (1500 - 150) * 100 = (budget - 150) / 1350 * 100
                    background: `linear-gradient(to right, #C4631C ${(budget - 150) / 1350 * 100}%, #EDE8E1 ${(budget - 150) / 1350 * 100}%)` 
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: '#A89B8C', fontWeight: 600 }}>
                  <span>150 DH</span>
                  <span>1,500+ DH</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Design Description *
                </label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="State type of product, dimensions, exact dynamic styling notes, lining choices, hardware finish or edge dye color..."
                  className="custom-textarea"
                  style={{ 
                    width: '100%', height: 160, padding: 18, borderRadius: 16, 
                    border: isFocused ? '1.5px solid #C4631C' : '1.5px solid #EDE8E1', 
                    background: isFocused ? '#ffffff' : '#FAF8F5', 
                    fontSize: 14, resize: 'vertical', outline: 'none', 
                    transition: 'all 0.2s ease', fontFamily: 'inherit', lineHeight: 1.6,
                    boxShadow: isFocused ? '0 0 0 4px rgba(196,99,28,0.06)' : 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Reference / Moodboard Media
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    height: 140, border: '2px dashed #D4C5B0', borderRadius: 16, 
                    background: imagePreview ? '#FFFFFF' : '#FAF8F5', display: 'flex', 
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.25s ease' 
                  }}
                  onMouseEnter={e => { if(!imagePreview) { e.currentTarget.style.borderColor = '#C4631C'; e.currentTarget.style.background = '#FCFAF7'; } }}
                  onMouseLeave={e => { if(!imagePreview) { e.currentTarget.style.borderColor = '#D4C5B0'; e.currentTarget.style.background = '#FAF8F5'; } }}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 10 }} />
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                        style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#A92828' }}
                      >
                        <X size={15} />
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                        <UploadCloud size={26} color="#C4631C" style={{ marginBottom: 8 }} />
                      </motion.div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1410' }}>Drop sketch or layout reference</p>
                      <p style={{ fontSize: 12, color: '#9E9184', marginTop: 4 }}>Supports heavy high-res PNG/JPG images</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              <motion.button 
                whileHover={{ scale: description.trim() ? 1.01 : 1, y: description.trim() ? -1 : 0 }} 
                whileTap={{ scale: description.trim() ? 0.99 : 1 }}
                type="submit" 
                disabled={submitLoading || !description.trim()}
                className="glow-btn"
                style={{ 
                  width: '100%', height: 56, 
                  background: description.trim() ? 'linear-gradient(135deg, #1A1410 0%, #332519 100%)' : '#EDE8E1', 
                  color: description.trim() ? '#FAF8F5' : '#9E9184', 
                  border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 700, 
                  letterSpacing: '0.12em', textTransform: 'uppercase', 
                  cursor: description.trim() ? 'pointer' : 'not-allowed', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
                  transition: 'all 0.3s ease', marginTop: 8,
                  boxShadow: description.trim() ? '0 12px 30px rgba(26,20,16,0.15)' : 'none' 
                }}
              >
                {submitLoading ? <Loader2 size={18} className="animate-spin" /> : <><Compass size={16} /> Transmission Request</>}
              </motion.button>
            </form>
          </motion.div>

          {/* RIGHT PANEL: CHRONOLOGY HISTORY */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="history-pane"
            style={{ flex: '7 1 540px', display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '680px', overflowY: 'auto', paddingRight: 6 }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1410', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
              <FileText size={18} color="#C4631C" /> Mon Historic Timeline
            </h2>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, background: '#fff', borderRadius: 24, border: '1px solid #E5E0D8' }}>
                <Loader2 size={28} color="#C4631C" className="animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div style={{ background: '#fff', padding: '80px 40px', borderRadius: 24, border: '1px solid #E5E0D8', textAlign: 'center' }}>
                <ImageIcon size={36} color="#D4C5B0" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1410', marginBottom: 6 }}>Aucune demande sur-mesure</h3>
                <p style={{ fontSize: 14, color: '#7A6E64' }}>Your custom requests ledger is empty. Submit specs on the left layout panel.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {requests.map((req, idx) => {
                  const theme = STATUS_THEMES[req.status] || { bg: '#FAFAF8', text: '#1A1410', border: '#EDE8E1', accent: '#1A1410' };
                  return (
                    <motion.div 
                      key={req.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(26,20,16,0.03)' }}
                      style={{ 
                        background: '#ffffff', padding: 28, borderRadius: 20, 
                        border: '1px solid #E5E0D8', position: 'relative',
                        borderLeft: `5px solid ${theme.accent}`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#9E9184', letterSpacing: '0.08em', marginBottom: 6 }}>
                            TRACK SPEC #{shortId(req.id)}
                          </p>
                          <span style={{ 
                            background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`,
                            fontSize: 10, fontWeight: 700, padding: '5px 14px', borderRadius: 100, 
                            letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block'
                          }}>
                            {req.status}
                          </span>
                        </div>
                        
                        {/* Dynamic Quote Badge */}
                        <div style={{ textAlign: 'right' }}>
                          {req.estimatedPrice ? (
                            <div style={{ background: '#FAF8F5', padding: '10px 16px', borderRadius: 12, border: '1px solid #E5E0D8' }}>
                              <p style={{ fontSize: 9, color: '#9E9184', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 2 }}>Tarification Estimée</p>
                              <p style={{ fontSize: 18, fontWeight: 700, color: '#C4631C' }}>{MAD(req.estimatedPrice)}</p>
                            </div>
                          ) : (
                            <p style={{ fontSize: 12, color: '#9E9184', fontStyle: 'italic', background: '#FAF8F5', padding: '8px 14px', borderRadius: 10, border: '1px dashed #EDE8E1' }}>
                              Étude d'Atelier en cours...
                            </p>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: 14, color: '#4A4035', lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-line' }}>
                        {req.description}
                      </p>

                      {/* INLINE ACTION ERROR DISPLAY */}
                      <AnimatePresence>
                        {actionErrorId === req.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}
                          >
                            <AlertCircle size={14} />
                            <span>Action failed. Please verify your connection and try again.</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #FAF8F5', paddingTop: 18, flexWrap: 'wrap', gap: 12 }}>
                        <p style={{ fontSize: 12, color: '#9E9184' }}>Sujet émis le {formatDate(req.createdAt)}</p>
                        
                        {/* Client Interactive Choices */}
                        {req.status === 'QUOTED' && (
                          <div style={{ display: 'flex', gap: 10 }}>
                            <motion.button 
                              whileHover={{ scale: 1.03, background: '#FEF2F2' }} whileTap={{ scale: 0.97 }}
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              style={{ padding: '10px 18px', background: '#FAF8F5', border: '1px solid #FCA5A5', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#991B1B', cursor: 'pointer', transition: 'all 0.15s' }}
                            >
                              Décliner
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.03, y: -1, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }} whileTap={{ scale: 0.97 }}
                              onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                              style={{ padding: '10px 20px', background: '#10B981', border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                            >
                              <Check size={14} strokeWidth={2.5} /> Accepter l'offre
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClientCustomOrders;