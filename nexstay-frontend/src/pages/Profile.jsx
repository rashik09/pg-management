import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Heart, Settings, User as UserIcon, Building, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, isOwner, logout } = useAuth();

  if (!user) return <div style={{paddingTop:'6rem', textAlign:'center'}}><h2>Please sign in</h2></div>;

  return (
    <div className="container" style={{paddingTop: '6rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh'}}>
        <div className="profile-hero" style={{background: 'linear-gradient(135deg, var(--primary) 0%, #A29BFE 100%)', borderRadius: 'var(--radius)', padding: '3rem 2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: 'var(--shadow-lg)'}}>
            <div className="profile-avatar-large" style={{width: '100px', height: '100px', borderRadius: '50%', background: 'white', color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'}}>
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 style={{fontSize: '2rem', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>{user.name}</h1>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center', opacity: 0.9}}>
                    <span>{user.email}</span>
                    <span className="profile-badge" style={{background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backdropFilter: 'blur(4px)'}}>
                        {isOwner ? <Building size={14} /> : <UserIcon size={14} />}
                        {isOwner ? 'PG Owner' : 'Tenant'}
                    </span>
                </div>
            </div>
        </div>

        <div className="profile-stats" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '-2rem', padding: '0 1rem', position: 'relative', zIndex: 10}}>
            <div className="stat-card glass" style={{background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem'}}>{user.stats?.total_inquiries || 0}</div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500}}>
                  {isOwner ? 'Total Inquiries Received' : 'Inquiries Made'}
                </div>
            </div>
            <div className="stat-card glass" style={{background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 800, color: '#10B981', marginBottom: '0.25rem'}}>
                  {isOwner ? (user.stats?.pgs_posted || 0) : (user.stats?.pgs_contacted || 0)}
                </div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500}}>
                  {isOwner ? 'Properties Listed' : 'Properties Contacted'}
                </div>
            </div>
        </div>

        <div className="profile-content" style={{marginTop: '3rem', display: 'grid', gap: '2rem', gridTemplateColumns: '1fr'}}>
            <div className="info-card" style={{background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)'}}>
                <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Settings size={20} className="text-primary" /> Account Details</h3>
                <div className="info-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                    <div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Full Name</div>
                        <div style={{fontWeight: 500}}>{user.name}</div>
                    </div>
                    <div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Email Address</div>
                        <div style={{fontWeight: 500}}>{user.email}</div>
                    </div>
                    <div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Account Type</div>
                        <div style={{fontWeight: 500, textTransform: 'capitalize'}}>{user.role}</div>
                    </div>
                    <div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Security</div>
                        <div style={{fontWeight: 500, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Shield size={14} /> Password protected</div>
                    </div>
                </div>
            </div>

            <div className="actions-card" style={{background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)'}}>
                <h3 style={{marginBottom: '1.5rem'}}>Quick Actions</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {isOwner ? (
                       <Link to="/admin" className="btn btn-primary-outline" style={{justifyContent: 'flex-start', padding: '1rem'}}><LayoutDashboard size={18} /> Owner Dashboard</Link>
                    ) : (
                       <Link to="/dashboard" className="btn btn-primary-outline" style={{justifyContent: 'flex-start', padding: '1rem'}}><Heart size={18} /> My Saved Properties</Link>
                    )}
                    <button className="btn" style={{justifyContent: 'flex-start', padding: '1rem', background: '#FEE2E2', color: '#EF4444'}} onClick={logout}><LogOut size={18} /> Sign Out</button>
                </div>
            </div>
        </div>
    </div>
  );
}
