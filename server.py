import http.server
import socketserver
import json
import sqlite3
import urllib.parse
import os

PORT = 3000
DB_FILE = 'warehouse.db'

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

class APIServer(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/all':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = dict_factory
            cursor = conn.cursor()
            
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row['name'] for row in cursor.fetchall()]
            
            data = {}
            for table in tables:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                # Attempt to parse JSON strings back to lists/dicts if needed, or just return as is
                for r in rows:
                    for k, v in r.items():
                        if isinstance(v, str) and (v.startswith('[') or v.startswith('{')):
                            try:
                                r[k] = json.loads(v)
                            except:
                                pass
                data[table] = rows
                
            conn.close()
            self.wfile.write(json.dumps(data).encode('utf-8'))
        else:
            # Serve static files (the frontend)
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            collection = self.path.split('/')[-1]
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.end_headers()
                return
                
            post_data = self.rfile.read(content_length)
            items = json.loads(post_data.decode('utf-8'))
            
            if not isinstance(items, list):
                items = [items]
            
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            cursor.execute(f"DROP TABLE IF EXISTS {collection}")
            
            if len(items) > 0:
                # Auto-create table based on first item
                first_item = items[0]
                columns = []
                for k in first_item.keys():
                    if k == 'id': columns.append("id TEXT PRIMARY KEY")
                    else: columns.append(f"{k} TEXT")
                
                if 'id' not in first_item:
                    columns.append("id TEXT PRIMARY KEY")
                    
                cursor.execute(f"CREATE TABLE {collection} ({', '.join(columns)})")
                
                for item in items:
                    for k, v in item.items():
                        if isinstance(v, (dict, list)): item[k] = json.dumps(v)
                        else: item[k] = str(v)
                    
                    keys = ", ".join(item.keys())
                    placeholders = ", ".join(["?"] * len(item))
                    values = tuple(item.values())
                    cursor.execute(f"INSERT INTO {collection} ({keys}) VALUES ({placeholders})", values)
            
            conn.commit()
            conn.close()
            
            self.send_response(201)
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": len(items)}).encode('utf-8'))

    def do_DELETE(self):
        if self.path.startswith('/api/'):
            parts = self.path.split('/')
            collection = parts[2]
            item_id = urllib.parse.unquote(parts[3]) if len(parts) > 3 else None
            
            if item_id:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                try:
                    cursor.execute(f"DELETE FROM {collection} WHERE id = ?", (item_id,))
                    conn.commit()
                except Exception as e:
                    print(e)
                conn.close()
                
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({"status": "deleted"}).encode('utf-8'))

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), APIServer) as httpd:
        print(f"==================================================")
        print(f"MASSIVE BACKEND API & DATABASE SERVER RUNNING")
        print(f"Listening at http://localhost:{PORT}")
        print(f"==================================================")
        httpd.serve_forever()
