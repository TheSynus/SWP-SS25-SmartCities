from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
import os

app = Flask(__name__)
# Session-Cookie
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")
CORS(app, supports_credentials=True)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", 5432),
        dbname=os.getenv("DB_NAME", "webportal"),
        user=os.getenv("DB_USER", "admin"),
        password=os.getenv("DB_PASSWORD", "Admin!1234")
    )

@app.route('/')
def index():
    return "REST API läuft!"

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.form
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO users (username, email, password_hash, role)
        VALUES (%s, %s, %s, %s)
    """, (data['username'], data['email'], data['password_hash'], data['role']))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/add_calendar_entry', methods=['POST'])
def add_calendar_entry():
    data = request.form
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO calendar_entries (title, description, location, start_time, end_time, is_all_day)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        data['title'],
        data.get('description'),
        data.get('location'),
        data['start_time'],
        data.get('end_time'),
        data.get('is_all_day') == 'on'
    ))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/add_image', methods=['POST'])
def add_image():
    data = request.form
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO images (file_name, file_path)
        VALUES (%s, %s)
    """, (data['file_name'], data['file_path']))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/add_event', methods=['POST'])
def add_event():
    data = request.form
    tags = [tag.strip() for tag in data.get('tags', '').split(',') if tag.strip()]
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO events (title, calendar_entry_id, category, tags, additional_info)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        data['title'],
        int(data['calendar_entry_id']),
        data.get('category'),
        tags if tags else None,
        data.get('additional_info')
    ))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/register', methods=['POST'])
def register():
    data = request.form
    username = data['username']
    email = data['email']
    password = data['password']
    role = data.get('role', 'user')
    password_hash = generate_password_hash(password)
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
        """, (username, email, password_hash, role))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    username = data['username']
    password = data['password']
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, password_hash, role FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user and check_password_hash(user[1], password):
        session['user_id'] = user[0]
        session['username'] = username
        session['role'] = user[2]
        return jsonify({"status": "success", "username": username, "role": user[2]})
    else:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)