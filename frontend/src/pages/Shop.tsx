import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, X, ShoppingBag, Check, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; description: string; price: number;
  stock: number; imageUrls: string[] | null; Category: Category | null;
  categoryId?: string; 
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const serif = "'Cormorant Garamond', Georgia, serif";
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

function ProductModal({ product, onClose, onNavigate, navigate }: {
  product: Product; onClose: () => void; onNavigate: () => void; navigate: (path: string) => void;
}) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const mobile = isMobile();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const images = product.imageUrls?.length ? product.imageUrls : [];

  const handleAdd = () => {
  if (product.stock === 0) return;
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    addItem({
      id: product.id, name: product.name, price: product.price,
      imageUrl: images[0] || '', category: product.Category?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(14,11,8,0.7)', backdropFilter: 'blur(10px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center', padding: mobile ? 0 : 24, pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: mobile ? 80 : 22, scale: mobile ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: mobile ? 80 : 16, scale: mobile ? 1 : 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            width: mobile ? '100%' : 'min(820px, calc(100vw - 48px))',
            maxHeight: mobile ? '92vh' : '87vh',
            background: '#FDFCF9',
            borderRadius: mobile ? '22px 22px 0 0' : 20,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            boxShadow: '0 32px 80px rgba(14,11,8,0.36), 0 0 0 1px rgba(229,224,216,0.4)',
          }}
        >
          {/* Close */}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14, zIndex: 20,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(253,252,249,0.96)', border: '1px solid rgba(229,224,216,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(6px)',
              boxShadow: '0 2px 10px rgba(14,11,8,0.1)',
            }}
          >
            <X size={14} color="#3A322A" strokeWidth={2.2} />
          </motion.button>

          {/* ── IMAGE SIDE ── */}
          <div style={{
            flex: mobile ? 'none' : '0 0 44%',
            height: mobile ? 280 : 'auto',
            background: '#EDE8DF',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            flexShrink: 0,
          }}>
            {/* Main image */}
            <div style={{ flex: 1, position: 'relative' }}>
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]} alt={product.name}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 52, opacity: 0.15, color: '#8C7B6A' }}>◈</span>
                </div>
              )}

              {/* Bottom gradient */}
              {images.length > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to top, rgba(14,11,8,0.5), transparent)', pointerEvents: 'none' }} />
              )}

              {/* Stock badge */}
              {product.stock === 0 && (
                <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(14,11,8,0.8)', color: '#FDFCF9', fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 12px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                  Sold Out
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div style={{ position: 'absolute', bottom: 14, left: 14, background: '#C4631C', color: '#fff', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 12px', borderRadius: 99 }}>
                  Only {product.stock} left
                </div>
              )}

              {/* Image counter dot */}
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', gap: 5 }}>
                  {images.map((_, i) => (
                    <button
                      key={i} onClick={() => setActiveImg(i)}
                      style={{ width: i === activeImg ? 18 : 6, height: 6, borderRadius: 99, background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip — only if more than 1 image */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 6, padding: '10px 12px', background: '#E8E3D9', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {images.map((url, i) => (
                  <button
                    key={i} onClick={() => setActiveImg(i)}
                    style={{
                      width: 46, height: 46, flexShrink: 0, borderRadius: 8, padding: 0,
                      border: i === activeImg ? '2px solid #C4631C' : '2px solid transparent',
                      background: 'none', cursor: 'pointer', overflow: 'hidden',
                      opacity: i === activeImg ? 1 : 0.55,
                      transition: 'all 0.2s',
                    }}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO SIDE ── */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            padding: mobile ? '22px 20px 28px' : '32px 32px 28px',
            overflowY: 'auto',
            gap: 0,
          }}>
            {/* Category */}
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 8 }}>
              {product.Category?.name || 'Leather Goods'}
            </p>

            {/* Name */}
            <h2 style={{ fontFamily: serif, fontSize: mobile ? 24 : 30, fontWeight: 600, color: '#1C1712', lineHeight: 1.1, marginBottom: 10, letterSpacing: '-0.01em' }}>
              {product.name}
            </h2>

            {/* Orange accent */}
            <div style={{ width: 32, height: 2, background: '#C4631C', borderRadius: 99, marginBottom: 16 }} />

            {/* Description */}
            <p style={{ fontSize: 13, lineHeight: 1.82, color: '#6B5F52', marginBottom: 22, flex: 1 }}>
              {product.description}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: '#EDE8E0', marginBottom: 18 }} />

            {/* Price row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A89B8C', marginBottom: 3, fontWeight: 700 }}>Price</p>
                <p style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: '#1C1712', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {MAD(product.price)}
                </p>
              </div>
              {product.stock > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 13px', background: product.stock <= 5 ? 'rgba(196,99,28,0.08)' : 'rgba(45,122,69,0.08)', borderRadius: 99, border: `1px solid ${product.stock <= 5 ? 'rgba(196,99,28,0.22)' : 'rgba(45,122,69,0.22)'}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: product.stock <= 5 ? '#C4631C' : '#2D7A45' }} />
                  <span style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: product.stock <= 5 ? '#C4631C' : '#2D7A45' }}>
                    {product.stock <= 5 ? `${product.stock} left` : 'In Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <motion.button
                whileHover={product.stock > 0 ? { scale: 1.012, boxShadow: '0 12px 32px rgba(28,23,18,0.22)' } : {}}
                whileTap={product.stock > 0 ? { scale: 0.982 } : {}}
                onClick={handleAdd}
                disabled={product.stock === 0}
                style={{
                  padding: '14px 20px',
                  background: added ? '#2D7A45' : (product.stock > 0 ? '#1C1712' : '#EDEBE6'),
                  color: added ? '#fff' : (product.stock > 0 ? '#FDFCF9' : '#A89B8C'),
                  border: 'none', borderRadius: 12,
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'background 0.22s, box-shadow 0.22s',
                  boxShadow: product.stock > 0 && !added ? '0 6px 22px rgba(28,23,18,0.14)' : 'none',
                }}
              >
                {added ? <><Check size={14} strokeWidth={2.5} /> Added to Cart</>
                  : product.stock > 0 ? <><ShoppingBag size={14} strokeWidth={2} /> Add to Cart</>
                  : 'Sold Out'}
              </motion.button>

              <motion.button
                whileHover={{ borderColor: '#C4B08A', color: '#1C1712' }}
                whileTap={{ scale: 0.98 }}
                onClick={onNavigate}
                style={{
                  padding: '13px 20px', background: 'transparent',
                  color: '#7A6F62', border: '1px solid #DDD8D0', borderRadius: 12, cursor: 'pointer',
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
              >
                View Full Details <ArrowRight size={12} strokeWidth={2.2} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */
function ProductCard({ product, idx, onClick }: { product: Product; idx: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const img = product.imageUrls?.[0] || null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.5, ease }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FDFCF9', border: `1px solid ${hovered ? '#C4B08A' : '#E5E0D8'}`,
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered ? '0 16px 48px rgba(28,23,18,0.12)' : '0 2px 8px rgba(28,23,18,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div style={{ aspectRatio: '4/5', background: '#EDE8DF', position: 'relative', overflow: 'hidden' }}>
        {img ? (
          <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, opacity: 0.15, color: '#8C7B6A' }}>◈</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="p-card-badge" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(10,8,5,0.72)', color: '#FDFCF9', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 11px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>Sold Out</div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="p-card-badge" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(196,99,28,0.92)', color: '#fff', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 11px', borderRadius: 99 }}>Only {product.stock} left</div>
        )}
        <motion.div
          className="p-card-arrow"
          initial={false} animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.2 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(10,8,5,0.55), transparent)', display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none' }}
        >
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(253,252,249,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(10,8,5,0.18)' }}>
            <ArrowRight size={13} color="#1C1712" />
          </div>
        </motion.div>
      </div>

      <div className="p-card-info" style={{ padding: '16px 18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <p className="p-card-cat" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#9C8E80' }}>
            {product.Category?.name || 'Leather Goods'}
          </p>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: hovered ? '#C4631C' : '#E5E0D8', transition: 'background 0.3s' }} />
        </div>
        <h3 className="p-card-title" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25, marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: hovered ? '#C4631C' : '#1C1712', transition: 'color 0.2s' }}>
          {product.name}
        </h3>
        <p className="p-card-price" style={{ fontSize: 14, fontWeight: 700, color: '#1C1712', marginBottom: 10 }}>
          {MAD(product.price)}
        </p>
        <div style={{ height: 1.5, background: hovered ? '#C4631C' : '#EDE8E0', width: hovered ? 34 : 20, borderRadius: 99, transition: 'all 0.5s cubic-bezier(0.22,1,0.36,1)' }} />
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────
   MAIN SHOP PAGE
