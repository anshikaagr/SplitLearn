# SplitLearn Video Processing

## Pipeline

lecture.mp4
↓
FFmpeg
↓
10-second segments
↓
High / Medium / Low quality
↓
OpenCV
↓
Motion score
↓
Content classification
↓
Segment metadata

## Content Types

- slide
- talking_head
- high_motion

## Quality Levels

- High: 720p
- Medium: 480p
- Low: 360p

## Segment Duration

Default: 10 seconds