// admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard
    if(localStorage.getItem('user_role') !== 'owner' || !localStorage.getItem('auth_token')) {
        window.location.href = 'login.html';
        return;
    }

    const tabs = ['dashboard', 'manage', 'inquiries'];
    
    tabs.forEach(tab => {
        const el = document.getElementById(`tab-${tab}`);
        if(el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach(t => document.getElementById(`tab-${t}`).classList.remove('active'));
                el.classList.add('active');
                renderView(tab);
            });
        }
    });

    // Setup Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
            window.location.href = 'login.html';
        });
    }

    // Render default view
    renderView('dashboard');
});

async function renderView(view) {
    const content = document.getElementById('adminContent');
    content.innerHTML = '<p style="color: var(--text-muted); text-align:center;">Loading Data...</p>';

    const pgsList = await getPGs();
    const allInquiries = await getInquiries();

    if(view === 'dashboard') {
        const activePGs = pgsList.filter(p => p.status === 'active').length;
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i data-lucide="building-2"></i></div>
                    <div class="stat-info">
                        <h3>Total Properties</h3>
                        <p>${pgsList.length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;"><i data-lucide="check-circle"></i></div>
                    <div class="stat-info">
                        <h3>Active PGs</h3>
                        <p>${activePGs}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;"><i data-lucide="message-square"></i></div>
                    <div class="stat-info">
                        <h3>Total Inquiries</h3>
                        <p>${allInquiries.length}</p>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <div class="section-header" style="padding: 1.5rem; margin-bottom: 0;">
                    <h2>Recent Inquiries</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allInquiries.slice(-5).reverse().map(inq => `
                            <tr>
                                <td>${inq.name}</td>
                                <td>${inq.phone}</td>
                                <td><span style="color: var(--text-muted)">${inq.date}</span></td>
                                <td><span class="badge-status ${inq.status === 'contacted' ? 'status-active' : 'status-inactive'}">${inq.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } 
    else if (view === 'manage') {
        content.innerHTML = `
            <div class="section-header" style="margin-bottom: 1.5rem; max-width: 100%; padding: 0;">
                <h2>Manage Properties</h2>
                <div style="display:flex; gap:1rem;">
                    <button class="btn btn-primary-outline" id="bulkDeleteBtn" style="color:#EF4444; border-color:#EF4444; display:none;" onclick="triggerBulkDelete()">
                        <i data-lucide="trash-2"></i> Delete Selected (<span id="selectedCount">0</span>)
                    </button>
                    <button class="btn btn-primary" onclick="window.openAddPGModal()">
                        <i data-lucide="plus"></i> Add New PG
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;"><input type="checkbox" id="selectAllPgs" onchange="toggleAllPgs(this)"></th>
                            <th>Property</th>
                            <th>Location/City</th>
                            <th>Tenants</th>
                            <th>Config</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pgsList.map(pg => `
                            <tr>
                                <td><input type="checkbox" class="pg-checkbox" value="${pg.id}" onchange="updateBulkDeleteBtn()"></td>
                                <td style="font-weight: 500;">
                                    ${pg.title}
                                    <div style="font-size:0.75rem; color: #10B981; margin-top:0.2rem;">${pg.vacancies} Vacancies Left</div>
                                </td>
                                <td><span style="color: var(--text-muted)">${pg.location}, ${pg.city}</span></td>
                                <td>${pg.type}</td>
                                <td><span style="font-size:0.8rem; color:var(--text-muted);">${pg.sharing_type} • ${pg.bathroom_type}</span></td>
                                <td style="font-weight: 600;">₹${pg.price}</td>
                                <td>
                                    <div style="display:flex; gap:0.5rem; align-items:center;">
                                        <button class="btn btn-primary-outline btn-sm" onclick="window.openAddPGModal(${pg.id})">Edit</button>
                                        <button class="btn btn-primary-outline btn-sm" onclick="triggerSingleDelete(${pg.id})" style="color:#EF4444; border-color:#EF4444;">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                        ${pgsList.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No properties found.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    }
    else if (view === 'inquiries') {
        content.innerHTML = `
            <div class="section-header" style="margin-bottom: 1.5rem; max-width: 100%; padding: 0;">
                <h2>All Inquiries</h2>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Lead Name</th>
                            <th>Phone Number</th>
                            <th>Property Ref</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allInquiries.reverse().map(inq => {
                            const pg = pgsList.find(p => p.id === inq.pgId);
                            return `
                            <tr>
                                <td style="font-weight: 500;">${inq.name}</td>
                                <td>${inq.phone}</td>
                                <td>${pg ? pg.title : 'Unknown PG'}</td>
                                <td><span style="color: var(--text-muted)">${inq.date}</span></td>
                                <td><span class="badge-status ${inq.status === 'contacted' ? 'status-active' : 'status-inactive'}">${inq.status}</span></td>
                                <td>
                                    ${inq.status === 'pending' ? 
                                     `<button class="btn btn-primary btn-sm" onclick="markContacted(${inq.id})">Mark Contacted</button>` : 
                                     `<span style="color: var(--text-muted); font-size: 0.875rem;">Done</span>`
                                    }
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    lucide.createIcons();
}

window.editingPgId = null; // Track edit state

window.openAddPGModal = async function(id = null) {
    document.getElementById('addPgForm').reset();
    document.querySelector('#addPgModal .modal-header h3').textContent = id ? 'Edit Property' : 'Add New Property';
    window.editingPgId = id;

    if(id) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/pgs/${id}`);
            if(res.ok) {
                const pg = await res.json();
                document.getElementById('pgTitle').value = pg.title;
                document.getElementById('pgLocation').value = pg.location;
                document.getElementById('pgCity').value = pg.city;
                document.getElementById('pgPrice').value = pg.price;
                document.getElementById('pgType').value = pg.type;
                document.getElementById('pgVacancies').value = pg.vacancies;
                document.getElementById('pgSharing').value = pg.sharing_type;
                document.getElementById('pgBathroom').value = pg.bathroom_type;
                document.getElementById('pgDescription').value = pg.description;
                document.getElementById('pgAc').checked = pg.has_ac;
                document.getElementById('pgWifi').checked = pg.has_wifi;
                document.getElementById('pgHotWater').checked = pg.has_hot_water;
                
                // Keep image files optional during edit.
                document.getElementById('pgImageFile').required = false;
                document.getElementById('pgGalleryFile').required = false;
            }
        } catch(e) { console.error('Error fetching details for edit', e); }
    } else {
        document.getElementById('pgImageFile').required = true;
        document.getElementById('pgGalleryFile').required = true;
    }

    document.getElementById('addPgModal').style.display = 'flex';
}

window.closeAddPGModal = function() {
    document.getElementById('addPgModal').style.display = 'none';
    window.editingPgId = null;
}

window.submitNewPG = async function(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading assets...";

    try {
        let mainImage = '';
        let galleryUrls = [];

        // Upload new images only if provided
        const coverInput = document.getElementById('pgImageFile');
        if(coverInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', coverInput.files[0]);
            
            const req = await fetch('http://127.0.0.1:5000/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                body: formData
            });
            const res = await req.json();
            if(req.ok) mainImage = res.url;
        }

        const galleryInput = document.getElementById('pgGalleryFile');
        if(galleryInput.files.length > 0) {
            submitBtn.textContent = `Uploading ${galleryInput.files.length} gallery images...`;
            for(let i=0; i<galleryInput.files.length; i++) {
                const formData = new FormData();
                formData.append('file', galleryInput.files[i]);
                
                const req = await fetch('http://127.0.0.1:5000/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                    body: formData
                });
                const res = await req.json();
                if(req.ok) galleryUrls.push(res.url);
            }
        }

        submitBtn.textContent = "Saving Database...";

        const data = {
            title: document.getElementById('pgTitle').value,
            location: document.getElementById('pgLocation').value,
            city: document.getElementById('pgCity').value,
            price: document.getElementById('pgPrice').value,
            type: document.getElementById('pgType').value,
            description: document.getElementById('pgDescription').value,
            vacancies: document.getElementById('pgVacancies').value,
            sharing_type: document.getElementById('pgSharing').value,
            bathroom_type: document.getElementById('pgBathroom').value,
            has_ac: document.getElementById('pgAc').checked,
            has_wifi: document.getElementById('pgWifi').checked,
            has_hot_water: document.getElementById('pgHotWater').checked
        };

        // Only attach images to payload if new ones were uploaded
        if(mainImage) data.image = mainImage;
        if(galleryUrls.length > 0) data.gallery = galleryUrls;

        const url = window.editingPgId ? `http://127.0.0.1:5000/api/pgs/${window.editingPgId}` : 'http://127.0.0.1:5000/api/pgs';
        const method = window.editingPgId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(data)
        });
        
        if(response.ok) {
            closeAddPGModal();
            renderView('manage');
        } else {
            window.showToast("Failed to save property.", "error");
        }
    } catch(err) {
        window.showToast("Upload Error: " + err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Property";
    }
}

