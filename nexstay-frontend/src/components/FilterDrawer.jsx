import { X } from 'lucide-react';

export default function FilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  onApply, 
  onClear,
  uniqueCities 
}) {
  return (
    <div className={`filter-drawer ${isOpen ? 'open' : ''}`}>
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="filter-close" onClick={onClose}><X size={20} /></button>
      </div>

      <div className="filter-group">
        <label>Location/City</label>
        <select 
          className="form-control" 
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        >
          <option value="">All Locations</option>
          {uniqueCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>Max Budget</label>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{filters.budget.toLocaleString()}</span>
        </div>
        <input 
          type="range" 
          min="2000" 
          max="20000" 
          step="500" 
          value={filters.budget} 
          onChange={(e) => setFilters({...filters, budget: parseInt(e.target.value)})}
          style={{ width: '100%', marginTop: '0.5rem' }} 
        />
      </div>

      <div className="filter-group">
        <label>Tenant Type</label>
        <select 
          className="form-control"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">Any</option>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
          <option value="Co-ed">Co-ed</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sharing Type</label>
        <select 
          className="form-control"
          value={filters.sharing}
          onChange={(e) => setFilters({...filters, sharing: e.target.value})}
        >
          <option value="">Any</option>
          <option value="1 Sharing">1 Sharing</option>
          <option value="2 Sharing">2 Sharing</option>
          <option value="3 Sharing">3 Sharing</option>
          <option value="4+ Sharing">4+ Sharing</option>
        </select>
      </div>

      <div className="filter-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn" style={{ flex: 1, background: '#E5E7EB', color: '#374151' }} onClick={onClear}>Clear</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onApply}>Apply Filters</button>
      </div>
    </div>
  );
}
