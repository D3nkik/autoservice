import paramiko, pymysql, sys, threading, socket, time
sys.stdout.reconfigure(encoding='utf-8')

SSH_HOST = '77.222.40.251'
SSH_PORT = 22
SSH_USER = 'kalkov553'
SSH_PASS = 'o9kh1Xurcm8#D4gs'
DB_USER = 'kalkov553'
DB_PASS = 'Qwer2435'
DB_NAME = 'kalkov553'
LOCAL_PORT = 13306

# SSH tunnel
transport = paramiko.Transport((SSH_HOST, SSH_PORT))
transport.connect(username=SSH_USER, password=SSH_PASS)
print("SSH connected")

server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_sock.bind(('127.0.0.1', LOCAL_PORT))
server_sock.listen(5)

def tunnel_handler(client_sock):
    try:
        chan = transport.open_channel('direct-tcpip', ('127.0.0.1', 3306), ('127.0.0.1', LOCAL_PORT), timeout=10)
        def fwd(src, dst):
            try:
                while True:
                    data = src.recv(4096)
                    if not data: break
                    dst.send(data)
            except: pass
        t1 = threading.Thread(target=fwd, args=(client_sock, chan), daemon=True)
        t2 = threading.Thread(target=fwd, args=(chan, client_sock), daemon=True)
        t1.start(); t2.start()
        t1.join(); t2.join()
    except Exception as e:
        print(f"Tunnel err: {e}")
    finally:
        try: client_sock.close()
        except: pass

def accept_loop():
    while True:
        try:
            client, _ = server_sock.accept()
            threading.Thread(target=tunnel_handler, args=(client,), daemon=True).start()
        except: break

threading.Thread(target=accept_loop, daemon=True).start()
time.sleep(0.5)
print(f"Tunnel ready on 127.0.0.1:{LOCAL_PORT}")

conn = pymysql.connect(
    host='127.0.0.1', port=LOCAL_PORT,
    user=DB_USER, password=DB_PASS,
    database=DB_NAME, charset='utf8mb4',
    connect_timeout=15
)
print("MySQL connected!")
cur = conn.cursor()
cur.execute("SELECT VERSION()")
print("MySQL version:", cur.fetchone()[0])

# Create tables
tables = [
    (
        "asvc_users",
        """CREATE TABLE IF NOT EXISTS `asvc_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('client','admin') NOT NULL DEFAULT 'client',
  `car_brand` varchar(100) DEFAULT NULL,
  `car_model` varchar(100) DEFAULT NULL,
  `car_year` int(11) DEFAULT NULL,
  `car_plate` varchar(20) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `asvc_users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"""
    ),
    (
        "asvc_services",
        """CREATE TABLE IF NOT EXISTS `asvc_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price_from` decimal(10,2) NOT NULL,
  `price_to` decimal(10,2) DEFAULT NULL,
  `duration_hours` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"""
    ),
    (
        "asvc_lifts",
        """CREATE TABLE IF NOT EXISTS `asvc_lifts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"""
    ),
    (
        "asvc_bookings",
        """CREATE TABLE IF NOT EXISTS `asvc_bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `lift_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `custom_service` text DEFAULT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_phone` varchar(20) NOT NULL,
  `client_email` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `time_slot` time(0) NOT NULL,
  `duration_hours` int(11) NOT NULL DEFAULT 1,
  `status` enum('new','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `car_brand` varchar(100) DEFAULT NULL,
  `car_model` varchar(100) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"""
    ),
    (
        "asvc_service_history",
        """CREATE TABLE IF NOT EXISTS `asvc_service_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `mileage` int(11) DEFAULT NULL,
  `completed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asvc_service_history_booking_id_key` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"""
    ),
]

for name, sql in tables:
    try:
        cur.execute(sql)
        conn.commit()
        print(f"  OK: {name}")
    except Exception as e:
        print(f"  Skip {name}: {str(e)[:80]}")

# Seed: admin user (bcrypt hash of 'admin123')
admin_hash = '$2b$10$rOzJqCxH6J8K9L1M2N3O4uP5Q6R7S8T9U0V1W2X3Y4Z5a6b7c8d9e0f'
# Use a real bcrypt hash - generate locally
try:
    import bcrypt
    admin_hash = bcrypt.hashpw(b'admin123', bcrypt.gensalt(10)).decode()
    print(f"  Generated bcrypt hash: {admin_hash[:20]}...")
except ImportError:
    # Fallback: use a pre-computed valid bcrypt hash for 'admin123'
    admin_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y'
    print("  Using pre-computed hash for admin123")

try:
    cur.execute("""
        INSERT INTO `asvc_users` (email, phone, name, password_hash, role, updated_at)
        VALUES (%s, %s, %s, %s, 'admin', NOW())
    """, ('admin@autoservice.ru', '+70000000000', 'Администратор', admin_hash))
    conn.commit()
    print("  Admin created: admin@autoservice.ru / admin123")
except Exception as e:
    print(f"  Admin already exists: {str(e)[:60]}")

# Lifts
for i in range(1, 5):
    try:
        cur.execute("INSERT INTO `asvc_lifts` (name) VALUES (%s)", (f'Подъёмник {i}',))
        conn.commit()
        print(f"  Lift {i} created")
    except:
        print(f"  Lift {i} exists")

# Services
services_data = [
    ('Техническое обслуживание', 'Замена масла, фильтров, проверка всех систем', 2000, 5000, 2, 1),
    ('Диагностика', 'Компьютерная диагностика всех систем автомобиля', 500, 1500, 1, 2),
    ('Ремонт ходовой части', 'Замена амортизаторов, рычагов, шаровых опор', 1500, 8000, 3, 3),
    ('Шиномонтаж', 'Замена и балансировка шин', 800, 2000, 1, 4),
    ('Кузовной ремонт', 'Устранение вмятин, покраска элементов', 3000, None, 4, 5),
    ('Замена тормозных колодок', 'Передние и задние тормозные колодки', 1200, 3000, 1, 6),
]
for name, desc, pf, pt, dur, sort in services_data:
    try:
        cur.execute("""
            INSERT INTO `asvc_services` (name, description, price_from, price_to, duration_hours, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, desc, pf, pt, dur, sort))
        conn.commit()
        print(f"  Service: {name}")
    except:
        print(f"  Service exists: {name}")

# Final check
cur.execute("SHOW TABLES LIKE 'asvc_%'")
final = [t[0] for t in cur.fetchall()]
print(f"\n=== Final asvc_ tables: {final}")
cur.execute("SELECT email, role FROM asvc_users")
print("Users:", cur.fetchall())
cur.execute("SELECT COUNT(*) FROM asvc_lifts")
print("Lifts count:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM asvc_services")
print("Services count:", cur.fetchone()[0])

cur.close()
conn.close()
server_sock.close()
transport.close()
print("\n✅ Database ready!")
