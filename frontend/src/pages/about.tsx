import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';

const About: React.FC = () => {
  return (
    <div className="premium-beige-bg" style={{ minHeight: '100vh', color: '#1A1410', position: 'relative', overflow: 'hidden' }}>
      
      {/* ─── LIGHTWEIGHT CSS ANIMATION ─── */}
      <style>{`
        @keyframes smoothGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .premium-beige-bg {
          /* ألوان Beige دافية وخفيفة */
          background: linear-gradient(-45deg, #FDFCF9, #F4EFE8, #EAE1D5, #F9F6F1);
          background-size: 400% 400%;
          animation: smoothGradient 18s ease-in-out infinite;
          font-family: 'Inter', sans-serif;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(28, 23, 18, 0.04);
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <Navbar />
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', padding: '100px 24px 150px' }}>
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 100 }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4631C', marginBottom: 20, display: 'block' }}>
            Our Heritage
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 30 }}>
            Crafted by Hand,<br />
            <span style={{ fontStyle: 'italic', color: '#8B7E72' }}>Built for Life.</span>
          </h1>
        </motion.div>

        {/* STORY CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, fontSize: 17, lineHeight: 1.9, color: '#3A322A' }}>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            At <strong>Deer Goods</strong>, every piece begins with hands, not machines. 
            What started in a small home workshop became a passion-driven craft built on patience, precision, and authenticity. 
          </motion.p>

          {/* GLASSMORPHISM QUOTE CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
            className="glass-card"
            style={{ padding: '40px', borderRadius: 24, borderLeft: '4px solid #C4631C' }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: 24, fontStyle: 'italic', color: '#1A1410', lineHeight: 1.6 }}>
              "The founder of Deer Goods began with a simple love for creating things by hand — learning alone, experimenting with leather, understanding textures, materials, and the timeless beauty behind true craftsmanship."
            </p>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            Over the past year and a half, that passion turned into a growing artisan brand focused on handmade leather goods designed to last. 
            Wallets became the heart of the workshop, but the craft never stopped there. 
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            From bags to custom leather pieces, every product is carefully handcrafted using quality materials and traditional techniques. 
            No mass production. No shortcuts. Just honest work, attention to detail, and durable pieces made with purpose. 
            Each stitch, cut, and finish reflects countless hours of learning, improving, and refining the craft inside a small workshop at home.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontWeight: 600, marginBottom: 12 }}>
              At Deer Goods, we believe leather tells a story — and the longer you carry it, the better that story becomes.
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#C4631C' }}>
              Because real craftsmanship is not rushed. It is built by hand.
            </p>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default About;