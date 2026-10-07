import json
import sys
import subprocess
from pathlib import Path


SEGMENTS_DIR = Path("output/segments")
QUALITIES_DIR = Path("output/qualities")
OUTPUT_FILE = Path("output/metadata.json")


def get_duration(video_path):
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path)
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True
    )

    return round(float(result.stdout.strip()), 2)


def get_motion_analysis(segment):
    command = [
        sys.executable,
        "processing/opencv/analyze_segment.py",
        str(segment)
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True
    )

    return json.loads(result.stdout)


def main():
    segments = sorted(SEGMENTS_DIR.glob("segment_*.mp4"))

    if not segments:
        print("No segments found.")
        return

    metadata = {
        "video_id": "lecture_001",
        "video_name": "lecture.mp4",
        "total_segments": len(segments),
        "segments": []
    }

    for index, segment in enumerate(segments):
        print(f"Processing segment {index}: {segment.name}")

        analysis = get_motion_analysis(segment)
        duration = get_duration(segment)

        segment_data = {
            "segment_id": index,
            "duration": duration,
            "motion_score": analysis["motion_score"],
            "content_type": analysis["content_type"],
            "qualities": {
                "high": {
                    "path": f"/qualities/high/{segment.stem}_high.mp4"
                },
                "medium": {
                    "path": f"/qualities/medium/{segment.stem}_medium.mp4"
                },
                "low": {
                    "path": f"/qualities/low/{segment.stem}_low.mp4"
                }
            }
        }

        metadata["segments"].append(segment_data)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print(f"\nMetadata created: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()