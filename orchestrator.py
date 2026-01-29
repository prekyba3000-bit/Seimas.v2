import subprocess
import sys
import time
import os

STEPS = [
    # (Display Name, Script Filename, Is_Critical)
    ("1. Ingest MPs", "ingest_seimas.py", True),
    ("2. Link VRK Identity", "link_vrk.py", True),
    ("3. Ingest Votes (Term 10)", "ingest_votes_v2.py", True),
    ("4. Sync Law Metadata", "ingest_legislation.py", False),
    ("5. Repair Regex Errors", "repair_project_ids.py", False),
    ("6. Ingest MP Assets", "ingest_assets.py", False)
]

def main():
    print("\n=== STARTING TRANSPARENCY PIPELINE ===")
    total_start = time.time()
    
    for name, script, critical in STEPS:
        if not os.path.exists(script):
            print(f"[ERROR] Missing script: {script}")
            if critical: sys.exit(1)
            continue
            
        print(f"\n>>> Running: {name}...")
        step_start = time.time()
        
        try:
            # Run the script and wait for it to finish
            result = subprocess.run([sys.executable, script], check=True)
            duration = time.time() - step_start
            print(f"[OK] {name} completed in {duration:.2f}s")
            
        except subprocess.CalledProcessError:
            print(f"[FAIL] {name} encountered an error.")
            if critical:
                print("!!! Critical Failure. Pipeline Aborted. !!!")
                sys.exit(1)
            else:
                print("...Warning: Non-critical step failed. Continuing.")

    total_duration = time.time() - total_start
    print(f"\n=== CHECKPOINT REACHED in {total_duration:.2f}s ===")
    
    # NEW: Automated Planner Sync
    print("\n>>> Finalizing Session: Syncing with Taskade...")
    try:
        subprocess.run([sys.executable, "sync_planner.py"], check=True)
    except subprocess.CalledProcessError:
        print("[WARNING] Taskade sync failed. Check API status.")

    print("\n=== THE ORCHESTRA HAS FINISHED ITS PERFORMANCE ===")
    print("System is synchronized. You may now review progress in Taskade.")

if __name__ == "__main__":
    main()
