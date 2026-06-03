import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles, PenTool } from 'lucide-react';
import apiClient from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

function Marquee() {
  const items = ['100% Handstitched', 'Full-grain Leather', 'Made in Morocco', 'Built to last', 'Bespoke Orders Welcome', 'Free Delivery over 500 DH'];
  return (
    <div className="bg-[#1C1712] text-[#FDFCF9] overflow-hidden py-3 text-[10px] tracking-[0.25em] uppercase font-bold border-b border-[#332A21]">
      <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 35, ease: 'linear', repeat: Infinity }} className="flex whitespace-nowrap gap-12">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-5">
            {item}<span className="text-[#C4631C]">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const MAD = (n: number) => `${n.toFixed(2)} DH`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/products')
      .then(res => {
        if (Array.isArray(res.data)) setFeatured(res.data.slice(0, 4));
      }).catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1C1712]">
      <Marquee />
      <Navbar />

      {/* ─── Hero: The Custom Order Gateway ─── */}
      <section className="relative bg-[#1C1712] overflow-hidden rounded-[32px] mx-4 sm:mx-8 lg:mx-12 my-6 sm:my-8 shadow-2xl">
        {/* Blueprint grid effect for a "design/workshop" vibe */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-shop" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0L0 0 0 40" fill="none" stroke="#FDFCF9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-shop)" />
          </svg>
        </div>
        
        {/* Radial glow for depth */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,rgba(196,99,28,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36">          <motion.div
            variants={stagger} initial="hidden" animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={cardVariants} className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C4631C]/20 text-[#C4631C]">
                <Sparkles size={14} />
              </span>
              <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#D4C5B0] font-bold font-sans">
                100% Custom Made
              </p>
            </motion.div>

            <motion.h1 variants={cardVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] text-[#FDFCF9] leading-[1.05] tracking-tight mb-8" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Your Vision.<br />
              <span className="italic text-[#C4B08A]">Our Craft.</span>
            </motion.h1>

            <motion.p variants={cardVariants} className="text-[#FDFCF9]/70 text-base sm:text-lg leading-relaxed max-w-lg mb-10 font-sans">
              Don't settle for off-the-shelf. Send us your sketches, dimensions, or inspiration, and our master artisans will hand-stitch a bespoke leather piece exclusively for you.
            </motion.p>

            <motion.div variants={cardVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Primary CTA -> Custom Orders */}
              <Link to="/custom-orders" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#C4631C] text-white text-[11px] sm:text-xs tracking-[0.15em] font-bold uppercase rounded-xl hover:bg-[#D4A574] transition-all duration-300 shadow-[0_8px_24px_rgba(196,99,28,0.25)] font-sans">
                <PenTool size={16} /> Request Custom Order
              </Link>
              
              {/* Secondary CTA -> Shop */}
              <Link to="/shop" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent text-[#FDFCF9] border border-[#FDFCF9]/20 text-[11px] sm:text-xs tracking-[0.15em] font-bold uppercase rounded-xl hover:bg-[#FDFCF9]/10 transition-all duration-300 font-sans">
                View Ready Stock
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hidden sm:block">
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ─── Pillars ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-16 sm:mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#E5E0D8] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)] bg-white">
          {[
            { icon: '◈', title: 'Hand-stitched', sub: 'Every piece stitched by hand using traditional saddle stitching.' },
            { icon: '◇', title: 'Full-grain Leather', sub: 'Premium hides that develop a beautiful patina over time.' },
            { icon: '◉', title: 'Made to Order', sub: 'Crafted specifically for you. No mass production.' },
          ].map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.1, duration: 0.5 }} 
              className={`p-8 sm:p-10 ${i < 2 ? 'border-b sm:border-b-0 sm:border-r border-[#E5E0D8]' : ''}`}>
              <div className="text-2xl text-[#C4631C] mb-4">{p.icon}</div>
              <p className="text-xl font-bold text-[#1C1712] mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{p.title}</p>
              <p className="text-sm text-[#7A6F62] leading-relaxed font-sans">{p.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Categories Focus ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-24 sm:mt-32">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C4631C] mb-3 font-sans">— Focus</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1712]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>The Atelier Essentials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1 (Light) */}
          <div 
            onClick={() => navigate('/shop')} 
            className="bg-white border border-[#E5E0D8] rounded-[32px] p-10 flex flex-col justify-between min-h-[340px] cursor-pointer group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(28,23,18,0.06)]"
          >
            <div>
              <Sparkles size={24} className="text-[#C4631C] mb-6" />
              <h3 className="text-3xl font-bold text-[#1C1712] mb-3" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Bespoke Wallets</h3>
              <p className="text-sm text-[#7A6F62] max-w-sm leading-relaxed font-sans">Minimalist cardholders and bifold wallets built to withstand the test of time.</p>
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#C4631C] flex items-center gap-2 mt-8 font-sans transition-all duration-300 group-hover:gap-4">
              Discover Wallets <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>

          {/* Box 2 (Dark) */}
          <div 
            onClick={() => navigate('/shop')} 
            className="bg-[#1C1712] text-white rounded-[32px] p-10 flex flex-col justify-between min-h-[340px] cursor-pointer group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(196,99,28,0.15)]"
          >
            <div>
              <div className="text-2xl text-[#D4C5B0] mb-6">◆</div>
              <h3 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Premium Bags & Gear</h3>
              <p className="text-sm text-[#D4C5B0]/70 max-w-sm leading-relaxed font-sans">Heavy-duty leather goods engineered for lifetime mileage and daily use.</p>
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4C5B0] flex items-center gap-2 mt-8 font-sans transition-all duration-300 group-hover:gap-4">
              Explore Bags <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>

        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-24 sm:mt-32 mb-20 sm:mb-32">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C4631C] mb-3 font-sans">— Handpicked</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1712]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Recommended Pieces</h2>
          </div>
            <Link 
              to="/shop" 
              className="self-start text-[11px] tracking-[0.15em] uppercase font-bold text-[#1C1712] border-b-2 border-[#1C1712] pb-1 hover:text-[#C4631C] hover:border-[#C4631C] transition-colors font-sans"
            >
              View All
            </Link>        
          </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featured.map((product, idx) => {
            const imageToShow = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null;

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_16px_rgba(28,23,18,0.02)] hover:shadow-[0_20px_40px_rgba(28,23,18,0.08)] border border-[#E5E0D8] hover:-translate-y-1 transition-all duration-400 ease-out flex flex-col"
              >
                {/* Image */}
                <div className="aspect-[4/5] bg-[#F0EBE2] overflow-hidden flex items-center justify-center relative">
                  {imageToShow ? (
                    <img
                      src={imageToShow}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[#9C8E80] text-[10px] sm:text-xs tracking-widest uppercase font-sans font-bold">No Image</span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute inset-0 bg-[#FDFCF9]/80 flex items-center justify-center text-[10px] sm:text-[11px] tracking-[0.2em] font-sans font-bold uppercase text-[#1C1712] backdrop-blur-sm">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Info - N9esna l-Padding hna f mobile (p-3) */}
                <div className="p-3 sm:p-5 space-y-1 sm:space-y-1.5 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1 sm:mb-0">
                      <p className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#9C8E80] font-bold font-sans line-clamp-1">
                        {product.Category?.name || 'Uncategorized'}
                      </p>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5E0D8] group-hover:bg-[#C4631C] transition-colors shrink-0" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base text-[#1C1712] line-clamp-2 sm:line-clamp-1 leading-snug group-hover:text-[#C4631C] transition-colors font-bold font-sans">
                      {product.name}
                    </h3>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-[#5A4F44] font-bold pt-1 font-sans">
                      {MAD(product.price)}
                    </p>
                    <div className="pt-2 w-6 h-px bg-[#E5E0D8] group-hover:w-10 group-hover:bg-[#C4631C] transition-all duration-500" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;