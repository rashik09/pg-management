import { useState, useEffect } from 'react';
import { SlidersHorizontal, ArrowRight, Search, ChevronDown } from 'lucide-react';
import { getPGs, getFavorites } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PGCard from '../components/PGCard';
import SkeletonCard from '../components/SkeletonCard';
import BookingModal from '../components/BookingModal';
import SearchBar from '../components/SearchBar';
import FilterDrawer from '../components/FilterDrawer';

export default function Home() {
  const { user } = useAuth();
  
  // Data state
  const [allPGs, setAllPGs] = useState([]);
  const [filteredPGs, setFilteredPGs] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Sorting state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id,desc');
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({ location: '', budget: 20000, type: '', sharing: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Booking modal
  const [booking, setBooking] = useState({ isOpen: false, pgId: null, pgTitle: '' });

  // Determine if filters are active
  const hasActiveFilters = searchQuery || filters.location || filters.budget < 20000 || filters.type || filters.sharing;
  // If filtering, we fetch all (size=1000) so client-side filter works across all data. Otherwise use lazy loading (size=6)
  const fetchSize = hasActiveFilters ? 1000 : 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (page === 0) setLoading(true); else setLoadingMore(true);
        
        const [pgResult, favResult] = await Promise.all([
          getPGs(page, fetchSize, sortBy),
          user && page === 0 ? getFavorites() : Promise.resolve([])
        ]);
        
        const active = (pgResult.content || pgResult).filter(p => p.status === 'active');
        
        if (page === 0) {
          setAllPGs(active);
        } else {
          setAllPGs(prev => {
              // Ensure no duplicates just in case
              const existingIds = new Set(prev.map(p => p.id));
              const uniqueNew = active.filter(p => !existingIds.has(p.id));
              return [...prev, ...uniqueNew];
          });
        }
        
        setTotalPages(pgResult.totalPages || 1);
        if (page === 0 && user) setFavIds(favResult.map(f => f.pg_id));
        
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchData();
  }, [user, page, sortBy, fetchSize]);

  // Apply filters whenever allPGs or filter criteria changes
  useEffect(() => {
    const applyFiltersLocal = () => {
      const { location, budget, type, sharing } = filters;
      const q = searchQuery.toLowerCase();
      
      const results = allPGs.filter(pg => {
        const matchLoc = !location || pg.city?.toLowerCase() === location.toLowerCase() || pg.location?.toLowerCase().includes(location.toLowerCase());
        const matchBudget = pg.price <= budget;
        const matchType = !type || pg.type === type;
        const matchSharing = !sharing || pg.sharing_type === sharing;
        const matchSearch = !q || 
                            pg.title?.toLowerCase().includes(q) || 
                            pg.location?.toLowerCase().includes(q) ||
                            pg.city?.toLowerCase().includes(q);
                            
        return matchLoc && matchBudget && matchType && matchSharing && matchSearch;
      });
      
      setFilteredPGs(results);
    };
    
    applyFiltersLocal();
  }, [allPGs, filters, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters({ ...filters, location: '' });
    setPage(0); // Reset page on new search
    
    // Scroll to results
    const searchEl = document.getElementById('search');
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeFilterCount = [
    filters.location ? 1 : 0,
    filters.budget < 20000 ? 1 : 0,
    filters.type ? 1 : 0,
    filters.sharing ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const uniqueCities = ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Gurugram', 'Noida'];

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
        <div className="section-header" style={{alignItems: 'end'}}>
          <div>
            <h2>Explore Properties</h2>
            <p style={{color: 'var(--text-muted)'}} id="resultsCount">{filteredPGs.length} properties</p>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            
            {/* Sort Dropdown */}
            <div className="sort-wrapper" style={{position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '99px', padding: '0.5rem 1rem'}}>
              <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem'}}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                style={{appearance: 'none', background: 'transparent', border: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', paddingRight: '1.5rem', cursor: 'pointer', outline: 'none'}}
              >
                <option value="id,desc">Recommended (Newest)</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="vacancies,desc">Highest Vacancies</option>
              </select>
              <ChevronDown size={14} style={{position: 'absolute', right: '1rem', pointerEvents: 'none'}} />
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
        </div>

        <FilterDrawer 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          uniqueCities={uniqueCities}
          onApply={() => { setPage(0); setIsFilterOpen(false); }}
          onClear={() => {
            const cleared = { location: '', budget: 20000, type: '', sharing: '' };
            setFilters(cleared);
            setSearchQuery('');
            setPage(0);
          }}
        />

        <div className="pg-grid" id="mainPgGrid">
          {loading && page === 0 ? (
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

        {/* Load More Button */}
        {!hasActiveFilters && page < totalPages - 1 && (
            <div style={{textAlign: 'center', marginTop: '3rem'}}>
              <button 
                className="btn btn-primary-outline" 
                style={{padding: '0.75rem 2rem'}}
                onClick={() => setPage(page + 1)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Properties'}
              </button>
            </div>
        )}
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
