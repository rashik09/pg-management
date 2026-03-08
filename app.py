from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import os
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_FILE = 'database.db'
SECRET_KEY = 'super-secret-premium-key-for-nexstay' # In production, use os.environ.get()

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create Users Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT,
            role TEXT
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            location TEXT,
            city TEXT,
            price INTEGER,
            type TEXT,
            image TEXT,
            vacancies INTEGER,
            sharing_type TEXT,
            bathroom_type TEXT,
            has_ac BOOLEAN,
            has_wifi BOOLEAN,
            has_hot_water BOOLEAN,
            description TEXT,
            gallery TEXT,
            featured BOOLEAN,
            status TEXT
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            pg_id INTEGER,
            date TEXT,
            status TEXT
        )
    ''')
    
    # Check if we need to seed property data
    c.execute('SELECT COUNT(*) FROM properties')
    if c.fetchone()[0] == 0:
        desc = "A premium living space designed for comfort and modern aesthetics. Steps away from local transit and prime shopping centers. Enjoy high-speed internet, dedicated housekeeping, and secure biometric access round the clock."
        gl1 = json.dumps(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800", "https://images.unsplash.com/photo-1497366216551-7008101aed46?w=800"])
        gl2 = json.dumps(["https://images.unsplash.com/photo-1598928506311-c55dd580231aa?w=800", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1502672260266-1c1de2d15582?w=800"])
        seed_data = [
            ("Sunshine Residency PG", "Koramangala, Bangalore", "Bangalore", 8500, "Boys", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 5, "2 Sharing", "Attached", False, True, True, desc, gl1, True, "active"),
            ("Crystal Clear PG for Girls", "HSR Layout, Bangalore", "Bangalore", 9200, "Girls", "https://images.unsplash.com/photo-1598928506311-c55dd580231aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 2, "3 Sharing", "Common", False, True, True, desc, gl2, True, "active"),
            ("Metro View Coliving", "Andheri West, Mumbai", "Mumbai", 12000, "Co-ed", "https://images.unsplash.com/photo-1502672260266-1c1de2d15582?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 0, "1 Sharing", "Attached", True, True, True, desc, gl1, False, "active"),
            ("Greenwood Boys Hostel", "Bandra, Mumbai", "Mumbai", 15000, "Boys", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 8, "2 Sharing", "Attached", True, True, True, desc, gl1, True, "active"),
            ("Whitehouse PG", "Gachibowli, Hyderabad", "Hyderabad", 7500, "Girls", "https://images.unsplash.com/photo-1513694203232-723a1a0df91b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 12, "4 Sharing", "Common", False, True, False, desc, gl2, False, "active"),
            ("Tech-Hub Stay", "Whitefield, Bangalore", "Bangalore", 10500, "Co-ed", "https://images.unsplash.com/photo-1497366216551-7008101aed46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 1, "1 Sharing", "Attached", True, True, True, desc, gl1, True, "active")
        ]
        c.executemany('''
            INSERT INTO properties (title, location, city, price, type, image, vacancies, sharing_type, bathroom_type, has_ac, has_wifi, has_hot_water, description, gallery, featured, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_data)

    c.execute('SELECT COUNT(*) FROM users')
    if c.fetchone()[0] == 0:
        c.execute('''
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        ''', ("Admin User", "admin@nexstay.com", generate_password_hash("password123"), "owner"))

    conn.commit()
    conn.close()

init_db()

