import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, ChevronDown, CheckCircle, XCircle, 
  User, RefreshCw, Filter, DollarSign, Image as ImageIcon, 
  Sparkles, FileText, Send, Clock, Eye
} from 'lucide-react';
import apiClient from '../../services/api';

interface UserData { email: string; name?: string; phone?: string; }
interface CustomOrder {
  id: string;
  description: string;
  imageUrl: string | null;
  estimatedPrice: number | null;
  status: string;
  createdAt: string;
  User: UserData | null;
}

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const shortId = (id: string) => id.split('-')[0].toUpperCase();

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; icon: React.ElementType; label: string }> = {
  PENDING:   { bg: 'bg-[#FFF4E5]', text: 'text-[#C4631C]', border: 'border-[#F5D09A]', dot: 'bg-[#C4631C]', icon: Clock,      label: 'Pending'   },
  REVIEWING: { bg: 'bg-[#F3E8FF]', text: 'text-[#6B46C1]', border: 'border-[#D6BCFA]', dot: 'bg-[#805AD5]', icon: Eye,        label: 'Reviewing' },
  QUOTED:    { bg: 'bg-[#E5F0FF]', text: 'text-[#2B6CB0]', border: 'border-[#BED4F5]', dot: 'bg-[#3182CE]', icon: DollarSign, label: 'Quoted'    },
  ACCEPTED:  { bg: 'bg-[#E6F4EA]', text: 'text-[#2D7A45]', border: 'border-[#9ED3AF]', dot: 'bg-[#48BB78]', icon: CheckCircle,label: 'Accepted'  },
  REJECTED:  { bg: 'bg-[#FEF0F0]', text: 'text-[#A92828]', border: 'border-[#F5B8B8]', dot: 'bg-[#E53E3E]', icon: XCircle,    label: 'Rejected'  },
};

