import paramiko, pymysql, sys, threading, socket, time
sys.stdout.reconfigure(encoding='utf-8')

SSH_HOST = '77.222.40.251'
SSH_USER = 'kalkov553'
SSH_PASS = 'o9kh1Xurcm8#D4gs'
LOCAL_PORT = 13307

transport = paramiko.Transport((SSH_HOST, 22))
transport.connect(username=SSH_USER, password=SSH_PASS)
print("SSH OK")

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
        pass
    finally:
        try: client_sock.close()
        except: pass

threading.Thread(target=lambda: [tunnel_handler(s) for s, _ in iter(server_sock.accept, None)], daemon=True).start()
time.sleep(0.5)

conn = pymysql.connect(host='127.0.0.1', port=LOCAL_PORT,
    user='kalkov553', password='Qwer2435', database='kalkov553',
    charset='utf8mb4', connect_timeout=15)
print("MySQL OK")
cur = conn.cursor()

cur.execute("SHOW TABLES LIKE 'asvc_%'")
tables = [t[0] for t in cur.fetchall()]
print(f"Tables: {tables}")

if 'asvc_users' in tables:
    cur.execute("SELECT email, role FROM asvc_users")
    print("Users:", cur.fetchall())

if 'asvc_services' in tables:
    cur.execute("SELECT COUNT(*) FROM asvc_services")
    print("Services count:", cur.fetchone()[0])

if 'asvc_lifts' in tables:
    cur.execute("SELECT COUNT(*) FROM asvc_lifts")
    print("Lifts count:", cur.fetchone()[0])

cur.close()
conn.close()
server_sock.close()
transport.close()
