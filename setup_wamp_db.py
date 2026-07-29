import pymysql
from werkzeug.security import generate_password_hash
import sys

def setup_database():
    try:
        # Step 1: Connect to MySQL server on WAMP
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            port=3306,
            autocommit=True
        )
        cursor = conn.cursor()
        print("Connected to WAMP MySQL Server successfully!")

        # Step 2: Create Database if not exists
        cursor.execute("CREATE DATABASE IF NOT EXISTS manasati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print("Database 'manasati_db' created/verified.")

        # Step 3: Switch to manasati_db
        cursor.execute("USE manasati_db;")

        # Step 4: Create tables
        # Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(120) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Categories table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            original_price DECIMAL(10, 2) NULL,
            badge VARCHAR(50) DEFAULT '',
            period VARCHAR(50) DEFAULT 'شهر واحد',
            delivery VARCHAR(100) DEFAULT 'تسليم فوري ⚡',
            image VARCHAR(500) NULL,
            description TEXT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Orders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_code VARCHAR(50) NOT NULL UNIQUE,
            customer_name VARCHAR(100) NOT NULL,
            customer_phone VARCHAR(50) NOT NULL,
            customer_email VARCHAR(120) NULL,
            user_id INT NULL,
            payment_method VARCHAR(50) DEFAULT 'madapay',
            total_amount DECIMAL(10, 2) NOT NULL,
            status VARCHAR(30) DEFAULT 'مكتمل',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Order Items table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NULL,
            product_title VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            quantity INT DEFAULT 1,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        print("Tables created successfully!")

        # Step 5: Seed Custom Admin & Demo User
        custom_admin_pass = generate_password_hash("@@##AaAa123123AaAa")
        user_pass = generate_password_hash("user123")

        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role);
        """, ("عزالدين خالد (مسؤول)", "ezzedinekhaled030@gmail.com", custom_admin_pass, "admin"))

        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role);
        """, ("مشترك فاخر", "user@manasati.com", user_pass, "user"))

        print("Admin user seeded: ezzedinekhaled030@gmail.com")


        # Step 6: Seed Default Products
        cursor.execute("SELECT COUNT(*) FROM products;")
        count = cursor.fetchone()[0]

        if count == 0:
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

            cursor.executemany("""
            INSERT INTO products (title, category, price, original_price, badge, period, delivery, image, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, initial_products)
            print("Initial products seeded successfully into WAMP MySQL!")

        cursor.close()
        conn.close()
        print("WAMP MySQL database setup completed with clean status!")
        return True
    except Exception as e:
        print(f"Error setting up WAMP MySQL Database: {e}")
        return False

if __name__ == '__main__':
    setup_database()
