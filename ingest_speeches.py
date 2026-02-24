import os
from datetime import datetime

import defusedxml.ElementTree as ET
import psycopg2
from psycopg2.extras import execute_values

from utils import fetch_with_retry


DB_DSN = os.getenv("DB_DSN")
BASE_URL = "https://apps.lrs.lt/sip/p2b.ad_sn_pranesimai_ziniasklaidai"


def parse_date(value: str | None):
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def get_attr(node, names):
    for name in names:
        val = node.get(name)
        if val is not None:
            return val
    return None


def get_child_text(node, names):
    for name in names:
        child = node.find(name)
        if child is not None and child.text:
            text = child.text.strip()
            if text:
                return text
    return None


def fetch_speech_rows(seimas_mp_id: int):
    url = f"{BASE_URL}?asmens_id={seimas_mp_id}"
    response = fetch_with_retry(url, timeout=30)
    root = ET.fromstring(response.content)
    rows = []

    for node in root.findall(".//pranesimas"):
        attrs = node.attrib or {}
        # Match both attribute-based and child-based XML variations.
        date_value = get_attr(node, ("pranesimo_data", "data", "date")) or get_child_text(
            node, ("pranesimo_data", "data", "date")
        )
        title_value = get_attr(node, ("pavadinimas", "antraste", "title")) or get_child_text(
            node, ("pavadinimas", "antraste", "title")
        )
        url_value = get_attr(node, ("nuoroda", "url", "link")) or get_child_text(
            node, ("nuoroda", "url", "link")
        )

        if date_value is None and title_value is None and url_value is None:
            continue

        speech_date = parse_date(date_value)
        if speech_date is None:
            continue

        rows.append((speech_date, title_value, url_value))

    return rows


def run_speech_ingest():
    if not DB_DSN:
        print("ERROR: DB_DSN environment variable not set.")
        return

    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, seimas_mp_id
        FROM politicians
        WHERE is_active = TRUE
          AND seimas_mp_id IS NOT NULL
        ORDER BY seimas_mp_id
        """
    )
    mps = cur.fetchall()
    print(f"Found {len(mps)} active MPs with Seimas IDs.")

    total_inserted = 0
    for mp_uuid, seimas_mp_id in mps:
        try:
            speeches = fetch_speech_rows(int(seimas_mp_id))
            cur.execute("DELETE FROM speeches WHERE mp_id = %s", (str(mp_uuid),))
            if speeches:
                payload = [
                    (str(mp_uuid), row_date, row_title, row_url)
                    for row_date, row_title, row_url in speeches
                ]
                execute_values(
                    cur,
                    """
                    INSERT INTO speeches (
                        mp_id, speech_date, speech_title, speech_url
                    ) VALUES %s
                    """,
                    payload,
                )
                total_inserted += len(payload)
            print(f"Synced speeches for MP {seimas_mp_id}: {len(speeches)} rows")
        except Exception as exc:
            print(f"Failed speech ingest for MP {seimas_mp_id}: {exc}")
            conn.rollback()
            continue

    conn.commit()
    cur.close()
    conn.close()
    print(f"Speech ingest complete. Inserted {total_inserted} speech rows.")


if __name__ == "__main__":
    run_speech_ingest()
