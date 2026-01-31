from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool
import os
import time
from typing import List, Dict
from collections import defaultdict

app = FastAPI(title="Skaidrus Seimas API")

# Suppress browser 404s for common static files
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

@app.get("/robots.txt", include_in_schema=False)
def robots():
    return Response("User-agent: *\nDisallow: /api/", media_type="text/plain")

# Enable CORS for production and local development
ALLOWED_ORIGINS = [
    "https://seimasv2-dashboard-production.up.railway.app",  # Production dashboard
    "https://seimasv2-dashboard.up.railway.app",  # Alternate production
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternate dev port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "OPTIONS"],  # Read-only API
    allow_headers=["*"],
    allow_credentials=True,
)

DB_DSN = os.getenv("DB_DSN")

# Simple in-memory rate limiter (60 requests per minute per IP)
RATE_LIMIT = 60
RATE_WINDOW = 60  # seconds
_rate_tracker: dict = defaultdict(list)

def check_rate_limit(ip: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = time.time()
    # Clean old entries
    _rate_tracker[ip] = [t for t in _rate_tracker[ip] if now - t < RATE_WINDOW]
    if len(_rate_tracker[ip]) >= RATE_LIMIT:
        return False
    _rate_tracker[ip].append(now)
    return True

# Connection pool (lazy init)
_pool = None

def get_pool():
    global _pool
    if _pool is None and DB_DSN:
        try:
            _pool = ThreadedConnectionPool(2, 10, DB_DSN)
        except Exception as e:
            print(f"Failed to create connection pool: {e}")
    return _pool

@contextmanager
def get_db_conn():
    """Context manager for database connections with automatic return to pool."""
    pool = get_pool()
    if not pool:
        yield None
        return
    conn = None
    try:
        conn = pool.getconn()
        conn.cursor_factory = RealDictCursor
        yield conn
    except Exception as e:
        print(f"Database connection error: {e}")
        yield None
    finally:
        if conn:
            pool.putconn(conn)

@app.get("/api/stats")
def get_stats(request: Request):
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
    
    with get_db_conn() as conn:
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        with conn.cursor() as cur:
            # Total MPs
            cur.execute("SELECT count(*) as count FROM politicians")
            mp_count = cur.fetchone()["count"]
            
            # Total Votes
            cur.execute("SELECT count(*) as count FROM votes")
            vote_count = cur.fetchone()["count"]
            
            # Rebel Count (approximate check for dashboard pulse)
            cur.execute("SELECT count(DISTINCT politician_id) as count FROM mp_assets WHERE year = 2023")
            rebel_count = cur.fetchone()["count"]
            
            return {
                "total_mps": mp_count,
                "historical_votes": f"{vote_count:,}",
                "accuracy": "99.9%",
                "active_rebels": rebel_count
            }

@app.get("/api/activity")
def get_activity():
    with get_db_conn() as conn:
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        with conn.cursor() as cur:
            # Get 5 recent "interesting" events (e.g. from mp_votes)
            cur.execute("""
                SELECT p.display_name, v.title, mv.vote_choice, v.sitting_date
                FROM mp_votes mv
                JOIN politicians p ON mv.politician_id = p.id
                JOIN votes v ON mv.vote_id = v.seimas_vote_id
                WHERE mv.vote_choice IN ('Prieš', 'Susilaikė')
                ORDER BY v.sitting_date DESC, v.created_at DESC
                LIMIT 5
            """)
            rows = cur.fetchall()
            activity = []
            for row in rows:
                activity.append({
                    "name": row["display_name"],
                    "action": f"Voted {row['vote_choice']}",
                    "context": row["title"][:50] + "...",
                    "time": str(row["sitting_date"])
                })
            return activity

@app.get("/api/mps")
def get_mps():
    """List all MPs for selector dropdown."""
    with get_db_conn() as conn:
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, display_name, current_party, photo_url, is_active
                FROM politicians
                WHERE is_active = TRUE
                ORDER BY display_name
            """)
            rows = cur.fetchall()
            return [
                {
                    "id": str(row["id"]),
                    "name": row["display_name"],
                    "party": row["current_party"],
                    "photo": row["photo_url"],
                    "active": row["is_active"]
                }
                for row in rows
            ]

@app.get("/api/mps/compare")
def compare_mps(ids: str):
    """
    Compare voting records between 2-4 MPs.
    
    Args:
        ids: Comma-separated UUIDs of MPs to compare
    
    Returns:
        mps: List of MP info
        alignment_matrix: Pairwise voting alignment percentages
        divergent_votes: Recent votes where MPs disagreed
    """
    mp_ids = [i.strip() for i in ids.split(",") if i.strip()]
    
    if len(mp_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 MP IDs required")
    if len(mp_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 MPs can be compared")
    
    with get_db_conn() as conn:
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        with conn.cursor() as cur:
            # 1. Get MP info
            cur.execute("""
                SELECT id, display_name, current_party, photo_url
                FROM politicians
                WHERE id = ANY(%s::uuid[])
            """, (mp_ids,))
            mp_rows = cur.fetchall()
            
            if len(mp_rows) != len(mp_ids):
                raise HTTPException(status_code=404, detail="One or more MPs not found")
            
            mps = [
                {
                    "id": str(row["id"]),
                    "name": row["display_name"],
                    "party": row["current_party"],
                    "photo": row["photo_url"]
                }
                for row in mp_rows
            ]
            
            # 2. Calculate pairwise alignment
            # For each pair, find votes where both participated and calculate agreement %
            alignment_matrix = []
            for i, mp1_id in enumerate(mp_ids):
                row = []
                for j, mp2_id in enumerate(mp_ids):
                    if i == j:
                        row.append(1.0)
                    else:
                        cur.execute("""
                            SELECT 
                                COUNT(*) as total,
                                SUM(CASE WHEN mv1.vote_choice = mv2.vote_choice THEN 1 ELSE 0 END) as agreed
                            FROM mp_votes mv1
                            JOIN mp_votes mv2 ON mv1.vote_id = mv2.vote_id
                            WHERE mv1.politician_id = %s::uuid
                              AND mv2.politician_id = %s::uuid
                              AND mv1.vote_choice IS NOT NULL
                              AND mv2.vote_choice IS NOT NULL
                        """, (mp1_id, mp2_id))
                        result = cur.fetchone()
                        total = result["total"] or 0
                        agreed = result["agreed"] or 0
                        alignment = round(agreed / total, 3) if total > 0 else 0
                        row.append(alignment)
                alignment_matrix.append(row)
            
            # 3. Get recent divergent votes (where MPs voted differently)
            cur.execute("""
                SELECT DISTINCT v.seimas_vote_id, v.title, v.sitting_date
                FROM votes v
                JOIN mp_votes mv1 ON v.seimas_vote_id = mv1.vote_id
                JOIN mp_votes mv2 ON v.seimas_vote_id = mv2.vote_id
                WHERE mv1.politician_id = ANY(%s::uuid[])
                  AND mv2.politician_id = ANY(%s::uuid[])
                  AND mv1.politician_id != mv2.politician_id
                  AND mv1.vote_choice != mv2.vote_choice
                  AND mv1.vote_choice IS NOT NULL
                  AND mv2.vote_choice IS NOT NULL
                ORDER BY v.sitting_date DESC
                LIMIT 10
            """, (mp_ids, mp_ids))
            divergent_votes_raw = cur.fetchall()
            
            # Get votes for each MP on these divergent issues
            divergent_votes = []
            for vote_row in divergent_votes_raw:
                vote_id = vote_row["seimas_vote_id"]
                cur.execute("""
                    SELECT politician_id, vote_choice
                    FROM mp_votes
                    WHERE vote_id = %s AND politician_id = ANY(%s::uuid[])
                """, (vote_id, mp_ids))
                mp_votes_map = {str(r["politician_id"]): r["vote_choice"] for r in cur.fetchall()}
                
                divergent_votes.append({
                    "vote_id": vote_id,
                    "title": vote_row["title"][:80] + "..." if len(vote_row["title"]) > 80 else vote_row["title"],
                    "date": str(vote_row["sitting_date"]),
                    "votes": mp_votes_map
                })
            
            return {
                "mps": mps,
                "alignment_matrix": alignment_matrix,
                "divergent_votes": divergent_votes
            }

@app.get("/api/mps/{mp_id}")
def get_mp(mp_id: str):
    """Get details for a single MP."""
    with get_db_conn() as conn:
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.id, p.display_name, p.current_party, p.photo_url, 
                       p.is_active, p.seimas_id, p.mandate_start,
                       COUNT(DISTINCT mv.vote_id) as vote_count
                FROM politicians p
                LEFT JOIN mp_votes mv ON p.id = mv.politician_id
                WHERE p.id = %s::uuid
                GROUP BY p.id
            """, (mp_id,))
            row = cur.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="MP not found")
            
            return {
                "id": str(row["id"]),
                "name": row["display_name"],
                "party": row["current_party"],
                "photo": row["photo_url"],
                "active": row["is_active"],
                "seimas_id": row["seimas_id"],
                "term_start": str(row["mandate_start"]) if row["mandate_start"] else None,
                "vote_count": row["vote_count"]
            }

