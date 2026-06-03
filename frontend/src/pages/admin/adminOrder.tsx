import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Package, ChevronDown, Clock, Truck,
  CheckCircle, XCircle, CreditCard, User, Phone, MapPin,
  RefreshCw, ShoppingBag, Filter,
  DollarSign,
  FileText
} from 'lucide-react';
import apiClient from '../../services/api';
//Factures Bibliotheques
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product { name: string; imageUrls: string[] | null; }
interface OrderItem { id: string; quantity: number; priceAtPurchase: number; Product: Product | null; }
interface UserData { email: string; }
interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  shippingAddress: string | null;
  phone: string | null;
  User: UserData | null;
  OrderItem: OrderItem[];
}

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const shortId = (id: string) => id.split('-')[0].toUpperCase();

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; icon: React.ElementType; label: string }> = {
  PENDING:    { bg: 'bg-[#FFF4E5]', text: 'text-[#C4631C]', border: 'border-[#F5D09A]', dot: 'bg-[#C4631C]', icon: Clock,        label: 'Pending'    },
  PROCESSING: { bg: 'bg-[#E5F0FF]', text: 'text-[#2B6CB0]', border: 'border-[#BED4F5]', dot: 'bg-[#3182CE]', icon: Package,      label: 'Processing' },
  SHIPPED:    { bg: 'bg-[#EBF4FF]', text: 'text-[#3182CE]', border: 'border-[#BFD9F9]', dot: 'bg-[#63B3ED]', icon: Truck,        label: 'Shipped'    },
  DELIVERED:  { bg: 'bg-[#E6F4EA]', text: 'text-[#2D7A45]', border: 'border-[#9ED3AF]', dot: 'bg-[#48BB78]', icon: CheckCircle,  label: 'Delivered'  },
  CANCELED:   { bg: 'bg-[#FEF0F0]', text: 'text-[#A92828]', border: 'border-[#F5B8B8]', dot: 'bg-[#E53E3E]', icon: XCircle,      label: 'Canceled'   },
  RETURNED:   { bg: 'bg-[#EDF2F7]', text: 'text-[#4A5568]', border: 'border-[#CBD5E0]', dot: 'bg-[#A0AEC0]', icon: Package,      label: 'Returned'   },
};

const ALL_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED',  'RETURNED'];

const toWhatsAppNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+')) return cleaned.slice(1);
  if (cleaned.startsWith('00')) return cleaned.slice(2);
  if (cleaned.startsWith('0')) return '212' + cleaned.slice(1);
  return cleaned;
};

