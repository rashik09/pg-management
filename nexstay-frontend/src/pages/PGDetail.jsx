import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Snowflake, Flame, Wifi, ShieldCheck, Sparkles } from 'lucide-react';
import { getPGById } from '../api/client';
import ImageCarousel from '../components/ImageCarousel';
import BookingModal from '../components/BookingModal';

export default function PGDetail() {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    getPGById(id)
      .then(data => setPg(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{padding: '6rem 2rem', textAlign: 'center'}}><h2 style={{color: 'var(--text-muted)'}}>Loading Property Details...</h2></div>;
  if (error || !pg) return <div style={{padding: '6rem 2rem', textAlign: 'center'}}><h2>Property Not Found</h2></div>;

  const images = [pg.image, ...(pg.gallery || [])];

  return (
    <>
      <div className="container" style={{paddingTop: '6rem'}}>
        <ImageCarousel images={images} title={pg.title} />

        <div className="pg-content-layout">
          <div className="pg-details">
            <div style={{ marginBottom: '2rem' }}>
              <h1>{pg.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <MapPin size={18} /> {pg.location}, {pg.city}
              </div>
            </div>
            
            <div className="pg-meta-list">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> {pg.type}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bed size={18} /> {pg.sharing_type}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bath size={18} /> {pg.bathroom_type} Bathroom</div>
            </div>

            <div className="pg-description" style={{ marginTop: '2rem' }}>
              <h3>About this Property</h3>
              <p style={{ marginTop: '1rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>{pg.description}</p>
            </div>

            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Top Amenities</h3>
              <div className="amenities-grid">
                {pg.has_ac && <div className="amenity-item"><Snowflake size={20} /> Air Conditioning</div>}
                {pg.has_wifi && <div className="amenity-item"><Wifi size={20} /> High-Speed WiFi</div>}
                {pg.has_hot_water && <div className="amenity-item"><Flame size={20} /> Hot Water (24/7)</div>}
                <div className="amenity-item"><ShieldCheck size={20} /> Security Cameras</div>
                <div className="amenity-item"><Sparkles size={20} /> Daily Housekeeping</div>
              </div>
            </div>
          </div>

          <div className="pg-booking-sidebar">
            <div className="booking-card">
              <div className="price-huge">₹{pg.price?.toLocaleString()}<span>/month</span></div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Deposit and terms apply.</p>
              
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600 }}>
                <Users size={18} /> Only {pg.vacancies} spots left!
              </div>

              <button 
                className="btn btn-primary btn-full" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }} 
                onClick={() => setIsBookingOpen(true)}
              >
                Request to Book
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen}
        pgId={pg.id}
        pgTitle={pg.title}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}
