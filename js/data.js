const API_URL = 'http://localhost:5000/api';

function getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function getPGs() {
    try {
        const response = await fetch(`${API_URL}/pgs`);
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch PGs:", e);
        return [];
    }
}

async function getInquiries() {
    try {
        const response = await fetch(`${API_URL}/inquiries`, {
            headers: getHeaders()
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = 'login.html';
            return [];
        }
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch Inquiries:", e);
        return [];
    }
}

async function createInquiry(inquiryData) {
    try {
        const response = await fetch(`${API_URL}/inquiries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(inquiryData)
        });
        if (response.status === 401) {
            window.showToast('Please login to book a room!', 'error', 'login.html');
            return false;
        }
        return response.ok;
    } catch (e) {
        console.error("Failed to create inquiry:", e);
        return false;
    }
}

async function updateInquiryStatus(id) {
    try {
        await fetch(`${API_URL}/inquiries/${id}`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return true;
    } catch (e) {
        console.error("Failed to update inquiry:", e);
        return false;
    }
}

async function deletePG(id) {
    try {
        await fetch(`${API_URL}/pgs/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return true;
    } catch (e) {
        console.error("Failed to delete PG:", e);
        return false;
    }
}

async function getFavorites() {
    try {
        const response = await fetch(`${API_URL}/favorites`, { headers: getHeaders() });
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch favorites:", e);
        return [];
    }
}

async function addFavorite(pgId) {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ pg_id: pgId })
        });
        return response.ok || response.status === 409;
    } catch (e) {
        console.error("Failed to add favorite:", e);
        return false;
    }
}

async function removeFavorite(pgId) {
    try {
        await fetch(`${API_URL}/favorites/${pgId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return true;
    } catch (e) {
        console.error("Failed to remove favorite:", e);
        return false;
    }
}

window.showToast = function(message, type = 'error', redirectUrl = null) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    
    // Lucide icon if available, else simple SVG
    const iconHtml = type === 'error' 
        ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#10B981"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.innerHTML = `${iconHtml} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
        if (redirectUrl) window.location.href = redirectUrl;
    }, 2500);
}
