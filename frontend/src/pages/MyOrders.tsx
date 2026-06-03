import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Package, Truck, CheckCircle, XCircle, AlertCircle, ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import apiClient from '../services/api';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

// --- Interfaces ---
interface Product { name: string; imageUrls: string[] | null; }
interface OrderItem { id: string; quantity: number; priceAtPurchase: number; Product: Product | null; }
interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  OrderItem: OrderItem[];
}

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const shortId = (id: string) => id.split('-')[0].toUpperCase();

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; desc: string }> = {
  'PENDING': { bg: '#FFF4E5', text: '#C4631C', icon: Clock, desc: 'Awaiting confirmation' },
  'PROCESSING': { bg: '#E5F0FF', text: '#2B6CB0', icon: Package, desc: 'Your items are being prepared' },
  'SHIPPED': { bg: '#EBF4FF', text: '#3182CE', icon: Truck, desc: 'On its way to your address' },
  'DELIVERED': { bg: '#E6F4EA', text: '#2D7A45', icon: CheckCircle, desc: 'Delivered successfully' },
  'CANCELED': { bg: '#FEF0F0', text: '#A92828', icon: XCircle, desc: 'This order was canceled' },
  'RETURNED': { bg: '#EDF2F7', text: '#4A5568', icon: Package, desc: 'Items have been returned' },
};

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await apiClient.get('/orders/my-orders');
        const sorted = (Array.isArray(res.data) ? res.data : []).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setOrders(sorted);
      } catch (error) {
        console.error('Error fetching my orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const confirmCancel = async () => {
    if (!orderToCancel) return;
    const id = orderToCancel;
    setOrderToCancel(null); 
    setCancelingId(id); 

    try {
      await apiClient.put(`/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELED' } : o));
      showToast("Order canceled successfully.", "success");
    } catch (error) {
      console.error("Error canceling order:", error);
      showToast("Could not cancel order. It might already be processed.", "error");
    } finally {
      setCancelingId(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAFAF8' }}>
      
      <Navbar />

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            style={{
              position: 'fixed', bottom: 40, left: '50%', zIndex: 1000,
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px',
              borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              background: toast.type === 'success' ? '#E6F4EA' : '#FEF0F0',
              color: toast.type === 'success' ? '#2D7A45' : '#A92828',
              border: `1px solid ${toast.type === 'success' ? '#C3E6CB' : '#FCD4D4'}`,
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CUSTOM CONFIRM MODAL ── */}
      <AnimatePresence>
        {orderToCancel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(28,23,18,0.4)', backdropFilter: 'blur(4px)', padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: '#fff', borderRadius: 24, padding: 32, maxWidth: 400, width: '100%',
                boxShadow: '0 24px 48px rgba(28,23,18,0.1)'
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF0F0', color: '#A92828', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={28} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1C1712', textAlign: 'center', marginBottom: 12, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Cancel this order?</h3>
              <p style={{ fontSize: 14, color: '#7A6F62', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
                Are you sure you want to cancel this order? This action cannot be undone, and your items will not be delivered.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setOrderToCancel(null)} 
                  style={{ flex: 1, padding: '14px', background: '#FAFAF8', border: '1px solid #E5E0D8', borderRadius: 12, color: '#5A4F44', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background 0.2s' }}
                  className="hover:!bg-[#F0EBE2]"
                >
                  Keep Order
                </button>
                <button 
                  onClick={confirmCancel} 
                  style={{ flex: 1, padding: '14px', background: '#A92828', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background 0.2s' }}
                  className="hover:!bg-[#8c2020]"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ flex: 1, padding: '40px 20px', color: '#1C1712' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          <button 
            onClick={() => navigate('/shop')} 
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#9C8E80', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', marginBottom: 32, transition: 'color 0.2s' }}
            className="hover:!text-[#1C1712]"
          >
            <ArrowLeft size={16} /> Back to Shop
          </button>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 700, color: '#1C1712', marginBottom: 8 }}>My Orders</h1>
            <p style={{ fontSize: 15, color: '#7A6F62' }}>Track your recent purchases and check their delivery status.</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
              <Loader2 size={40} color="#C4631C" className="animate-spin" />
              <p style={{ color: '#9C8E80', fontWeight: 600, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Loading Orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', background: '#fff', padding: '80px 40px', borderRadius: 24, border: '1px solid #E5E0D8', boxShadow: '0 10px 30px rgba(28,23,18,0.02)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <ShoppingBag size={32} color="#D4C5B0" />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: '#1C1712', marginBottom: 12 }}>No orders found</h3>
              <p style={{ fontSize: 14, color: '#7A6F62', marginBottom: 32, maxWidth: 340, margin: '0 auto 32px', lineHeight: 1.6 }}>You haven't placed any orders yet. Discover our premium leather collection and find your next favorite piece.</p>
              <button onClick={() => navigate('/shop')} style={{ padding: '16px 32px', background: '#1C1712', border: 'none', borderRadius: 12, color: '#FDFCF9', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.3s' }} className="hover:!bg-[#C4631C]">
                Explore Collection
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {orders.map((order, index) => {
                const cfg = STATUS_CONFIG[order.status] || { bg: '#F0EBE2', text: '#7A6F62', icon: AlertCircle, desc: 'Status unknown' };
                const StatusIcon = cfg.icon;

                return (
                  <motion.div 
                    key={order.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5E0D8', overflow: 'hidden', boxShadow: '0 4px 20px rgba(28,23,18,0.03)' }}
                  >
                    <div style={{ padding: '24px 32px', background: '#FAFAF8', borderBottom: '1px solid #E5E0D8', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Order Date</p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1712' }}>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Total</p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#C4631C' }}>{MAD(order.totalAmount)}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Order ID</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1712', fontFamily: 'monospace' }}>#{shortId(order.id)}</p>
                      </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: cfg.bg, borderRadius: 12, color: cfg.text, marginBottom: 32, border: `1px solid ${cfg.text}20` }}>
                        <StatusIcon size={24} />
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>{order.status}</h4>
                          <p style={{ fontSize: 13, opacity: 0.9 }}>{cfg.desc}</p>
                        </div>
                      </div>

                      <h4 style={{ fontSize: 12, fontWeight: 700, color: '#9C8E80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Items in this order</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {order.OrderItem?.map((item) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px', borderRadius: 16, border: '1px solid #FAFAF8', transition: 'background 0.2s' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 12, background: '#FAFAF8', border: '1px solid #E5E0D8', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.Product?.imageUrls?.[0] ? (
                                <img src={item.Product.imageUrls[0]} alt={item.Product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Package size={24} color="#D4C5B0" />
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1C1712', marginBottom: 4 }}>{item.Product?.name || 'Premium Leather Item'}</h4>
                              <p style={{ fontSize: 13, color: '#7A6F62' }}>Qty: <span style={{ fontWeight: 600, color: '#1C1712' }}>{item.quantity}</span></p>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1712' }}>{MAD(item.priceAtPurchase * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      {order.status === 'PENDING' && (
                        <div style={{ width: '100%', borderTop: '1px dashed #E5E0D8', paddingTop: 24, marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setOrderToCancel(order.id)}
                            disabled={cancelingId === order.id}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', 
                              background: '#FEF0F0', color: '#A92828', border: '1px solid #FCD4D4', 
                              borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', 
                              cursor: cancelingId === order.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s' 
                            }}
                            className="hover:!bg-[#FCD4D4]"
                          >
                            {cancelingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            CANCEL ORDER
                          </button>
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;