let pendingDeletions = [];

window.triggerSingleDelete = function(id) {
    pendingDeletions = [id];
    document.getElementById('deleteConfirmText').textContent = "Are you sure you want to delete this property? This action cannot be undone.";
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

window.triggerBulkDelete = function() {
    const checkboxes = document.querySelectorAll('.pg-checkbox:checked');
    pendingDeletions = Array.from(checkboxes).map(cb => parseInt(cb.value));
    document.getElementById('deleteConfirmText').textContent = `Are you sure you want to delete ${pendingDeletions.length} properties? This action cannot be undone.`;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

window.closeDeleteModal = function() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    pendingDeletions = [];
}

window.submitConfirmDelete = async function() {
    if(pendingDeletions.length === 0) return;
    
    const btn = document.getElementById('confirmDeleteBtn');
    const originalText = btn.textContent;
    btn.textContent = "Deleting...";
    btn.disabled = true;

    try {
        const promises = pendingDeletions.map(id => deletePG(id));
        await Promise.all(promises);
        window.showToast(`Successfully deleted ${pendingDeletions.length} properties.`, "success");
    } catch (e) {
        window.showToast("Error during deletion.", "error");
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
    closeDeleteModal();
    renderView('manage');
}

window.toggleAllPgs = function(source) {
    const checkboxes = document.querySelectorAll('.pg-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
    updateBulkDeleteBtn();
}

window.updateBulkDeleteBtn = function() {
    const checked = document.querySelectorAll('.pg-checkbox:checked').length;
    const btn = document.getElementById('bulkDeleteBtn');
    if(btn) {
        if(checked > 0) {
            btn.style.display = 'inline-flex';
            document.getElementById('selectedCount').textContent = checked;
        } else {
            btn.style.display = 'none';
            const masterCheck = document.getElementById('selectAllPgs');
            if(masterCheck) masterCheck.checked = false;
        }
    }
}

window.markContacted = async function(id) {
    await updateInquiryStatus(id);
    renderView('inquiries');
}
