import psycopg2
import os

# --- Configuration ---
DB_DSN = os.getenv("DB_DSN", "postgres://julio:jou@localhost:5432/transparency_db")

def populate_legislation_from_votes():
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()
    
    print("Populating 'legislation' table from captured 'votes' data...")
    
    # 1. Ensure table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS legislation (
            project_id TEXT PRIMARY KEY,
            title TEXT,
            summary TEXT,
            url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    
    # 2. Extract unique project IDs and titles from votes
    # Using REGEXP_REPLACE or split to clean up titles if needed.
    # Current titles look like: "Motion Title (Nr. XIVP-1234)"
    # We can use the most frequent title or just any.
    
    cur.execute("""
        INSERT INTO legislation (project_id, title, url)
        SELECT DISTINCT ON (project_id) 
            project_id, 
            title,
            'https://e-seimas.lrs.lt/portal/documentSearch/lt' as url -- Default search portal
        FROM votes
        WHERE project_id IS NOT NULL
        ON CONFLICT (project_id) DO UPDATE SET title = EXCLUDED.title
    """)
    
    row_count = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"SUCCESS: Populated {row_count} records in 'legislation' table.")

if __name__ == "__main__":
    populate_legislation_from_votes()
