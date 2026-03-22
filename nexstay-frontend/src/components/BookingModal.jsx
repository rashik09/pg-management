import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { createInquiry } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ pgId, pgTitle, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please sign in to book a property.", "error");
      navigate('/login');
      return;
    }

    setStatus('loading');
    try {
      const success = await createInquiry({
        name,
        phone,
        pgId: parseInt(pgId),
        date: new Date().toISOString().split('T')[0]
      });

      if (success) {
        setStatus('success');
      } else {
        showToast("There was an error sending your inquiry.", "error");
        setStatus('idle');
      }
    } catch (err) {
      showToast("Failed to book property.", "error");
      setStatus('idle');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal">
        <div className="modal-header">
          <h3>Request Booking</h3>
          <button className="close-modal" onClick={handleClose}><X /></button>
        </div>
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle color="#10B981" size={64} style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Inquiry Sent!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We've received your booking request for <strong>{pgTitle}</strong>. 
              The owner will contact you shortly on +91 {phone} to schedule a visit or confirm details.
            </p>
            <button className="btn btn-primary btn-full" onClick={handleClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              You are requesting to book <strong id="bookPgTitleText" style={{ color: 'var(--text-main)' }}>{pgTitle}</strong>. Please provide your contact details.
            </p>
            <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Phone Number</label>
                <input type="tel" className="form-control" placeholder="+91" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            
            <div className="modal-actions">
                <button type="button" className="btn" style={{ background: '#E5E7EB', color: '#374151' }} onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
