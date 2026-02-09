"""
MISSION: FINAL DATA POLISH
Export clean absenteeism statistics with real faces and no ghosts.
- Filters: is_active = TRUE (no ghosts/resigned MPs)
- Filters: votes_cast > 20 (excludes very inactive MPs)
- Includes: real photo_url from database
- Output: dashboard/public/data/absenteeism.json
"""
import os
import json
import psycopg2
from datetime import datetime

DB_DSN = os.getenv("DB_DSN")

if not DB_DSN:
    print("ERROR: DB_DSN environment variable not set")
    exit(1)

# Connect to database
conn = psycopg2.connect(DB_DSN)
cur = conn.cursor()

# The "Anti-Ghost" Query
# 1. Filters out inactive MPs (is_active = false) - no resigned/ghost MPs
# 2. Filters out new/inactive MPs with too few votes (< 20) to avoid false positives
# 3. GROUP BY ensures distinct MP records (no duplicates)
SQL = """
WITH mp_stats AS (
    SELECT 
        p.id,
        p.display_name,
        p.photo_url,
        COUNT(mv.vote_id) as votes_cast,
        (SELECT COUNT(*) FROM votes) as total_possible
    FROM politicians p
    LEFT JOIN mp_votes mv ON p.id = mv.politician_id
    WHERE p.is_active = TRUE 
    GROUP BY p.id, p.display_name, p.photo_url
    HAVING COUNT(mv.vote_id) > 20
)
SELECT 
    display_name,
    photo_url,
    votes_cast,
    total_possible,
    ROUND((votes_cast::numeric / NULLIF(total_possible, 0)) * 100, 1) as pct
FROM mp_stats
ORDER BY pct ASC
LIMIT 10;
"""

cur.execute(SQL)
rows = cur.fetchall()

# Format JSON with rank
absentees = []
for rank, (name, photo_url, votes_cast, total_possible, pct) in enumerate(rows, 1):
    absentees.append({
        "rank": rank,
        "name": name,
        "photo_url": photo_url,
        "votes_cast": int(votes_cast),
        "total_possible": int(total_possible),
        "participation_pct": float(pct)
    })

data = {
    "title": "Wall of Shame - Lowest Participation MPs",
    "description": "Bottom 10 active MPs by plenary voting participation (>20 votes, is_active)",
    "generated_at": datetime.now().isoformat(),
    "absentees": absentees
}

# Create directory if needed
os.makedirs("dashboard/public/data", exist_ok=True)

# Save JSON
with open("dashboard/public/data/absenteeism.json", "w", encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Exported {len(absentees)} unique, active MPs to absenteeism.json")
if absentees:
    print(f"   Lowest participation: {absentees[0]['name']} - {absentees[0]['participation_pct']}%")
    print(f"   Highest participation: {absentees[-1]['name']} - {absentees[-1]['participation_pct']}%")

cur.close()
conn.close()
