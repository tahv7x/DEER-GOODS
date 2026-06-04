import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Eye, EyeOff, AlertCircle, User, Mail, Lock, Phone } from 'lucide-react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease } }),
};

const STEPS = ['Account', 'Personal', 'Done'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkStrength = (pass: string) => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    setPasswordStrength(s);
  };

  const validateStep0 = () => {
    const e: { [k: string]: string } = {};
    if (!formData.email) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.password) e.password = 'Required';
    else if (formData.password.length < 8) e.password = 'At least 8 characters';
    else if (passwordStrength < 2) e.password = 'Add numbers or symbols';
    setFieldErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e: { [k: string]: string } = {};
    if (!formData.name.trim()) e.name = 'Required';
    else if (formData.name.trim().length < 2) e.name = 'Min 2 characters';
    if (!formData.phone) e.phone = 'Required';
    else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) e.phone = 'Invalid number';
    setFieldErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'phone') {
      finalValue = finalValue.replace(/[^0-9]/g, ''); 
      if (finalValue.startsWith('212')) {
        finalValue = '0' + finalValue.slice(3); 
      }else if(finalValue.length > 0 && !finalValue.startsWith('0')){
        finalValue = '0' + finalValue;
      }
      finalValue = finalValue.slice(0, 10);
    }
    setFormData(p => ({ ...p, [name]: finalValue }));
    setError('');
    if (name === 'password') checkStrength(value);
    if (touched[name]) step === 0 ? validateStep0() : validateStep1();
  };

  const handleNext = () => {
    setTouched({ email: true, password: true });
    if (!validateStep0()) return;
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (!validateStep1()) return;
    setLoading(true);
    setError('');
    try {
      // Create user via backend
      await apiClient.post('/auth/register', formData);
      
      // Auto login via Supabase frontend client to establish native session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      const user = authData.user;
      const token = authData.session.access_token;
      
      login(token, { 
        id: user.id, 
        name: user.user_metadata?.name || formData.name, 
        email: user.email || '', 
        role: 'CUSTOMER' 
      });
      
      setStep(2);
      setTimeout(() => navigate('/shop'), 1800);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '';
      setError(msg.toLowerCase().includes('taken') ? 'Email already registered.' : (msg || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%', padding: '14px 16px 14px 44px',
    background: focused === field ? '#fff' : '#FDFCF9',
    border: `1.5px solid ${fieldErrors[field] && touched[field] ? '#C0392B' : focused === field ? '#C4631C' : '#E5E0D8'}`,
    borderRadius: 12, fontSize: 14, color: '#1C1712', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box' as const,
  });

  const strengthColors = ['#E24B4B', '#E87826', '#F2C12E', '#3A9E5F'];
  const strengthLabel = passwordStrength === 0 ? '' : ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FDFCF9' }}>

      {/* ─── Left panel ─── */}
      <motion.div
        initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className="hidden lg:flex"
        style={{
          width: '48%', background: '#1C1712', flexDirection: 'column',
          justifyContent: 'space-between', padding: '56px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
          <svg width="100%" height="100%">
            <defs><pattern id="r-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#r-dots)" />
          </svg>
        </div>
        {/* glow */}
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
            Begin your<br />journey.<br />
            <em style={{ color: '#D4A574', fontWeight: 400 }}>Join the craft.</em>
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(253,252,249,0.55)', maxWidth: 340 }}>
            Create an account to track orders, save your favourite pieces, and receive early access to new collections.
          </p>
          
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              '100% handmade genuine leather in Morocco', 
              'Custom engraving and personalization', 
              'Lifetime warranty on all stitching', 
              'VIP access to limited edition drops'
            ].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(196,99,28,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4631C' }} />
                </div>
                <span style={{ fontSize: 13, color: 'rgba(253,252,249,0.6)' }}>{b}</span>
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
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ marginBottom: 36 }}>
            <Link to="/shop" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: '#1C1712' }}>
                DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
              </span>
            </Link>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i <= step ? '#1C1712' : '#F0EBE2',
                    color: i <= step ? '#FDFCF9' : '#9C8E80',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, transition: 'all 0.3s',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === step ? '#1C1712' : '#9C8E80' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1.5, background: i < step ? '#1C1712' : '#E5E0D8', transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ─── Step 0: Account ─── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease }}>
              <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 10 }}>
                Step 1 of 2
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 38, fontWeight: 600, color: '#1C1712', marginBottom: 8 }}>
                Create account
              </h1>
              <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7, marginBottom: 32 }}>
                Join our community of leather enthusiasts.
              </p>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 10, background: '#FEF0F0', border: '1px solid #FCCFCF', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#A92828', marginBottom: 20, alignItems: 'flex-start' }}>
                  <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} /><span>{error}</span>
                </motion.div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#C4631C' : '#9C8E80', transition: 'color 0.2s' }} />
                    <input type="email" name="email" value={formData.email}
                      onChange={handleChange} onFocus={() => setFocused('email')}
                      onBlur={() => { setFocused(null); setTouched(p => ({ ...p, email: true })); validateStep0(); }}
                      style={inputStyle('email')} placeholder="your@email.com" />
                  </div>
                  {fieldErrors.email && touched.email && <p style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? '#C4631C' : '#9C8E80', transition: 'color 0.2s' }} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleChange} onFocus={() => setFocused('password')}
                      onBlur={() => { setFocused(null); setTouched(p => ({ ...p, password: true })); validateStep0(); }}
                      style={{ ...inputStyle('password'), paddingRight: 44 }} placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', lineHeight: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {formData.password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#E5E0D8', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      {strengthLabel && <p style={{ fontSize: 11, color: strengthColors[passwordStrength - 1], fontWeight: 600 }}>{strengthLabel}</p>}
                    </motion.div>
                  )}
                  {fieldErrors.password && touched.password && <p style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldErrors.password}</p>}
                </div>

                <motion.button type="button" onClick={handleNext}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '15px 24px', background: '#1C1712', color: '#FDFCF9',
                    border: 'none', borderRadius: 12, cursor: 'pointer',
                    fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    marginTop: 8,
                  }}
                  className="hover:!bg-[#C4631C]"
                >
                  Continue <ArrowRight size={14} />
                </motion.button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#7A6F62', marginTop: 24 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#C4631C', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 700 }}>Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* ─── Step 1: Personal info ─── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease }}>
              <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 10 }}>
                Step 2 of 2
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 38, fontWeight: 600, color: '#1C1712', marginBottom: 8 }}>
                About you
              </h1>
              <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7, marginBottom: 32 }}>
                Tell us your name and phone number.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'name' ? '#C4631C' : '#9C8E80', transition: 'color 0.2s' }} />
                    <input type="text" name="name" value={formData.name}
                      onChange={handleChange} onFocus={() => setFocused('name')}
                      onBlur={() => { setFocused(null); setTouched(p => ({ ...p, name: true })); validateStep1(); }}
                      style={inputStyle('name')} placeholder="Your full name" />
                  </div>
                  {fieldErrors.name && touched.name && <p style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldErrors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>Phone Number</label>
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'phone' ? '#C4631C' : '#9C8E80', transition: 'color 0.2s', zIndex: 1 }} />
                    <span style={{
                      position: 'absolute', left: 44, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 14, color: '#7A6F62', fontWeight: 600, zIndex: 1,
                    }}>+212</span>
                    <input type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} onFocus={() => setFocused('phone')}
                      onBlur={() => { setFocused(null); setTouched(p => ({ ...p, phone: true })); validateStep1(); }}
                      style={{ ...inputStyle('phone'), paddingLeft: 86 }} placeholder="6XX XXX XXX" 
                      maxLength = {10}
                      />
                  </div>
                  {fieldErrors.phone && touched.phone && <p style={{ fontSize: 12, color: '#A92828', marginTop: 5 }}>{fieldErrors.phone}</p>}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(0)}
                    style={{
                      flex: 1, padding: '15px 24px', background: 'transparent', color: '#7A6F62',
                      border: '1.5px solid #E5E0D8', borderRadius: 12, cursor: 'pointer',
                      fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                    className="hover:!border-[#1C1712] hover:!text-[#1C1712]"
                  >Back</button>
                  <motion.button type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                    style={{
                      flex: 2, padding: '15px 24px', background: '#1C1712', color: '#FDFCF9',
                      border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      opacity: loading ? 0.7 : 1, transition: 'background 0.25s',
                    }}
                    className="hover:!bg-[#C4631C]"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={14} /></>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─── Step 2: Success ─── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease }}
              style={{ textAlign: 'center', paddingTop: 20 }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: '#E8F5EE', margin: '0 auto 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#2D7A45',
                }}
              >✓</motion.div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 600, color: '#1C1712', marginBottom: 12 }}>
                Welcome to DEER GOODS.
              </h2>
              <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7 }}>
                Your account has been created. Redirecting you to the shop...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;