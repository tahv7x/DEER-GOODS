import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const MAD = (n: number) => `${n.toFixed(2)} DH`
export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(10,8,5,0.55)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            className="fixed top-0 right-0 bottom-0 z-[201] flex flex-col"
            style={{
              width: 'min(420px, 100vw)',
              background: '#FDFCF9',
              borderLeft: '1px solid #E5E0D8',
              boxShadow: '-24px 0 80px rgba(28,23,18,0.16)',
            }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 28px', borderBottom: '1px solid #E5E0D8',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShoppingBag size={18} style={{ color: '#C4631C' }} />
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 20, fontWeight: 600, color: '#1C1712',
                }}>Your Selection</span>
                {totalItems > 0 && (
                  <span style={{
                    background: '#C4631C', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 99,
                  }}>{totalItems}</span>
                )}
              </div>
              <button onClick={closeCart} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#7A6F62', padding: 6, lineHeight: 0,
                borderRadius: 8, transition: 'color 0.2s',
              }}
                className="hover:!text-[#1C1712]"
              ><X size={18} /></button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', paddingTop: 80 }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>◈</div>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 20, color: '#1C1712', marginBottom: 8,
                  }}>Your cart is empty</p>
                  <p style={{ fontSize: 13, color: '#9C8E80', lineHeight: 1.7 }}>
                    Browse our collection and add pieces you love.
                  </p>
                  <button onClick={closeCart} style={{
                    marginTop: 24,
                    padding: '12px 24px', background: '#1C1712', color: '#FDFCF9',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                  }}>Browse Collection</button>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25, ease }}
                        style={{
                          display: 'flex', gap: 14,
                          padding: '16px', background: '#fff',
                          border: '1px solid #E5E0D8', borderRadius: 14,
                        }}
                      >
                        {/* Image */}
                        <div style={{
                          width: 72, height: 88, flexShrink: 0,
                          background: '#F0EBE2', borderRadius: 10, overflow: 'hidden',
                        }}>
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4A882', fontSize: 20 }}>◈</div>
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {item.category && (
                            <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#C4631C', marginBottom: 4 }}>
                              {item.category}
                            </p>
                          )}
                          <p style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 15, fontWeight: 600, color: '#1C1712',
                            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            marginBottom: 6,
                          }}>{item.name}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#C4631C', marginBottom: 12 }}>
                            {MAD(item.price)}
                          </p>

                          {/* Qty + Remove */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 0,
                              border: '1px solid #E5E0D8', borderRadius: 8, overflow: 'hidden',
                            }}>
                              <button onClick={() => updateQty(item.id, item.quantity - 1)}
                                style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#7A6F62', lineHeight: 0 }}>
                                <Minus size={12} />
                              </button>
                              <span style={{ padding: '6px 10px', fontSize: 13, fontWeight: 600, color: '#1C1712', borderLeft: '1px solid #E5E0D8', borderRight: '1px solid #E5E0D8' }}>
                                {item.quantity}
                              </span>
                              <button onClick={() => updateQty(item.id, item.quantity + 1)}
                                style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#7A6F62', lineHeight: 0 }}>
                                <Plus size={12} />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0B0A0', padding: 6, lineHeight: 0, transition: 'color 0.2s' }}
                              className="hover:!text-red-500"
                            ><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '20px 28px 28px', borderTop: '1px solid #E5E0D8' }}>
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#7A6F62' }}>
                    total
                  </span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 22, fontWeight: 700, color: '#1C1712',
                  }}>{MAD(totalPrice)}</span>
                </div>
                <p style={{ fontSize: 11, color: '#9C8E80', marginBottom: 16, lineHeight: 1.6 }}>
                  Free delivery In Casablanca
                </p>

                {user ? (
                  <button 
                  onClick={() => {
                    closeCart(); 
                    navigate('/checkout');
                  }}
                  style={{
                    width: '100%', padding: '15px 24px',
                    background: '#1C1712', color: '#FDFCF9',
                    border: 'none', borderRadius: 12, cursor: 'pointer',
                    fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'background 0.25s',
                  }}
                    className="hover:!bg-[#C4631C]"
                  >
                    Proceed to Checkout <ArrowRight size={14} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link to="/login" onClick={closeCart} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '15px 24px', background: '#1C1712', color: '#FDFCF9',
                      border: 'none', borderRadius: 12, cursor: 'pointer',
                      fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
                      textDecoration: 'none', transition: 'background 0.25s',
                    }}>Sign In to Checkout</Link>
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#9C8E80' }}>
                      or{' '}
                      <Link to="/register" onClick={closeCart} style={{ color: '#C4631C', textDecoration: 'underline' }}>
                        create an account
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartDrawer;