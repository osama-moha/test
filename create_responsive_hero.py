from pathlib import Path
from PIL import Image

source = Path("urban-eye-assets/guard3.webp")
output_sizes = {
    "guard3-480.webp": 480,
    "guard3-800.webp": 800,
    "guard3-1100.webp": 1100,
}

if not source.exists():
    raise FileNotFoundError(f"Source image not found: {source}")

with Image.open(source) as image:
    image = image.convert("RGB")
    original_width, original_height = image.size

    for filename, target_width in output_sizes.items():
        target_height = round(original_height * target_width / original_width)

        resized = image.resize(
            (target_width, target_height),
            Image.Resampling.LANCZOS
        )

        output_path = source.parent / filename
        resized.save(
            output_path,
            "WEBP",
            quality=76,
            method=6,
            optimize=True
        )

        size_kb = output_path.stat().st_size / 1024
        print(
            f"Created {output_path} "
            f"({target_width}x{target_height}, {size_kb:.1f} KB)"
        )