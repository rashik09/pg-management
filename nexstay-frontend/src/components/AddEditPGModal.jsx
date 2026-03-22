import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { uploadImage, createPG, updatePG, getPGById } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AddEditPGModal({ isOpen, onClose, pgId, onSave }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '', location: '', city: '', price: '', type: 'Boys',
    vacancies: 1, sharing_type: '1 Sharing', bathroom_type: 'Attached',
    description: '', has_ac: false, has_wifi: false, has_hot_water: false
  });
  
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  useEffect(() => {
    if (isOpen && pgId) {
      getPGById(pgId).then(data => {
        setFormData({
          title: data.title, location: data.location, city: data.city,
          price: data.price, type: data.type, vacancies: data.vacancies,
          sharing_type: data.sharing_type, bathroom_type: data.bathroom_type,
          description: data.description, has_ac: data.has_ac,
          has_wifi: data.has_wifi, has_hot_water: data.has_hot_water
        });
      }).catch(() => showToast("Failed to fetch property details", "error"));
    } else {
      setFormData({
        title: '', location: '', city: '', price: '', type: 'Boys',
        vacancies: 1, sharing_type: '1 Sharing', bathroom_type: 'Attached',
        description: '', has_ac: false, has_wifi: false, has_hot_water: false
      });
      setCoverFile(null);
      setGalleryFiles([]);
    }
  }, [isOpen, pgId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImage = '';
      let galleryUrls = [];

      if (coverFile) {
        const res = await uploadImage(coverFile);
        mainImage = res.url;
      }
      if (galleryFiles.length > 0) {
        for (let i=0; i<galleryFiles.length; i++) {
          const res = await uploadImage(galleryFiles[i]);
          galleryUrls.push(res.url);
        }
      }

      const payload = { ...formData, price: Number(formData.price), vacancies: Number(formData.vacancies) };
      if (mainImage) payload.image = mainImage;
      if (galleryUrls.length > 0) payload.gallery = galleryUrls;

      if (pgId) {
        await updatePG(pgId, payload);
        showToast("Property updated successfully", "success");
      } else {
        await createPG(payload);
        showToast("Property created successfully", "success");
      }
      onSave();
    } catch (err) {
      showToast("Failed to save property", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>{pgId ? 'Edit Property' : 'Add New Property'}</h3>
          <button type="button" className="close-modal" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property Name</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Primary Image Cover {!pgId && '(Required)'}</label>
              <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.webp" onChange={e => setCoverFile(e.target.files[0])} required={!pgId} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Gallery Images (Upload multiple)</label>
              <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.webp" multiple onChange={e => setGalleryFiles(e.target.files)} required={!pgId} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <div className="form-group">
                  <label>Location Area</label>
                  <input type="text" className="form-control" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-control" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
              </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem'}}>
              <div className="form-group">
                  <label>Rent Price (₹)</label>
                  <input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="form-group">
                  <label>Tenant Type</label>
                  <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                      <option value="Co-ed">Co-ed</option>
                  </select>
              </div>
              <div className="form-group">
                  <label>Vacancies</label>
                  <input type="number" className="form-control" min="0" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: e.target.value})} required />
              </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <div className="form-group">
                  <label>Sharing</label>
                  <select className="form-control" value={formData.sharing_type} onChange={e => setFormData({...formData, sharing_type: e.target.value})} required>
                      <option value="1 Sharing">1 Sharing</option>
                      <option value="2 Sharing">2 Sharing</option>
                      <option value="3 Sharing">3 Sharing</option>
                      <option value="4+ Sharing">4+ Sharing</option>
                  </select>
              </div>
              <div className="form-group">
                  <label>Bathroom</label>
                  <select className="form-control" value={formData.bathroom_type} onChange={e => setFormData({...formData, bathroom_type: e.target.value})} required>
                      <option value="Attached">Attached</option>
                      <option value="Common">Common</option>
                  </select>
              </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Description</label>
              <textarea className="form-control" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Amenities</label>
              <div style={{display:'flex', gap:'1.5rem', marginTop:'0.5rem'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><input type="checkbox" checked={formData.has_ac} onChange={e => setFormData({...formData, has_ac: e.target.checked})} /> AC</label>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><input type="checkbox" checked={formData.has_wifi} onChange={e => setFormData({...formData, has_wifi: e.target.checked})} /> WiFi</label>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><input type="checkbox" checked={formData.has_hot_water} onChange={e => setFormData({...formData, has_hot_water: e.target.checked})} /> Hot Water</label>
              </div>
          </div>

          <div className="modal-actions">
              <button type="button" className="btn" style={{ background: '#E5E7EB', color: '#374151' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Property'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
