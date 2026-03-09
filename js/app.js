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
        } else {
            navLinks.innerHTML += `<a href="dashboard.html" class="btn btn-primary-outline">My Bookings</a>`;
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

    // 1. Initial Load of all active PGs
    const allPGs = await getPGs();
    const activePGs = allPGs.filter(p => p.status === 'active');
    
    // Render all to main search grid initially
    renderPGs(activePGs, 'mainPgGrid');
    
    // Update count
    const countEl = document.getElementById('resultsCount');
    if(countEl) countEl.textContent = `Showing ${activePGs.length} properties`;

    // 2. Setup Advanced Filtering Logic
    setupFilters(activePGs);
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

function setupFilters(allPGs) {
    const applyBtn = document.getElementById('applyFiltersBtn');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const budgetSlider = document.getElementById('filterBudget');
    const budgetDisplay = document.getElementById('budgetDisplay');
    const resultsCount = document.getElementById('resultsCount');
    const gridId = 'mainPgGrid';

    // Top Header Search integration (Quick search)
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if(!applyBtn || !allPGs) return;

    // Live update the budget slider display text
    budgetSlider.addEventListener('input', (e) => {
        budgetDisplay.textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
    });

    // Core Filtering Engine
    function applyFilters(searchQuery = "") {
        const location = document.getElementById('filterLocation').value.toLowerCase();
        const maxBudget = parseInt(budgetSlider.value);
        const type = document.getElementById('filterType').value;
        const sharing = document.getElementById('filterSharing').value;

        const filtered = allPGs.filter(pg => {
            // Check individual constraints
            const matchLoc = !location || pg.city.toLowerCase() === location || pg.location.toLowerCase().includes(location);
            const matchBudget = pg.price <= maxBudget;
            const matchType = !type || pg.type === type;
            const matchSharing = !sharing || pg.sharing_type === sharing;
            const matchSearch = !searchQuery || 
                                pg.title.toLowerCase().includes(searchQuery) || 
                                pg.location.toLowerCase().includes(searchQuery) ||
                                pg.city.toLowerCase().includes(searchQuery);

            return matchLoc && matchBudget && matchType && matchSharing && matchSearch;
        });

        // Render Results
        renderPGs(filtered, gridId);
        if(resultsCount) resultsCount.textContent = `Showing ${filtered.length} properties`;
        
        // Scroll down to results smoothly
        document.getElementById('search').scrollIntoView({behavior: 'smooth'});
    }

    // Attach to Apply Filter click
    applyBtn.addEventListener('click', () => applyFilters());

    // Attach to clear filter click
    clearBtn.addEventListener('click', () => {
        document.getElementById('filterLocation').value = "";
        budgetSlider.value = 20000;
        budgetDisplay.textContent = "₹20,000";
        document.getElementById('filterType').value = "";
        document.getElementById('filterSharing').value = "";
        if(searchInput) searchInput.value = "";
        applyFilters();
    });

    // Quick Search integration into Advanced Grid
    if(searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.toLowerCase().trim();
            document.getElementById('filterLocation').value = ""; // Clear explicit dropdown to allow search to override
            applyFilters(query);
        });
        
        // Trigger on Enter Key
        searchInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                if (document.getElementById('autocompleteDropdown')) document.getElementById('autocompleteDropdown').style.display = 'none';
                searchBtn.click();
            }
        });

        // Autocomplete Logic
        const autocompleteDropdown = document.getElementById('autocompleteDropdown');
        const uniqueCities = [...new Set(allPGs.map(pg => pg.city.trim()))].filter(Boolean);

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            autocompleteDropdown.innerHTML = '';
            if (!val) {
                autocompleteDropdown.style.display = 'none';
                return;
            }

            const matches = uniqueCities.filter(c => c.toLowerCase().includes(val));
            
            if (matches.length > 0) {
                matches.forEach(city => {
                    const div = document.createElement('div');
                    div.style.padding = '0.75rem 1rem';
                    div.style.cursor = 'pointer';
                    div.style.borderBottom = '1px solid var(--border)';
                    div.style.color = 'var(--text-main)';
                    div.innerHTML = `<i data-lucide="map-pin" style="width:16px; height:16px; margin-right:0.5rem; color:var(--text-muted); vertical-align:middle;"></i>${city}`;
                    
                    div.onmouseover = () => div.style.background = 'var(--bg-light)';
                    div.onmouseout = () => div.style.background = 'white';
                    
                    div.onclick = () => {
                        searchInput.value = city;
                        autocompleteDropdown.style.display = 'none';
                        
                        // Sync with sidebar filter if possible
                        const filterLoc = document.getElementById('filterLocation');
                        let optionExists = Array.from(filterLoc.options).some(opt => opt.value.toLowerCase() === city.toLowerCase());
                        if (optionExists) {
                            filterLoc.value = Array.from(filterLoc.options).find(opt => opt.value.toLowerCase() === city.toLowerCase()).value;
                            applyFilters();
                        } else {
                            filterLoc.value = ""; // clear restrictive sidebar if not matching exactly
                            applyFilters(city.toLowerCase());
                        }
                    };
                    autocompleteDropdown.appendChild(div);
                });
                autocompleteDropdown.style.display = 'block';
                if(window.lucide) lucide.createIcons();
            } else {
                autocompleteDropdown.style.display = 'none';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (autocompleteDropdown && !searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
                autocompleteDropdown.style.display = 'none';
            }
        });
    }

    // Geolocation Logic
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                window.showToast("Geolocation is not supported by your browser", "error");
                return;
            }

            locationBtn.innerHTML = `<i data-lucide="loader-2" style="width: 20px; height: 20px; animation: spin 1s linear infinite;"></i>`;
            if(window.lucide) lucide.createIcons();

            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    
                    const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
                    
                    if (city) {
                        searchInput.value = city;
                        window.showToast(`Location detected: ${city}`, "success");
                        
                        const filterLoc = document.getElementById('filterLocation');
                        let optionExists = Array.from(filterLoc.options).some(opt => opt.value.toLowerCase() === city.toLowerCase());
                        if (optionExists) {
                            filterLoc.value = Array.from(filterLoc.options).find(opt => opt.value.toLowerCase() === city.toLowerCase()).value;
                            applyFilters();
                        } else {
                            filterLoc.value = "";
                            applyFilters(city.toLowerCase());
                        }
                    } else {
                        window.showToast("Could not determine city from location", "error");
                    }
                } catch(e) {
                    console.error("Geocoding error", e);
                    window.showToast("Failed to fetch location details", "error");
                } finally {
                    locationBtn.innerHTML = `<i data-lucide="locate" style="width: 20px; height: 20px;"></i>`;
                    if(window.lucide) lucide.createIcons();
                }
            }, (error) => {
                window.showToast("Location access denied or unavailable", "error");
                locationBtn.innerHTML = `<i data-lucide="locate" style="width: 20px; height: 20px;"></i>`;
                if(window.lucide) lucide.createIcons();
            });
        });
    }
}

window.bookRoom = function(pgId, pgTitle) {
    if(!localStorage.getItem('auth_token')) {
        window.showToast("Please sign in or register to book a property.", "error", "login.html");
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
        window.showToast("There was an error sending your inquiry. Please ensure the backend is running.", "error");
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
