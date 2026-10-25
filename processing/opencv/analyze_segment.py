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


def detect_face(frame, face_detector):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
    )

    return len(faces) > 0


def analyze_faces(video_path, sample_every_seconds=1):
    cascade_path = (
        cv2.data.haarcascades
        + "haarcascade_frontalface_default.xml"
    )

    face_detector = cv2.CascadeClassifier(cascade_path)

    if face_detector.empty():
        raise RuntimeError("Could not load face detector")

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        cap.release()
        return {
            "face_frames": 0,
            "sampled_frames": 0,
            "face_ratio": 0.0,
        }

    frame_interval = max(1, int(fps * sample_every_seconds))
    frame_index = 0
    sampled_frames = 0
    face_frames = 0

    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        ret, frame = cap.read()

        if not ret:
            break

        frame = cv2.resize(frame, (640, 360))

        sampled_frames += 1

        if detect_face(frame, face_detector):
            face_frames += 1

        frame_index += frame_interval

    cap.release()

    face_ratio = (
        face_frames / sampled_frames
        if sampled_frames
        else 0.0
    )

    return {
        "face_frames": face_frames,
        "sampled_frames": sampled_frames,
        "face_ratio": round(face_ratio, 3),
    }


def classify_content(motion_score, face_ratio):
    # A face appears in multiple sampled frames.
    if face_ratio >= 0.30:
        return "talking_head"

    # Little movement and no consistently detected face.
    if motion_score < 0.10 and face_ratio < 0.10:
        return "slide"

    # Movement without consistent face detection is ambiguous.
    if motion_score >= 0.35:
        return "high_motion"

    return "slide"


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
    face_analysis = analyze_faces(video_path)

    content_type = classify_content(
        motion_score,
        face_analysis["face_ratio"],
    )

    duration = get_video_duration(video_path)

    return {
        "video": video_path.name,
        "motion_score": round(motion_score, 4),
        "face_ratio": face_analysis["face_ratio"],
        "content_type": content_type,
        "duration": round(duration, 2),
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_segment.py <video_path>")
        sys.exit(1)

    video_path = Path(sys.argv[1])

    if not video_path.exists():
        print(f"Video not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    result = analyze_segment(video_path)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
