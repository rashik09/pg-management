// app.js
document.addEventListener('DOMContentLoaded', async () => {

    // === Navbar scroll effect ===
    const navbar = document.getElementById('mainNav');
    if(navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
        });
    }

    // === Show skeleton loaders while fetching ===
    showSkeletons('mainPgGrid', 6);

    // Auth UI Updates
    const navLinks = document.getElementById('navLinks');
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');

    if(token) {
        if(role === 'owner') {
            navLinks.innerHTML += `<a href="admin.html" class="nav-link"><i data-lucide="layout-dashboard" style="width:16px;height:16px;"></i> Dashboard</a>`;
        } else {
            navLinks.innerHTML += `<a href="dashboard.html" class="nav-link"><i data-lucide="heart" style="width:16px;height:16px;"></i> My Bookings</a>`;
        }
        navLinks.innerHTML += `
            <div style="display:flex; align-items:center; gap:0.75rem; margin-left: 0.5rem;">
                <div class="user-pill">
                    <div class="user-avatar">${name ? name.charAt(0).toUpperCase() : 'U'}</div>
                    <span>${name || 'User'}</span>
                </div>
                <button class="btn btn-ghost" style="color: var(--text-muted); font-size:0.85rem;" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        navLinks.innerHTML += `<a href="login.html" class="btn btn-primary">Sign In</a>`;
    }

    // 1. Fetch PGs
    const allPGs = await getPGs();
    const activePGs = allPGs.filter(p => p.status === 'active');
    
    // Load user favorites
    let userFavIds = [];
    if(token) {
        const favs = await getFavorites();
        userFavIds = favs.map(f => f.pg_id);
    }
    
    // Render PGs (replaces skeletons)
    renderPGs(activePGs, 'mainPgGrid', userFavIds);
    
    // Update count
    const countEl = document.getElementById('resultsCount');
    if(countEl) countEl.textContent = `${activePGs.length} properties`;

    // 2. Setup Filters
    setupFilters(activePGs, userFavIds);

    // === Dismiss page loader ===
    const loader = document.getElementById('pageLoader');
    if(loader) {
        loader.classList.add('loaded');
        setTimeout(() => loader.remove(), 600);
    }

    // Refresh icons
    if(typeof lucide !== 'undefined') lucide.createIcons();
});

// === Skeleton Loaders ===
function showSkeletons(containerId, count) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    for(let i = 0; i < count; i++) {
        const skel = document.createElement('div');
        skel.className = 'skeleton-card';
        skel.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `;
        container.appendChild(skel);
    }
}

