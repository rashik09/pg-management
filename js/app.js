// app.js
document.addEventListener('DOMContentLoaded', async () => {
    // Auth UI Updates
    const navLinks = document.getElementById('navLinks');
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');

    if(token) {
        if(role === 'owner') {
            navLinks.innerHTML += `<a href="admin.html" class="btn btn-primary-outline">Dashboard</a>`;
        }
        navLinks.innerHTML += `
            <div style="display:flex; align-items:center; gap:1rem; margin-left: 1rem;">
                <span style="font-weight:600; color:var(--text-main);">Hi, ${name}</span>
                <button class="btn btn-primary-outline" style="padding:0.25rem 0.75rem;" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        navLinks.innerHTML += `<a href="login.html" class="btn btn-primary">Sign In</a>`;
    }

    // 1. Fetch & Render Featured PGs
    const allPGs = await getPGs();
    const featured = allPGs.filter(p => p.featured && p.status === 'active');
    renderPGs(featured, 'featuredGrid');

    // 2. Setup Location Detection (OLX Style)
    setupLocation(allPGs);
});

function renderPGs(pgList, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.innerHTML = '';
    
    if(pgList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">No PGs found in this area.</p>';
        return;
    }

    pgList.forEach(pg => {
        // Build specific amenity badges based on boolean traits
        let amsHtml = '';
        if(pg.has_ac) amsHtml += `<span class="amenity"><i data-lucide="sun-snow"></i> AC</span>`;
        if(pg.has_wifi) amsHtml += `<span class="amenity"><i data-lucide="wifi"></i> WiFi</span>`;
        if(pg.has_hot_water) amsHtml += `<span class="amenity"><i data-lucide="flame"></i> Hot Water</span>`;
        if(!pg.has_ac && !pg.has_wifi && !pg.has_hot_water) amsHtml += `<span class="amenity">Basic Amenities</span>`;
        
        const card = document.createElement('div');
        card.className = 'pg-card';
        card.innerHTML = `
            <a href="pg.html?id=${pg.id}" style="text-decoration: none; color: inherit; display: block;">
                <div class="pg-image">
                    <img src="${pg.image}" alt="${pg.title}">
                    <div class="pg-badge">${pg.type}</div>
                </div>
                <div class="pg-content">
                    <div class="pg-price">₹${pg.price}<span>/month</span></div>
                    <h3 class="pg-title">
                        ${pg.title}
                        <span style="font-size:0.75rem; background:#D1FAE5; color:#10B981; padding:0.2rem 0.5rem; border-radius:12px; margin-left:0.5rem;">${pg.vacancies} Spots Left</span>
                    </h3>
                    <div class="pg-location"><i data-lucide="map-pin"></i> ${pg.location}, ${pg.city}</div>
                    
                    <div class="pg-amenities">
                        <span title="Sharing Type"><i data-lucide="bed"></i> ${pg.sharing_type}</span>
                        <span title="Bathroom"><i data-lucide="bath"></i> ${pg.bathroom_type}</span>
                        ${pg.has_ac ? '<span title="AC Available"><i data-lucide="sun-snow"></i> AC</span>' : ''}
                        ${pg.has_wifi ? '<span title="WiFi Available"><i data-lucide="wifi"></i> WiFi</span>' : ''}
                        ${pg.has_hot_water ? '<span title="Hot Water"><i data-lucide="flame"></i> Hot Water</span>' : ''}
                    </div>
                </div>
            </a>
            <div class="pg-footer" style="padding: 1.5rem; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                <span class="pg-type" style="color: var(--text-muted); font-size: 0.9rem;">${pg.type} Only</span>
                <button class="btn btn-primary btn-sm" onclick="bookRoom(${pg.id}, '${pg.title}')">Book Now</button>
            </div>
        `;
        container.appendChild(card);
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function setupLocation(allPGs) {
    const picker = document.getElementById('locationPicker');
    const userLocText = document.getElementById('userLocationText');
    const nearbyName = document.getElementById('nearbyLocationName');
    const nearbyGrid = document.getElementById('nearbyGrid');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    // Simulate Location Fetching (OLX Style)
    setTimeout(() => {
        const defaultCity = "Bangalore"; 
        if(userLocText) userLocText.textContent = defaultCity;
        if(nearbyName) nearbyName.textContent = `in ${defaultCity}`;
        
        const nearby = allPGs.filter(p => p.city === defaultCity && p.status === 'active');
        renderPGs(nearby, 'nearbyGrid');
    }, 1500);

    // Location picker mock interaction
    if(picker) {
        picker.addEventListener('click', async () => {
            const newCity = prompt("Enter your city to find PGs (e.g., Mumbai, Bangalore, Hyderabad):", userLocText.textContent);
            if(newCity && newCity.trim() !== '') {
                userLocText.textContent = newCity.trim();
                nearbyName.textContent = `in ${newCity.trim()}`;
                
                // Fetch fresh PGs to filter
                const freshPGs = await getPGs();
                const nearby = freshPGs.filter(p => p.city.toLowerCase() === newCity.trim().toLowerCase() && p.status === 'active');
                renderPGs(nearby, 'nearbyGrid');
                document.getElementById('nearbySection').scrollIntoView({behavior: 'smooth'});
            }
        });
    }

    // Search functionality
    if(searchBtn && searchInput) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.toLowerCase();
            if(query) {
                nearbyName.textContent = `matching "${query}"`;
                const freshPGs = await getPGs();
                const results = freshPGs.filter(p => 
                    p.status === 'active' && 
                    (p.title.toLowerCase().includes(query) || 
                     p.location.toLowerCase().includes(query) || 
                     p.city.toLowerCase().includes(query))
                );
                renderPGs(results, 'nearbyGrid');
                document.getElementById('nearbySection').scrollIntoView({behavior: 'smooth'});
            }
        });
    }
}

window.bookRoom = function(pgId, pgTitle) {
    if(!localStorage.getItem('auth_token')) {
        alert("Please sign in or register to book a property.");
        window.location.href = 'login.html';
        return;
    }
    
    // Reset Modal State
    document.getElementById('bookFormContainer').style.display = 'block';
    document.getElementById('bookSuccessContainer').style.display = 'none';
    document.getElementById('bookForm').reset();
    
    // Set Data
    document.getElementById('bookPgTitleText').textContent = pgTitle;
    document.getElementById('bookPgId').value = pgId;
    
    // Show Modal
    document.getElementById('bookModal').style.display = 'flex';
}

window.closeBookModal = function() {
    document.getElementById('bookModal').style.display = 'none';
}

window.submitBooking = async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('bookSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const success = await createInquiry({
        name: document.getElementById('bookName').value,
        phone: document.getElementById('bookPhone').value,
        pgId: parseInt(document.getElementById('bookPgId').value),
        date: new Date().toISOString().split('T')[0]
    });

    if(success) {
        document.getElementById('bookFormContainer').style.display = 'none';
        document.getElementById('bookSuccessContainer').style.display = 'block';
    } else {
        alert("There was an error sending your inquiry. Please ensure the backend is running.");
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry';
}

window.logout = function() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    window.location.reload();
}
