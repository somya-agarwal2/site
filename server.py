import http.server
import socketserver
import os
import mimetypes
import json
import urllib.parse

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web") if os.path.isdir(os.path.join(BASE_DIR, "web")) else BASE_DIR
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")

class AdahHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: Get products
        if path == "/api/products":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            if os.path.exists(PRODUCTS_FILE):
                try:
                    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
                        self.wfile.write(f.read().encode("utf-8"))
                except Exception:
                    self.wfile.write(b"[]")
            else:
                self.wfile.write(b"[]")
            return

        # Default mapping
        if path == "/" or path == "/index.html":
            path = "/index.html"
        elif path == "/admin" or path == "/admin/":
            path = "/admin.html"

        # Serve from web directory
        local_path = os.path.join(WEB_DIR, path.lstrip("/"))
        if os.path.isfile(local_path):
            mime_type, _ = mimetypes.guess_type(local_path)
            if not mime_type:
                if local_path.endswith(".js"):
                    mime_type = "application/javascript"
                elif local_path.endswith(".css"):
                    mime_type = "text/css"
                elif local_path.endswith(".html"):
                    mime_type = "text/html"
                else:
                    mime_type = "application/octet-stream"

            with open(local_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(content)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/products":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                data = json.loads(body)
                if isinstance(data, list):
                    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "ok", "count": len(data)}).encode("utf-8"))
                else:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Expected array"}).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AdahHandler) as httpd:
        print(f"ADAH JEWELS Studio Server active at http://localhost:{PORT}/", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
