import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient'; 
import { AnyARecord } from 'node:dns';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease },
  }),
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [focused, setFocused] = useState<string | null>(null);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'At least 8 characters';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    if (touched[e.target.name]) validate();
  };

  const handleBlur = (field: string) => {
    setFocused(null);
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({email: true, password: true});
    if(!validate()) return ;

    setLoading(true);
    setError('');

    try{
      const response = await apiClient.post('/auth/login',formData);
      const {token,user} = response.data;

      const { data: dbUser } = await supabase
        .from('User')
        .select('role')
        .eq('email', formData.email)
        .single();

      const realRole = dbUser?.role || 'CUSTOMER';
      const userName = user?.user_metadata?.name ;
      const avatar = user?.user_metadata?.avatar_url;
      login(token, { 
        id: user.id, 
        name: userName, 
        email: user.email, 
        role: realRole,
        avatar
      });

      if(realRole === 'ADMIN'){
        navigate('/admin');
      }else{
        navigate('/shop');
      }
    }catch(err: any){
      console.error("Login error : ",err);
      setError(err.response.data.message);
    }finally{
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err.message);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '14px 16px',
    background: focused === field ? '#fff' : '#FDFCF9',
    border: `1px solid ${fieldErrors[field] && touched[field] ? '#C0392B' : focused === field ? '#C4631C' : '#E5E0D8'}`,
    borderRadius: 10,
    fontSize: 14,
    color: '#1C1712',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FDFCF9', color: '#1C1712' }}>
      
      {/* ─── Left Panel (Desktop) ─── */}
      <motion.div
        initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
        style={{
          display: 'none', width: '50%', background: '#1C1712', position: 'relative', overflow: 'hidden',
          flexDirection: 'column', justifyContent: 'space-between', padding: '56px',
        }}
        className="hidden lg:flex"
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '70%', height: '60%', background: 'radial-gradient(ellipse, rgba(196,99,28,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: '#FDFCF9', letterSpacing: '-0.02em' }}>
              DEER GOODS<span style={{ color: '#C4631C' }}>.</span>
            </span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }} style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: 48, fontWeight: 600, lineHeight: 1.08, color: '#FDFCF9', letterSpacing: '-0.02em', marginBottom: 20 }}>
            Welcome<br />back.<br />
            <em style={{ color: '#D4A574', fontStyle: 'italic', fontWeight: 400 }}>We missed you.</em>
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(253,252,249,0.55)', maxWidth: 340 }}>
            Sign in to continue your journey. Your orders, saved pieces, and artisan updates await.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(253,252,249,0.3)', fontWeight: 700 }}>
            Est. 2026 — Handmade in Morocco
          </p>
        </motion.div>
      </motion.div>

      {/* ─── Right Form ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          
          <motion.div className="lg:hidden" custom={0} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 40 }}>
            <Link to="/shop" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, color: '#1C1712' }}>
                HOMEVO<span style={{ color: '#C4631C' }}>.</span>
              </span>
            </Link>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 12 }}>Account Access</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: 40, fontWeight: 600, color: '#1C1712', lineHeight: 1.1, marginBottom: 8 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: '#7A6F62', lineHeight: 1.7, marginBottom: 36 }}>Enter your credentials to access your account.</p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF0F0', border: '1px solid #FCCFCF', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#A92828' }}>
                <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62', marginBottom: 8 }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocused('email')} onBlur={() => handleBlur('email')} style={inputStyle('email')} placeholder="your@email.com" />
              {fieldErrors.email && touched.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#A92828', marginTop: 6 }}>{fieldErrors.email}</motion.p>}
            </motion.div>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 11, color: '#9C8E80', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:!text-[#C4631C]">Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocused('password')} onBlur={() => handleBlur('password')} style={{ ...inputStyle('password'), paddingRight: 44 }} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', padding: 0, lineHeight: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && touched.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#A92828', marginTop: 6 }}>{fieldErrors.password}</motion.p>}
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}} style={{ width: '100%', padding: '15px 24px', background: '#1C1712', color: '#FDFCF9', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1, transition: 'background 0.25s' }} className="hover:!bg-[#C4631C]">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={14} /></>}
              </motion.button>
            </motion.div>

            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#E5E0D8' }} />
              <span style={{ fontSize: 11, color: '#9C8E80', letterSpacing: '0.1em' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#E5E0D8' }} />
            </motion.div>

            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <motion.button type="button" onClick={handleGoogleLogin} whileHover={{ scale: 1.01, background: '#F5F0EA' }} whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '14px 24px', background: '#FDFCF9', color: '#1C1712', border: '1px solid #E5E0D8', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.21-3.21C17.55 1.7 14.97 1 12 1 7.35 1 3.37 3.68 1.41 7.6l3.85 2.99C6.2 7.57 8.88 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.65 2.83c2.14-1.97 3.36-4.87 3.36-8.51z" />
                  <path fill="#FBBC05" d="M5.26 14.39c-.25-.76-.39-1.57-.39-2.39s.14-1.63.39-2.39L1.41 6.61C.51 8.42 0 10.46 0 12.5s.51 4.08 1.41 5.89l3.85-2.99z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.65-2.83c-1.01.67-2.3 1.07-4.31 1.07-3.12 0-5.8-2.53-6.74-5.55L1.41 16.7C3.37 20.62 7.35 23 12 23z" />
                </svg>
                Continue with Google
              </motion.button>
            </motion.div>

            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', paddingTop: 8 }}>
              <Link to="/register" style={{ fontSize: 13, color: '#7A6F62', textDecoration: 'none' }} className="hover:!text-[#C4631C]">
                Don't have an account? <span style={{ fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Register</span>
              </Link>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;