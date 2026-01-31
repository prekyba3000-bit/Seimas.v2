import requests
import psycopg2
from psycopg2.extras import execute_values
import unidecode
import os
import defusedxml.ElementTree as ET
from datetime import datetime
from utils import fetch_with_retry

DB_DSN = os.getenv("DB_DSN") 
SEIMAS_API_URL = "https://apps.lrs.lt/sip/p2b.ad_seimo_nariai"

def normalize(name):
    if not name: return ""
    clean = unidecode.unidecode(name).lower().strip()
    return " ".join(clean.split())  # Collapse multiple spaces

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None

def sync_db():
    if not DB_DSN:
        print("ERROR: DB_DSN environment variable not set.")
        return

    print(f"Fetching XML from {SEIMAS_API_URL}...")
    response = fetch_with_retry(SEIMAS_API_URL, timeout=30)
    root = ET.fromstring(response.content)
    
    mps = []
    active_count = 0
    
    # Adjusted to match actual API response which uses CamelCase and Lithuanian diacritics
    for node in root.findall('.//SeimoNarys'):
        # API uses 'asmens_id' not 'sn_id'
        mp_id = node.get('asmens_id')
        if not mp_id: continue
        
        # 'pavardė' has a dot/special char on e
        full_name = f"{node.get('vardas')} {node.get('pavardė')}"
        
        # LOGIC: If 'data_iki' exists, mandate has ended.
        data_iki = node.get('data_iki')
        term_end = parse_date(data_iki)
        is_active = term_end is None
        
        if is_active: active_count += 1
        
        # 'frakcija' is not an attribute of SeimoNarys, need to look in Pareigos children
        # But for quick fix, assume user wanted to stick to their structure.
        # However, to make it work, we must traverse Pareigos.
        party = 'Unknown'
        for pareigos in node.findall('Pareigos'):
            if pareigos.get('pareigos') == 'Frakcijos narys':
                party = pareigos.get('padalinio_pavadinimas')
                break
        
        # Photo URL - Heuristic based on pattern or children
        # Seimas API typically has a photo link or thumb
        photo_url = f"https://www.lrs.lt/sip/p2b.ad_seimo_nario_nuotrauka?asmens_id={mp_id}"
        bio = "" # Bio requires separate fetch or child node
        
        mps.append((
            normalize(full_name),
            full_name,
            mp_id,
            party,
            is_active,
            term_end,
            photo_url,
            bio
        ))
        
    print(f"Found {active_count} active MPs out of {len(mps)} total records.")
    
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()
    
    sql = """
        INSERT INTO politicians (
            full_name_normalized, display_name, seimas_mp_id, current_party, is_active, term_end_date, photo_url, bio
        ) VALUES %s
        ON CONFLICT (seimas_mp_id) DO UPDATE SET
            current_party = EXCLUDED.current_party,
            is_active = EXCLUDED.is_active,
            term_end_date = EXCLUDED.term_end_date,
            photo_url = EXCLUDED.photo_url;
    """
    
    execute_values(cur, sql, mps)
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    sync_db()
