import { useState, useEffect } from 'react';
import { Home, LayoutDashboard, Building2, MessageSquare, LogOut, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPGs, getInquiries, deletePG, updateInquiryStatus } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AddEditPGModal from '../components/AddEditPGModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pgs, setPgs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPgs, setSelectedPgs] = useState([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingPgId, setEditingPgId] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pgRes, inqRes] = await Promise.all([getPGs(0, 1000, 'id,desc'), getInquiries()]);
      setPgs(pgRes.content || pgRes);
      setInquiries(inqRes);
      setSelectedPgs([]);
    } catch (e) {
      showToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPgs(pgs.map(p => p.id));
    } else {
      setSelectedPgs([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedPgs(prev => [...prev, id]);
    } else {
      setSelectedPgs(prev => prev.filter(pId => pId !== id));
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(pendingDeletions.map(id => deletePG(id)));
      showToast(`Successfully deleted ${pendingDeletions.length} properties.`, "success");
      setIsDeleteOpen(false);
      setPendingDeletions([]);
      fetchData();
    } catch (e) {
      showToast("Error during deletion.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const markContacted = async (id) => {
    try {
      await updateInquiryStatus(id);
      fetchData();
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const activePGCount = pgs.filter(p => p.status === 'active').length;

  return (
    <div className="admin-body">
      <aside className="sidebar">
        <div className="sidebar-header">
            <Link to="/" className="logo">
                <Home size={20} />
                <span>NexStay <span className="admin-badge">Admin</span></span>
            </Link>
        </div>
        <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18}/> Dashboard</div>
            <div className={`nav-item ${activeTab==='manage'?'active':''}`} onClick={() => setActiveTab('manage')}><Building2 size={18}/> Manage PGs</div>
            <div className={`nav-item ${activeTab==='inquiries'?'active':''}`} onClick={() => setActiveTab('inquiries')}><MessageSquare size={18}/> Inquiries</div>
        </nav>
        <div className="sidebar-footer">
            <Link to="/" className="nav-item"><Home size={18}/> Client Portal</Link>
            <div className="nav-item" onClick={logout} style={{color: '#EF4444', cursor: 'pointer'}}><LogOut size={18}/> Sign Out</div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header glass">
            <h2>Welcome back, {user?.name || 'Admin'}</h2>
            <div className="admin-profile">
                <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
            </div>
        </header>

        <div className="admin-content">
          {loading ? (
             <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Loading Data...</p>
          ) : activeTab === 'dashboard' ? (
            <>
              <div className="stats-grid">
                  <div className="stat-card">
                      <div className="stat-icon"><Building2 size={24}/></div>
                      <div className="stat-info">
                          <h3>Total Properties</h3>
                          <p>{pgs.length}</p>
                      </div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10B981'}}><CheckCircle size={24} /></div>
                      <div className="stat-info">
                          <h3>Active PGs</h3>
                          <p>{activePGCount}</p>
                      </div>
                  </div>
                  <div className="stat-card">
                      <div className="stat-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B'}}><MessageSquare size={24}/></div>
                      <div className="stat-info">
                          <h3>Total Inquiries</h3>
                          <p>{inquiries.length}</p>
                      </div>
                  </div>
              </div>

              <div className="table-container">
                  <div className="section-header" style={{padding: '1.5rem', marginBottom: 0}}>
                      <h2>Recent Inquiries</h2>
                  </div>
                  <table>
                      <thead><tr><th>Name</th><th>Phone</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                          {inquiries.slice(-5).reverse().map(inq => (
                              <tr key={inq.id}>
                                  <td>{inq.name}</td>
                                  <td>{inq.phone}</td>
                                  <td><span style={{color: 'var(--text-muted)'}}>{inq.date}</span></td>
                                  <td><span className={`badge-status ${inq.status === 'contacted' ? 'status-active' : 'status-inactive'}`}>{inq.status}</span></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </>
          ) : activeTab === 'manage' ? (
            <>
              <div className="section-header" style={{marginBottom: '1.5rem', maxWidth: '100%', padding: 0}}>
                  <h2>Manage Properties</h2>
                  <div style={{display:'flex', gap:'1rem'}}>
                      {selectedPgs.length > 0 && (
                        <button className="btn btn-primary-outline" style={{color:'#EF4444', borderColor:'#EF4444'}} onClick={() => { setPendingDeletions(selectedPgs); setIsDeleteOpen(true); }}>
                            <Trash2 size={16}/> Delete Selected ({selectedPgs.length})
                        </button>
                      )}
                      <button className="btn btn-primary" onClick={() => { setEditingPgId(null); setIsAddEditOpen(true); }}>
                          <Plus size={16}/> Add New PG
                      </button>
                  </div>
              </div>
              
              <div className="table-container">
                  <table>
                      <thead>
                          <tr>
                              <th style={{width: '40px'}}><input type="checkbox" checked={selectedPgs.length === pgs.length && pgs.length > 0} onChange={handleSelectAll} /></th>
                              <th>Property</th>
                              <th>Location/City</th>
                              <th>Tenants</th>
                              <th>Config</th>
                              <th>Price</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {pgs.map(pg => (
                              <tr key={pg.id}>
                                  <td><input type="checkbox" checked={selectedPgs.includes(pg.id)} onChange={(e) => handleSelectOne(pg.id, e.target.checked)} /></td>
                                  <td style={{fontWeight: 500}}>
                                      {pg.title}
                                      <div style={{fontSize:'0.75rem', color: '#10B981', marginTop:'0.2rem'}}>{pg.vacancies} Vacancies Left</div>
                                  </td>
                                  <td><span style={{color: 'var(--text-muted)'}}>{pg.location}, {pg.city}</span></td>
                                  <td>{pg.type}</td>
                                  <td><span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{pg.sharing_type} • {pg.bathroom_type}</span></td>
                                  <td style={{fontWeight: 600}}>₹{pg.price}</td>
                                  <td>
                                      <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                                          <button className="btn btn-primary-outline btn-sm" onClick={() => { setEditingPgId(pg.id); setIsAddEditOpen(true); }}>Edit</button>
                                          <button className="btn btn-primary-outline btn-sm" style={{color:'#EF4444', borderColor:'#EF4444'}} onClick={() => { setPendingDeletions([pg.id]); setIsDeleteOpen(true); }}>Delete</button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {pgs.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No properties found.</td></tr>}
                      </tbody>
                  </table>
              </div>
            </>
          ) : (
             <>
              <div className="section-header" style={{marginBottom: '1.5rem', maxWidth: '100%', padding: 0}}>
                  <h2>All Inquiries</h2>
              </div>
              
              <div className="table-container">
                  <table>
                      <thead><tr><th>Lead Name</th><th>Phone Number</th><th>Property Ref</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                          {inquiries.slice().reverse().map(inq => {
                              const pg = pgs.find(p => p.id === inq.pgId);
                              return (
                              <tr key={inq.id}>
                                  <td style={{fontWeight: 500}}>{inq.name}</td>
                                  <td>{inq.phone}</td>
                                  <td>{pg ? pg.title : 'Unknown PG'}</td>
                                  <td><span style={{color: 'var(--text-muted)'}}>{inq.date}</span></td>
                                  <td><span className={`badge-status ${inq.status === 'contacted' ? 'status-active' : 'status-inactive'}`}>{inq.status}</span></td>
                                  <td>
                                      {inq.status === 'pending' ? 
                                       <button className="btn btn-primary btn-sm" onClick={() => markContacted(inq.id)}>Mark Contacted</button> : 
                                       <span style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Done</span>
                                      }
                                  </td>
                              </tr>
                          )})}
                      </tbody>
                  </table>
              </div>
             </>
          )}
        </div>
      </main>

      <AddEditPGModal isOpen={isAddEditOpen} onClose={() => setIsAddEditOpen(false)} pgId={editingPgId} onSave={() => { setIsAddEditOpen(false); fetchData(); }} />
      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} count={pendingDeletions.length} onConfirm={confirmDelete} loading={isDeleting} />
    </div>
  );
}
