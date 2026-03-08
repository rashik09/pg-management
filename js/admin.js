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
                <button class="btn btn-primary" onclick="window.openAddPGModal()">
                    <i data-lucide="plus"></i> Add New PG
                </button>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
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
                                <td style="font-weight: 500;">
                                    ${pg.title}
                                    <div style="font-size:0.75rem; color: #10B981; margin-top:0.2rem;">${pg.vacancies} Vacancies Left</div>
                                </td>
                                <td><span style="color: var(--text-muted)">${pg.location}, ${pg.city}</span></td>
                                <td>${pg.type}</td>
                                <td><span style="font-size:0.8rem; color:var(--text-muted);">${pg.sharing_type} • ${pg.bathroom_type}</span></td>
                                <td style="font-weight: 600;">₹${pg.price}</td>
                                <td>
                                    <button class="btn btn-primary-outline btn-sm" onclick="deletePGHandler(${pg.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${pgsList.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No properties found.</td></tr>' : ''}
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

window.openAddPGModal = function() {
    document.getElementById('addPgForm').reset();
    document.getElementById('addPgModal').style.display = 'flex';
}

window.closeAddPGModal = function() {
    document.getElementById('addPgModal').style.display = 'none';
}

window.submitNewPG = async function(e) {
    e.preventDefault();

    // Generate contextual placeholder images
    const pgType = document.getElementById('pgType').value;
    let query = 'apartment';
    if(pgType === 'Boys') query = 'hostel,boys';
    if(pgType === 'Girls') query = 'bedroom,girls';
    if(pgType === 'Co-ed') query = 'coliving';
    
    const randomId = Math.floor(Math.random() * 1000);
    const mainImage = `https://source.unsplash.com/800x600/?${query}&sig=${randomId}`;
    
    // Synthesize up to 5 additional gallery images
    const gallery = Array.from({length: 5}, (_, i) => `https://source.unsplash.com/800x600/?${query},interior&sig=${randomId + i + 1}`);

    const data = {
        title: document.getElementById('pgTitle').value,
        location: document.getElementById('pgLocation').value,
        city: document.getElementById('pgCity').value,
        price: document.getElementById('pgPrice').value,
        type: pgType,
        image: mainImage,
        description: document.getElementById('pgDescription').value,
        gallery: gallery,
        vacancies: document.getElementById('pgVacancies').value,
        sharing_type: document.getElementById('pgSharing').value,
        bathroom_type: document.getElementById('pgBathroom').value,
        has_ac: document.getElementById('pgAc').checked,
        has_wifi: document.getElementById('pgWifi').checked,
        has_hot_water: document.getElementById('pgHotWater').checked
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/pgs', {
            method: 'POST',
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
            alert("Failed to save property. Ensure you are an Admin.");
        }
    } catch(err) {
        alert("Network error.");
    }
}

window.deletePGHandler = async function(id) {
    if(confirm("Are you sure you want to delete this property?")) {
        await deletePG(id);
        renderView('manage');
    }
}

window.markContacted = async function(id) {
    await updateInquiryStatus(id);
    renderView('inquiries');
}
