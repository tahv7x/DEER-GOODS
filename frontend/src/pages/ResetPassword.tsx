import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Check, Lock } from 'lucide-react';
import apiClient from '../services/api';
import supabase from '../config/supabaseClient';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease } }),
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      let accessToken = '';

      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        accessToken = params.get('access_token') || '';
      }
      
      if (!accessToken && search) {
        const params = new URLSearchParams(search);
        accessToken = params.get('access_token') || params.get('token') || params.get('code') || '';
      }

      // If the URL has no token, Supabase might have already intercepted it and logged the user in.
      if (!accessToken) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.access_token) {
          accessToken = session.access_token;
        }
      }

      if (accessToken) { 
        setToken(accessToken); 
        localStorage.setItem('token', accessToken); 
      } else {
        setError('Reset link is invalid or missing. Make sure you clicked the full link in your email.');
      }
    };

    fetchSession();
  }, []);

  const checkStrength = (pass: string) => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    setPasswordStrength(s);
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'At least 8 characters';
    else if (passwordStrength < 2) e.password = 'Too weak — add numbers or symbols';
    if (!confirmPassword) e.confirm = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirm = 'Passwords do not match';
    setFieldErrors(e);
    return !Object.keys(e).length;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value); checkStrength(e.target.value); setError('');
    if (touched.password) validate();
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value); setError('');
    if (touched.confirm) validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!validate()) return;
    if (!token) { setError('Reset token missing. Please re-open the link from your email.'); return; }
    setLoading(true); setError('');
    try {
      await apiClient.post('/auth/reset-password', { password, token });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const strengthColors = ['#E24B4B', '#E87826', '#F2C12E', '#3A9E5F'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const inputStyle = (field: string, extraPadding = false) => ({
    width: '100%',
    padding: `14px ${extraPadding ? '44px' : '16px'} 14px 44px`,
    background: focused === field ? '#fff' : '#FDFCF9',
    border: `1.5px solid ${fieldErrors[field] && touched[field] ? '#C0392B' : focused === field ? '#C4631C' : '#E5E0D8'}`,
    borderRadius: 12, fontSize: 14, color: '#1C1712', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box' as const,
  });

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
            <defs><pattern id="rp-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#rp-dots)" />
          </svg>
        </div>
        {/* top glow */}
        <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '60%', height: '55%', background: 'radial-gradient(ellipse, rgba(196,99,28,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: '#FDFCF9' }}>
              DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
            </span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 46, fontWeight: 600, lineHeight: 1.08, color: '#FDFCF9', marginBottom: 20 }}>
            Set a new<br />password.<br />
            <em style={{ color: '#D4A574', fontWeight: 400 }}>Secure your account.</em>
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(253,252,249,0.55)', maxWidth: 340 }}>
            Choose a strong password to protect your account and your orders.
          </p>

          {/* tips */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['At least 8 characters', 'One uppercase letter', 'One number or symbol'].map(tip => (
              <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(196,99,28,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4631C' }} />
                </div>
                <span style={{ fontSize: 13, color: 'rgba(253,252,249,0.6)' }}>{tip}</span>
              </div>
            ))}
          </div>
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
                DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
              </span>
            </Link>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease }}
              style={{ textAlign: 'center', paddingTop: 20 }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8F5EE', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#2D7A45' }}
              >✓</motion.div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 600, color: '#1C1712', marginBottom: 12 }}>
                Password updated!
              </h2>
              <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7 }}>
                Redirecting you to sign in...
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 10 }}>
                  Security
                </p>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 600, color: '#1C1712', marginBottom: 8 }}>
                  Reset password
                </h1>
                <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7, marginBottom: 36 }}>
                  Enter your new password below.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: 10, background: '#FEF0F0', border: '1px solid #FCCFCF', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#A92828', alignItems: 'flex-start' }}>
                    <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} /><span>{error}</span>
                  </motion.div>
                )}

                {/* New password */}
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? '#C4631C' : '#9C8E80', transition: 'color 0.2s' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={handlePasswordChange}
                      onFocus={() => setFocused('password')}
                      onBlur={() => { setFocused(null); setTouched(p => ({ ...p, password: true })); validate(); }}
                      placeholder="Min. 8 characters"
                      style={{ ...inputStyle('password'), paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', lineHeight: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#E5E0D8', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      {passwordStrength > 0 && (
                        <p style={{ fontSize: 11, color: strengthColors[passwordStrength - 1], fontWeight: 600 }}>
                          {strengthLabels[passwordStrength - 1]}
                        </p>
                      )}
                    </motion.div>
                  )}
                  {fieldErrors.password && touched.password && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldErrors.password}</motion.p>
                  )}
                </motion.div>

                {/* Confirm password */}
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'confirm' ? '#C4631C' : '#9C8E80', transition: 'color 0.2s' }} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword} onChange={handleConfirmChange}
                      onFocus={() => setFocused('confirm')}
                      onBlur={() => { setFocused(null); setTouched(p => ({ ...p, confirm: true })); validate(); }}
                      placeholder="Repeat your password"
                      style={{ ...inputStyle('confirm'), paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', lineHeight: 0 }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {confirmPassword && password === confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ fontSize: 12, color: '#2D7A45', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                      <Check size={13} /> Passwords match
                    </motion.p>
                  )}
                  {fieldErrors.confirm && touched.confirm && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldErrors.confirm}</motion.p>
                  )}
                </motion.div>

                {/* Submit */}
                <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
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
                      : <><span>Update Password</span><ArrowRight size={14} /></>
                    }
                  </motion.button>
                </motion.div>

                <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', paddingTop: 4 }}>
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

export default ResetPassword;