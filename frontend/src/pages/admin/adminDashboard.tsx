import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
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
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          apiClient.get('/orders/admin'),
          apiClient.get('/users'),
          apiClient.get('/products')
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const products = Array.isArray(productsRes.data) ? productsRes.data : [];
        
        // ─── HNA BDNLNA L-7SSAB: GHIR LI DELIVERED HOMA LI K-YDKHLO F L-REVENUE ───
        const revenue = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const customersCount = users.filter(u => u.role === 'CUSTOMER').length;

        setStats({
          revenue,
          totalOrders: orders.length,
          totalCustomers: customersCount,
          totalProducts: products.length
        });

        const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setRecentOrders(sortedOrders.slice(0, 6));

        const lowStock = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
        setLowStockProducts(lowStock.slice(0, 5));

      } catch (error) {
        console.error("Erreur Fetch Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10 text-[#1C1712]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1712] mb-1 md:mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Overview
          </h1>
          <p className="text-sm text-[#7A6F62]">Welcome back to your store dashboard.</p>
        </div>
        <div className="bg-[#FDFCF9] px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#5A4F44] flex items-center gap-2 self-start sm:self-auto">
          <TrendingUp size={18} color="#C4631C" /> Store Performance
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard title="Total Revenue" value={MAD(stats.revenue)} icon={DollarSign} color={{ bg: '#E6F4EA', text: '#2D7A45' }} delay={0} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color={{ bg: '#E5F0FF', text: '#2B6CB0' }} delay={0.1} />
        <StatCard title="Customers" value={stats.totalCustomers} icon={Users} color={{ bg: '#F0EBE2', text: '#C4631C' }} delay={0.2} />
        <StatCard title="Products" value={stats.totalProducts} icon={Package} color={{ bg: '#FAFAF8', text: '#5A4F44' }} delay={0.3} />
      </div>

      {/* ── MAIN CONTENT: ORDERS & ALERTS ── */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* RECENT ORDERS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
          className="w-full lg:w-2/3 bg-white rounded-[20px] border border-[#E5E0D8] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
        >
          <div className="px-4 py-4 md:px-8 md:py-6 border-b border-[#E5E0D8] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1C1712]">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs md:text-[13px] font-semibold text-[#C4631C] no-underline flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[500px]">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E5E0D8]">
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 md:px-8 md:py-4 text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-[#9C8E80] text-sm">No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr key={order.id} className={`hover:bg-[#FDFCF9] transition-colors ${idx !== recentOrders.length - 1 ? 'border-b border-[#F0EBE2]' : ''}`}>
                      <td className="px-4 py-3 md:px-8 md:py-5">
                        <p className="text-sm font-bold text-[#1C1712] mb-1">#{shortId(order.id)}</p>
                        <p className="text-xs text-[#9C8E80]">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-4 py-3 md:px-8 md:py-5 text-sm text-[#5A4F44]">
                        {order.User?.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 md:px-8 md:py-5 text-sm font-bold text-[#1C1712]">
                        {MAD(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 md:px-8 md:py-5 text-right">
                        <span 
                          className={`text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-lg
                            ${order.status === 'DELIVERED' ? 'bg-[#E6F4EA] text-[#2D7A45]' : 
                              order.status === 'PENDING' ? 'bg-[#FFF4E5] text-[#C4631C]' : 
                              'bg-[#E5F0FF] text-[#2B6CB0]'}`}
                        >
                          {order.status}
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
            <h3 className="text-lg font-bold text-[#1C1712]">Low Stock</h3>
          </div>
          <div className="py-2 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 md:p-10 text-center text-[#9C8E80] text-sm">
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
                      <p className="text-xs text-[#7A6F62]">{product.Category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
                    <span className={`text-[11px] md:text-[13px] font-bold ${product.stock === 0 ? 'text-[#A92828]' : 'text-[#C4631C]'}`}>
                      {product.stock} left
                    </span>
                    <Link to="/admin/products" className="p-1.5 md:p-2 bg-[#FDFCF9] border border-[#E5E0D8] rounded-lg text-[#5A4F44] hover:bg-[#F0EBE2] transition-colors">
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