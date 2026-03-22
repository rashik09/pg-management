import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, count, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ color: '#EF4444', marginBottom: '1rem' }}>
            <AlertTriangle size={48} strokeWidth={1.5} style={{ margin: '0 auto' }} />
        </div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Confirm Deletion</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Are you sure you want to delete {count === 1 ? 'this property' : `these ${count} properties`}? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn" style={{ background: '#E5E7EB', color: '#374151' }} onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444' }} onClick={onConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
        </div>
      </div>
    </div>
  );
}
