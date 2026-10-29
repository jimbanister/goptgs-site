#!/usr/bin/env python3
"""Local preview + in-page copy save for PTGS site draft."""
from __future__ import annotations

import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTENT_JS = ROOT / "js" / "content.js"
PORT = 4173


def read_copy_object() -> str:
    text = CONTENT_JS.read_text(encoding="utf-8")
    m = re.search(r"window\.PTGS_COPY\s*=\s*(\{.*\})\s*;\s*\Z", text, re.S)
    if not m:
        raise ValueError("Could not find window.PTGS_COPY object in content.js")
    return m.group(1)


def write_copy_object(obj: dict) -> None:
    # Pretty JSON that is valid JS object literal (no undefined)
    body = json.dumps(obj, indent=2, ensure_ascii=False)
    # Keep trailing commas out; JSON is fine as JS object literal for our data
    out = (
        "/**\n"
        " * PTGS site copy — edit in the browser (?edit=1) or edit this file.\n"
        " * Keep British English unless Jim switches the site to US English.\n"
        " */\n"
        f"window.PTGS_COPY = {body};\n"
    )
    CONTENT_JS.write_text(out, encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/content":
            try:
                raw = read_copy_object()
                # validate
                json.loads(raw)
                data = raw.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                msg = json.dumps({"error": str(e)}).encode()
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(msg)))
                self.end_headers()
                self.wfile.write(msg)
            return
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/api/content":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            obj = json.loads(raw.decode("utf-8"))
            if not isinstance(obj, dict):
                raise ValueError("Body must be a JSON object")
            write_copy_object(obj)
            msg = json.dumps({"ok": True}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)
        except Exception as e:
            msg = json.dumps({"ok": False, "error": str(e)}).encode()
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


if __name__ == "__main__":
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"PTGS edit server: http://127.0.0.1:{PORT}/?edit=1")
    print("Edit copy in the page, then Save. Writes js/content.js")
    httpd.serve_forever()