const openWhatsApp = (phone: string | null, orderId: string, address: string | null, items: OrderItem[], total: number) => {
  if (!phone) { alert("Ce client n'a pas fourni de numéro de téléphone."); return; }
  const intlPhone = toWhatsAppNumber(phone);
  const productsList = items.map(i => `• ${i.quantity}x ${i.Product?.name || 'Produit'}`).join('\n');
  const msg = encodeURIComponent(
    `Salam \n\nHadi équipe *Deer Goods*. Kantwaslou m3ak bash n'confirmew la commande dyalek (#${shortId(orderId)}).\n\n*Talabiya dyalek:*\n${productsList}\n\n*Taman l'ijmali:* ${MAD(total)}\n\n*Adresse d'envoi:* ${address || '...'}\n\nWash n'confirmew lik l'irssal? (Jawbna b Ah awla La) 🙏`
  );
  window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['PENDING'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold tracking-wider uppercase whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatsBar: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const shipped = orders.filter(o => o.status === 'SHIPPED').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
      {[
        { label: 'Total Orders', value: String(orders.length), icon: ShoppingBag, color: { bg: '#F0EBE2', text: '#C4631C' } },
        { label: 'Revenue',      value: MAD(revenue),          icon: DollarSign,  color: { bg: '#E6F4EA', text: '#2D7A45' } },
        { label: 'Pending',      value: String(pending),       icon: Clock,       color: { bg: '#FFF4E5', text: '#C4631C' } },
        { label: 'Shipped',      value: String(shipped),       icon: Truck,       color: { bg: '#E5F0FF', text: '#2B6CB0' } },
      ].map(({ label, value, icon: Icon, color }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 md:p-7 rounded-[20px] border border-[#E5E0D8] flex items-center gap-4 md:gap-5 shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: color.bg, color: color.text }}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-1">{label}</p>
            <p className="text-xl md:text-2xl font-bold text-[#1C1712]">{value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const AdminOrders: React.FC = () => {
  const [orders,          setOrders]          = useState<Order[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [statusFilter,    setStatusFilter]    = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId,      setUpdatingId]      = useState<string | null>(null);

  const fetchOrders = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await apiClient.get('/orders/admin');
      const sorted = (Array.isArray(res.data) ? res.data : []).sort(
        (a: Order, b: Order) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setOrders(sorted);
    } catch (e) { console.error('Error fetching orders:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch { alert('Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();
    const invoiceId = shortId(order.id);
    const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 18); 
    doc.text("DEER GOODS.", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(122, 111, 98); 
    doc.text("Premium Leather Goods", 14, 28);
    doc.text("Casablanca, Morocco", 14, 33);
    doc.text("Email: leatherstore27@gmail.com", 14, 38);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(196, 99, 28); 
    doc.text("FACTURE", 150, 22);

    doc.setFontSize(10);
    doc.setTextColor(28, 23, 18);
    doc.text(`N° Commande : #${invoiceId}`, 150, 30);
    doc.setFont("helvetica", "normal");
    doc.text(`Date : ${orderDate}`, 150, 35);
    doc.text(`Paiement : ${order.paymentMethod}`, 150, 40);

    doc.setDrawColor(229, 224, 216); 
    doc.line(14, 48, 196, 48);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 18);
    doc.text("FACTURÉ À :", 14, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 79, 68);
    doc.text(`Nom : ${order.User?.email || 'N/A'}`, 14, 63);
    doc.text(`Email : ${order.User?.email || 'N/A'}`, 14, 66);
    doc.text(`Téléphone : ${order.phone || 'Non renseigné'}`, 14, 71);
    doc.text(`Adresse : ${order.shippingAddress || 'Non renseignée'}`, 14, 76);

    // 4. Jdwal (Table) dyal l-Produits
    const tableColumn = ["Produit", "Prix Unitaire", "Quantité", "Total"];
    const tableRows = order.OrderItem.map(item => [
      item.Product?.name || 'Produit Inconnu',
      `${MAD(item.priceAtPurchase)}`,
      item.quantity.toString(),
      `${MAD(item.priceAtPurchase * item.quantity)}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'plain',
      headStyles: { fillColor: [250, 250, 248], textColor: [156, 142, 128], fontStyle: 'bold' },
      bodyStyles: { textColor: [28, 23, 18] },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      styles: { cellPadding: 6, fontSize: 10, lineColor: [229, 224, 216], lineWidth: 0.5 },
    });

    // 5. Total (L-7ssab l-lkhr)
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 18);
    doc.text(`TOTAL À PAYER : ${MAD(order.totalAmount)}`, 140, finalY);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(156, 142, 128);
    doc.text("Merci pour votre confiance ! - DEER GOODS", 105, 280, { align: "center" });

    // Download l-fichier
    doc.save(`Facture_ORD-${invoiceId}.pdf`);
  };

  const countFor = (s: string) => s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || (o.User?.email || '').toLowerCase().includes(q) || (o.phone || '').includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={40} color="#C4631C" className="animate-spin" />
        <p className="text-[#7A6F62] font-semibold text-sm">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10 text-[#1C1712]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="font-bold text-3xl md:text-4xl text-[#1C1712] mb-1 md:mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Orders Management
          </h1>
          <p className="text-sm text-[#7A6F62]">Track customer orders, view details, and update shipping statuses.</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="bg-[#FDFCF9] px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#5A4F44] flex items-center gap-2 self-start sm:self-auto hover:bg-[#F0EBE2] transition-colors"
        >
          <RefreshCw size={15} color="#C4631C" className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <StatsBar orders={orders} />

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-[20px] border border-[#E5E0D8] px-4 py-3 md:px-6 md:py-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_20px_rgba(28,23,18,0.03)]">

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => {
            const active = statusFilter === s;
            const cfg = STATUS_CONFIG[s] || { label: s, bg: 'bg-[#F0EBE2]', text: 'text-[#7A6F62]', border: 'border-transparent' };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all border
                  ${active
                    ? s === 'ALL'
                      ? 'bg-[#1C1712] text-[#FDFCF9] border-[#1C1712]'
                      : `${cfg.bg} ${cfg.text} ${cfg.border}`
                    : 'bg-[#F0EBE2] text-[#7A6F62] border-transparent hover:border-[#D4C5B0]'
                  }`}
              >
                {s === 'ALL' ? 'All' : cfg.label}
                <span className={`px-1.5 py-0 rounded-full text-[10px] ${active ? (s === 'ALL' ? 'bg-white/20 text-white' : 'bg-white/60') : 'bg-[#E5E0D8] text-[#9C8E80]'}`}>
                  {countFor(s)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8E80] pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, email or phone…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E0D8] bg-[#FDFCF9] text-sm text-[#1C1712] placeholder:text-[#9C8E80] outline-none focus:border-[#D4C5B0] transition-colors"
          />
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[20px] border border-dashed border-[#E5E0D8] p-16 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBE2] flex items-center justify-center">
            <Filter size={20} color="#9C8E80" />
          </div>
          <p className="text-sm font-bold text-[#7A6F62]">No orders match your criteria.</p>
        </div>
      ) : (

        /* ── Orders table ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[20px] border border-[#E5E0D8] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
        >
          {/* Table head */}
          <div className="hidden md:grid grid-cols-[1fr_220px_130px_130px_32px] gap-3 px-8 py-4 bg-[#FAFAF8] border-b border-[#E5E0D8]">
            {['Order', 'Customer', 'Total', 'Status', ''].map(h => (
              <p key={h} className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-[#F0EBE2]">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className={`transition-colors ${isExpanded ? 'bg-[#FDFCF9]' : 'hover:bg-[#FDFCF9]'}`}>

                  {/* ── Row ── */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_220px_130px_130px_32px] gap-3 items-center px-4 md:px-8 py-4 md:py-5 cursor-pointer"
                  >
                    {/* ID + date */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F0EBE2] border border-[#E5E0D8] flex items-center justify-center shrink-0">
                        <ShoppingBag size={16} color="#7A6F62" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1712] mb-0.5">#{shortId(order.id)}</p>
                        <p className="text-xs text-[#9C8E80]">{order.createdAt ? formatDate(order.createdAt) : '—'}</p>
                      </div>
                    </div>

                    {/* Customer — hidden on mobile */}
                    <div className="hidden md:block overflow-hidden">
                      <p className="text-sm text-[#5A4F44] truncate">{order.User?.email || <em className="text-[#9C8E80]">Guest</em>}</p>
                      {order.phone && <p className="text-xs text-[#9C8E80] mt-0.5">{order.phone}</p>}
                    </div>

                    {/* Total — hidden on mobile */}
                    <p className="hidden md:block text-sm font-bold text-[#1C1712]">{MAD(order.totalAmount)}</p>

                    {/* Status */}
                    <StatusBadge status={order.status} />

                    {/* Chevron */}
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="hidden md:flex justify-center">
                      <ChevronDown size={16} color="#9C8E80" />
                    </motion.div>
                  </div>

                  {/* ── Expanded body ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#E5E0D8] overflow-hidden"
                      >
                        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 bg-[#FAFAF8]">

                          {/* LEFT — Items */}
                          <div>
                            <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-4">Items Purchased</p>
                            <div className="flex flex-col gap-3">
                              {order.OrderItem?.map(item => {
                                const img = item.Product?.imageUrls?.[0];
                                return (
                                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#E5E0D8]">
                                    <div className="w-11 h-11 rounded-xl bg-[#F0EBE2] overflow-hidden flex items-center justify-center shrink-0">
                                      {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={18} color="#9C8E80" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-[#1C1712] truncate">{item.Product?.name || 'Unknown Product'}</p>
                                      <p className="text-xs text-[#7A6F62] mt-0.5">{item.quantity} × {MAD(item.priceAtPurchase)}</p>
                                    </div>
                                    <p className="text-sm font-bold text-[#1C1712] shrink-0">{MAD(item.quantity * item.priceAtPurchase)}</p>
                                  </div>
                                );
                              })}
                              {/* Total row */}
                              <div className="flex justify-between items-center p-3 px-4 bg-[#FFF4E5] rounded-2xl border border-[#F5D09A]">
                                <p className="text-[11px] font-bold text-[#C4631C] uppercase tracking-[0.1em]">Order Total</p>
                                <p className="text-base font-bold text-[#C4631C]">{MAD(order.totalAmount)}</p>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT — Info + Actions */}
                          <div className="flex flex-col gap-4">

                            {/* Customer info */}
                            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 md:p-5">
                              <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-4">Customer & Payment</p>
                              <div className="flex flex-col gap-3">
                                {[
                                  { Icon: User,       label: order.User?.email || 'N/A'           },
                                  { Icon: CreditCard, label: order.paymentMethod                  },
                                  { Icon: Phone,      label: order.phone || 'Non renseigné'       },
                                  { Icon: MapPin,     label: order.shippingAddress || 'N/A'       },
                                ].map(({ Icon, label }) => (
                                  <div key={label} className="flex items-start gap-2.5">
                                    <Icon size={14} color="#C4631C" className="mt-0.5 shrink-0" />
                                    <p className="text-sm text-[#5A4F44] leading-snug">{label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Manage Order (Status + Invoice) */}
                            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 md:p-5">
                              <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3">Manage Order</p>
                              
                              <div className="flex flex-col gap-3">
                                <div className="relative">
                                  <select
                                    value={order.status}
                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                    disabled={updatingId === order.id}
                                    className="w-full px-3 py-2.5 pr-9 appearance-none rounded-xl border border-[#D4C5B0] bg-[#FDFCF9] text-sm font-semibold text-[#1C1712] cursor-pointer outline-none focus:border-[#C4631C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {ALL_STATUSES.map(s => (
                                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                                    ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {updatingId === order.id
                                      ? <Loader2 size={15} color="#C4631C" className="animate-spin" />
                                      : <ChevronDown size={15} color="#9C8E80" />
                                    }
                                  </div>
                                </div>

                                {/* PDF Button */}
                                <button 
                                  onClick={() => generateInvoice(order)}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAFAF8] hover:bg-[#1C1712] hover:text-white border border-[#E5E0D8] text-[#5A4F44] text-sm font-bold transition-colors"
                                >
                                  <FileText size={16} />
                                  Download Invoice (PDF)
                                </button>
                              </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 md:p-5">
                              <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3">Contact Client</p>
                              {order.phone ? (
                                <>
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] mb-3">
                                    <Phone size={14} color="#2E7D32" />
                                    <span className="text-sm font-bold text-[#2E7D32]">{order.phone}</span>
                                  </div>
                                  <button
                                    onClick={() => openWhatsApp(order.phone, order.id, order.shippingAddress, order.OrderItem, order.totalAmount)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-bold transition-colors"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Confirmer via WhatsApp
                                  </button>
                                  <p className="text-[11px] text-[#9C8E80] mt-2 text-center">Ouvre WhatsApp avec l'adresse pré-remplie</p>
                                </>
                              ) : (
                                <p className="text-sm text-[#9C8E80] italic">Numéro non disponible pour ce client.</p>
                              )}
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminOrders;