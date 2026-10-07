import cv2
import json
import sys
from pathlib import Path


def calculate_motion_score(video_path):
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    previous_frame = None
    motion_values = []

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame = cv2.resize(frame, (320, 180))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if previous_frame is not None:
            difference = cv2.absdiff(previous_frame, gray)
            motion = difference.mean() / 255.0
            motion_values.append(motion)

        previous_frame = gray

    cap.release()

    if not motion_values:
        return 0.0

    return sum(motion_values) / len(motion_values)


def classify_content(motion_score):
    if motion_score < 0.10:
        return "slide"
    elif motion_score < 0.35:
        return "talking_head"
    else:
        return "high_motion"


def get_video_duration(video_path):
    cap = cv2.VideoCapture(str(video_path))

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)

    cap.release()

    if fps <= 0:
        return 0.0

    return frame_count / fps


def analyze_segment(video_path):
    motion_score = calculate_motion_score(video_path)
    content_type = classify_content(motion_score)
    duration = get_video_duration(video_path)

    return {
        "video": video_path.name,
        "motion_score": round(motion_score, 4),
        "content_type": content_type,
        "duration": round(duration, 2)
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_segment.py <video_path>")
        return

    video_path = Path(sys.argv[1])

    if not video_path.exists():
        print(f"Video not found: {video_path}")
        return

    result = analyze_segment(video_path)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
