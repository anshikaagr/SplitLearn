import argparse
import subprocess
from pathlib import Path


QUALITIES = {
    "high": "1280:720",
    "medium": "854:480",
    "low": "640:360",
}


def generate_quality(input_file, output_dir, quality, resolution):
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"{input_file.stem}_{quality}.mp4"

    command = [
        "ffmpeg",
        "-y",
        "-i", str(input_file),
        "-vf", f"scale={resolution}:force_original_aspect_ratio=decrease,"
               f"pad={resolution}:(ow-iw)/2:(oh-ih)/2",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(output_file),
    ]

    print(f"Generating {quality}: {input_file.name}")
    subprocess.run(command, check=True)
    print(f"Created: {output_file}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--segments-dir", required=True)
    parser.add_argument("--qualities-dir", required=True)
    args = parser.parse_args()

    segments_dir = Path(args.segments_dir).resolve()
    qualities_dir = Path(args.qualities_dir).resolve()

    segments = sorted(segments_dir.glob("segment_*.mp4"))

    if not segments:
        raise RuntimeError(f"No segments found in {segments_dir}")

    print(f"Found {len(segments)} segments.")

    for segment in segments:
        for quality, resolution in QUALITIES.items():
            generate_quality(
                segment,
                qualities_dir / quality,
                quality,
                resolution,
            )

    print("All quality versions generated successfully!")


if __name__ == "__main__":
    main()
