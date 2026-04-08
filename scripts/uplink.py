#!/usr/bin/env python3
from __future__ import annotations

import os
import time
import psutil
from supabase import create_client

# --- CONFIGURATION ---
# This script monitors system metrics and sends them to the CommandNexus dashboard.
# Configure these environment variables on your remote server:
# - NEXUS_SUPABASE_URL
# - NEXUS_SUPABASE_KEY
# - NEXUS_SERVER_NAME (e.g., "CCX23", "EDGE-01")

URL = os.getenv("NEXUS_SUPABASE_URL", "https://pjwegooqtwvloqxnzoxa.supabase.co")
KEY = os.getenv("NEXUS_SUPABASE_KEY", "")
SERVER_NAME = os.getenv("NEXUS_SERVER_NAME", "CCX23")
TABLE = os.getenv("NEXUS_TABLE", "server_uplink")
INTERVAL_SECONDS = float(os.getenv("NEXUS_INTERVAL_SECONDS", "10"))
DISK_PATH = os.getenv("NEXUS_DISK_PATH", "/")

def main() -> int:
    if not URL.strip():
        raise SystemExit("Missing URL (set NEXUS_SUPABASE_URL)")

    if not KEY.strip():
        raise SystemExit("Missing KEY (set NEXUS_SUPABASE_KEY)")

    print(f"--- NEXUS UPLINK STARTING [SERVER: {SERVER_NAME}] ---")
    print(f"Target: {URL} | Interval: {INTERVAL_SECONDS}s")
    print("Press Ctrl+C to stop.")

    supabase = create_client(URL, KEY)

    try:
        while True:
            cpu = psutil.cpu_percent(interval=1)
            ram = psutil.virtual_memory().percent
            disk = psutil.disk_usage(DISK_PATH).percent

            data = {
                "cpu_usage": cpu,
                "ram_usage": ram,
                "disk_usage": disk,
                "status": "online",
                "last_seen": "now()", # Supabase will handle this if configured or we send ISO
            }
            
            # Add timestamp for the backend
            data["updated_at"] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

            # Update an existing row for this server.
            try:
                res = supabase.table(TABLE).update(data).eq("server_name", SERVER_NAME).execute()
                if not res.data:
                    # If no row exists yet, attempt an insert
                    supabase.table(TABLE).insert({"server_name": SERVER_NAME, **data}).execute()
                
                print(f"[{time.strftime('%H:%M:%S')}] Uplink Sent: CPU {cpu:.0f}% | RAM {ram:.0f}% | DISK {disk:.0f}%")
            except Exception as e:
                print(f"Uplink Error: {e}")

            time.sleep(INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\nStopping Uplink...")
        return 0

if __name__ == "__main__":
    raise SystemExit(main())
