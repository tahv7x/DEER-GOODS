import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, Mail } from 'lucide-react';
import apiClient from '../services/api';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease } }),
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const validate = () => {
    if (!email) { setFieldError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('Invalid email format'); return false; }
    setFieldError(''); return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value); setError('');
    if (touched) validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validate()) return;
    setLoading(true); setError(''); setSuccess(false);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('email')) {
        setError('No account found with this email. Please check or create an account.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FDFCF9', color: '#1C1712' }}>

      {/* ─── Left panel ─── */}
      <motion.div
        initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className="hidden lg:flex"
        style={{ width: '48%', background: '#1C1712', flexDirection: 'column', justifyContent: 'space-between', padding: '56px', position: 'relative', overflow: 'hidden' }}
      >
        {/* dot texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
          <svg width="100%" height="100%">
            <defs><pattern id="fp-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#fp-dots)" />
          </svg>
        </div>
        {/* amber glow */}
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '65%', height: '55%', background: 'radial-gradient(ellipse, rgba(196,99,28,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: '#FDFCF9' }}>
              DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
            </span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 46, fontWeight: 600, lineHeight: 1.08, color: '#FDFCF9', marginBottom: 20 }}>
            Reset your<br />password.<br />
            <em style={{ color: '#D4A574', fontWeight: 400 }}>We'll help you.</em>
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(253,252,249,0.55)', maxWidth: 340 }}>
            Enter your email and we'll send you a secure link to set a new password.
          </p>
        </motion.div>

        <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(253,252,249,0.25)', fontWeight: 700, position: 'relative', zIndex: 1 }}>
          Est. 2026 — Handmade in Morocco
        </p>
      </motion.div>

      {/* ─── Right form ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ marginBottom: 36 }}>
            <Link to="/shop" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: '#1C1712' }}>
                HOMEVO<span style={{ color: '#C4631C' }}>.</span>
              </span>
            </Link>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease }}
              style={{ textAlign: 'center', paddingTop: 20 }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ width: 72, height: 72, borderRadius: '50%', background: '#FEF3EA', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Mail size={28} style={{ color: '#C4631C' }} />
              </motion.div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 600, color: '#1C1712', marginBottom: 12 }}>
                Check your email
              </h2>
              <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7, marginBottom: 32 }}>
                We've sent a password reset link to<br />
                <strong style={{ color: '#1C1712' }}>{email}</strong>
              </p>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                color: '#7A6F62', textDecoration: 'none', transition: 'color 0.2s',
              }} className="hover:!text-[#C4631C]">
                ← Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 10 }}>
                  Password Recovery
                </p>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 600, color: '#1C1712', marginBottom: 8 }}>
                  Forgot password
                </h1>
                <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7, marginBottom: 36 }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: 10, background: '#FEF0F0', border: '1px solid #FCCFCF', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#A92828', alignItems: 'flex-start' }}>
                    <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} /><span>{error}</span>
                  </motion.div>
                )}

                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#C4631C' : '#9C8E80', transition: 'color 0.2s' }} />
                    <input
                      type="email" value={email} onChange={handleChange}
                      onFocus={() => setFocused(true)}
                      onBlur={() => { setFocused(false); setTouched(true); validate(); }}
                      placeholder="your@email.com"
                      style={{
                        width: '100%', padding: '14px 16px 14px 44px',
                        background: focused ? '#fff' : '#FDFCF9',
                        border: `1.5px solid ${fieldError && touched ? '#C0392B' : focused ? '#C4631C' : '#E5E0D8'}`,
                        borderRadius: 12, fontSize: 14, color: '#1C1712', outline: 'none',
                        transition: 'all 0.2s', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {fieldError && touched && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldError}</motion.p>
                  )}
                </motion.div>

                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                  <motion.button type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                    style={{
                      width: '100%', padding: '15px 24px', background: '#1C1712', color: '#FDFCF9',
                      border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      opacity: loading ? 0.7 : 1, transition: 'background 0.25s',
                    }}
                    className="hover:!bg-[#C4631C]"
                  >
                    {loading
                      ? <Loader2 size={16} className="animate-spin" />
                      : <><span>Send Reset Link</span><ArrowRight size={14} /></>
                    }
                  </motion.button>
                </motion.div>

                <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', paddingTop: 4 }}>
                  <Link to="/login" style={{ fontSize: 13, color: '#7A6F62', textDecoration: 'none', transition: 'color 0.2s' }}
                    className="hover:!text-[#C4631C]">
                    ← Back to Sign In
                  </Link>
                </motion.div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;