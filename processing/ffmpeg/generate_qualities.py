import subprocess
from pathlib import Path

SEGMENTS_DIR = Path("output/segments")
OUTPUT_DIR = Path("output/qualities")

QUALITIES = {
    "high": {
        "resolution": "1280:720"
    },
    "medium": {
        "resolution": "854:480"
    },
    "low": {
        "resolution": "640:360"
    }
}


def generate_quality(input_file, quality, resolution):
    output_dir = OUTPUT_DIR / quality
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"{input_file.stem}_{quality}.mp4"

    command = [
        "ffmpeg",
        "-y",
        "-i", str(input_file),
        "-vf", f"scale={resolution}",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-an",
        str(output_file)
    ]

    print(f"Generating {quality}: {input_file.name}")

    subprocess.run(command, check=True)

    print(f"Created: {output_file}")


def main():
    segments = sorted(SEGMENTS_DIR.glob("segment_*.mp4"))

    if not segments:
        print("No video segments found.")
        return

    print(f"Found {len(segments)} segments.")

    for segment in segments:
        for quality, settings in QUALITIES.items():
            generate_quality(
                segment,
                quality,
                settings["resolution"]
            )

    print("\nAll quality versions generated successfully!")


if __name__ == "__main__":
    main()