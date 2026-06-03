import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Loader2, X, Save, AlertTriangle, 
  Tag, Briefcase, Glasses, Package, Watch, Shirt,Wallet // Zdt les icones l-jdaad
} from 'lucide-react';
import apiClient from '../../services/api';
import toast from 'react-hot-toast'; // <--- ZDT TOAST HNA

interface Category { id: string; name: string; description: string; }

const serif = "'Cormorant Garamond', Georgia, serif";

// ── FONCTION BACH N-JBDO L-ICONE 3LA 7SSAB S-SMIYA DYAL CATEGORY ──
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('bag') || lowerName.includes('sac')) return Briefcase;
  if (lowerName.includes('accessory') || lowerName.includes('accessoire')) return Glasses;
  if (lowerName.includes('wallet') || lowerName.includes('porte')) return Wallet; 
  if (lowerName.includes('watch') || lowerName.includes('montre')) return Watch;
  if (lowerName.includes('clothes') || lowerName.includes('vetement')) return Shirt;
  return Tag; // L-Icone par defaut
};

/* ─────────────────────────────────────────
   CATEGORY FORM DRAWER
───────────────────────────────────────── */
const CategoryFormDrawer = ({ isOpen, onClose, onSuccess, categoryToEdit }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; categoryToEdit: Category | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(categoryToEdit?.name || '');
      setDescription(categoryToEdit?.description || '');
      setError('');
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { name, description };
      if (categoryToEdit) {
        await apiClient.put(`/categories/${categoryToEdit.id}`, payload);
        toast.success("Catégorie modifiée avec succès !"); // <-- TOAST SUCCESS
      } else {
        await apiClient.post('/categories', payload);
        toast.success("Catégorie ajoutée avec succès !"); // <-- TOAST SUCCESS
      }
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
      toast.error("Erreur lors de l'enregistrement."); // <-- TOAST ERROR
    } finally { setLoading(false); }
  };

  const IconToRender = getCategoryIcon(name);

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
            className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-[#FDFCF9] z-[1001] flex flex-col shadow-[-16px_0_48px_rgba(0,0,0,0.12)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-8 border-b border-[#EDE8E0] bg-white shrink-0">
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#C4631C] mb-1.5">
                  {categoryToEdit ? 'Editing' : 'New'}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1C1712] leading-none" style={{ fontFamily: serif }}>
                  {categoryToEdit ? categoryToEdit.name : 'Add Category'}
                </h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F0EBE2] hover:bg-[#E5E0D8] border-none flex items-center justify-center cursor-pointer text-[#7A6F62] shrink-0 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
              <form id="categoryForm" onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-7">
                {error && (
                  <div className="px-4 py-3 bg-[#FEF0F0] border border-[#FCCFCF] rounded-xl text-[#A92828] text-[13px] font-semibold flex items-center gap-2.5">
                    <AlertTriangle size={18} /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">Category Name</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Wallets"
                    className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] tracking-[0.16em] uppercase font-bold text-[#9C8E80] mb-2">
                    Description <span className="text-[#C4B08A] text-[9px]">(optional)</span>
                  </label>
                  <textarea
                    value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this category…" rows={5}
                    className="w-full px-4 py-3.5 bg-[#FAFAF8] border border-[#E5E0D8] rounded-xl text-sm text-[#1C1712] outline-none transition-colors focus:bg-white focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)] resize-y leading-[1.7]"
                  />
                </div>

                {/* Preview card */}
                {name && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-[#F4EFE8] rounded-2xl border border-[#E5E0D8]">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#A89B8C] font-bold mb-3">Preview</p>
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-[10px] bg-[#C4631C] flex items-center justify-center shrink-0">
                        {/* ICON DYNAMIQUE HNA */}
                        <IconToRender size={18} color="#fff" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#1C1712]">{name}</p>
                        {description && <p className="text-xs text-[#7A6F62] mt-0.5 leading-[1.4] line-clamp-1">{description}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 md:px-10 md:py-6 bg-white border-t border-[#EDE8E0] flex gap-4 shrink-0">
              <button onClick={onClose} type="button"
                className="flex-1 py-3.5 md:py-4 bg-[#F0EBE2] hover:bg-[#E5E0D8] rounded-xl text-[#5A4F44] text-[13px] font-bold tracking-[0.12em] uppercase transition-colors"
              >
                Cancel
              </button>
              <button form="categoryForm" type="submit" disabled={loading}
                className={`flex-[2] py-3.5 md:py-4 rounded-xl text-[#FDFCF9] text-[13px] font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-colors ${loading ? 'bg-[#5A4F44] cursor-not-allowed' : 'bg-[#1C1712] hover:bg-[#332A21]'}`}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Saving…' : categoryToEdit ? 'Save Changes' : 'Create Category'}
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
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, category, loading }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; category: Category | null; loading: boolean;
}) => (
  <AnimatePresence>
    {isOpen && category && (
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
              <h3 className="text-2xl md:text-[26px] font-bold text-[#1C1712] mb-3" style={{ fontFamily: serif }}>Delete Category?</h3>
              <p className="text-[15px] text-[#6B5F52] leading-[1.65]">
                You're about to delete <span className="font-bold text-[#1C1712]">{category.name}</span>. This will fail if products are linked to it.
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
   MAIN PAGE
───────────────────────────────────────── */
const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/categories/${categoryToDelete.id}`);
      toast.success("Catégorie supprimée avec succès !"); // <-- TOAST HNA
      setIsDeleteOpen(false); setCategoryToDelete(null); fetchCategories();
    } catch (e: any) {
      // 3wd l-alert b l-Toast
      toast.error(e.response?.data?.message || 'Cannot delete — products may be linked to this category.');
    } finally { setDeleteLoading(false); }
  };

  // Color palette for category icons
  const palette = ['#C4631C', '#7B5EA7', '#2D7A45', '#2B6CB0', '#B7791F', '#C53030'];

  return (
    <div className="text-[#1C1712] w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1712] mb-1.5 leading-[1.1]" style={{ fontFamily: serif }}>Categories</h1>
          <p className="text-sm text-[#9C8E80]">
            <span className="text-[#1C1712] font-bold">{categories.length}</span> categories
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C8E80]" />
            <input 
              type="text" placeholder="Search categories…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full py-3 pr-4 pl-[42px] rounded-xl border border-[#E5E0D8] bg-white text-sm outline-none transition-all focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]"
            />
          </div>

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setCategoryToEdit(null); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C4631C] hover:bg-[#1C1712] text-white border-none rounded-xl text-[13px] font-bold tracking-[0.08em] whitespace-nowrap shadow-[0_4px_16px_rgba(196,99,28,0.28)] transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Category
          </motion.button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-[#E5E0D8] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[600px]">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#E5E0D8]">
                {['Category', 'Description', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-4 md:px-8 md:py-5 text-xs font-bold text-[#A89B8C] uppercase tracking-[0.12em] ${i === 2 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-20 text-center">
                  <Loader2 size={28} color="#C4631C" className="animate-spin mx-auto block" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="p-20 text-center">
                  <Tag size={36} className="text-[#D4C5B0] mx-auto mb-4 block" />
                  <p className="text-[15px] text-[#A89B8C]">No categories found.</p>
                </td></tr>
              ) : filtered.map((cat, idx) => {
                const color = palette[idx % palette.length];
                const CatIcon = getCategoryIcon(cat.name); // <-- ZDT L-ICONE DYNAMIQUE HNA
                
                return (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-[#F5F1EC] hover:bg-[#FAFAF8] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-4 md:px-8 md:py-5 w-1/3">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}18` }}
                        >
                          <CatIcon size={18} color={color} className="md:w-5 md:h-5" />
                        </div>
                        <span className="text-[14px] md:text-[15px] font-bold text-[#1C1712]">{cat.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 md:px-8 md:py-5 text-[13px] md:text-[14px] text-[#6B5F52] w-1/2">
                      {cat.description
                        ? <span className="line-clamp-2 md:line-clamp-1">{cat.description}</span>
                        : <span className="italic text-[#C4B08A] text-xs">No description</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 md:px-8 md:py-5">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                          onClick={() => { setCategoryToEdit(cat); setIsFormOpen(true); }}
                          title="Edit"
                          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#F0EBE2] hover:bg-[#E5E0D8] text-[#5A4F44] flex items-center justify-center transition-colors"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                          onClick={() => { setCategoryToDelete(cat); setIsDeleteOpen(true); }}
                          title="Delete"
                          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#FEF0F0] hover:bg-[#FCCFCF] text-[#A92828] flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 md:px-8 bg-[#FAFAF8] border-t border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs md:text-[13px] text-[#A89B8C]">
              Showing <span className="text-[#1C1712] font-bold">{filtered.length}</span> of <span className="text-[#1C1712] font-bold">{categories.length}</span> categories
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[11px] text-[#C4631C] font-bold bg-transparent border-none tracking-[0.1em] uppercase hover:underline self-start sm:self-auto">
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <CategoryFormDrawer isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={fetchCategories} categoryToEdit={categoryToEdit} />
      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} category={categoryToDelete} loading={deleteLoading} />
    </div>
  );
};

export default AdminCategories;