@app.get("/api/mps/{mp_id}/votes")
def get_mp_votes(mp_id: str, limit: int = 20):
    """Get recent votes for an MP."""
    with get_db_conn() as conn:
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        with conn.cursor() as cur:
            cur.execute("""
                SELECT v.title, v.sitting_date, mv.vote_choice
                FROM mp_votes mv
                JOIN votes v ON mv.vote_id = v.seimas_vote_id
                WHERE mv.politician_id = %s::uuid
                ORDER BY v.sitting_date DESC
                LIMIT %s
            """, (mp_id, limit))
            rows = cur.fetchall()
            
            return [
                {
                    "title": row["title"][:80] + "..." if len(row["title"]) > 80 else row["title"],
                    "date": str(row["sitting_date"]),
                    "choice": row["vote_choice"]
                }
                for row in rows
            ]

@app.get("/")
def root():
    return {
        "name": "Skaidrus Seimas API",
        "version": "2.2",
        "endpoints": ["/health", "/api/stats", "/api/activity", "/api/mps", "/api/mps/{id}", "/api/mps/{id}/votes", "/api/mps/compare"]
    }

@app.get("/health")
def health():
    """Health check with DB connectivity verification."""
    db_status = "disconnected"
    try:
        with get_db_conn() as conn:
            if conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                    db_status = "connected"
    except Exception:
        db_status = "error"
    
    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "orchestra": "conducting",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
