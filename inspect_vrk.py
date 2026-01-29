import requests
import json

URL = "https://www.vrk.lt/statiniai/puslapiai/rinkimai/2024/seimas/mobKand.json"

try:
    print(f"Fetching {URL}...")
    resp = requests.get(URL)
    resp.raise_for_status()
    data = resp.json()
    
    print("Type:", type(data))
    if isinstance(data, list):
        print("Length:", len(data))
        if len(data) > 0:
            print("First item keys:", data[0].keys())
            print("First item sample:", json.dumps(data[0], ensure_ascii=False, indent=2))
    elif isinstance(data, dict):
        print("Keys:", data.keys())
        # Check for likely lists
        for k, v in data.items():
            if isinstance(v, list):
                print(f"Key '{k}' is a list of length {len(v)}")
                if len(v) > 0:
                    print(f"Sample item from '{k}':", json.dumps(v[0], ensure_ascii=False, indent=2))
except Exception as e:
    print(f"Error: {e}")
