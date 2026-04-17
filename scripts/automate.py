#!/usr/bin/env python3
"""
ASTRON Automation Script
Runs the RBSE scraper periodically and updates the application data.
"""

import json
import time
from datetime import datetime
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
SCRAPER_SCRIPT = ROOT / 'scripts' / 'rbse_scraper.py'
LAST_RUN_FILE = ROOT / 'data' / 'last_scraper_run.json'

def run_scraper():
    """Run the RBSE scraper script."""
    try:
        print(f"[{datetime.now()}] Running RBSE scraper...")
        result = subprocess.run([
            sys.executable, str(SCRAPER_SCRIPT)
        ], capture_output=True, text=True, cwd=ROOT)

        if result.returncode == 0:
            print("✅ Scraper completed successfully")
            return True
        else:
            print(f"❌ Scraper failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running scraper: {e}")
        return False

def update_last_run():
    """Update the last run timestamp."""
    try:
        LAST_RUN_FILE.parent.mkdir(parents=True, exist_ok=True)
        data = {
            'last_run': datetime.now().isoformat(),
            'timestamp': int(time.time())
        }
        LAST_RUN_FILE.write_text(json.dumps(data, indent=2), encoding='utf-8')
    except Exception as e:
        print(f"Warning: Could not update last run file: {e}")

def should_run_scraper():
    """Check if scraper should run (every 6 hours)."""
    if not LAST_RUN_FILE.exists():
        return True

    try:
        data = json.loads(LAST_RUN_FILE.read_text(encoding='utf-8'))
        last_run = data.get('timestamp', 0)
        current_time = int(time.time())

        # Run every 6 hours (21600 seconds)
        return (current_time - last_run) > 21600
    except Exception:
        return True

def main():
    """Main automation function."""
    print("🚀 ASTRON Automation Starting...")

    if should_run_scraper():
        if run_scraper():
            update_last_run()
            print("✅ Automation cycle completed")
        else:
            print("❌ Automation cycle failed")
    else:
        print("⏭️  Scraper not due to run yet")

if __name__ == '__main__':
    main()