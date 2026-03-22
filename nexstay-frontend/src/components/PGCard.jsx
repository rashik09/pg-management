import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Snowflake, Wifi, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addFavorite, removeFavorite } from '../api/client';

export default function PGCard({ pg, isFav, onFavToggle, onBook }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFavToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showToast("Please sign in to save favorites.", "error");
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(pg.id);
        onFavToggle(pg.id, false);
        showToast("Removed from favorites", "success");
      } else {
        await addFavorite(pg.id);
        onFavToggle(pg.id, true);
        showToast("Added to favorites! ❤️", "success");
      }
    } catch (err) {
      showToast("Failed to update favorite status", "error");
    }
  };

  const handleBook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBook(pg.id, pg.title);
  };

  const vacancyClass = pg.vacancies === 0 ? 'full' : '';
  const vacancyText = pg.vacancies === 0 ? 'Full' : `${pg.vacancies} left`;

  return (
    <Link to={`/pg/${pg.id}`} className="pg-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="pg-image">
        <img src={pg.image} alt={pg.title} loading="lazy" />
        <div className="pg-badge">{pg.type}</div>
        <div className={`vacancy-badge ${vacancyClass}`}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
          {vacancyText}
        </div>
      </div>
      <div className="pg-content">
        <h3 className="pg-title">{pg.title}</h3>
        <div className="pg-location"><MapPin size={16} /> {pg.location}, {pg.city}</div>
        
        <div className="pg-amenities">
          <span className="amenity"><Bed size={14} /> {pg.sharing_type}</span>
          <span className="amenity"><Bath size={14} /> {pg.bathroom_type}</span>
          {pg.has_ac && <span className="amenity"><Snowflake size={14} /> AC</span>}
          {pg.has_wifi && <span className="amenity"><Wifi size={14} /> WiFi</span>}
          {pg.has_hot_water && <span className="amenity"><Flame size={14} /> Hot</span>}
        </div>
        
        <div className="pg-footer">
          <div className="pg-price">₹{pg.price?.toLocaleString()}<span>/mo</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user && (
              <button 
                className={`fav-btn ${isFav ? 'fav-active' : ''}`} 
                onClick={handleFavToggle} 
                title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#9CA3AF'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleBook}>Book Now</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