───────────────────────────────────────── */
const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([apiClient.get('/products'), apiClient.get('/categories')]);
      setProducts(Array.isArray(p?.data) ? p.data : []);
      
      // 🔴 FIX: Njbdou les catégories w n7iydou mnhom "Custom Orders" bach matbanch l-klyan
      const fetchedCategories = Array.isArray(c?.data) ? c.data : [];
      setCategories(fetchedCategories.filter((cat: Category) => cat.name !== 'Custom Orders'));

    } catch {
      setProducts([]); setCategories([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => products.filter(p => {
    // 🔴 FIX: N-khebiw ga3 les produits li smyathom fihom "Commande" awla "Bespoke"
    if (p.name.includes('Commande') || p.name === 'Bespoke Custom Piece') return false;

    const productCategoryId = p.categoryId || p.Category?.id;
    const catOk = activeCategory === 'ALL' || String(productCategoryId) === String(activeCategory);
    
    const qOk = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const price = Number(p.price) || 0;
    const priceOk = priceRange === 'ALL' ? true
      : priceRange === '0-250' ? price < 250
      : priceRange === '250-500' ? price >= 250 && price <= 500
      : price > 500;
          return catOk && qOk && priceOk;
  }), [products, activeCategory, searchQuery, priceRange]);

  const handleCardClick = (product: Product) => {
    if (isMobile()) navigate(`/product/${product.id}`);
    else setSelectedProduct(product);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FDFCF9', color: '#1C1712' }}>
      <Navbar />

      {/* ── CSS DYAL L-MOBILE GRID BACH IBANOU 2 F S-STER ── */}
      <style>{`
        .shop-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        @media (max-width: 768px) {
          .shop-product-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 f ster wahed f mobile */
            gap: 12px;
          }
          .p-card-info { padding: 12px 14px 16px !important; }
          .p-card-cat { font-size: 8px !important; }
          .p-card-title { font-size: 14px !important; margin-bottom: 4px !important; }
          .p-card-price { font-size: 12px !important; margin-bottom: 6px !important; }
          .p-card-badge { top: 8px !important; left: 8px !important; padding: 4px 8px !important; font-size: 7px !important; }
          .p-card-arrow { padding: 10px !important; }
          .p-card-arrow div { width: 28px !important; height: 28px !important; }
          .p-card-arrow svg { width: 12px !important; height: 12px !important; }
        }
      `}</style>

      {/* ── Sticky Filter Bar ── */}
      <div style={{ position: 'sticky', top: 60, zIndex: 50, background: 'rgba(253,252,249,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #E5E0D8', boxShadow: '0 2px 16px rgba(28,23,18,0.05)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 16px' }}>

          {/* Desktop */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 1 }}>
              {['ALL', ...categories.map(c => c.id)].map(id => {
                const label = id === 'ALL' ? 'All' : (categories.find(c => c.id === id)?.name || id);
                const active = String(activeCategory) === String(id);
                return (
                  <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(id)}
                    style={{ padding: '7px 18px', background: active ? '#1C1712' : 'transparent', color: active ? '#FDFCF9' : '#7A6F62', border: `1px solid ${active ? '#1C1712' : '#E5E0D8'}`, borderRadius: 99, cursor: 'pointer', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.22s', flexShrink: 0 }}>
                    {label}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ width: 1, height: 22, background: '#E5E0D8', flexShrink: 0 }} />
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
                style={{ appearance: 'none', padding: '9px 32px 9px 14px', background: '#FDFCF9', border: '1px solid #E5E0D8', borderRadius: 10, fontSize: 11, color: '#1C1712', outline: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <option value="ALL">All</option>
                  <option value="0-250">{'UNDER 250'}</option>
                  <option value="250-500">250–500</option>
                  <option value="500+">{'OVER 500'}</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9C8E80', pointerEvents: 'none' }} />
            </div>
            <div style={{ position: 'relative', width: 220, border: `1px solid ${searchFocused ? '#C4B08A' : '#E5E0D8'}`, borderRadius: 10, background: '#FDFCF9', transition: 'border-color 0.2s', flexShrink: 0 }}>
              <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9C8E80' }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search pieces…"
                style={{ width: '100%', padding: '9px 32px 9px 32px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#1C1712' }} />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', padding: 2 }}><X size={13} /></button>}
            </div>
          </div>

          {/* Mobile */}
          <div className="flex flex-col md:hidden" style={{ padding: '10px 0', gap: 9 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1, border: `1px solid ${searchFocused ? '#C4B08A' : '#E5E0D8'}`, borderRadius: 10, background: '#FDFCF9', transition: 'border-color 0.2s' }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9C8E80' }} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search…"
                  style={{ width: '100%', padding: '10px 34px 10px 34px', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#1C1712' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', padding: 2 }}><X size={13} /></button>}
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
                  style={{ appearance: 'none', padding: '10px 28px 10px 12px', background: '#FDFCF9', border: '1px solid #E5E0D8', borderRadius: 10, fontSize: 10, color: '#1C1712', outline: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', height: '100%' }}>
                  <option value="ALL">All</option>
                  <option value="0-500">{'< 500'}</option>
                  <option value="500-1500">500–1500</option>
                  <option value="1500+">{'>1500'}</option>
                </select>
                <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#9C8E80', pointerEvents: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
              {['ALL', ...categories.map(c => c.id)].map(id => {
                const label = id === 'ALL' ? 'All' : (categories.find(c => c.id === id)?.name || id);
                const active = String(activeCategory) === String(id);
                return (
                  <button key={id} onClick={() => setActiveCategory(id)}
                    style={{ padding: '6px 16px', flexShrink: 0, background: active ? '#1C1712' : 'transparent', color: active ? '#FDFCF9' : '#7A6F62', border: `1px solid ${active ? '#1C1712' : '#E5E0D8'}`, borderRadius: 99, cursor: 'pointer', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, transition: 'all 0.2s' }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Grid ── */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 16px 100px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 18 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} style={{ width: 30, height: 30, border: '2px solid #E5E0D8', borderTopColor: '#C4631C', borderRadius: '50%' }} />
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8E80' }}>Loading collection…</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '100px 0', color: '#9C8E80' }}>
            <div style={{ fontSize: 44, opacity: 0.15, marginBottom: 14 }}>◈</div>
            <p style={{ fontSize: 14, marginBottom: 6 }}>No pieces found.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); setPriceRange('ALL'); }} style={{ marginTop: 10, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C4631C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="shop-product-grid">
            {filtered.map((product, idx) => (
              <ProductCard key={product.id} product={product} idx={idx} onClick={() => handleCardClick(product)} />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigate={() => { navigate(`/product/${selectedProduct.id}`); setSelectedProduct(null); }}
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Shop;