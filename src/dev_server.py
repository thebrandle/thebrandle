#!/usr/bin/env python3
"""Local preview server for the built site (the folder above src/).  usage: python3 src/dev_server.py [port]
Plain `python3 -m http.server` drops connections when a page asks for many files at once (its queue holds 5),
which showed up as random missing images. This one queues 128, serves /404.html for unknown addresses the way
a real host does, and tells the browser not to keep old copies while developing."""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        page = ROOT / '404.html'
        if code == 404 and page.is_file():
            body = page.read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, fmt, *args):
        if not str(args[1] if len(args) > 1 else '').startswith(('2', '3')):      # only problems reach the log
            super().log_message(fmt, *args)


class Server(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4660
    Server(('127.0.0.1', port), partial(Handler, directory=str(ROOT))).serve_forever()
