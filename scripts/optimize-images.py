"""Regenerate landing-page assets from the originals (requires Pillow)."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src/assets/optimized"
OUTPUT.mkdir(parents=True, exist_ok=True)

# Keep browser UI screenshots pixel-perfect at their original resolution.
for name in ("banner", "tab_management", "split", "peek"):
    with Image.open(ROOT / f"{name}.png") as image:
        image.save(OUTPUT / f"{name}.webp", lossless=True, method=6)
        if name == "banner":
            image.resize((720, 426), Image.Resampling.LANCZOS).save(
                OUTPUT / "banner-720.webp", lossless=True, method=6
            )

# The soft CTA background and briefly displayed photos need much less data.
with Image.open(ROOT / "cta_bg.png") as image:
    image.save(OUTPUT / "cta_bg.webp", quality=82, method=6)

intro_output = OUTPUT / "intro"
intro_output.mkdir(exist_ok=True)
for source in sorted((ROOT / "src/assets/intro").glob("*.jpg")):
    with Image.open(source) as image:
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
        image.save(intro_output / f"{source.stem}.webp", quality=72, method=6)

for asset in sorted(OUTPUT.rglob("*.webp")):
    print(f"{asset.relative_to(ROOT)}: {asset.stat().st_size:,} bytes")
