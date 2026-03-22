import { useState, useEffect } from 'react';
import { SlidersHorizontal, ArrowRight, Search } from 'lucide-react';
import { getPGs, getFavorites } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PGCard from '../components/PGCard';
import SkeletonCard from '../components/SkeletonCard';
import BookingModal from '../components/BookingModal';
import SearchBar from '../components/SearchBar';
import FilterDrawer from '../components/FilterDrawer';

export default function Home() {
  const { user } = useAuth();
  const [allPGs, setAllPGs] = useState([]);
  const [filteredPGs, setFilteredPGs] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({ location: '', budget: 20000, type: '', sharing: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Booking modal
  const [booking, setBooking] = useState({ isOpen: false, pgId: null, pgTitle: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pgResult, favResult] = await Promise.all([
          getPGs(),
          user ? getFavorites() : Promise.resolve([])
        ]);
        
        const active = pgResult.filter(p => p.status === 'active');
        setAllPGs(active);
        setFilteredPGs(active);
        setFavIds(favResult.map(f => f.pg_id));
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const applyFilters = (query = searchQuery, currentFilters = filters) => {
    const { location, budget, type, sharing } = currentFilters;
    const q = query.toLowerCase();
    
    const results = allPGs.filter(pg => {
      const matchLoc = !location || pg.city.toLowerCase() === location.toLowerCase() || pg.location.toLowerCase().includes(location.toLowerCase());
      const matchBudget = pg.price <= budget;
      const matchType = !type || pg.type === type;
      const matchSharing = !sharing || pg.sharing_type === sharing;
      const matchSearch = !q || 
                          pg.title.toLowerCase().includes(q) || 
                          pg.location.toLowerCase().includes(q) ||
                          pg.city.toLowerCase().includes(q);
                          
      return matchLoc && matchBudget && matchType && matchSharing && matchSearch;
    });
    
    setFilteredPGs(results);
    setIsFilterOpen(false);
    
    const searchEl = document.getElementById('search');
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters({ ...filters, location: '' });
    applyFilters(query, { ...filters, location: '' });
  };

  const activeFilterCount = [
    filters.location ? 1 : 0,
    filters.budget < 20000 ? 1 : 0,
    filters.type ? 1 : 0,
    filters.sharing ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const uniqueCities = [...new Set(allPGs.map(pg => pg.city.trim()))].filter(Boolean);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="badge">Premium PG Aggregator <ArrowRight size={14} style={{marginLeft:'0.25rem'}}/></div>
          <h1>Find Your Perfect <br/><span style={{color: 'var(--primary)'}}>Second Home</span></h1>
          <p>Discover handpicked paying guest accommodations with premium amenities, verified owners, and transparent pricing in top cities.</p>
          
          <SearchBar activePGs={allPGs} onSearch={handleSearch} />

          <div className="hero-stats">
            <div className="hero-stat-item">
              <strong>15,000+</strong>
              <span>Happy Tenants</span>
            </div>
            <div className="hero-stat-item">
              <strong>500+</strong>
              <span>Verified PGs</span>
            </div>
            <div className="hero-stat-item desktop-only">
              <strong>12+</strong>
              <span>Major Cities</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop" alt="Premium PG Interior" className="hero-image" />
        </div>
      </section>

      <section className="main-content" id="search">
        <div className="section-header">
          <div>
            <h2>Explore Properties</h2>
            <p style={{color: 'var(--text-muted)'}} id="resultsCount">{filteredPGs.length} properties</p>
          </div>
          <button 
            className={`btn ${isFilterOpen ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal size={18} />
            Filters
            {activeFilterCount > 0 && <span className="filter-badge" style={{display:'flex'}}>{activeFilterCount}</span>}
          </button>
        </div>

        <FilterDrawer 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          uniqueCities={uniqueCities}
          onApply={() => applyFilters(searchQuery, filters)}
          onClear={() => {
            const cleared = { location: '', budget: 20000, type: '', sharing: '' };
            setFilters(cleared);
            setSearchQuery('');
            applyFilters('', cleared);
          }}
        />

        <div className="pg-grid" id="mainPgGrid">
          {loading ? (
            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredPGs.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No PGs found</p>
              <p style={{ marginTop: '0.25rem' }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredPGs.map(pg => (
              <PGCard 
                key={pg.id} 
                pg={pg} 
                isFav={favIds.includes(pg.id)}
                onFavToggle={(id, add) => {
                  setFavIds(prev => add ? [...prev, id] : prev.filter(f => f !== id));
                }}
                onBook={(pgId, pgTitle) => setBooking({ isOpen: true, pgId, pgTitle })}
              />
            ))
          )}
        </div>
      </section>

      <BookingModal 
        isOpen={booking.isOpen}
        pgId={booking.pgId}
        pgTitle={booking.pgTitle}
        onClose={() => setBooking({ ...booking, isOpen: false })}
      />
    </>
  );
}