const ALL_STATUSES = ['PENDING', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'REJECTED'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['PENDING'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] md:text-[11px] font-bold tracking-wider uppercase whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatsBar: React.FC<{ requests: CustomOrder[] }> = ({ requests }) => {
  const total = requests.length;
  const pending = requests.filter(o => o.status === 'PENDING').length;
  const quoted = requests.filter(o => o.status === 'QUOTED').length;
  const accepted = requests.filter(o => o.status === 'ACCEPTED').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
      {[
        { label: 'Total Requests', value: String(total),    icon: Sparkles,   color: { bg: '#F0EBE2', text: '#1C1712' } },
        { label: 'Pending Review', value: String(pending),  icon: Clock,      color: { bg: '#FFF4E5', text: '#C4631C' } },
        { label: 'Quotes Sent',    value: String(quoted),   icon: Send,       color: { bg: '#E5F0FF', text: '#2B6CB0' } },
        { label: 'Accepted',       value: String(accepted), icon: CheckCircle,color: { bg: '#E6F4EA', text: '#2D7A45' } },
      ].map(({ label, value, icon: Icon, color }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 md:p-7 rounded-2xl md:rounded-[20px] border border-[#E5E0D8] flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
        >
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: color.bg, color: color.text }}>
            <Icon size={20} className="md:w-[22px] md:h-[22px]" />
          </div>
          <div>
            <p className="text-[10px] md:text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-1">{label}</p>
            <p className="text-lg md:text-2xl font-bold text-[#1C1712]">{value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   EXPANDED ROW COMPONENT (Gére la logique du Quote)
───────────────────────────────────────── */
const ExpandedRow: React.FC<{ 
  request: CustomOrder; 
  onUpdateStatus: (id: string, st: string) => Promise<void>;
  onSendQuote: (id: string, price: number) => Promise<void>;
}> = ({ request, onUpdateStatus, onSendQuote }) => {
  
  const [quotePrice, setQuotePrice] = useState(request.estimatedPrice?.toString() || '');
  const [isQuoting, setIsQuoting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuote = async () => {
    if (!quotePrice) return;
    setIsQuoting(true);
    await onSendQuote(request.id, parseFloat(quotePrice));
    setIsQuoting(false);
  };

  const handleStatus = async (st: string) => {
    setIsUpdating(true);
    await onUpdateStatus(request.id, st);
    setIsUpdating(false);
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-t border-[#E5E0D8] overflow-hidden"
    >
      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 bg-[#FAFAF8]">

        {/* LEFT — Specification & Media */}
        <div className="w-full">
          <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3 md:mb-4 flex items-center gap-2">
            <FileText size={14} /> Specification Details
          </p>
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E0D8] mb-4 shadow-sm w-full">
            <p className="text-xs md:text-sm text-[#4A4035] leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>

          <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3 md:mb-4 flex items-center gap-2">
            <ImageIcon size={14} /> Reference Media
          </p>
          {request.imageUrl ? (
            <div className="w-full max-w-sm rounded-xl overflow-hidden border border-[#E5E0D8] bg-white">
              <img src={request.imageUrl} alt="Reference" className="w-full h-auto object-cover" />
            </div>
          ) : (
            <div className="w-full h-24 bg-white border border-dashed border-[#D4C5B0] rounded-xl flex items-center justify-center text-[#9C8E80]">
              <ImageIcon size={18} className="mr-2" />
              <span className="text-xs md:text-sm font-medium">No image provided</span>
            </div>
          )}
        </div>

        {/* RIGHT — Info + Actions */}
        <div className="flex flex-col gap-4 w-full">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 md:p-5 shadow-sm">
            <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3 md:mb-4">Customer Info</p>
            <div className="flex items-start gap-3 mb-2">
              <User size={16} color="#C4631C" className="mt-0.5 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#1C1712] truncate">{request.User?.name || 'Guest User'}</p>
                <p className="text-xs text-[#7A6F62] truncate">{request.User?.email || 'No email'}</p>
              </div>
            </div>
          </div>

          {/* Quote Action */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 md:p-5 shadow-sm">
            <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3">Send Official Quote</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8E80] text-sm">DH</div>
                <input 
                  type="number" 
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2.5 md:py-3 rounded-xl border border-[#D4C5B0] bg-[#FDFCF9] text-sm font-bold text-[#1C1712] outline-none focus:border-[#C4631C] transition-colors"
                />
              </div>
              <button 
                onClick={handleQuote}
                disabled={isQuoting || !quotePrice}
                className="w-full sm:w-auto px-5 py-2.5 md:py-3 bg-[#C4631C] hover:bg-[#1A1410] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {isQuoting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Quote
              </button>
            </div>
            <p className="text-[11px] md:text-xs text-[#9C8E80] mt-2 italic">Sending a quote automatically updates status to QUOTED.</p>
          </div>

          {/* Status Override */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 md:p-5 shadow-sm">
            <p className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-[0.12em] mb-3">Manual Status Override</p>
            <div className="relative w-full">
              <select
                value={request.status}
                onChange={e => handleStatus(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2.5 md:py-3 pr-9 appearance-none rounded-xl border border-[#D4C5B0] bg-[#FDFCF9] text-sm font-semibold text-[#1C1712] cursor-pointer outline-none focus:border-[#C4631C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isUpdating ? <Loader2 size={15} color="#C4631C" className="animate-spin" /> : <ChevronDown size={15} color="#9C8E80" />}
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};


/* ─────────────────────────────────────────
   MAIN ADMIN PAGE
───────────────────────────────────────── */
const AdminCustomOrders: React.FC = () => {
  const [requests, setRequests] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRequests = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await apiClient.get('/custom-orders/admin');
      const sorted = (Array.isArray(res.data) ? res.data : []).sort(
        (a: CustomOrder, b: CustomOrder) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setRequests(sorted);
    } catch (e) { console.error('Error fetching custom orders:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/custom-orders/${id}/status`, { status: newStatus });
      setRequests(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch { alert('Failed to update status.'); }
  };

  const handleSendQuote = async (id: string, price: number) => {
    try {
      await apiClient.put(`/custom-orders/${id}/quote`, { estimatedPrice: price });
      setRequests(prev => prev.map(o => o.id === id ? { ...o, estimatedPrice: price, status: 'QUOTED' } : o));
    } catch { alert('Failed to send quote.'); }
  };

  const countFor = (s: string) => s === 'ALL' ? requests.length : requests.filter(o => o.status === s).length;

  const filteredRequests = requests.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || (o.User?.email || '').toLowerCase().includes(q) || (o.User?.name || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={40} color="#C4631C" className="animate-spin" />
        <p className="text-[#7A6F62] font-semibold text-sm">Loading bespoke requests...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10 text-[#1C1712]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="font-bold text-2xl md:text-4xl text-[#1C1712] mb-1 md:mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Bespoke Management
          </h1>
          <p className="text-xs md:text-sm text-[#7A6F62]">Review client specifications, send price quotes, and manage custom orders.</p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
          className="bg-[#FDFCF9] px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#5A4F44] flex items-center justify-center gap-2 w-full sm:w-auto hover:bg-[#F0EBE2] transition-colors shadow-sm shrink-0"
        >
          <RefreshCw size={15} color="#C4631C" className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <StatsBar requests={requests} />

      {/* ── Filter bar (Mobile Optimized) ── */}
      <div className="bg-white rounded-[20px] border border-[#E5E0D8] p-3 md:px-6 md:py-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(28,23,18,0.03)] w-full">
        {/* Status pills - Horizontal scroll on mobile */}
        <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 w-full md:w-auto md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {['ALL', ...ALL_STATUSES].map(s => {
            const active = statusFilter === s;
            const cfg = STATUS_CONFIG[s] || { label: s, bg: 'bg-[#F0EBE2]', text: 'text-[#7A6F62]', border: 'border-transparent' };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase transition-all border shrink-0
                  ${active
                    ? s === 'ALL' ? 'bg-[#1C1712] text-[#FDFCF9] border-[#1C1712]' : `${cfg.bg} ${cfg.text} ${cfg.border}`
                    : 'bg-[#F0EBE2] text-[#7A6F62] border-transparent hover:border-[#D4C5B0]'
                  }`}
              >
                {s === 'ALL' ? 'All' : cfg.label}
                <span className={`px-1.5 py-0.5 md:py-0 rounded-full text-[9px] md:text-[10px] ${active ? (s === 'ALL' ? 'bg-white/20 text-white' : 'bg-white/60') : 'bg-[#E5E0D8] text-[#9C8E80]'}`}>
                  {countFor(s)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-auto md:min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8E80] pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 md:py-2 rounded-xl border border-[#E5E0D8] bg-[#FDFCF9] text-sm text-[#1C1712] placeholder:text-[#9C8E80] outline-none focus:border-[#D4C5B0] transition-colors"
          />
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[20px] border border-dashed border-[#E5E0D8] p-10 md:p-16 flex flex-col items-center gap-3 text-center mx-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBE2] flex items-center justify-center">
            <Filter size={20} color="#9C8E80" />
          </div>
          <p className="text-sm font-bold text-[#7A6F62]">No requests match your criteria.</p>
        </div>
      ) : (

        /* ── Requests table ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl md:rounded-[20px] border border-[#E5E0D8] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]"
        >
          {/* Table head (Desktop only) */}
          <div className="hidden md:grid grid-cols-[1fr_220px_140px_130px_32px] gap-3 px-8 py-4 bg-[#FAFAF8] border-b border-[#E5E0D8]">
            {['Request ID', 'Client', 'Est. Price', 'Status', ''].map(h => (
              <p key={h} className="text-[11px] font-bold text-[#9C8E80] uppercase tracking-wider">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-[#F0EBE2]">
            {filteredRequests.map(req => {
              const isExpanded = expandedId === req.id;

              return (
                <div key={req.id} className={`transition-colors ${isExpanded ? 'bg-[#FDFCF9]' : 'hover:bg-[#FDFCF9]'}`}>
                  
                  {/* ── Mobile/Desktop Adaptive Row ── */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="flex flex-col md:grid md:grid-cols-[1fr_220px_140px_130px_32px] gap-3 md:items-center px-4 md:px-8 py-4 md:py-5 cursor-pointer relative"
                  >
                    
                    {/* 1. Icon, ID, Date & Mobile Status/Chevron */}
                    <div className="flex w-full md:w-auto items-center justify-between md:justify-start">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F0EBE2] border border-[#E5E0D8] flex items-center justify-center shrink-0">
                          <Sparkles size={16} color="#7A6F62" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1C1712] mb-0.5">#{shortId(req.id)}</p>
                          <p className="text-[11px] md:text-xs text-[#9C8E80]">{req.createdAt ? formatDate(req.createdAt) : '—'}</p>
                        </div>
                      </div>
                      
                      {/* Mobile Status + Chevron */}
                      <div className="flex items-center gap-2 md:hidden">
                        <StatusBadge status={req.status} />
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown size={16} color="#9C8E80" />
                        </motion.div>
                      </div>
                    </div>

                    {/* 2. Customer & Mobile Price */}
                    <div className="flex w-full md:w-auto items-center justify-between md:block mt-1 md:mt-0 ml-12 md:ml-0">
                      <div className="overflow-hidden">
                        <p className="text-sm text-[#5A4F44] truncate font-medium">{req.User?.name || 'Guest'}</p>
                        <p className="text-[11px] md:text-xs text-[#9C8E80] mt-0.5 truncate">{req.User?.email}</p>
                      </div>
                      {/* Mobile Price */}
                      <div className="md:hidden text-right shrink-0">
                        <p className="text-sm font-bold text-[#1C1712]">
                          {req.estimatedPrice ? MAD(req.estimatedPrice) : <span className="text-[#9C8E80] italic font-medium">Not quoted</span>}
                        </p>
                      </div>
                    </div>

                    {/* 3. Desktop Price */}
                    <p className="hidden md:block text-sm font-bold text-[#1C1712]">
                      {req.estimatedPrice ? MAD(req.estimatedPrice) : <span className="text-[#9C8E80] italic font-medium">Not quoted</span>}
                    </p>

                    {/* 4. Desktop Status */}
                    <div className="hidden md:block">
                      <StatusBadge status={req.status} />
                    </div>

                    {/* 5. Desktop Chevron */}
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="hidden md:flex justify-center">
                      <ChevronDown size={16} color="#9C8E80" />
                    </motion.div>

                  </div>

                  {/* ── Expanded body ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <ExpandedRow 
                        request={req} 
                        onUpdateStatus={handleUpdateStatus} 
                        onSendQuote={handleSendQuote} 
                      />
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

export default AdminCustomOrders;