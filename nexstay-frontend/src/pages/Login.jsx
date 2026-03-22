import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowRight, Mail, Lock, User, Building } from 'lucide-react';
import { login as loginApi, register as registerApi, forgotPassword } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [role, setRole] = useState('user'); // user, owner
  const [mode, setMode] = useState('login'); // login, register, forgot
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginApi({ email, password, role });
        login(res.token, res.user);
        showToast("Welcome back!", "success");
        navigate(res.user.role === 'owner' ? '/admin' : '/');
      } else if (mode === 'register') {
        await registerApi({ name, email, password, role });
        showToast("Account created successfully. Please sign in.", "success");
        setMode('login');
      } else if (mode === 'forgot') {
        await forgotPassword({ email, role });
        showToast("If an account exists, a reset link has been sent.", "success");
        setMode('login');
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <Link to="/" className="logo" style={{justifyContent: 'center', marginBottom: '2rem'}}>
          <div className="logo-icon-wrap"><Home /></div>
          <span>Nex<span style={{color: 'var(--accent)'}}>Stay</span></span>
        </Link>
        
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1 style={{fontSize: '1.75rem', marginBottom: '0.5rem'}}>
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h1>
          <p style={{color: 'var(--text-muted)'}}>
            {mode === 'login' ? 'Enter your details to access your account' : 
             mode === 'register' ? 'Join thousands of users finding their perfect home' : 
             'Enter your email to receive a reset link'}
          </p>
        </div>

        <div className="role-selector">
          <button className={`role-btn ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')} type="button">
            <User size={18} /> Tenant
          </button>
          <button className={`role-btn ${role === 'owner' ? 'active' : ''}`} onClick={() => setRole('owner')} type="button">
            <Building size={18} /> PG Owner
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input type="text" className="form-control" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label>Password</label>
                {mode === 'login' && (
                  <button type="button" className="btn btn-ghost" style={{padding:0, fontSize:'0.85rem', color:'var(--primary)'}} onClick={() => setMode('forgot')}>
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={18} />
                <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              {mode === 'register' && <small style={{color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block'}}>Must be at least 6 characters</small>}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.875rem'}} disabled={loading}>
            {loading ? 'Processing...' : (
              <>
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                <ArrowRight size={18} style={{marginLeft: '0.5rem'}} />
              </>
            )}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem'}}>
          <span style={{color: 'var(--text-muted)'}}>
            {mode === 'login' ? "Don't have an account? " : mode === 'register' ? "Already have an account? " : "Remember your password? "}
          </span>
          <button type="button" className="btn btn-ghost" style={{padding:0, color:'var(--primary)', fontWeight:600}} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
