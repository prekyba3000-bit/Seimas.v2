import base64
import datetime as dt
import html
import math
import mimetypes
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from string import Template
from typing import Any, Dict, Tuple

import requests
from playwright.sync_api import sync_playwright


TEMPLATE_PATH = Path(__file__).with_name("share_card_template.html")
DEFAULT_PHOTO_SVG = (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>"
    "<rect width='300' height='300' fill='#2D2E3A'/>"
    "<text x='150' y='170' text-anchor='middle' fill='#A9B1D6' font-size='84' font-family='sans-serif'>MP</text>"
    "</svg>"
)

FORMAT_DIMENSIONS: Dict[str, Tuple[int, int]] = {
    "primary": (1200, 628),
    "square": (1080, 1080),
}
_playwright_install_lock = threading.Lock()
_playwright_install_attempted = False

RARITY_BORDER = {
    "mythic": "#facc15",
    "legendary": "#a855f7",
    "epic": "#60a5fa",
    "rare": "#4ade80",
    "common": "#6b7280",
}


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except Exception:
        return default


def _fetch_photo_data_uri(photo_url: str | None) -> str:
    if not photo_url:
        encoded = base64.b64encode(DEFAULT_PHOTO_SVG.encode("utf-8")).decode("ascii")
        return f"data:image/svg+xml;base64,{encoded}"

    try:
        response = requests.get(photo_url, timeout=15)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
        if not content_type.startswith("image/"):
            guess = mimetypes.guess_type(photo_url)[0]
            content_type = guess if guess and guess.startswith("image/") else "image/jpeg"
        encoded = base64.b64encode(response.content).decode("ascii")
        return f"data:{content_type};base64,{encoded}"
    except Exception:
        encoded = base64.b64encode(DEFAULT_PHOTO_SVG.encode("utf-8")).decode("ascii")
        return f"data:image/svg+xml;base64,{encoded}"


def compute_radar_vertices(attributes: dict, center_x: float, center_y: float, radius: float) -> str:
    """Compute SVG polygon vertices for a 5-axis radar chart."""
    keys = ["STR", "WIS", "CHA", "INT", "STA"]
    vertices = []
    for i, key in enumerate(keys):
        value = float(attributes.get(key, 0) or 0) / 100.0
        value = max(0.0, min(1.0, value))
        angle = (2 * math.pi * i / 5) - (math.pi / 2)
        x = center_x + radius * value * math.cos(angle)
        y = center_y + radius * value * math.sin(angle)
        vertices.append(f"{x:.1f},{y:.1f}")
    return " ".join(vertices)


def _compute_ring_vertices(center_x: float, center_y: float, radius: float, points: int = 5) -> str:
    coords = []
    for i in range(points):
        angle = (2 * math.pi * i / points) - (math.pi / 2)
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        coords.append(f"{x:.1f},{y:.1f}")
    return " ".join(coords)


def _alignment_visual(alignment: str) -> Tuple[str, str]:
    raw = (alignment or "True Neutral").lower()
    if "good" in raw:
        tone = "background:#166534;color:#bbf7d0;"
    elif "evil" in raw:
        tone = "background:#7f1d1d;color:#fecaca;"
    else:
        tone = "background:#374151;color:#e5e7eb;"

    if "lawful" in raw:
        icon = "⚖"
    elif "chaotic" in raw:
        icon = "⚡"
    else:
        icon = "−"
    return tone, icon


def _artifacts_html(artifacts: list[dict]) -> str:
    rows = artifacts[:3]
    if not rows:
        return (
            "<div class='artifact-item' style='border-color:#6b7280;'>"
            "<span class='artifact-name'>No artifacts unlocked</span>"
            "<span class='artifact-rarity'>Common</span>"
            "</div>"
        )

    html_rows = []
    for artifact in rows:
        name = html.escape(str(artifact.get("name", "Unknown Artifact")))
        rarity = str(artifact.get("rarity", "Common"))
        border_color = RARITY_BORDER.get(rarity.lower(), "#6b7280")
        html_rows.append(
            f"<div class='artifact-item' style='border-color:{border_color};'>"
            f"<span class='artifact-name'>{name}</span>"
            f"<span class='artifact-rarity'>{html.escape(rarity)}</span>"
            "</div>"
        )
    return "".join(html_rows)