// === Filter Drawer Toggle ===
window.toggleFilterDrawer = function() {
    const drawer = document.getElementById('filterDrawer');
    const btn = document.getElementById('filterToggleBtn');
    if(!drawer || !btn) return;
    drawer.classList.toggle('open');
    btn.classList.toggle('active');
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderPGs(pgList, containerId, favIds = []) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.innerHTML = '';
    const isLoggedIn = !!localStorage.getItem('auth_token');
    
    if(pgList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.3;">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p style="font-size: 1.1rem; font-weight: 500;">No PGs found</p>
                <p style="margin-top: 0.25rem;">Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    pgList.forEach((pg, index) => {
        const isFav = favIds.includes(pg.id);
        const vacancyClass = pg.vacancies === 0 ? 'full' : '';
        const vacancyText = pg.vacancies === 0 ? 'Full' : `${pg.vacancies} left`;
        
        const card = document.createElement('div');
        card.className = 'pg-card';
        card.style.animationDelay = `${index * 0.08}s`;
        
        card.innerHTML = `
            <a href="pg.html?id=${pg.id}" style="text-decoration: none; color: inherit; display: block;">
                <div class="pg-image">
                    <img src="${pg.image}" alt="${pg.title}" loading="lazy">
                    <div class="pg-badge">${pg.type}</div>
                    <div class="vacancy-badge ${vacancyClass}">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                        ${vacancyText}
                    </div>
                </div>
                <div class="pg-content">
                    <h3 class="pg-title">${pg.title}</h3>
                    <div class="pg-location"><i data-lucide="map-pin"></i> ${pg.location}, ${pg.city}</div>
                    
                    <div class="pg-amenities">
                        <span class="amenity"><i data-lucide="bed"></i> ${pg.sharing_type}</span>
                        <span class="amenity"><i data-lucide="bath"></i> ${pg.bathroom_type}</span>
                        ${pg.has_ac ? '<span class="amenity"><i data-lucide="snowflake"></i> AC</span>' : ''}
                        ${pg.has_wifi ? '<span class="amenity"><i data-lucide="wifi"></i> WiFi</span>' : ''}
                        ${pg.has_hot_water ? '<span class="amenity"><i data-lucide="flame"></i> Hot Water</span>' : ''}
                    </div>
                    
                    <div class="pg-footer">
                        <div class="pg-price">₹${pg.price.toLocaleString()}<span>/mo</span></div>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            ${isLoggedIn ? `
                                <button class="fav-btn ${isFav ? 'fav-active' : ''}" onclick="event.preventDefault(); event.stopPropagation(); toggleFavorite(${pg.id}, this)" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? '#EF4444' : 'none'}" stroke="${isFav ? '#EF4444' : '#9CA3AF'}" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                            ` : ''}
                            <button class="btn btn-primary btn-sm" onclick="event.preventDefault(); event.stopPropagation(); bookRoom(${pg.id}, '${pg.title.replace(/'/g, "\\'")}')">Book Now</button>
                        </div>
                    </div>
                </div>
            </a>
        `;
        container.appendChild(card);
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function setupFilters(allPGs, userFavIds = []) {
    const applyBtn = document.getElementById('applyFiltersBtn');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const budgetSlider = document.getElementById('filterBudget');
    const budgetDisplay = document.getElementById('budgetDisplay');
    const resultsCount = document.getElementById('resultsCount');
    const gridId = 'mainPgGrid';

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if(!applyBtn || !allPGs) return;

    budgetSlider.addEventListener('input', (e) => {
        budgetDisplay.textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
    });

    function applyFilters(searchQuery = "") {
        const location = document.getElementById('filterLocation').value.toLowerCase();
        const maxBudget = parseInt(budgetSlider.value);
        const type = document.getElementById('filterType').value;
        const sharing = document.getElementById('filterSharing').value;

        const filtered = allPGs.filter(pg => {
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

        renderPGs(filtered, gridId, userFavIds);
        if(resultsCount) resultsCount.textContent = `${filtered.length} properties`;
        
        // Count active filters for badge
        let activeCount = 0;
        if(location) activeCount++;
        if(budgetSlider.value != 20000) activeCount++;
        if(type) activeCount++;
        if(sharing) activeCount++;
        const badge = document.getElementById('activeFilterCount');
        if(badge) {
            if(activeCount > 0) {
                badge.style.display = 'flex';
                badge.textContent = activeCount;
            } else {
                badge.style.display = 'none';
            }
        }
        
        document.getElementById('search').scrollIntoView({behavior: 'smooth'});
    }

    applyBtn.addEventListener('click', () => applyFilters());

    clearBtn.addEventListener('click', () => {
        document.getElementById('filterLocation').value = "";
        budgetSlider.value = 20000;
        budgetDisplay.textContent = "₹20,000";
        document.getElementById('filterType').value = "";
        document.getElementById('filterSharing').value = "";
        if(searchInput) searchInput.value = "";
        applyFilters();
    });

    if(searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.toLowerCase().trim();
            document.getElementById('filterLocation').value = "";
            applyFilters(query);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                if (document.getElementById('autocompleteDropdown')) document.getElementById('autocompleteDropdown').style.display = 'none';
                searchBtn.click();
            }
        });

        // Autocomplete
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
                    div.style.cssText = 'padding:0.75rem 1rem; cursor:pointer; border-bottom:1px solid var(--border); color:var(--text-main); transition:background 0.15s;';
                    div.innerHTML = `<i data-lucide="map-pin" style="width:14px; height:14px; margin-right:0.5rem; color:var(--primary); vertical-align:middle;"></i>${city}`;
                    
                    div.onmouseover = () => div.style.background = 'var(--bg)';
                    div.onmouseout = () => div.style.background = 'white';
                    
                    div.onclick = () => {
                        searchInput.value = city;
                        autocompleteDropdown.style.display = 'none';
                        
                        const filterLoc = document.getElementById('filterLocation');
                        let optionExists = Array.from(filterLoc.options).some(opt => opt.value.toLowerCase() === city.toLowerCase());
                        if (optionExists) {
                            filterLoc.value = Array.from(filterLoc.options).find(opt => opt.value.toLowerCase() === city.toLowerCase()).value;
                            applyFilters();
                        } else {
                            filterLoc.value = "";
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

        document.addEventListener('click', (e) => {
            if (autocompleteDropdown && !searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
                autocompleteDropdown.style.display = 'none';
            }
        });
    }

    // Geolocation
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                window.showToast("Geolocation is not supported by your browser", "error");
                return;
            }

            locationBtn.innerHTML = `<i data-lucide="loader-2" style="width: 18px; height: 18px; animation: loaderSpin 0.8s linear infinite;"></i>`;
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
                    locationBtn.innerHTML = `<i data-lucide="locate" style="width: 18px; height: 18px;"></i>`;
                    if(window.lucide) lucide.createIcons();
                }
            }, (error) => {
                window.showToast("Location access denied or unavailable", "error");
                locationBtn.innerHTML = `<i data-lucide="locate" style="width: 18px; height: 18px;"></i>`;
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
    
    document.getElementById('bookFormContainer').style.display = 'block';
    document.getElementById('bookSuccessContainer').style.display = 'none';
    document.getElementById('bookForm').reset();
    
    document.getElementById('bookPgTitleText').textContent = pgTitle;
    document.getElementById('bookPgId').value = pgId;
    
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
        window.showToast("There was an error sending your inquiry.", "error");
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry';
}

window.toggleFavorite = async function(pgId, btn) {
    if(!localStorage.getItem('auth_token')) {
        window.showToast("Please sign in to save favorites.", "error", "login.html");
        return;
    }
    
    const svg = btn.querySelector('svg');
    const isCurrentlyFav = btn.classList.contains('fav-active');
    
    if(isCurrentlyFav) {
        const success = await removeFavorite(pgId);
        if(success) {
            btn.classList.remove('fav-active');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', '#9CA3AF');
            btn.title = 'Add to Favorites';
            window.showToast('Removed from favorites', 'success');
        }
    } else {
        const success = await addFavorite(pgId);
        if(success) {
            btn.classList.add('fav-active');
            svg.setAttribute('fill', '#EF4444');
            svg.setAttribute('stroke', '#EF4444');
            btn.title = 'Remove from Favorites';
            window.showToast('Added to favorites! ❤️', 'success');
        }
    }
}

window.logout = function() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    window.location.reload();
}
