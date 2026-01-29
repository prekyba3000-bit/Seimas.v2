import os
import sys
from scripts.taskade_client import TaskadeClient
from dotenv import load_dotenv

load_dotenv()

def get_tasks_from_file(filepath):
    """Simple parser for task.md style checkboxes."""
    tasks = []
    if not os.path.exists(filepath): return tasks
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith("- [ ]") or line.startswith("- [/]"):
                tasks.append(line.replace("- [ ]", "").replace("- [/]", "").strip())
    return tasks

def sync_memory_bank():
    token = os.getenv("TASKADE_TOKEN")
    if not token:
        print(">>> Taskade Integration Pending: TOKEN_MISSING")
        return

    client = TaskadeClient(token)
    print(">>> Connecting to Taskade...")
    
    workspaces = client.get_workspaces()
    if not workspaces:
        print(">>> Error: No workspaces found or invalid token.")
        return
    
    # Target the first workspace for simplicity
    ws = workspaces[0]
    ws_id = ws['id']
    name = ws['name']
    print(f">>> Target Workspace: {name} ({ws_id})")

    # Get folders (Taskade projects are often in the default folder)
    # The API often requires a folder/project structure.
    # For now, let's create a new project called "Skaidrus Seimas v.2"
    
    import psycopg2 # For live stats
    
    task_file = "/home/julio/.gemini/antigravity/brain/b8a0f98c-0bb3-477d-a302-4ef9fc9676a5/task.md"
    pending_tasks = get_tasks_from_file(task_file)
    
    # === NEW: Fetch Live Stats ===
    db_dsn = os.getenv("DB_DSN")
    stats_markdown = "### 📊 Live System Pulse\n"
    if db_dsn:
        try:
            conn = psycopg2.connect(db_dsn)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM politicians")
            mp_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM votes")
            vote_count = cur.fetchone()[0]
            stats_markdown += f"- **MPs Ingested**: {mp_count}\n"
            stats_markdown += f"- **Votes Ingested**: {vote_count:,}\n"
            stats_markdown += f"- **Status**: Orchestra Running 🎼\n"
            cur.close()
            conn.close()
        except:
            stats_markdown += "- *[Stats currently unavailable]*\n"
    
    # === NEW: Fetch Intelligence Briefing ===
    intelligence_markdown = "\n### 🕵️ Intelligence Briefing\n"
    if db_dsn:
        try:
            cur = conn.cursor()
            # Top 3 High Attendance
            cur.execute("""
                SELECT p.display_name, ROUND(CAST(COUNT(CASE WHEN mv.vote_choice != 'Nedalyvavo' THEN 1 END) AS NUMERIC) / COUNT(mv.id) * 100, 1) as pct
                FROM politicians p JOIN mp_votes mv ON p.id = mv.politician_id
                GROUP BY p.id, p.display_name HAVING COUNT(mv.id) > 50
                ORDER BY pct DESC LIMIT 3
            """)
            top_attendance = cur.fetchall()
            intelligence_markdown += "**Top Attendance (Reliable):**\n"
            for name, pct in top_attendance:
                intelligence_markdown += f"- {name}: {pct}%\n"
            
            # Count potential rebels (just a count for now)
            cur.execute("SELECT COUNT(*) FROM mp_votes WHERE vote_choice IN ('Už', 'Prieš')")
            total_active_votes = cur.fetchone()[0]
            intelligence_markdown += f"\n**Active Participation**: {total_active_votes:,} documented votes."
            
            # NEW: Controversial Votes (Drama Detector)
            cur.execute("""
                SELECT title, sitting_date, uz_count, pries_count, ABS(uz_count - pries_count) as margin
                FROM (
                    SELECT v.seimas_vote_id, v.title, v.sitting_date,
                    COUNT(CASE WHEN mv.vote_choice = 'Už' THEN 1 END) as uz_count,
                    COUNT(CASE WHEN mv.vote_choice = 'Prieš' THEN 1 END) as pries_count
                    FROM votes v JOIN mp_votes mv ON v.seimas_vote_id = mv.vote_id
                    GROUP BY v.seimas_vote_id, v.title, v.sitting_date
                ) sub WHERE uz_count > 10 AND pries_count > 10
                ORDER BY margin ASC, sitting_date DESC LIMIT 3
            """)
            controversy = cur.fetchall()
            intelligence_markdown += "\n\n**🔥 Peak Drama (Tie-Breakers needed):**\n"
            for title, date, uz, ps, margin in controversy:
                title_clean = title.strip() or "[Unnamed Vote]"
                intelligence_markdown += f"- **{title_clean[:50]}...** (Margin: {margin})\n"
            
            # === NEW: Financial Stake Analysis (Follow the Money) ===
            cur.execute("""
                SELECT p.display_name, a.securities_art_jewelry_eur
                FROM politicians p JOIN mp_assets a ON p.id = a.politician_id
                WHERE a.year = 2023 AND a.securities_art_jewelry_eur > 100000
                ORDER BY a.securities_art_jewelry_eur DESC LIMIT 3
            """)
            rich_mps = cur.fetchall()
            intelligence_markdown += "\n\n**💰 High Financial Stake (Securities > 100k€):**\n"
            for name, amount in rich_mps:
                intelligence_markdown += f"- {name}: {amount:,.0f} €\n"
            
            cur.close()
        except Exception as e:
            intelligence_markdown += f"- *[Intelligence extraction failed: {str(e)}]*\n"
    
    content = stats_markdown + intelligence_markdown + "\n### 📝 Project Roadmap\n" + "\n".join([f"- [ ] {t}" for t in pending_tasks])
    
    print(f">>> Syncing {len(pending_tasks)} pending tasks...")
    
    # We need a folder_id. Usually 'default' or we find the first folder.
    # Note: Taskade API v1 might require specific folder IDs. 
    # Let's try to get folders.
    response = requests.get(f"{client.base_url}/workspaces/{ws_id}/folders", headers=client.headers)
    folders = response.json().get("items", [])
    if not folders:
        print(">>> No folders found in workspace.")
        return
    
    folder_id = folders[0]['id']
    
    print(f">>> Creating/Updating project in folder: {folders[0]['name']}")
    project = client.create_project(folder_id, "Skaidrus Seimas v.2", content)
    
    if project and 'item' in project:
        print(f">>> SUCCESS: Project synced to Taskade!")
        print(f">>> Link: https://www.taskade.com/p/{project['item']['id']}")
    else:
        print(f">>> Sync failed or unexpected response: {project}")

if __name__ == "__main__":
    import requests # Ensure requests is available for the folder fetch
    sync_memory_bank()