def _build_radar_svg(attributes: dict) -> str:
    cx, cy, r = 180, 155, 120
    polygon_points = compute_radar_vertices(attributes, cx, cy, r)

    rings = []
    for frac in (0.25, 0.5, 0.75, 1.0):
        rings.append(
            f"<polygon points='{_compute_ring_vertices(cx, cy, r * frac)}' "
            "fill='none' stroke='#4E597B' stroke-width='1' opacity='0.7' />"
        )

    axes = []
    labels = []
    keys = ["STR", "WIS", "CHA", "INT", "STA"]
    for i, key in enumerate(keys):
        angle = (2 * math.pi * i / 5) - (math.pi / 2)
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        axes.append(
            f"<line x1='{cx:.1f}' y1='{cy:.1f}' x2='{x:.1f}' y2='{y:.1f}' stroke='#4E597B' stroke-width='1' />"
        )
        lx = cx + (r + 20) * math.cos(angle)
        ly = cy + (r + 20) * math.sin(angle)
        labels.append(
            f"<text x='{lx:.1f}' y='{ly:.1f}' fill='#A9B1D6' font-size='13' text-anchor='middle'>{key}</text>"
        )

    return (
        "<svg width='360' height='310' viewBox='0 0 360 310' xmlns='http://www.w3.org/2000/svg'>"
        + "".join(rings)
        + "".join(axes)
        + (
            f"<polygon points='{polygon_points}' fill='rgba(122,162,247,0.35)' "
            "stroke='#7AA2F7' stroke-width='2' />"
        )
        + "".join(labels)
        + "</svg>"
    )


def _ensure_playwright_chromium() -> None:
    global _playwright_install_attempted
    with _playwright_install_lock:
        if _playwright_install_attempted:
            return
        _playwright_install_attempted = True
        subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            check=True,
            timeout=900,
        )


def render_share_card(hero_profile: Dict[str, Any], card_format: str = "primary") -> bytes:
    fmt = card_format.lower()
    if fmt not in FORMAT_DIMENSIONS:
        raise ValueError("Invalid format. Use 'primary' or 'square'.")

    width, height = FORMAT_DIMENSIONS[fmt]
    mp = hero_profile.get("mp", {})
    attributes = hero_profile.get("attributes", {})
    artifacts = hero_profile.get("artifacts", [])
    alignment = str(hero_profile.get("alignment", "True Neutral"))

    current_xp = _safe_int(hero_profile.get("xp_current_level"), 0)
    next_xp = max(_safe_int(hero_profile.get("xp_next_level"), 1), 1)
    xp = _safe_int(hero_profile.get("xp"), 0)
    denom = max(next_xp - current_xp, 1)
    progress = max(0.0, min(100.0, ((xp - current_xp) / denom) * 100.0))

    photo_data_uri = _fetch_photo_data_uri(mp.get("photo"))
    alignment_style, alignment_icon = _alignment_visual(alignment)

    template = Template(TEMPLATE_PATH.read_text(encoding="utf-8"))
    rendered = template.safe_substitute(
        WIDTH=width,
        HEIGHT=height,
        PHOTO_DATA_URI=photo_data_uri,
        MP_NAME=html.escape(str(mp.get("name", "Unknown MP"))),
        MP_PARTY=html.escape(str(mp.get("party", "Independent"))),
        LEVEL=_safe_int(hero_profile.get("level"), 0),
        ALIGNMENT_STYLE=alignment_style,
        ALIGNMENT_ICON=alignment_icon,
        ALIGNMENT_TEXT=html.escape(alignment),
        RADAR_SVG=_build_radar_svg(attributes),
        XP_PERCENT=f"{progress:.2f}",
        XP_CURRENT=f"{current_xp:,}",
        XP_NEXT=f"{next_xp:,}",
        ARTIFACTS_HTML=_artifacts_html(artifacts),
        GENERATED_DATE=dt.datetime.utcnow().strftime("%Y-%m-%d"),
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        html_path = Path(tmp_dir) / "share_card.html"
        html_path.write_text(rendered, encoding="utf-8")
        png_path = Path(tmp_dir) / "share_card.png"

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": width, "height": height, "device_scale_factor": 1})
                page.goto(html_path.as_uri(), wait_until="load")
                page.screenshot(path=str(png_path), type="png")
                browser.close()
        except Exception as exc:
            message = str(exc)
            if "Executable doesn't exist" not in message:
                raise
            _ensure_playwright_chromium()
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": width, "height": height, "device_scale_factor": 1})
                page.goto(html_path.as_uri(), wait_until="load")
                page.screenshot(path=str(png_path), type="png")
                browser.close()

        return png_path.read_bytes()
