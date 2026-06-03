import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User as UserIcon,
  CreditCard,
  Loader2,
  CheckCircle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import apiClient from '../services/api';

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items: cart, totalPrice: totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect ila kan l-cart khawi
  useEffect(() => {
    if (cart.length === 0 && !success) {
      navigate('/shop');
    }
  }, [cart, navigate,success]);


  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: (user as any)?.phone || '',
    address: '',
    city: 'Casablanca',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.address || !formData.city) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount,
        paymentMethod: 'COD',
        shippingAddress: `${formData.address}, ${formData.city}`,
        phone: formData.phone,
      };

      await apiClient.post('/orders', payload);

      clearCart();
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {success && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(10,8,5,0.55)',
                backdropFilter: 'blur(6px)',
                zIndex: 2000,
              }}
            />

            {/* MODAL */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                pointerEvents: 'none',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 26,
                }}
                style={{
                  width: '100%',
                  maxWidth: 430,
                  background: '#FDFCF9',
                  borderRadius: 30,
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                  boxShadow: '0 32px 70px rgba(0,0,0,0.18)',
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    padding: '42px 32px 30px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 78,
                      height: 78,
                      borderRadius: '50%',
                      background: 'rgba(26,122,70,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                    }}
                  >
                    <CheckCircle size={40} color="#1A7A46" />
                  </div>

                  <h2
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: '#1A1410',
                      marginBottom: 12,
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    Order Confirmed
                  </h2>

                  <p
                    style={{
                      fontSize: 14,
                      color: '#7A6E64',
                      lineHeight: 1.7,
                      maxWidth: 300,
                      margin: '0 auto',
                    }}
                  >
                    Thank you for your purchase. Your order has been placed
                    successfully.
                  </p>
                </div>

                {/* BUTTONS */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    padding: '0 24px 24px',
                  }}
                >
                  {/* VIEW SHOP */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/shop')}
                    style={{
                      height: 54,
                      borderRadius: 15,
                      border: '1px solid #E5DED5',
                      background: '#F5F1EB',
                      color: '#5B5148',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    View Shop
                  </motion.button>

                  {/* VIEW ORDERS */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/orders')}
                    style={{
                      height: 54,
                      borderRadius: 15,
                      border: 'none',
                      background:
                        'linear-gradient(135deg, #1A1410 0%, #332519 100%)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 12px 30px rgba(26,20,16,0.18)',
                    }}
                  >
                    View Orders
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div
        style={{
          minHeight: '100vh',
          background: '#F9F6F1',
          color: '#1A1410',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            maxWidth: 1160,
            margin: '0 auto',
            padding: '60px 20px',
            width: '100%',
          }}
        >
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#9E9184',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 32,
            }}
            className="hover:!text-[#1A1410] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </Link>

          <h1
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 700,
              fontFamily: "'Cormorant Garamond', serif",
              marginBottom: 40,
            }}
          >
            Checkout
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 40,
              alignItems: 'start',
            }}
          >
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fff',
                borderRadius: 28,
                padding: 36,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <MapPin size={20} color="#C4631C" />
                Shipping Details
              </h2>

              <form
                onSubmit={handlePlaceOrder}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                {/* FULL NAME */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9E9184',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 8,
                    }}
                  >
                    Full Name
                  </label>

                  <div style={{ position: 'relative' }}>
                    <UserIcon
                      size={18}
                      color="#9E9184"
                      style={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        height: 50,
                        padding: '0 16px 0 44px',
                        borderRadius: 12,
                        border: '1px solid #EDE8E1',
                        background: '#FAF7F3',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9E9184',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 8,
                    }}
                  >
                    Phone Number *
                  </label>

                  <div style={{ position: 'relative' }}>
                    <Phone
                      size={18}
                      color="#C4631C"
                      style={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="06 XX XX XX XX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        height: 50,
                        padding: '0 16px 0 44px',
                        borderRadius: 12,
                        border: '1px solid #C4631C',
                        background: '#fff',
                        fontSize: 14,
                        outline: 'none',
                        boxShadow:
                          '0 0 0 3px rgba(196,99,28,0.1)',
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 11,
                      color: '#9E9184',
                      marginTop: 6,
                    }}
                  >
                    Required for delivery updates via WhatsApp.
                  </p>
                </div>

                {/* CITY */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9E9184',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 8,
                    }}
                  >
                    City
                  </label>

                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      height: 50,
                      padding: '0 16px',
                      borderRadius: 12,
                      border: '1px solid #EDE8E1',
                      background: '#FAF7F3',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Tangier">Tangier</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Other">Other (Specify in address)</option>
                  </select>
                </div>

                {/* ADDRESS */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9E9184',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 8,
                    }}
                  >
                    Detailed Address *
                  </label>

                  <input
                    type="text"
                    name="address"
                    placeholder="Street, Neighborhood, Apartment..."
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      height: 50,
                      padding: '0 16px',
                      borderRadius: 12,
                      border: '1px solid #EDE8E1',
                      background: '#FAF7F3',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* PAYMENT */}
                <div style={{ marginTop: 12 }}>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <CreditCard size={20} color="#C4631C" />
                    Payment Method
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px',
                      border: '1px solid #C4631C',
                      background: 'rgba(196,99,28,0.05)',
                      borderRadius: 12,
                    }}
                  >
                    <input
                      type="radio"
                      checked
                      readOnly
                      style={{ accentColor: '#C4631C' }}
                    />

                    <div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#1A1410',
                        }}
                      >
                        Cash on Delivery
                      </p>

                      <p
                        style={{
                          fontSize: 12,
                          color: '#7A6E64',
                        }}
                      >
                        Pay in cash when your order arrives.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 24,
                    width: '100%',
                    height: 54,
                    background:
                      'linear-gradient(135deg, #1A1410 0%, #332519 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 16,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow:
                      '0 10px 30px rgba(26,20,16,0.22)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </form>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: '#FAF7F3',
                borderRadius: 28,
                padding: 36,
                border: '1px solid #EDE8E1',
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                Order Summary
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  marginBottom: 24,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {cart.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 12,
                        background: '#fff',
                        border: '1px solid #EDE8E1',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#1A1410',
                        }}
                      >
                        {item.name}
                      </p>

                      <p
                        style={{
                          fontSize: 12,
                          color: '#7A6E64',
                        }}
                      >
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#1A1410',
                      }}
                    >
                      {MAD(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: '1px solid #EDE8E1',
                  paddingTop: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: '#7A6E64',
                  }}
                >
                  <span>Subtotal</span>
                  <span>{MAD(totalAmount)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: '#7A6E64',
                  }}
                >
                  <span>Shipping</span>
                  <span
                    style={{
                      color: '#1A7A46',
                      fontWeight: 700,
                    }}
                  >
                    Free
                  </span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #EDE8E1',
                    paddingTop: 16,
                    marginTop: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1A1410',
                    }}
                  >
                    Total
                  </span>

                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: '#C4631C',
                    }}
                  >
                    {MAD(totalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Checkout;