import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import unidecode
import os
import json

DB_DSN = os.getenv("DB_DSN", "postgres://julio:jou@localhost:5432/transparency_db")
VMI_FILE = "vmi_assets.xlsx" 
YEAR = 2023 

def normalize(name):
    if not isinstance(name, str): return ""
    return unidecode.unidecode(name).lower().strip()

def ingest_assets():
    if not os.path.exists(VMI_FILE):
        print(f"ERROR: File {VMI_FILE} not found. Please upload the VMI Excel dump.")
        return

    print(f"Reading {VMI_FILE}...")
    # Load Excel. Header=0 implies first row is header.
    df = pd.read_excel(VMI_FILE, header=0) 
    
    # Connect to DB to get the "Golden List"
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()
    cur.execute("SELECT id, full_name_normalized FROM politicians")
    db_mps = {row[1]: row[0] for row in cur.fetchall()}
    
    matches = []
    
    print("Processing rows...")
    for index, row in df.iterrows():
        # Construct Name
        raw_name = f"{row.get('Vardas', '')} {row.get('Pavardė', '')}"
        norm_name = normalize(raw_name)
        
        if norm_name in db_mps:
            politician_id = db_mps[norm_name]
            
            try:
                # Attempt to find the total column or sum specific known columns
                total_value = row.get('Turto suma') or row.get('Bendra turto vertė', 0)
                if pd.isna(total_value): total_value = 0
            except:
                total_value = 0
                
            # Create a JSON dump of the row for audit
            # Convert NaN to None for valid JSON
            row_clean = row.where(pd.notnull(row), None).to_dict()
            
            matches.append((
                str(politician_id),
                YEAR,
                float(total_value),
                json.dumps(row_clean, default=str)
            ))
            
    if matches:
        print(f"Found {len(matches)} matching politicians in VMI data.")
        sql = """
            INSERT INTO assets (politician_id, year, total_value, raw_json)
            VALUES %s
        """
        execute_values(cur, sql, matches)
        conn.commit()
        print("Assets ingested successfully.")
    else:
        print("No matches found. Check column headers in the Excel file.")
        # Fixed nested quotes syntax
        example_names = [normalize(f"{r.get('Vardas')} {r.get('Pavardė')}") for i, r in df.head().iterrows()]
        print(f"First 5 Excel names normalized: {example_names}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    ingest_assets()
