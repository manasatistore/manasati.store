from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

import sqlite3

app = Flask(__name__)
# ================================
# FRONTEND ROUTES
# ================================

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/app.js")
def app_js():
    return send_from_directory(".", "app.js")


@app.route("/styles.css")
def styles_css():
    return send_from_directory(".", "styles.css")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)
CORS(app)

SECRET_KEY = "manasati_super_secret_jwt_key_2026"
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'manasati_db',
    'port': 3306,
    'charset': 'utf8mb4',
    'autocommit': True,
    'cursorclass': pymysql.cursors.DictCursor
}

class SQLiteCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, query, params=()):
        query_converted = query.replace('%s', '?')
        self.cursor.execute(query_converted, params)
        return self

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        if isinstance(row, sqlite3.Row):
            return dict(row)
        return row

    def fetchall(self):
        rows = self.cursor.fetchall()
        if not rows:
            return []
        if isinstance(rows[0], sqlite3.Row):
            return [dict(r) for r in rows]
        return rows

    @property
    def lastrowid(self):
        return self.cursor.lastrowid

    def close(self):
        self.cursor.close()

class SQLiteConnWrapper:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        return SQLiteCursorWrapper(self.conn.cursor())

    def close(self):
        self.conn.commit()
        self.conn.close()

def init_sqlite_db():
    conn = sqlite3.connect(os.path.join(BASE_DIR, "manasati.db"))
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL NULL,
        badge TEXT DEFAULT '',
        period TEXT DEFAULT 'شهر واحد',
        delivery TEXT DEFAULT 'تسليم فوري ⚡',
        image TEXT NULL,
        description TEXT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NULL,
        user_id INTEGER NULL,
        payment_method TEXT DEFAULT 'madapay',
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'مكتمل',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NULL,
        product_title TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER DEFAULT 1
    );
    """)

    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM users;")
    if cursor.fetchone()[0] == 0:
        admin_pass = generate_password_hash("@@##AaAa123123AaAa")
        user_pass = generate_password_hash("user123")
        cursor.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?);",
                       ("عزالدين خالد (مسؤول)", "ezzedinekhaled030@gmail.com", admin_pass, "admin"))
        cursor.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?);",
                       ("مشترك فاخر", "user@manasati.com", user_pass, "user"))
        conn.commit()

    cursor.execute("SELECT COUNT(*) FROM products;")
    if cursor.fetchone()[0] == 0:
        initial_products = [
            ("اشتراك نتفليكس 4K Ultra HD (ملف خاص برمز سري)", "entertainment", 29.00, 49.00, "الأكثر مبيعاً 🔥", "شهر واحد", "تسليم فوري ⚡", "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80", "استمتع بمشاهدة جميع الأفلام والمسلسلات الحصرية أعلى دقة 4K UHD. ملف شخصي خاص بك ومقفل برمز سري PIN لضمان الخصوصية والراحة التامة."),
            ("اشتراك شاهد VIP + الرياضية (شامل دوري روشن والرياضة)", "entertainment", 35.00, 59.00, "خصم 40%", "شهر واحد", "تسليم فوري ⚡", "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80", "شاهد جميع المباريات المباشرة ودوري روشن السعودي، بالإضافة إلى أعمال شاهد الأصلية وأضخم المسلسلات والأفلام بأعلى جودة وبدون إعلانات."),
            ("اشتراك يوتيوب بريميوم (تفعيل رسمي على حسابك الخاص)", "music", 15.00, 30.00, "تفعيل رسمي 💯", "شهر واحد", "خلال 15 دقيقة 🚀", "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80", "مشاهدة الفيديوهات بدون أي إعلانات مزعجة، إمكانية التشغيل في الخلفية وتحميل الفيديوهات، بالإضافة للاستمتاع بـ YouTube Music."),
            ("اشتراك ChatGPT Plus (وصول كامل لـ GPT-4o و DALL-E 3)", "ai", 49.00, 85.00, "ذكاء اصطناعي", "شهر واحد", "تسليم فوري ⚡", "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=80", "احصل على أفضل أدوات الذكاء الاصطناعي مع نموذج GPT-4o الفائق، توليد الصور الاحترافية عبر DALL-E 3 وتحليل البيانات بسرعة عالية."),
            ("اشتراك كانفا بريميوم Canva Pro (تفعيل رسمي بريدك)", "ai", 19.00, 45.00, "ضمان سنة 🛡️", "سنة كاملة", "تفعيل فوري ⚡", "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80", "تفعيل رسمي لـ Canva Pro على حسابك الشخصي. فتح ملايين القوالب والخطوط والصور الاحترافية وميزة إزالة خلفية الصور بنقرة واحدة."),
            ("اشتراك بلايستيشن بلس PlayStation Plus Deluxe", "gaming", 89.00, 140.00, "عرض حصري 🎮", "3 أشهر", "خلال 30 دقيقة 🚀", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80", "باقة ديلوكس (الأعلى): مئات الألعاب الكلاسيكية والحديثة للتنزيل، إمكانية التنافس أونلاين وتجربة أحدث الألعاب مجاناً."),
            ("اشتراك تطبيق TOD (دوري أبطال أوروبا والدوريات الكبرى)", "sports", 45.00, 75.00, "بث مباشر HD", "شهر واحد", "تسليم فوري ⚡", "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80", "متابعة البث المباشر لأقوى الدوريات العالمية (الدوري الإنجليزي، الإسباني، ودوري أبطال أوروبا) على شاشة التلفزيون أو الجوال."),
            ("اشتراك سبوتيفاي بريميوم Spotify Premium Family", "music", 12.00, 25.00, "صوت عالي الجودة", "3 أشهر", "تسليم فوري ⚡", "https://images.unsplash.com/photo-1614680376593-902f749f7ba3?w=500&auto=format&fit=crop&q=80", "استمع لأغاني والبودكاست المفضلة لديك بدون إعلانات وبجودة صوت فائقة وميزة الاستماع أوفلاين دون اتصال بالإنترنت.")
        ]
        cursor.executemany("INSERT INTO products (title, category, price, original_price, badge, period, delivery, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", initial_products)
        conn.commit()

    conn.close()

def get_db():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except Exception:
        init_sqlite_db()
        sq_conn = sqlite3.connect(os.path.join(BASE_DIR, "manasati.db"))
        sq_conn.row_factory = sqlite3.Row
        return SQLiteConnWrapper(sq_conn)

def verify_token(token):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data
    except Exception:
        return None

# ================================
# AUTHENTICATION ENDPOINTS
# ================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'يرجى إدخال البريد الإلكتروني وكلمة المرور'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s;", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'بيانات الدخول غير صحيحة'}), 401

    payload = {
        'user_id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify({
        'success': True,
        'message': 'تم تسجيل الدخول بنجاح',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'جميع الحقول مطلوبة'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = %s;", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'message': 'البريد الإلكتروني مسجل بالفعل'}), 400

    password_hash = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s);",
        (name, email, password_hash, 'user')
    )
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()

    payload = {
        'user_id': user_id,
        'email': email,
        'name': name,
        'role': 'user',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify({
        'success': True,
        'message': 'تم إنشاء الحساب بنجاح',
        'token': token,
        'user': {
            'id': user_id,
            'name': name,
            'email': email,
            'role': 'user'
        }
    }), 201

# ================================
# PRODUCTS CRUD ENDPOINTS (MySQL WAMP)
# ================================

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC;")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    products = []
    for r in rows:
        products.append({
            'id': f"srv-{r['id']}",
            'db_id': r['id'],
            'title': r['title'],
            'category': r['category'],
            'price': float(r['price']),
            'originalPrice': float(r['original_price']) if r['original_price'] else float(r['price']),
            'badge': r['badge'] or '',
            'period': r['period'] or 'شهر واحد',
            'delivery': r['delivery'] or 'تسليم فوري ⚡',
            'image': r['image'] or 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
            'description': r['description'] or ''
        })

    return jsonify({'success': True, 'products': products}), 200

@app.route('/api/products', methods=['POST'])
def create_product():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user_info = verify_token(token)

    # Validate admin role
    if not user_info or user_info.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'غير مصرح لك بإضافة منتجات. يجب تسجيل الدخول كمسؤول.'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    category = data.get('category', 'entertainment')
    price = data.get('price', 0)
    original_price = data.get('originalPrice', price)
    badge = data.get('badge', '')
    period = data.get('period', 'شهر واحد')
    delivery = data.get('delivery', 'تسليم فوري ⚡')
    image = data.get('image', '')
    description = data.get('description', '')

    if not title or price <= 0:
        return jsonify({'success': False, 'message': 'يرجى إدخال اسم الخدمة والسعر بشكل صحيح'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO products (title, category, price, original_price, badge, period, delivery, image, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """, (title, category, price, original_price, badge, period, delivery, image, description))

    new_id = cursor.lastrowid
    cursor.close()
    conn.close()

    new_product = {
        'id': f"srv-{new_id}",
        'db_id': new_id,
        'title': title,
        'category': category,
        'price': float(price),
        'originalPrice': float(original_price),
        'badge': badge,
        'period': period,
        'delivery': delivery,
        'image': image or 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
        'description': description
    }

    return jsonify({
        'success': True,
        'message': 'تم حفظ الخدمة الجديدة في قاعدة بيانات WAMP MySQL بنجاح!',
        'product': new_product
    }), 201

