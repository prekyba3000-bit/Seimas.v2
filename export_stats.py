"""
Wall of Shame — Lowest Attendance by Sitting Day
Attendance = number of sitting days the MP showed up (cast at least one
non-Nedalyvavo vote) divided by total sitting days they were registered for.
"""
import os
import json
import psycopg2
from datetime import datetime

DB_DSN = os.getenv("DB_DSN")

if not DB_DSN:
    print("ERROR: DB_DSN environment variable not set")
    exit(1)

conn = psycopg2.connect(DB_DSN)
cur = conn.cursor()

SQL = """
WITH day_attendance AS (
    SELECT
        p.id,
        p.display_name,
        p.photo_url,
        COUNT(DISTINCT v.sitting_date) AS total_days,
        COUNT(DISTINCT v.sitting_date) FILTER (
            WHERE mv.vote_choice != 'Nedalyvavo'
        ) AS days_present
    FROM politicians p
    JOIN mp_votes mv ON p.id = mv.politician_id
    JOIN votes v ON mv.vote_id = v.seimas_vote_id
    WHERE p.is_active = TRUE
    GROUP BY p.id, p.display_name, p.photo_url
    HAVING COUNT(DISTINCT v.sitting_date) > 5
)
SELECT
    display_name,
    photo_url,
    days_present,
    total_days,
    ROUND((days_present::numeric / NULLIF(total_days, 0)) * 100, 1) AS pct
FROM day_attendance
ORDER BY pct ASC
LIMIT 10;
"""

cur.execute(SQL)
rows = cur.fetchall()

absentees = []
for rank, (name, photo_url, days_present, total_days, pct) in enumerate(rows, 1):
    absentees.append({
        "rank": rank,
        "name": name,
        "photo_url": photo_url,
        "days_present": int(days_present),
        "total_days": int(total_days),
        "participation_pct": float(pct)
    })

data = {
    "title": "Gėdos siena — žemiausias dalyvavimas",
    "description": "10 aktyviausiai praleistų posėdžių dienų narių (pagal faktinį dalyvavimą posėdžių dienomis)",
    "generated_at": datetime.now().isoformat(),
    "absentees": absentees
}

os.makedirs("dashboard/public/data", exist_ok=True)

with open("dashboard/public/data/absenteeism.json", "w", encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Exported {len(absentees)} MPs to absenteeism.json (by sitting day)")
if absentees:
    print(f"  Lowest: {absentees[0]['name']} — {absentees[0]['participation_pct']}% ({absentees[0]['days_present']}/{absentees[0]['total_days']} dienų)")
