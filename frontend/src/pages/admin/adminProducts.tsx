import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon,
  X, UploadCloud, Save, ChevronDown, AlertTriangle, Package, RefreshCw
} from 'lucide-react';
import apiClient from '../../services/api';

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; description: string; price: number;
  stock: number; imageUrls: string[] | null; Category: Category | null;
}

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;
const serif = "'Cormorant Garamond', Georgia, serif";

/* ─────────────────────────────────────────
   PRODUCT FORM DRAWER
───────────────────────────────────────── */
const ProductFormDrawer = ({ isOpen, onClose, onSuccess, categories, productToEdit }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void;
  categories: Category[]; productToEdit: Product | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setStock(productToEdit.stock.toString());
        setCategoryId(productToEdit.Category?.id || '');
        setDescription(productToEdit.description);
        setExistingImages(productToEdit.imageUrls || []);
      } else {
        setName(''); setPrice(''); setStock(''); setCategoryId(''); setDescription('');
        setExistingImages([]);
      }
      setNewImageFiles([]); setNewImagePreviews([]);
      setError('');
    }
  }, [isOpen, productToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImageFiles(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name); fd.append('price', price);
      fd.append('stock', stock); fd.append('categoryId', categoryId);
      fd.append('description', description);
      fd.append('existingImages', JSON.stringify(existingImages));
      newImageFiles.forEach(f => fd.append('images', f));
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (productToEdit) await apiClient.put(`/products/${productToEdit.id}`, fd, cfg);
      else await apiClient.post('/products', fd, cfg);
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const hasImages = existingImages.length > 0 || newImagePreviews.length > 0;
  const allImages = [
    ...existingImages.map(url => ({ url, isNew: false, idx: existingImages.indexOf(url) })),
    ...newImagePreviews.map((url, idx) => ({ url, isNew: true, idx })),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a0805]/45 backdrop-blur-[6px] z-[1000]"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[600px] bg-[#FDFCF9] z-[1001] flex flex-col shadow-[-16px_0_48px_rgba(0,0,0,0.12)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-8 border-b border-[#EDE8E0] bg-white shrink-0">
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#C4631C] mb-1.5">
                  {productToEdit ? 'Editing' : 'New'}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1C1712] leading-none" style={{ fontFamily: serif }}>
                  {productToEdit ? productToEdit.name : 'Add Product'}
                </h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F0EBE2] hover:bg-[#E5E0D8] border-none flex items-center justify-center cursor-pointer text-[#7A6F62] shrink-0 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
              <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-7">
                {error && (
                  <div className="px-4 py-3 bg-[#FEF0F0] border border-[#FCCFCF] rounded-xl text-[#A92828] text-[13px] font-semibold flex items-center gap-2.5">
                    <AlertTriangle size={18} /> {error}
                  </div>
                )}

                {/* Image upload */}
                <div>
                  <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Product Images</label>

                  {hasImages && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {allImages.map(({ url, isNew, idx }) => (
                        <div key={`${isNew ? 'n' : 'e'}-${idx}`} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isNew ? 'border-[#C4631C]' : 'border-[#E5E0D8]'}`}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={() => isNew
                              ? (setNewImageFiles(p => p.filter((_, i) => i !== idx)), setNewImagePreviews(p => p.filter((_, i) => i !== idx)))
                              : setExistingImages(p => p.filter((_, i) => i !== idx))}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-[#A92828] hover:bg-white transition-colors"
                          >
                            <X size={13} />
                          </button>
                          {isNew && <div className="absolute bottom-0 left-0 right-0 bg-[#C4631C]/85 text-[9px] text-white text-center py-1 font-bold tracking-wider">NEW</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer gap-2 transition-all ${hasImages ? 'h-20 border-[#D4C5B0] bg-[#FAF8F5] hover:border-[#C4631C] hover:bg-[#FDF7F2]' : 'h-40 border-[#D4C5B0] bg-[#FAF8F5] hover:border-[#C4631C] hover:bg-[#FDF7F2]'}`}
                  >
                    <UploadCloud size={hasImages ? 20 : 28} color="#C4631C" />
                    {!hasImages && (
                      <>
                        <p className="text-[15px] font-semibold text-[#3A322A]">Click to add images</p>
                        <p className="text-[13px] text-[#9C8E80]">Multiple files supported</p>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Product Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. The Classic Tote" 
                    className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]" 
                  />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Price (DH)</label>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="0.00" 
                      className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Stock</label>
                    <input type="number" value={stock} onChange={e => setStock(e.target.value)} required placeholder="0" 
                      className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]" 
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Category</label>
                  <div className="relative">
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required 
                      className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)] appearance-none cursor-pointer pr-10"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C8E80] pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5}
                    className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)] resize-y leading-[1.7]" 
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 md:px-10 md:py-6 bg-white border-t border-[#EDE8E0] flex gap-4 shrink-0">
              <button onClick={onClose} type="button"
                className="flex-1 py-3.5 md:py-4 bg-[#F0EBE2] hover:bg-[#E5E0D8] rounded-xl text-[#5A4F44] text-[13px] font-bold tracking-[0.12em] uppercase transition-colors"
              >
                Cancel
              </button>
              <button form="productForm" type="submit" disabled={loading}
                className={`flex-[2] py-3.5 md:py-4 rounded-xl text-[#FDFCF9] text-[13px] font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-colors ${loading ? 'bg-[#5A4F44] cursor-not-allowed' : 'bg-[#1C1712] hover:bg-[#332A21]'}`}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Saving…' : productToEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


/* ─────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────── */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, product, loading }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; product: Product | null; loading: boolean;
}) => (
  <AnimatePresence>
    {isOpen && product && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={!loading ? onClose : undefined}
          className="fixed inset-0 bg-[#0a0805]/55 backdrop-blur-[6px] z-[1002]"
        />
        <div className="fixed inset-0 z-[1003] flex items-center justify-center p-4 md:p-5 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="bg-[#FDFCF9] w-full max-w-[420px] rounded-[24px] overflow-hidden pointer-events-auto shadow-[0_32px_64px_rgba(0,0,0,0.18)]"
          >
            <div className="px-6 py-8 md:px-8 md:pt-10 md:pb-8 text-center">
              <div className="w-16 h-16 bg-[#FEF0F0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A92828]">
                <Trash2 size={28} />
              </div>
              <h3 className="text-2xl md:text-[26px] font-bold text-[#1C1712] mb-3" style={{ fontFamily: serif }}>Delete Product?</h3>
              <p className="text-[15px] text-[#6B5F52] leading-[1.65]">
                You're about to permanently delete <span className="font-bold text-[#1C1712]">{product.name}</span>. This cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-[#EDE8E0]">
              <button onClick={onClose} disabled={loading}
                className="p-5 bg-[#FAFAF8] hover:bg-[#F0EBE2] border-r border-[#EDE8E0] text-[14px] font-semibold text-[#6B5F52] transition-colors disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button onClick={onConfirm} disabled={loading}
                className="p-5 bg-[#FAFAF8] hover:bg-[#FEF0F0] text-[14px] font-bold text-[#A92828] flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Trash2 size={16} /> Delete</>}
              </button>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);


/* ─────────────────────────────────────────
   ADMIN PRODUCTS PAGE
───────────────────────────────────────── */
const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [rP, rC] = await Promise.all([apiClient.get('/products'), apiClient.get('/categories')]);
      
      // 🔴 FIX 1: N-khebiw ga3 les Produits dyal Custom Orders mn l'Admin (li fihom Commande f smiyethom awla smiythom Bespoke)
      const validProducts = (Array.isArray(rP.data) ? rP.data : []).filter(p => 
        !p.name.includes('Commande') && p.name !== 'Bespoke Custom Piece'
      );
      
      const sortedProducts = validProducts.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(sortedProducts);
      setCategories(Array.isArray(rC.data) ? rC.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/products/${productToDelete.id}`);
      setIsDeleteOpen(false); setProductToDelete(null); fetchData(true);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Could not delete product.');
    } finally { setDeleteLoading(false); }
  };

  return (
    <div className="text-[#1C1712] w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1712] mb-1.5 leading-[1.1]" style={{ fontFamily: serif }}>Products</h1>
          <p className="text-sm text-[#9C8E80]">
            <span className="text-[#1C1712] font-bold">{products.length}</span> items in catalog
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
          
          {/* 🔴 FIX 2: Bouton Refresh bach njibou Stock jdid mli t-w9e3 chi Mbi3a */}
          <button
             onClick={() => fetchData(true)}
             className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FDFCF9] border border-[#E5E0D8] rounded-xl text-[13px] font-bold text-[#5A4F44] tracking-[0.08em] shadow-sm hover:bg-[#F0EBE2] transition-colors"
          >
             <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
             <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C8E80]" />
            <input
              type="text" placeholder="Search products…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full py-3 pr-4 pl-[42px] rounded-xl border border-[#E5E0D8] bg-white text-sm outline-none transition-all focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]"
            />
          </div>

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setProductToEdit(null); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C4631C] hover:bg-[#1C1712] text-white border-none rounded-xl text-[13px] font-bold tracking-[0.08em] whitespace-nowrap shadow-[0_4px_16px_rgba(196,99,28,0.28)] transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Product
          </motion.button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-[#E5E0D8] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#E5E0D8]">
                {['Product', 'Category', 'Price', 'Stock', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-4 md:px-8 md:py-5 text-xs font-bold text-[#A89B8C] uppercase tracking-[0.12em] ${i === 4 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && !refreshing ? (
                <tr><td colSpan={5} className="p-20 text-center">
                  <Loader2 size={28} color="#C4631C" className="animate-spin mx-auto block" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center">
                  <Package size={36} className="text-[#D4C5B0] mx-auto mb-4 block" />
                  <p className="text-[15px] text-[#A89B8C]">No products found.</p>
                </td></tr>
              ) : filtered.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-[#F5F1EC] hover:bg-[#FAFAF8] transition-colors"
                >
                  {/* Product */}
                  <td className="px-5 py-4 md:px-8 md:py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#EDE8DF] border border-[#E5E0D8] overflow-hidden flex items-center justify-center shrink-0">
                        {product.imageUrls?.length
                          ? <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                          : <ImageIcon size={20} color="#B0A898" />}
                      </div>
                      <div>
                        <p className="text-[14px] md:text-[15px] font-bold text-[#1C1712] leading-[1.3]">{product.name}</p>
                        {product.imageUrls && product.imageUrls.length > 1 && (
                          <p className="text-[11px] md:text-xs text-[#B0A898] mt-1">{product.imageUrls.length} photos</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 md:px-8 md:py-5">
                    <span className="bg-[#F4EFE8] text-[#5A4F44] px-3.5 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-[0.08em] uppercase">
                      {product.Category?.name || '—'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 md:px-8 md:py-5 text-[14px] md:text-[15px] font-bold text-[#1C1712]">
                    {MAD(product.price)}
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-4 md:px-8 md:py-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${product.stock === 0 ? 'bg-[#E24B4B]' : product.stock <= 5 ? 'bg-[#C4631C]' : 'bg-[#2D7A45]'}`} />
                      <span className={`text-[14px] md:text-[15px] font-bold ${product.stock === 0 ? 'text-[#E24B4B]' : product.stock <= 5 ? 'text-[#C4631C]' : 'text-[#1C1712]'}`}>
                        {product.stock}
                      </span>
                      {product.stock === 0 && <span className="text-[10px] text-[#E24B4B] tracking-[0.12em] uppercase font-bold">Out</span>}
                      {product.stock > 0 && product.stock <= 5 && <span className="text-[10px] text-[#C4631C] tracking-[0.12em] uppercase font-bold">Low</span>}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 md:px-8 md:py-5">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                        onClick={() => { setProductToEdit(product); setIsFormOpen(true); }}
                        title="Edit"
                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#F0EBE2] hover:bg-[#E5E0D8] text-[#5A4F44] flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                        onClick={() => { setProductToDelete(product); setIsDeleteOpen(true); }}
                        title="Delete"
                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#FEF0F0] hover:bg-[#FCCFCF] text-[#A92828] flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 md:px-8 bg-[#FAFAF8] border-t border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs md:text-[13px] text-[#A89B8C]">
              Showing <span className="text-[#1C1712] font-bold">{filtered.length}</span> of <span className="text-[#1C1712] font-bold">{products.length}</span> products
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[11px] text-[#C4631C] font-bold bg-transparent border-none tracking-[0.1em] uppercase hover:underline self-start sm:self-auto">
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <ProductFormDrawer isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={() => fetchData(true)} categories={categories} productToEdit={productToEdit} />
      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} product={productToDelete} loading={deleteLoading} />
    </div>
  );
};

export default AdminProducts;