import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingBag, Check, ChevronRight, ChevronLeft,
  Leaf, Scissors, MapPin, RefreshCw, Truck, RotateCcw, Package,
} from 'lucide-react';
import apiClient from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const serif = "'Cormorant Garamond', Georgia, serif";

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.65, ease },
});

interface Product {
  id: string; name: string; description: string;
  price: number; stock: number; imageUrls: string[] | null;
  Category: { id: string; name: string } | null;
}

const CRAFT_DETAILS = [
  { icon: <Leaf size={14} />,      label: 'Material',  value: 'Full-grain vegetable-tanned leather' },
  { icon: <Scissors size={14} />,  label: 'Stitching', value: 'Hand-stitched with waxed linen thread' },
  { icon: <RefreshCw size={14} />, label: 'Finish',    value: 'Hand-burnished edges, natural wax finish' },
  { icon: <MapPin size={14} />,    label: 'Origin',    value: 'Handmade in Morocco' },
  { icon: <Package size={14} />,   label: 'Care',      value: 'Wipe with dry cloth, condition every 6 months' },
];

const SHIPPING = [
  { icon: <Truck size={15} />,     label: 'Free shipping in Casablanca', detail: 'On all orders within the city' },
  { icon: <Package size={15} />,   label: '3–5 business days',           detail: 'Nationwide delivery across Morocco' },
  { icon: <RotateCcw size={15} />, label: '14-day returns',              detail: 'Unused items in original condition' },
];

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping'>('details');
  const [activeImg, setActiveImg] = useState(0);
  const [imgHovered, setImgHovered] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FDFCF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 36, height: 36, border: '2.5px solid #E5E0D8', borderTopColor: '#C4631C', borderRadius: '50%' }} />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#FDFCF9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <span style={{ fontSize: 56, opacity: 0.12 }}>◈</span>
      <p style={{ fontFamily: serif, fontSize: 28, color: '#1C1712' }}>Piece not found.</p>
      <button onClick={() => navigate('/shop')} style={{ padding: '12px 24px', background: '#1C1712', color: '#FDFCF9', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
        Return to Collection
      </button>
    </div>
  );

  const images = product.imageUrls?.length ? product.imageUrls : [];
  const prev = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg(i => (i + 1) % images.length);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    if (!user) { navigate('/login'); return; }
    addItem({ id: product.id, name: product.name, price: product.price, imageUrl: images[0] || '', category: product.Category?.name });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDFCF9', color: '#1C1712' }}>
      <Navbar />

      <style>{`
        .pg-grid {
          display: grid;
          /* FIX: N9sna mn l-3rd d tswira mn 56% l 44% w zedna chwiya f l-gap */
          grid-template-columns: 44% 1fr; 
          gap: 60px;
          align-items: start;
        }
        .nav-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(253,252,249,0.94);
          border: 1px solid rgba(229,224,216,0.8);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; backdrop-filter: blur(8px);
          box-shadow: 0 4px 18px rgba(14,11,8,0.16);
          transition: background 0.18s, transform 0.18s; z-index: 10;
        }
        .nav-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
        .nav-arrow.left { left: 16px; }
        .nav-arrow.right { right: 16px; }
        .tab-btn { transition: color 0.2s; }
        .tab-btn:hover { color: #1C1712 !important; }
        .atc-btn { transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.22s; }
        .atc-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(26,20,16,0.24) !important; }
        @media (max-width: 860px) {
          .pg-grid { grid-template-columns: 1fr; gap: 28px; }
          .sticky-col { position: static !important; }
        }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ borderBottom: '1px solid #EDE8E0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '13px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#9E9184', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#C4631C', cursor: 'pointer', fontWeight: 700, padding: 0, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <ArrowLeft size={13} /> Shop
          </button>
          <ChevronRight size={11} style={{ color: '#DDD8D0' }} />
          <span style={{ color: '#B0A898' }}>{product.Category?.name || 'Collection'}</span>
          <ChevronRight size={11} style={{ color: '#DDD8D0' }} />
          <span style={{ color: '#5A4F44', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 24px 100px' }}>
        <div className="pg-grid">

          {/* ─── LEFT: Image + Thumbnails ─── */}
          <motion.div {...stagger(0)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Main image — big */}
            <div
              style={{
                aspectRatio: '4/5', /* FIX: rddinaha 4/5 f blast 3/4 bach tji mtewla b l-9yas wmatb9ach twila bzaf */
                background: '#EDE8DF', borderRadius: 20,
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 32px 80px rgba(28,23,18,0.12)',
                border: '1px solid rgba(229,224,216,0.5)',
                cursor: images.length > 1 ? 'pointer' : 'default',
              }}
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
            >
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]} alt={product.name}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32, ease }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 72, opacity: 0.12, color: '#8C7B6A' }}>◈</span>
                </div>
              )}

              {/* Bottom gradient */}
              {images.length > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, background: 'linear-gradient(to top, rgba(14,11,8,0.5), transparent)', pointerEvents: 'none' }} />
              )}

              {/* Prev / Next arrows — show on hover */}
              {images.length > 1 && (
                <AnimatePresence>
                  {imgHovered && (<>
                    <motion.button className="nav-arrow left"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.16 }}
                      onClick={e => { e.stopPropagation(); prev(); }}
                    >
                      <ChevronLeft size={18} color="#1C1712" strokeWidth={2.2} />
                    </motion.button>
                    <motion.button className="nav-arrow right"
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.16 }}
                      onClick={e => { e.stopPropagation(); next(); }}
                    >
                      <ChevronRight size={18} color="#1C1712" strokeWidth={2.2} />
                    </motion.button>
                  </>)}
                </AnimatePresence>
              )}

              {/* Dot pagination */}
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, alignItems: 'center', zIndex: 5 }}>
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{ width: i === activeImg ? 22 : 6, height: 6, borderRadius: 99, background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)', boxShadow: i === activeImg ? '0 2px 8px rgba(0,0,0,0.25)' : 'none' }}
                    />
                  ))}
                </div>
              )}

              {/* Stock badges */}
              {product.stock > 0 && product.stock <= 3 && (
                <div style={{ position: 'absolute', top: 18, left: 18, background: '#C4631C', color: '#fff', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, padding: '6px 14px', borderRadius: 99, boxShadow: '0 6px 20px rgba(196,99,28,0.35)' }}>
                  Only {product.stock} left
                </div>
              )}
              {product.stock === 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(253,252,249,0.52)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6 }}>
                  <span style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, background: '#1C1712', color: '#fff', padding: '13px 26px', borderRadius: 99 }}>Sold Out</span>
                </div>
              )}
            </div>

            {/* Thumbnails strip — below main image */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 78, height: 78, flexShrink: 0, borderRadius: 12,
                      padding: 0, background: 'none', cursor: 'pointer', overflow: 'hidden',
                      border: i === activeImg ? '2.5px solid #C4631C' : '2.5px solid transparent',
                      outline: 'none',
                      opacity: i === activeImg ? 1 : 0.55,
                      transition: 'opacity 0.2s, border-color 0.2s',
                      boxShadow: i === activeImg ? '0 4px 16px rgba(196,99,28,0.22)' : 'none',
                    }}
                    onMouseEnter={e => { if (i !== activeImg) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                    onMouseLeave={e => { if (i !== activeImg) (e.currentTarget as HTMLButtonElement).style.opacity = '0.55'; }}
                  >
                    <div style={{ width: '100%', height: '100%', background: '#EDE8DF', borderRadius: 10, overflow: 'hidden' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ─── RIGHT: Info ─── */}
          <div className="sticky-col" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 26 }}>

            <motion.div {...stagger(1)}>
              <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 10 }}>
                {product.Category?.name || 'Leather Goods'}
              </p>
              <h1 style={{ fontFamily: serif, fontSize: 'clamp(34px, 3.5vw, 50px)', fontWeight: 600, color: '#1C1712', lineHeight: 1.07, letterSpacing: '-0.02em', marginBottom: 18 }}>
                {product.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontFamily: serif, fontSize: 40, fontWeight: 700, color: '#1C1712', letterSpacing: '-0.02em' }}>{MAD(product.price)}</span>
                  <span style={{ fontSize: 11, color: '#A89B8C', marginLeft: 10, letterSpacing: '0.05em' }}>Tax included</span>
                </div>
                {product.stock > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: product.stock <= 5 ? 'rgba(196,99,28,0.08)' : 'rgba(45,122,69,0.08)', borderRadius: 99, border: `1px solid ${product.stock <= 5 ? 'rgba(196,99,28,0.22)' : 'rgba(45,122,69,0.22)'}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: product.stock <= 5 ? '#C4631C' : '#2D7A45' }} />
                    <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: product.stock <= 5 ? '#C4631C' : '#2D7A45' }}>
                      {product.stock <= 5 ? `${product.stock} left` : 'In Stock'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div {...stagger(2)} style={{ height: 1, background: '#EDE8E0' }} />

            <motion.p {...stagger(3)} style={{ fontSize: 15, lineHeight: 1.85, color: '#5A4F44' }}>
              {product.description || 'A bespoke handcrafted piece, finished with care by our master artisans in Morocco.'}
            </motion.p>

            <motion.div {...stagger(4)}>
              <button
                className="atc-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  width: '100%', height: 62, border: 'none', borderRadius: 16,
                  background: added ? '#2D7A45' : (product.stock > 0 ? '#1C1712' : '#EDEBE6'),
                  color: added ? '#fff' : (product.stock > 0 ? '#fff' : '#9C8E80'),
                  fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: product.stock > 0 && !added ? '0 8px 28px rgba(28,23,18,0.18)' : 'none',
                }}
              >
                {added
                  ? <><Check size={17} strokeWidth={2.5} /> Added to Cart</>
                  : product.stock > 0
                  ? <><ShoppingBag size={17} /> {user ? 'Add to Cart' : 'Sign In to Purchase'}</>
                  : 'Currently Unavailable'}
              </button>
            </motion.div>

            <motion.div {...stagger(5)} style={{ background: '#fff', borderRadius: 18, border: '1px solid #EDE8E0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(28,23,18,0.04)' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #EDE8E0' }}>
                {(['details', 'shipping'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className="tab-btn"
                    style={{ flex: 1, padding: '16px 0', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#C4631C' : 'transparent'}`, marginBottom: -1, cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: activeTab === tab ? '#1C1712' : '#A89B8C', transition: 'all 0.22s' }}>
                    {tab === 'details' ? 'Craft Details' : 'Shipping & Returns'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
                  style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeTab === 'details'
                    ? CRAFT_DETAILS.map(({ icon, label, value }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F4EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4631C', flexShrink: 0 }}>{icon}</div>
                          <div>
                            <p style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#A89B8C', marginBottom: 2 }}>{label}</p>
                            <p style={{ fontSize: 13, color: '#3A322A', lineHeight: 1.5, fontWeight: 500 }}>{value}</p>
                          </div>
                        </div>
                      ))
                    : SHIPPING.map(({ icon, label, detail }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F4EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4631C', flexShrink: 0 }}>{icon}</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1712', marginBottom: 2 }}>{label}</p>
                            <p style={{ fontSize: 12, color: '#7A6F62', lineHeight: 1.5 }}>{detail}</p>
                          </div>
                        </div>
                      ))
                  }
                </motion.div>
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;