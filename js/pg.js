const urlParams = new URLSearchParams(window.location.search);
const pgId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    if(!pgId) {
        document.getElementById('loadingContainer').innerHTML = "<h2>Property Not Found</h2>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pgs/${pgId}`);
        if(!response.ok) throw new Error("Not found");
        const pg = await response.json();
        
        document.getElementById('loadingContainer').style.display = 'none';
        
        const container = document.getElementById('pgContainer');
        container.style.display = 'block';
        
        // Images mapping
        const mainImage = pg.image;
        const sub1 = pg.gallery && pg.gallery.length > 0 ? pg.gallery[0] : mainImage;
        const sub2 = pg.gallery && pg.gallery.length > 1 ? pg.gallery[1] : mainImage;
        
        // Amenities Check
        let amsHtml = '';
        if(pg.has_ac) amsHtml += `<div class="amenity-item"><i data-lucide="sun-snow"></i> Air Conditioning</div>`;
        if(pg.has_wifi) amsHtml += `<div class="amenity-item"><i data-lucide="wifi"></i> High-Speed WiFi</div>`;
        if(pg.has_hot_water) amsHtml += `<div class="amenity-item"><i data-lucide="flame"></i> Hot Water (24/7)</div>`;
        
        // Always provide base amenities
        amsHtml += `<div class="amenity-item"><i data-lucide="shield-check"></i> Security Cameras</div>`;
        amsHtml += `<div class="amenity-item"><i data-lucide="sparkles"></i> Daily Housekeeping</div>`;

        container.innerHTML += `
            <div class="pg-hero-grid">
                <img src="${mainImage}" class="hero-main-img" alt="${pg.title}">
                <img src="${sub1}" class="hero-sub-img" alt="Interior">
                <img src="${sub2}" class="hero-sub-img" alt="Facilities">
            </div>

            <div class="pg-content-layout">
                <div class="pg-details">
                    <div style="margin-bottom: 2rem;">
                        <h1>${pg.title}</h1>
                        <div style="display:flex; align-items:center; gap:0.5rem; color:var(--text-muted);">
                            <i data-lucide="map-pin"></i> ${pg.location}, ${pg.city}
                        </div>
                    </div>
                    
                    <div class="pg-meta-list">
                        <div style="display:flex; align-items:center; gap:0.5rem;"><i data-lucide="users"></i> ${pg.type}</div>
                        <div style="display:flex; align-items:center; gap:0.5rem;"><i data-lucide="bed"></i> ${pg.sharing_type}</div>
                        <div style="display:flex; align-items:center; gap:0.5rem;"><i data-lucide="bath"></i> ${pg.bathroom_type} Bathroom</div>
                    </div>

                    <div class="pg-description">
                        <h3>About this Property</h3>
                        <p style="margin-top:1rem;">${pg.description}</p>
                    </div>

                    <div>
                        <h3 style="font-size:1.5rem; margin-bottom:1rem;">Top Amenities</h3>
                        <div class="amenities-grid">
                            ${amsHtml}
                        </div>
                    </div>
                </div>

                <div class="pg-booking-sidebar">
                    <div class="booking-card">
                        <div class="price-huge">₹${pg.price}<span>/month</span></div>
                        <p style="color:var(--text-muted); margin-bottom:1.5rem; font-size:0.9rem;">Deposit and terms apply.</p>
                        
                        <div style="background:rgba(16, 185, 129, 0.1); border-radius:8px; padding:1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem; color:#10B981; font-weight:600;">
                            <i data-lucide="users"></i> Only ${pg.vacancies} spots left!
                        </div>

                        <button class="btn btn-primary btn-full" style="width:100%; justify-content:center; padding:1rem; font-size:1.1rem;" onclick="bookRoom(${pg.id}, '${pg.title}')">Request to Book</button>
                    </div>
                </div>
            </div>
        `;
        
        lucide.createIcons();

    } catch (e) {
        document.getElementById('loadingContainer').innerHTML = "<h2>Error loading property data.</h2>";
    }
});

// Reusing identical Modal Booking Logic from app.js for standalone page integration
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
        window.showToast("There was an error sending your inquiry. Please ensure the backend is running.", "error");
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry';
}
