import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, Loader2, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const shortId = (id: string) => id.split('-')[0].toUpperCase();

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Stats States
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  
  // Data States
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, productsRes, customOrdersRes] = await Promise.all([
          apiClient.get('/orders/admin'),
          apiClient.get('/users'),
          apiClient.get('/products'),
          apiClient.get('/custom-orders/admin').catch(() => ({ data: [] }))
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const products = Array.isArray(productsRes.data) ? productsRes.data : [];
        const customOrders = Array.isArray(customOrdersRes.data) ? customOrdersRes.data : [];
        
        // ─── REVENUE: GHIR LI DELIVERED ───
        const revenue = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const customersCount = users.filter(u => u.role === 'CUSTOMER').length;

        // 🔴 FIX: N-7iydou les Custom Orders li wllaw 'ACCEPTED' (7it deja wllaw Commandes 79i9iyin)
        const activeCustomOrders = customOrders.filter(c => c.status !== 'ACCEPTED');

        setStats({
          revenue,
          totalOrders: orders.length + activeCustomOrders.length, // Hka ma-kayb9ach double-compte
          totalCustomers: customersCount,
          totalProducts: products.length
        });

        // ─── MIXING ORDERS & CUSTOM ORDERS ───
        const formattedStandard = orders.map(o => ({
          id: o.id,
          type: 'Order', // 🔴 Bdelna s-smiya hna (Kant 'Standard')
          customer: o.User?.email || 'N/A',
          amount: o.totalAmount,
          status: o.status,
          date: o.created_at || o.createdAt
        }));

        const formattedCustom = activeCustomOrders.map(c => ({
          id: c.id,
          type: 'Custom Order', // 🔴 Bdelna s-smiya hna (Kant 'Bespoke')
          customer: c.User?.email || c.User?.name || 'N/A',
          amount: c.estimatedPrice || 0,
          status: c.status,
          date: c.createdAt || c.created_at
        }));

        // Njm3ouhom w nrtbhom b t-tarikh (Jdid howa l-lowel)
        const combined = [...formattedStandard, ...formattedCustom].sort((a, b) => 
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        );

        setRecentActivity(combined.slice(0, 6)); // N-akhdo top 6

        const lowStock = products.filter(p => p.stock <= 5 && p.name !== 'Bespoke Custom Piece').sort((a, b) => a.stock - b.stock);
        setLowStockProducts(lowStock.slice(0, 5));

      } catch (error) {
        console.error("Erreur Fetch Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusStyle = (status: string) => {
    const s = status.toUpperCase();
    if (['DELIVERED', 'ACCEPTED'].includes(s)) return 'bg-[#E6F4EA] text-[#2D7A45]';
    if (['PENDING', 'REVIEWING'].includes(s)) return 'bg-[#FFF4E5] text-[#C4631C]';
    if (['REJECTED', 'CANCELLED'].includes(s)) return 'bg-[#FEF0F0] text-[#A92828]';
    return 'bg-[#E5F0FF] text-[#2B6CB0]'; // QUOTED, SHIPPED...
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="bg-white p-5 md:p-7 rounded-[20px] border border-[#E5E0D8] flex items-center gap-4 md:gap-5 shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
    >
      <div 
        className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0" 
        style={{ background: color.bg, color: color.text }}
      >
        <Icon size={24} className="md:w-7 md:h-7" />
      </div>
      <div>
        <p className="text-[11px] md:text-[13px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-1">{title}</p>
        <p className="text-xl md:text-3xl font-bold text-[#1C1712]">{value}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={40} color="#C4631C" className="animate-spin" />
        <p className="text-[#7A6F62] font-semibold text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10 text-[#1C1712] font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1C1712] mb-1 md:mb-2 tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-[#7A6F62] font-medium">Welcome back to your store dashboard.</p>
        </div>
        <div className="bg-[#FDFCF9] px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-bold text-[#1C1712] flex items-center gap-2 self-start sm:self-auto">
          <TrendingUp size={18} color="#C4631C" /> Store Performance
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard title="Total Revenue" value={MAD(stats.revenue)} icon={DollarSign} color={{ bg: '#E6F4EA', text: '#2D7A45' }} delay={0} />
        <StatCard title="Total Activity" value={stats.totalOrders} icon={ShoppingBag} color={{ bg: '#E5F0FF', text: '#2B6CB0' }} delay={0.1} />
        <StatCard title="Customers" value={stats.totalCustomers} icon={Users} color={{ bg: '#F0EBE2', text: '#C4631C' }} delay={0.2} />
        <StatCard title="Products" value={stats.totalProducts} icon={Package} color={{ bg: '#FAFAF8', text: '#5A4F44' }} delay={0.3} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* RECENT ACTIVITY */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
          className="w-full lg:w-2/3 bg-white rounded-[20px] border border-[#E5E0D8] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
        >
          <div className="px-4 py-4 md:px-8 md:py-6 border-b border-[#E5E0D8] flex items-center justify-between">
            <h3 className="text-lg font-black text-[#1C1712]">Recent Activity</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[540px]">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E5E0D8]">
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-extrabold text-[#9C8E80] uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-extrabold text-[#9C8E80] uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-extrabold text-[#9C8E80] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-extrabold text-[#9C8E80] uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-[#9C8E80] text-sm font-medium">No activity yet.</td>
                  </tr>
                ) : (
                  recentActivity.map((item, idx) => (
                    <tr key={item.id} className={`hover:bg-[#FDFCF9] transition-colors ${idx !== recentActivity.length - 1 ? 'border-b border-[#F0EBE2]' : ''}`}>
                      <td className="px-4 py-3 md:px-8 md:py-5">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'Custom Order' ? <Sparkles size={12} color="#C4631C" /> : <ShoppingBag size={12} color="#9C8E80" />}
                          <p className="text-sm font-bold text-[#1C1712]">#{shortId(item.id)}</p>
                        </div>
                        <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider">
                          {item.type} • {formatDate(item.date)}
                        </p>
                      </td>
                      <td className="px-4 py-3 md:px-8 md:py-5 text-sm text-[#5A4F44] font-medium">
                        {item.customer}
                      </td>
                      <td className="px-4 py-3 md:px-8 md:py-5 text-sm font-black text-[#1C1712]">
                        {item.amount > 0 ? MAD(item.amount) : <span className="text-[#9C8E80] italic font-medium text-xs">Pending Quote</span>}
                      </td>
                      <td className="px-4 py-3 md:px-8 md:py-5 text-right">
                        <span className={`text-[10px] font-extrabold tracking-wider px-3 py-1.5 rounded-lg uppercase ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* LOW STOCK ALERTS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} 
          className="w-full lg:w-1/3 bg-white rounded-[20px] border border-[#E5E0D8] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)] flex flex-col"
        >
          <div className="px-4 py-4 md:px-8 md:py-6 border-b border-[#E5E0D8] flex items-center gap-3">
            <AlertTriangle size={20} color="#A92828" />
            <h3 className="text-lg font-black text-[#1C1712]">Low Stock Alert</h3>
          </div>
          <div className="py-2 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 md:p-10 text-center text-[#9C8E80] text-sm font-medium">
                All products are well stocked.
              </div>
            ) : (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#FAFAF8] last:border-b-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F0EBE2] overflow-hidden flex items-center justify-center shrink-0">
                      {product.imageUrls?.[0] ? 
                        <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" /> : 
                        <Package size={20} color="#9C8E80" />
                      }
                    </div>
                    <div>
                      <p className="text-[13px] md:text-sm font-bold text-[#1C1712] mb-1 line-clamp-1">{product.name}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">{product.Category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
                    <span className={`text-[11px] md:text-[13px] font-black ${product.stock === 0 ? 'text-[#A92828]' : 'text-[#C4631C]'}`}>
                      {product.stock} left
                    </span>
                    <Link to="/admin/products" className="p-1.5 md:p-2 bg-[#FDFCF9] border border-[#E5E0D8] rounded-lg text-[#5A4F44] hover:bg-[#1C1712] hover:text-white hover:border-[#1C1712] transition-all">
                      <ArrowRight size={14} className="md:w-4 md:h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;