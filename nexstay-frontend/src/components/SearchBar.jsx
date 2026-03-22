import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Locate, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SearchBar({ activePGs, onSearch }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const dropdownRef = useRef(null);
  const { showToast } = useToast();

  const uniqueCities = [...new Set(activePGs.map(pg => pg.city.trim()))].filter(Boolean);
  const matches = query ? uniqueCities.filter(c => c.toLowerCase().includes(query.toLowerCase())) : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchVal) => {
    setShowDropdown(false);
    onSearch(searchVal);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
        
        if (city) {
          setQuery(city);
          showToast(`Location detected: ${city}`, "success");
          handleSearchSubmit(city);
        } else {
          showToast("Could not determine city from location", "error");
        }
      } catch(e) {
        showToast("Failed to fetch location details", "error");
      } finally {
        setLocating(false);
      }
    }, () => {
      showToast("Location access denied or unavailable", "error");
      setLocating(false);
    });
  };

  return (
    <div className="search-bar" ref={dropdownRef}>
      <div className="search-input-wrap" style={{ position: 'relative', flex: 1 }}>
        <MapPin className="search-icon" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit(query);
          }}
          placeholder="Search for a city, locality or PG name..." 
        />
        
        {showDropdown && matches.length > 0 && (
          <div className="autocomplete-dropdown" style={{ display: 'block' }}>
            {matches.map(city => (
              <div 
                key={city}
                style={{
                  padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', 
                  color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg)'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
                onClick={() => {
                  setQuery(city);
                  handleSearchSubmit(city);
                }}
              >
                <MapPin size={14} color="var(--primary)" /> {city}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="location-btn" onClick={handleGeolocation} title="Use my current location">
          {locating ? <Loader2 className="spinner" size={18} /> : <Locate size={18} />}
        </button>
        <button className="btn btn-primary" onClick={() => handleSearchSubmit(query)}>
          Search
        </button>
      </div>
    </div>
  );
}
