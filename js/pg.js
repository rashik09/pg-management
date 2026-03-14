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

        // Amenities Check
        let amsHtml = '';
        if(pg.has_ac) amsHtml += `<div class="amenity-item"><i data-lucide="sun-snow"></i> Air Conditioning</div>`;
        if(pg.has_wifi) amsHtml += `<div class="amenity-item"><i data-lucide="wifi"></i> High-Speed WiFi</div>`;
        if(pg.has_hot_water) amsHtml += `<div class="amenity-item"><i data-lucide="flame"></i> Hot Water (24/7)</div>`;
        
        // Always provide base amenities
        amsHtml += `<div class="amenity-item"><i data-lucide="shield-check"></i> Security Cameras</div>`;
        amsHtml += `<div class="amenity-item"><i data-lucide="sparkles"></i> Daily Housekeeping</div>`;
        
        // Dynamic Image Carousel
        let images = [pg.image];
        if(pg.gallery && pg.gallery.length > 0) {
            images = images.concat(pg.gallery);
        }
        
        window.pgImages = images;
        window.currentSlide = 0;
        let slideInterval;

        function startSlideShow() {
            if (images.length > 1) {
                slideInterval = setInterval(() => {
                    window.changeSlide(1, false);
                }, 3000);
            }
        }

        window.changeSlide = function(direction, isManual = true) {
            if (isManual && slideInterval) {
                clearInterval(slideInterval);
                startSlideShow(); // Reset timer on manual click
            }

            window.currentSlide += direction;
            if (window.currentSlide < 0) {
                window.currentSlide = window.pgImages.length - 1;
            } else if (window.currentSlide >= window.pgImages.length) {
                window.currentSlide = 0;
            }
            const imgEl = document.getElementById('carouselMainImg');
            // Brief fade effect
            imgEl.style.opacity = 0.5;
            setTimeout(() => {
                imgEl.src = window.pgImages[window.currentSlide];
                imgEl.style.opacity = 1;
            }, 150);
            
            const counterEl = document.getElementById('carouselCounter');
            if(counterEl) counterEl.textContent = `${window.currentSlide + 1} / ${window.pgImages.length}`;
        };

        // Start autoplay initially
        startSlideShow();

        let carouselHtml = `
            <div class="pg-carousel" style="position: relative; width: 100%; height: clamp(300px, 45vh, 480px); margin-top: 1.5rem; border-radius: 16px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
                <img id="carouselMainImg" src="${images[0]}" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease;" alt="${pg.title}">
                
                ${images.length > 1 ? `
                    <button onclick="changeSlide(-1, true)" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-md); transition: background 0.2s; z-index: 10;">
                        <i data-lucide="chevron-left" style="color: var(--text-main);"></i>
                    </button>
                    <button onclick="changeSlide(1, true)" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-md); transition: background 0.2s; z-index: 10;">
                        <i data-lucide="chevron-right" style="color: var(--text-main);"></i>
                    </button>
                    <div id="carouselCounter" style="position: absolute; bottom: 1rem; right: 1.5rem; background: rgba(0,0,0,0.6); color: white; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 500; z-index: 10;">
                        1 / ${images.length}
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML += `
            ${carouselHtml}

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