# --- Auth Decorators ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            conn = get_db_connection()
            c = conn.cursor()
            c.execute('SELECT * FROM users WHERE id=?', (data['user_id'],))
            current_user = c.fetchone()
            conn.close()
            
            if not current_user:
                return jsonify({'message': 'Invalid token!'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def owner_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if dict(current_user)['role'] != 'owner':
            return jsonify({'message': 'Unauthorized! Owner access required.'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# --- HTML Serving Routes ---
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/login.html')
def serve_login():
    return send_from_directory('.', 'login.html')

@app.route('/admin.html')
def serve_admin():
    return send_from_directory('.', 'admin.html')

# --- AUTH API ROUTES ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('name') or not data.get('role'):
        return jsonify({'message': 'Missing parameters'}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    
    try:
        c.execute('SELECT id FROM users WHERE email=?', (data['email'],))
        if c.fetchone():
            return jsonify({'message': 'User already exists!'}), 400
            
        hashed_pw = generate_password_hash(data['password'])
        c.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                 (data['name'], data['email'], hashed_pw, data['role']))
        conn.commit()
        return jsonify({'message': 'Successfully registered!'}), 201
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email=?', (data['email'],))
    user = c.fetchone()
    conn.close()
    
    if not user or not check_password_hash(dict(user)['password_hash'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'user_id': dict(user)['id'],
        'role': dict(user)['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'token': token, 
        'name': dict(user)['name'],
        'role': dict(user)['role']
    })

# --- DATA API ROUTES ---
@app.route('/api/pgs', methods=['GET'])
def get_pgs():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM properties WHERE status="active"')
    rows = c.fetchall()
    conn.close()
    
    properties = []
    for row in rows:
        prop = dict(row)
        prop['has_ac'] = bool(prop['has_ac'])
        prop['has_wifi'] = bool(prop['has_wifi'])
        prop['has_hot_water'] = bool(prop['has_hot_water'])
        prop['featured'] = bool(prop['featured'])
        try:
            prop['gallery'] = json.loads(str(prop['gallery'])) if prop['gallery'] else []
        except:
            prop['gallery'] = []
        properties.append(prop)
        
    return jsonify(properties)

@app.route('/api/pgs/<int:id>', methods=['GET'])
def get_pg(id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM properties WHERE id=? AND status="active"', (id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        return jsonify({"message": "Property not found"}), 404
        
    prop = dict(row)
    prop['has_ac'] = bool(prop['has_ac'])
    prop['has_wifi'] = bool(prop['has_wifi'])
    prop['has_hot_water'] = bool(prop['has_hot_water'])
    prop['featured'] = bool(prop['featured'])
    try:
        prop['gallery'] = json.loads(prop['gallery']) if prop['gallery'] else []
    except:
        prop['gallery'] = []
    
    return jsonify(prop)

@app.route('/api/pgs', methods=['POST'])
@token_required
@owner_required
def create_pg(current_user):
    data = request.json
    conn = get_db_connection()
    c = conn.cursor()
    
    gallery_str = json.dumps(data.get('gallery', []))
    
    c.execute('''
        INSERT INTO properties (
            title, location, city, price, type, image,
            vacancies, sharing_type, bathroom_type,
            has_ac, has_wifi, has_hot_water, description, gallery, featured, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['title'], data['location'], data['city'], int(data['price']),
        data['type'], data.get('image', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'),
        int(data['vacancies']), data['sharing_type'], data['bathroom_type'],
        bool(data.get('has_ac')), bool(data.get('has_wifi')), bool(data.get('has_hot_water')),
        data.get('description', 'A beautiful new PG property.'), gallery_str,
        False, "active"
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "PG added successfully"}), 201

@app.route('/api/pgs/<int:id>', methods=['DELETE'])
@token_required
@owner_required
def delete_pg(current_user, id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE properties SET status="deleted" WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "PG deleted successfully"})

@app.route('/api/inquiries', methods=['GET'])
@token_required
@owner_required
def get_inquiries(current_user):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM inquiries ORDER BY id ASC')
    rows = c.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/inquiries', methods=['POST'])
@token_required
def create_inquiry(current_user):
    data = request.json
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO inquiries (name, phone, pg_id, date, status)
        VALUES (?, ?, ?, ?, 'pending')
    ''', (dict(current_user)['name'], data['phone'], data['pgId'], data['date'])) # Name pulled from authenticated user!
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Inquiry submitted"}), 201

@app.route('/api/inquiries/<int:id>', methods=['PUT'])
@token_required
@owner_required
def update_inquiry(current_user, id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE inquiries SET status='contacted' WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Inquiry updated"})

if __name__ == '__main__':
    print("Starting Nexus Stay Secure API Server...")
    app.run(port=5000, debug=True)
