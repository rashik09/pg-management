import { useState, useEffect } from 'react';
import { Heart, Clock, CheckCircle } from 'lucide-react';
import { getUserInquiries, getFavorites } from '../api/client';
import PGCard from '../components/PGCard';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [inquiries, setInquiries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inqRes, favRes] = await Promise.all([
          getUserInquiries(),
          getFavorites()
        ]);
        setInquiries(inqRes);
        setFavorites(favRes);
      } catch (err) {
        showToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleFavToggle = (id, add) => {
    if (!add) {
      setFavorites(prev => prev.filter(f => f.pg_id !== id));
    }
  };

  return (
    <div className="container" style={{paddingTop: '6rem', minHeight: '80vh'}}>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>My Dashboard</h2>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          My Bookings
        </div>
        <div className={`tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
          Saved Properties
        </div>
      </div>

      <div className="tab-content" style={{ marginTop: '2rem' }}>
        {loading ? (
          <div className="pg-grid">
            {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : activeTab === 'bookings' ? (
          <div>
            {inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No bookings yet</p>
                <p style={{ marginTop: '0.25rem' }}>When you request to book a PG, it will appear here.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{inq.pg_title || `PG ID: ${inq.pgId}`}</td>
                        <td><span style={{ color: 'var(--text-muted)' }}>{inq.date}</span></td>
                        <td>
                          <span className={`badge-status ${inq.status === 'contacted' ? 'status-active' : 'status-inactive'}`}>
                            {inq.status === 'contacted' ? <CheckCircle size={14} style={{ marginRight: '4px' }}/> : <Clock size={14} style={{ marginRight: '4px' }}/>}
                            {inq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="pg-grid">
            {favorites.length === 0 ? (
               <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No saved properties</p>
                <p style={{ marginTop: '0.25rem' }}>Tap the heart on properties you like to save them here.</p>
              </div>
            ) : (
              favorites.map(fav => (
                <PGCard 
                  key={fav.pg_id} 
                  pg={{...fav, id: fav.pg_id}} 
                  isFav={true} 
                  onFavToggle={handleFavToggle}
                  onBook={(id, title) => {
                    window.location.href = `/pg/${id}`;
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
