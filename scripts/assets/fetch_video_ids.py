import json
from pathlib import Path
import structlog

logger = structlog.get_logger()

OUTPUT_FILE = Path("apps/web/public/assets/videos.json")

# Curated Video IDs for Hero backgrounds
# Usually fetched from YouTube API, but for the demo we use a static registry
VIDEO_DATA = {
    "intro_2025": {
        "id": "Ue6O8UP6I0U",
        "title": "F1 2025 Official Intro",
        "type": "hero"
    },
    "ferrari_launch": {
        "id": "v7_O9Z_8I7A",
        "title": "Ferrari 2025 Car Launch",
        "type": "team_hero"
    }
}

def main():
    logger.info("🚀 Syncing Video Registry...")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump(VIDEO_DATA, f, indent=2)
        
    logger.info("✅ Video Registry Complete", count=len(VIDEO_DATA))

if __name__ == "__main__":
    main()
