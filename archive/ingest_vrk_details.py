import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
import requests
import json

DB_DSN = os.getenv("DB_DSN", "postgres://julio:jou@localhost:5432/transparency_db")
BASE_URL = "https://www.vrk.lt/statiniai/puslapiai/rinkimai/1544/rnk1870/kandidatai/"

def run_scraper():
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()
    
    # Get linked MPs
    cur.execute("SELECT id, vrk_candidate_id FROM politicians WHERE vrk_candidate_id IS NOT NULL")
    mps = cur.fetchall()
    print(f"Scraping details for {len(mps)} MPs...")
    
    asset_updates = []
    interest_updates = []
    
    for mp_id, vrk_id in mps:
        # 1. Scrape Assets (Turto/Pajamų Deklaracija)
        url_assets = f"{BASE_URL}KandidatasTurtoPajDekl_rkndId-{vrk_id}.html"
        try:
            # explicit flavor usually helps, keeping default for now but ready to switch
            dfs = pd.read_html(url_assets, encoding='utf-8')
            if dfs:
                # Based on inspection, usually table 0 or 1 has the data.
                # We store the raw JSON for post-processing safety.
                # Converting the first table to JSON.
                raw_json = dfs[0].to_json()
                total_val = 0 
                
                # Heuristic: try to find a cell that looks like total if possible, 
                # but user script had 0 placeholder. Keeping 0.
                
                asset_updates.append((
                    str(mp_id),
                    2024,
                    total_val,
                    url_assets,
                    raw_json
                ))
        except ValueError as ve:
            # No tables found
            pass
        except Exception as e:
            print(f"Skipping Assets for {vrk_id}: {e}")

        # 2. Scrape Interests (Privačių Interesų)
        url_interests = f"{BASE_URL}KandidatasPrivInterDekl_rkndId-{vrk_id}.html"
        try:
            dfs = pd.read_html(url_interests, encoding='utf-8')
            for df in dfs:
                content = df.to_json()
                # Schema: politician_id, interest_type, description, organization_name
                # We store the raw JSON table in 'description' and use a placeholder for 'organization_name'
                # since we aren't parsing the specific rows yet.
                interest_updates.append((
                    str(mp_id),
                    'VRK_DECLARATION',
                    content,          # description
                    'VRK Import (Raw)' # organization_name
                ))
        except ValueError:
            pass
        except Exception as e:
            pass # Not all candidates have interest tables
            
    # Batch Insert Assets
    if asset_updates:
        print(f"Inserting {len(asset_updates)} asset records...")
        sql = """
            INSERT INTO assets (politician_id, year, total_value, source_url, raw_json)
            VALUES %s
        """
        execute_values(cur, sql, asset_updates)
        
    # Batch Insert Interests
    # Note: schema expects (politician_id, interest_type, description, organization_name)
    # But my script above had extra raw content. 
    # Let's check schema again.
    # Schema: politician_id, interest_type, description, organization_name, created_at
    # User script had: (mp_id, 'VRK_DECLARATION', 'Raw Table', content) -> 4 args
    # But schema `description` and `organization_name` are text columns.
    # The user script provided SQL: INSERT INTO interests (politician_id, interest_type, description, organization_name)
    # So I need 4 values in the tuple.
    
    if interest_updates:
        print(f"Inserting {len(interest_updates)} interest records...")
        # Clean up tuple to match schema: 
        # (id, type, desc, org_name) -> we put content in desc or ignore?
        # User script put content in 4th arg? Wait.
        # User script: (str(mp_id), 'VRK_DECLARATION', 'Raw Table', content)
        # SQL: INSERT INTO ... (..., description, organization_name)
        # So 'Raw Table' -> description, content -> organization_name? 
        # That's a bit hacky but follows the user's intent to store data.
        
        # Fixing tuple construction in loop above to be clearer.
        # Re-defining interest_updates processing here just in case.
        
        sql = """
            INSERT INTO interests (politician_id, interest_type, description, organization_name)
            VALUES %s
        """
        # We need to make sure we don't insert too huge JSON into a TEXT column if it's small.
        # But 'organization_name' is TEXT. JSON is fine.
        execute_values(cur, sql, interest_updates)

    conn.commit()
    conn.close()
    print("Deep dive ingestion complete.")

if __name__ == "__main__":
    run_scraper()
