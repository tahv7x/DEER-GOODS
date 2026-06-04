import React from 'react';
import { Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid #EAE8E2', background: '#FDFCF9', marginTop: 'auto' }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto', padding: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontStyle: 'italic', color: '#5A4F44', textAlign: 'center', margin: 0 }}>
          "Deer Goods was born from a passion for handmade craftsmanship."
        </p>

        <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#B0A898', textAlign: 'center', margin: 0 }}>
          © {new Date().getFullYear()} Homevo Atelier. All rights reserved.
        </p>

        <a
          href="https://www.instagram.com/deer_goods"
          target="_blank" rel="noreferrer"
          style={{ color: '#B0A898', transition: 'color 0.2s', marginTop: 4, display: 'flex' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#C4631C')}
          onMouseLeave={e => (e.currentTarget.style.color = '#B0A898')}
        >
          <Instagram size={15} />
        </a>
      </div>
    </footer>
  );
};