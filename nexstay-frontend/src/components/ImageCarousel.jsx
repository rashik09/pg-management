import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const changeSlide = (dir) => {
    setCurrent((prev) => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <div className="pg-carousel" style={{ position: 'relative', width: '100%', height: 'clamp(300px, 45vh, 480px)', marginTop: '1.5rem', borderRadius: '16px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img 
        src={images[current]} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }} 
        alt={`${title} - image ${current + 1}`} 
      />
      
      {images.length > 1 && (
        <>
          <button onClick={() => changeSlide(-1)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)', transition: 'background 0.2s', zIndex: 10 }}>
            <ChevronLeft color="var(--text-main)" />
          </button>
          <button onClick={() => changeSlide(1)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)', transition: 'background 0.2s', zIndex: 10 }}>
            <ChevronRight color="var(--text-main)" />
          </button>
          <div style={{ position: 'absolute', bottom: '1rem', right: '1.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500, zIndex: 10 }}>
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
