// auth.js
// API_URL and showToast provided by data.js

function setRole(role) {
    document.getElementById('currentRole').value = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    
    if(role === 'user') {
        document.getElementById('roleUser').classList.add('active');
        document.getElementById('authSub').textContent = "Log in to browse and book PGs";
    } else {
        document.getElementById('roleOwner').classList.add('active');
        document.getElementById('authSub').textContent = "Log in to manage your properties";
    }
}

function toggleMode() {
    const modeInput = document.getElementById('authMode');
    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('name');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const title = document.getElementById('authTitle');

    if(modeInput.value === 'login') {
        modeInput.value = 'register';
        nameGroup.style.display = 'block';
        nameInput.required = true;
        submitBtn.textContent = 'Sign Up';
        toggleText.innerText = 'Already have an account? Log in';
        title.innerText = 'Create Account';
    } else {
        modeInput.value = 'login';
        nameGroup.style.display = 'none';
        nameInput.required = false;
        submitBtn.textContent = 'Sign In';
        toggleText.innerText = "Don't have an account? Sign up";
        title.innerText = 'Welcome Back';
    }
}

function showError(msg) {
    window.showToast(msg, 'error');
}

async function handleAuth(e) {
    e.preventDefault();
    const mode = document.getElementById('authMode').value;
    const role = document.getElementById('currentRole').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';

    if(mode === 'register') {
        const name = document.getElementById('name').value;
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            
            if(res.ok) {
                window.showToast("Account created successfully!", "success");
                
                // Auto login after successful registration
                const loginRes = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const loginData = await loginRes.json();
                
                if(loginRes.ok) {
                    localStorage.setItem('auth_token', loginData.token);
                    localStorage.setItem('user_name', loginData.name);
                    localStorage.setItem('user_role', loginData.role);
                    
                    if(loginData.role === 'owner') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            } else {
                if (data.message === "User already exists" || res.status === 400 || res.status === 409) {
                    window.showToast("Account already exists", "error");
                } else {
                    showError(data.message || 'Registration failed');
                }
            }
        } catch(e) {
            showError("Server error. Ensure backend is running.");
        }
    } else {
        // Login Flow
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if(res.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_name', data.name);
                localStorage.setItem('user_role', data.role);
                
                // Redirect based on role
                if(data.role === 'owner') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                showError(data.message || 'Login failed');
            }
        } catch(e) {
            showError("Server error. Ensure backend is running.");
        }
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = mode === 'register' ? 'Sign Up' : 'Sign In';
}
