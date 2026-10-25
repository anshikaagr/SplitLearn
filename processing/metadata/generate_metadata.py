import argparse
import json
import subprocess
import sys
from pathlib import Path


def get_duration(video_path):
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )

    return round(float(result.stdout.strip()), 2)


def get_motion_analysis(segment):
    command = [
        sys.executable,
        "processing/opencv/analyze_segment.py",
        str(segment),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )

    return json.loads(result.stdout)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video-id", required=True)
    parser.add_argument("--video-name", required=True)
    parser.add_argument("--segments-dir", required=True)
    parser.add_argument("--qualities-dir", required=True)
    parser.add_argument("--output-file", required=True)
    args = parser.parse_args()

    segments_dir = Path(args.segments_dir).resolve()
    qualities_dir = Path(args.qualities_dir).resolve()
    output_file = Path(args.output_file).resolve()

    segments = sorted(segments_dir.glob("segment_*.mp4"))

    if not segments:
        raise RuntimeError(f"No segments found in {segments_dir}")

    metadata = {
        "video_id": args.video_id,
        "video_name": args.video_name,
        "total_segments": len(segments),
        "segments": [],
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
                quality: {
                    "path": (
                        f"/videos/{args.video_id}/qualities/"
                        f"{quality}/{segment.stem}_{quality}.mp4"
                    )
                }
                for quality in ("high", "medium", "low")
            },
        }

        metadata["segments"].append(segment_data)

    output_file.parent.mkdir(parents=True, exist_ok=True)

    with output_file.open("w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print(f"Metadata created: {output_file}")


if __name__ == "__main__":
    main()
