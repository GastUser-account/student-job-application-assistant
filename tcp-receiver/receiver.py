import base64
import json
import os
import socketserver
import threading
import urllib.request
import urllib.error
from datetime import datetime, timezone

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "9000"))
SUPABASE_FUNCTION_URL = os.getenv("SUPABASE_FUNCTION_URL", "").strip()
LOGGER_INGEST_SECRET = os.getenv("LOGGER_INGEST_SECRET", "").strip()
DEVICE_ID = os.getenv("DEVICE_ID", "gsx8-prototype")
IDLE_TIMEOUT = float(os.getenv("IDLE_TIMEOUT_SECONDS", "2.0"))
MAX_BYTES = int(os.getenv("MAX_PAYLOAD_BYTES", "65536"))

def forward_payload(raw: bytes, peer: str) -> None:
    if not SUPABASE_FUNCTION_URL or not LOGGER_INGEST_SECRET:
        print("Received payload but forwarding is not configured (set SUPABASE_FUNCTION_URL and LOGGER_INGEST_SECRET).", flush=True)
        return
    body = json.dumps({
        "device_id": DEVICE_ID,
        "received_at_receiver": datetime.now(timezone.utc).isoformat(),
        "remote_peer": peer,
        "payload_text": raw.decode("utf-8", errors="replace"),
        "payload_base64": base64.b64encode(raw).decode("ascii"),
    }).encode("utf-8")
    req = urllib.request.Request(
        SUPABASE_FUNCTION_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-logger-secret": LOGGER_INGEST_SECRET,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            print(f"Forwarded {len(raw)} bytes from {peer}; Supabase HTTP {response.status}", flush=True)
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"Supabase forwarding failed for {peer}: {exc}", flush=True)

class Handler(socketserver.BaseRequestHandler):
    def handle(self):
        self.request.settimeout(IDLE_TIMEOUT)
        chunks = []
        total = 0
        peer = f"{self.client_address[0]}:{self.client_address[1]}"
        while total < MAX_BYTES:
            try:
                chunk = self.request.recv(min(4096, MAX_BYTES - total))
            except socket.timeout:
                break
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
        raw = b"".join(chunks)
        if not raw:
            print(f"Empty TCP connection from {peer}", flush=True)
            return
        print(f"Received {len(raw)} bytes from {peer}: {raw[:160]!r}", flush=True)
        threading.Thread(target=forward_payload, args=(raw, peer), daemon=True).start()

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    print(f"GSX8 TCP receiver listening on {HOST}:{PORT}", flush=True)
    with Server((HOST, PORT), Handler) as server:
        server.serve_forever()
