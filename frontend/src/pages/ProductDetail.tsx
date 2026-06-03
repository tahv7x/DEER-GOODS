import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Check, Loader2, ShieldCheck, Truck, Lock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import apiClient from '../services/api';

const MAD = (n: number) => `${Number(n).toFixed(2)} DH`;

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product || product.stock === 0) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrls?.[0] || product.imageUrl || '',
      category: product.Category?.name
    });

    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C4631C]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] text-center pt-32">
        <h2 className="font-sans text-3xl font-bold text-[#1C1712] mb-6">Product not found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[#1C1712] text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-[#332A21] transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1C1712] pb-24 md:pb-32">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 pt-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 bg-transparent border-none text-[#9C8E80] cursor-pointer text-[11px] tracking-[0.15em] uppercase font-bold mb-10 transition-colors hover:text-[#C4631C]"
        >
          <ArrowLeft size={14} /> Back to Collection
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          
          {/* ─── LEFT: IMAGE GALLERY ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[24px] overflow-hidden bg-[#EDE8DF] relative aspect-[4/5] md:sticky md:top-24 shadow-[0_8px_32px_rgba(28,23,18,0.06)] border border-[#E5E0D8]"
          >
            {product.imageUrls?.[0] || product.imageUrl ? (
              <img
                src={product.imageUrls?.[0] || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#D4C5B0] text-6xl">
                ◈
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-[#FDFCF9]/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm tracking-[0.2em] uppercase font-bold text-[#1C1712] bg-white px-6 py-3 rounded-full shadow-lg">
                  Sold Out
                </span>
              </div>
            )}
          </motion.div>

          {/* ─── RIGHT: PRODUCT INFO ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:sticky md:top-24 pt-4 md:pt-0"
          >
            <p className="text-[11px] tracking-[0.2em] uppercase font-bold text-[#C4631C] mb-3 font-sans">
              {product.Category?.name || 'Handcrafted Gear'}
            </p>
            
            {/* L-FONT T-BEDDEL HNA: Rddinah font-sans w font-extrabold */}
            <h1 className="font-sans text-[clamp(32px,4vw,44px)] font-extrabold leading-[1.1] mb-4 text-[#1C1712] tracking-tight">
              {product.name}
            </h1>
            
            {/* L-Prix hta howa */}
            <p className="font-sans text-2xl font-extrabold text-[#1C1712] mb-8">
              {MAD(product.price)}
            </p>

            {/* Zedt lik had l-kht l-Limouni sghir kay3ti style wa3er */}
            <div className="w-10 h-1 bg-[#C4631C] rounded-full mb-8" />

            <p className="text-[#6B5F52] text-[15px] leading-[1.8] mb-10 font-sans">
              {product.description}
            </p>

            {/* STOCK INDICATOR */}
            <div className="mb-6 flex items-center gap-2.5">
              <div
                className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-[#DC3232]' : 'bg-[#2D7A45]'}`}
              />
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
                  isOutOfStock ? 'text-[#DC3232]' : 'text-[#2D7A45]'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : `${product.stock} In Stock`}
              </span>
            </div>

            {/* ADD TO CART - Sticky on Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDFCF9]/95 backdrop-blur-md border-t border-[#E5E0D8] md:static md:p-0 md:bg-transparent md:border-none md:backdrop-blur-none z-50">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`
                  w-full h-[60px] rounded-2xl border-none text-[12px] font-bold tracking-[0.15em] uppercase
                  flex items-center justify-center gap-3 transition-all duration-300 font-sans
                  ${
                    added
                      ? 'bg-[#2D7A45] text-white'
                      : isOutOfStock
                      ? 'bg-[#E5E0D8] text-[#9C8E80] cursor-not-allowed'
                      : 'bg-[#1C1712] text-white cursor-pointer hover:bg-[#332A21] shadow-[0_10px_30px_rgba(28,23,18,0.15)] hover:shadow-[0_15px_40px_rgba(28,23,18,0.25)] hover:-translate-y-1'
                  }
                `}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : isOutOfStock ? (
                  'Unavailable'
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* PERKS / TRUST SIGNALS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 md:mt-12 pt-8 md:pt-10 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#C4631C] flex-shrink-0" />
                <span className="text-[13px] font-bold text-[#1C1712] font-sans">Lifetime Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-[#C4631C] flex-shrink-0" />
                <span className="text-[13px] font-bold text-[#1C1712] font-sans">Free Shipping over 500 DH</span>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Lock size={20} className="text-[#C4631C] flex-shrink-0" />
                <span className="text-[13px] font-bold text-[#1C1712] font-sans">Secure SSL Checkout</span>
              </div>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;