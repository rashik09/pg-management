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
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const nameInput = document.getElementById('name');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const title = document.getElementById('authTitle');

    if(modeInput.value === 'login') {
        modeInput.value = 'register';
        nameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        nameInput.required = true;
        confirmPasswordInput.required = true;
        submitBtn.textContent = 'Sign Up';
        toggleText.innerText = 'Already have an account? Log in';
        title.innerText = 'Create Account';
    } else {
        modeInput.value = 'login';
        nameGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
        nameInput.required = false;
        confirmPasswordInput.required = false;
        confirmPasswordInput.value = '';
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
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showError("Passwords do not match");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            
            if(res.ok) {
                window.showToast("Account created successfully! Redirecting to login...", "success");
                
                // Properly redirect to login page to reset entire form state
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                
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
    submitBtn.textContent = document.getElementById('authMode').value === 'register' ? 'Sign Up' : 'Sign In';
}

window.showForgotPassword = function() {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('toggleText').parentElement.style.display = 'none';
    document.getElementById('forgotPwdView').style.display = 'block';
    document.getElementById('authTitle').innerText = 'Reset Password';
    document.getElementById('authSub').innerText = 'Follow the steps to recover your account';
    document.querySelector('.role-selector').style.display = 'none';
}

window.hideForgotPassword = function() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('toggleText').parentElement.style.display = 'block';
    document.getElementById('forgotPwdView').style.display = 'none';
    
    const mode = document.getElementById('authMode').value;
    document.getElementById('authTitle').innerText = mode === 'login' ? 'Welcome Back' : 'Create Account';
    document.getElementById('authSub').innerText = mode === 'login' ? 'Log in to manage your spaces' : 'Join NexStay today';
    document.querySelector('.role-selector').style.display = 'flex';
}

window.handleForgotPassword = async function(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    const submitBtn = document.getElementById('forgotSubmitBtn');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        
        if(res.ok) {
            window.showToast(data.message, "success");
            setTimeout(() => {
                hideForgotPassword();
            }, 2000);
        } else {
            window.showToast(data.message || "Failed to send reset link", "error");
        }
    } catch(e) {
        window.showToast("Server error. Ensure backend is running.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}
