import requests
import xml.etree.ElementTree as ET
import psycopg2
from psycopg2.extras import execute_values
import os
import time
import re

# --- Configuration ---
# Use the verified working credentials
DB_DSN = os.getenv("DB_DSN", "postgres://julio:jou@localhost:5432/transparency_db")
BASE_URL = "https://apps.lrs.lt/sip/p2b"
TERM_ID = "10" # 2024-2028 Term

def get_db():
    return psycopg2.connect(DB_DSN)

def fetch_xml(url):
    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200: return None
        return ET.fromstring(r.content)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def ingest_term_votes():
    conn = get_db()
    
    # 1. Get Sessions
    print(f"Fetching Sessions for Term {TERM_ID}...")
    root = fetch_xml(f"{BASE_URL}.ad_seimo_sesijos?kadencijos_id={TERM_ID}")
    if not root: 
        print("Failed to fetch sessions.")
        return
    
    # API uses 'SeimoSesija' with 'sesijos_id' attribute
    sessions = [s.get('sesijos_id') for s in root.findall('.//SeimoSesija')]
    print(f"Found Sessions: {sessions}")

    total_votes = 0

    for sess_id in sessions:
        if not sess_id: continue
        # 2. Get Sittings
        s_root = fetch_xml(f"{BASE_URL}.ad_seimo_posedziai?sesijos_id={sess_id}")
        if not s_root: continue
        
        # API uses 'SeimoPosėdis' with 'posėdžio_id' attribute
        sittings = [p.get('posėdžio_id') for p in s_root.findall('.//SeimoPosėdis')]
        
        print(f"Session {sess_id}: Processing {len(sittings)} sittings...")
        
        for sit_id in sittings:
            if not sit_id: continue
            # 3. Get Agenda (Full eiga has the links)
            agenda = fetch_xml(f"{BASE_URL}.ad_seimo_posedzio_eiga_full?posedzio_id={sit_id}")
            if not agenda: continue
            
            # Extract date from agenda header
            sitting_date_str = None
            posedis_tag = agenda.find('.//posedis')
            if posedis_tag is not None:
                sitting_date_str = posedis_tag.findtext('data') or posedis_tag.get('data')

            cur = conn.cursor()
            
            # Iterate 'darbotvarkes-klausimas' (Agenda Item)
            for q in agenda.findall('.//darbotvarkes-klausimas'):
                # Extract Title
                title = q.findtext('pavadinimas') or "Unknown Motion"
                stadija = q.findtext('stadija') # e.g. Pateikimas
                
                # Extract Project ID (e.g., XIVP-1234) from title if registracijos_nr missing
                # (User emphasized Project ID linkage)
                project_id = q.get('registracijos_nr') # Check if user's field exists
                if not project_id:
                    match = re.search(r'Nr\.\s*([A-Za-z0-9-]+)', title)
                    if match: project_id = match.group(1)
                
                # Find votes inside this question
                # The tag in full eiga is <balsavimas> with 'bals_id'
                for b in q.findall('.//balsavimas'):
                    vid = b.get('bals_id') or b.get('balsavimo_id')
                    if not vid: continue
                    
                    # 4. Fetch Results
                    res_xml = fetch_xml(f"{BASE_URL}.ad_sp_balsavimo_rezultatai?balsavimo_id={vid}")
                    if not res_xml: continue
                    
                    # Metadata from results (if any) or fallback to agenda
                    # Results XML has BalsavimoRezultataiAntraštė
                    header = res_xml.find('.//BalsavimoRezultataiAntraštė')
                    if header is not None:
                        # Use results title if more specific
                        res_title = header.get('klausimo_pavadinimas')
                        if res_title: title = res_title
                        if not stadija: stadija = header.get('balsavimo_tipas')
                    
                    # Insert Vote
                    cur.execute("""
                        INSERT INTO votes (seimas_vote_id, sitting_date, title, project_id, vote_type, created_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (seimas_vote_id) 
                        DO UPDATE SET 
                            title = EXCLUDED.title, 
                            sitting_date = EXCLUDED.sitting_date,
                            project_id = EXCLUDED.project_id,
                            vote_type = EXCLUDED.vote_type
                    """, (vid, sitting_date_str, title, project_id, stadija))
                    
                    # Insert Decisions
                    # Uses IndividualusBalsavimoRezultatas
                    mp_batch = []
                    rows = res_xml.findall('.//IndividualusBalsavimoRezultatas')
                    if not rows: rows = res_xml.findall('.//BalsavimoRezultatai')
                    
                    for v in rows:
                        mp_ext_id = v.get('asmens_id') or v.get('sn_id')
                        choice = v.get('kaip_balsavo') or v.get('balsavimo_rezultatas')
                        
                        if not mp_ext_id: continue
                        
                        # Resolve UUID
                        cur.execute("SELECT id FROM politicians WHERE seimas_mp_id = %s", (int(mp_ext_id),))
                        res = cur.fetchone()
                        if res:
                            mp_batch.append((vid, res[0], choice))
                    
                    if mp_batch:
                        execute_values(cur, 
                            "INSERT INTO mp_votes (vote_id, politician_id, vote_choice) VALUES %s ON CONFLICT DO NOTHING",
                            mp_batch)
                    
                    total_votes += 1
                    conn.commit()
            
            cur.close()
            
    conn.close()
    print(f"SUCCESS: Ingested {total_votes} votes/updates.")


def sync_votes():
    ingest_term_votes()

if __name__ == "__main__":
    ingest_term_votes()
