#!/usr/bin/env python3
"""
Simple HTTP Server for Exam Simulator
Runs locally to bypass file:// protocol limitations
"""
import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import re

PORT = 8000
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def end_headers(self):
        # Only allow requests from the same origin (localhost)
        origin = self.headers.get('Origin', '')
        port = self.server.server_address[1]
        allowed_origins = [
            f'http://localhost:{port}',
            f'http://127.0.0.1:{port}',
            'null'  # for file:// protocol
        ]
        if origin in allowed_origins or not origin:
            self.send_header('Access-Control-Allow-Origin', origin or f'http://localhost:{port}')
        else:
            self.send_header('Access-Control-Allow-Origin', 'null')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_PUT(self):
        parsed = urlparse(self.path)

        if parsed.path != '/__upload_images':
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'Not Found')
            return

        qs = parse_qs(parsed.query)
        exam = (qs.get('exam', [''])[0] or '').strip()
        name = (qs.get('name', [''])[0] or '').strip()

        # Basic sanitization to avoid path traversal
        if not exam or not re.fullmatch(r'[A-Za-z0-9_\-]+', exam):
            self.send_response(400)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid exam id'}).encode('utf-8'))
            return

        safe_name = os.path.basename(name)
        if not safe_name:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid filename'}).encode('utf-8'))
            return

        content_length = int(self.headers.get('Content-Length') or 0)
        max_size = 50 * 1024 * 1024  # 50 MB
        if content_length > max_size:
            self.send_response(413)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'File too large. Maximum size is 50 MB.'}).encode('utf-8'))
            return
        data = self.rfile.read(content_length) if content_length > 0 else b''

        dest_dir = DIRECTORY / 'user-content' / 'exams' / exam / 'images'
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / safe_name

        try:
            dest_path.write_bytes(data)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps({'filename': safe_name}).encode('utf-8'))

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    os.chdir(DIRECTORY)

    print("=" * 60)
    print("Exam Simulator - Local Server")
    print("=" * 60)
    print(f"Serving from: {DIRECTORY}")
    print(f"Server running at: http://localhost:{PORT}")
    print("=" * 60)
    print("\nOpening browser...")
    print("\nPress Ctrl+C to stop the server\n")

    # Try to open browser
    try:
        webbrowser.open(f"http://localhost:{PORT}/")
    except:
        print("Could not open browser automatically")
        print(f"Please open: http://localhost:{PORT}/")

    # Start server
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped. Goodbye!")
            sys.exit(0)

if __name__ == "__main__":
    main()