@app.route('/api/products/<int:db_id>', methods=['PUT'])
def update_product(db_id):
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user_info = verify_token(token)

    if not user_info or user_info.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'غير مصرح لك بتعديل المنتجات'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    category = data.get('category')
    price = data.get('price')
    original_price = data.get('originalPrice')
    badge = data.get('badge')
    period = data.get('period')
    delivery = data.get('delivery')
    image = data.get('image')
    description = data.get('description')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE products
        SET title=%s, category=%s, price=%s, original_price=%s, badge=%s, period=%s, delivery=%s, image=%s, description=%s
        WHERE id=%s;
    """, (title, category, price, original_price, badge, period, delivery, image, description, db_id))
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'message': 'تم تحديث بيانات الخدمة بنجاح في WAMP MySQL'}), 200

@app.route('/api/products/<int:db_id>', methods=['DELETE'])
def delete_product(db_id):
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user_info = verify_token(token)

    if not user_info or user_info.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'غير مصرح لك بحذف المنتجات'}), 403

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE products SET is_active = 0 WHERE id = %s;", (db_id,))
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'message': 'تم حذف الخدمة من قاعدة البيانات بنجاح'}), 200

# ================================
# ORDERS ENDPOINT
# ================================

@app.route('/api/orders', methods=['POST'])
def create_order():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user_info = verify_token(token) if token else None

    data = request.get_json() or {}
    customer_name = data.get('customer_name', '').strip()
    customer_phone = data.get('customer_phone', '').strip()
    customer_email = data.get('customer_email', '').strip()
    payment_method = data.get('payment_method', 'madapay')
    items = data.get('items', [])
    total_amount = data.get('total_amount', 0)
    user_id = user_info.get('user_id') if user_info else data.get('user_id')

    if not customer_name or not customer_phone or not items:
        return jsonify({'success': False, 'message': 'بيانات الطلب غير مكتملة'}), 400

    order_code = f"MN-{int(datetime.datetime.now().timestamp())}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO orders (order_code, customer_name, customer_phone, customer_email, user_id, payment_method, total_amount)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
    """, (order_code, customer_name, customer_phone, customer_email, user_id, payment_method, total_amount))

    order_id = cursor.lastrowid

    for item in items:
        cursor.execute("""
            INSERT INTO order_items (order_id, product_title, price, quantity)
            VALUES (%s, %s, %s, %s);
        """, (order_id, item.get('title', 'خدمة رقمية'), item.get('price', 0), item.get('quantity', 1)))

    cursor.close()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'تم استلام وتوثيق الطلب بنجاح',
        'order_code': order_code,
        'order_id': order_id
    }), 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user_info = verify_token(token)

    if not user_info or user_info.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'غير مصرح لك بنشاط الطلبات'}), 403

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 50;")
    orders = cursor.fetchall()

    for order in orders:
        cursor.execute("SELECT * FROM order_items WHERE order_id = %s;", (order['id'],))
        items = cursor.fetchall()
        for item in items:
            item['price'] = float(item['price'])
        order['items'] = items
        if order['total_amount']:
            order['total_amount'] = float(order['total_amount'])
        if order['created_at']:
            order['created_at'] = str(order['created_at'])

    cursor.close()
    conn.close()

    return jsonify({'success': True, 'orders': orders}), 200

@app.route('/api/orders/my-orders', methods=['GET'])
def get_my_orders():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user_info = verify_token(token)

    if not user_info:
        return jsonify({'success': False, 'message': 'يرجى تسجيل الدخول لعرض طلباتك'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM orders 
        WHERE user_id = %s OR customer_email = %s 
        ORDER BY id DESC LIMIT 50;
    """, (user_info['user_id'], user_info['email']))
    orders = cursor.fetchall()

    for order in orders:
        cursor.execute("SELECT * FROM order_items WHERE order_id = %s;", (order['id'],))
        items = cursor.fetchall()
        for item in items:
            item['price'] = float(item['price'])
        order['items'] = items
        if order['total_amount']:
            order['total_amount'] = float(order['total_amount'])
        if order['created_at']:
            order['created_at'] = str(order['created_at'])

    cursor.close()
    conn.close()

    return jsonify({'success': True, 'orders': orders}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Manasati Store on port {port}")
    app.run(host="0.0.0.0", port=port)
