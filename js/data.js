const API_URL = 'http://127.0.0.1:5000/api';

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
            alert('Please login to book a room!');
            window.location.href = 'login.html';
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
