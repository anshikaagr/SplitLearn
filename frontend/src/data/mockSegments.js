const mockSegments = [
  {
    segment_id: 0,
    duration: 11.14,
    motion_score: 0.016,
    content_type: "slide",
    qualities: {
      high: {
        path: "/qualities/high/segment_000_high.mp4",
      },
      medium: {
        path: "/qualities/medium/segment_000_medium.mp4",
      },
      low: {
        path: "/qualities/low/segment_000_low.mp4",
      },
    },
  },

  {
    segment_id: 1,
    duration: 10.2,
    motion_score: 0.22,
    content_type: "talking_head",
    qualities: {
      high: {
        path: "/qualities/high/segment_001_high.mp4",
      },
      medium: {
        path: "/qualities/medium/segment_001_medium.mp4",
      },
      low: {
        path: "/qualities/low/segment_001_low.mp4",
      },
    },
  },

  {
    segment_id: 2,
    duration: 9.8,
    motion_score: 0.72,
    content_type: "high_motion",
    qualities: {
      high: {
        path: "/qualities/high/segment_002_high.mp4",
      },
      medium: {
        path: "/qualities/medium/segment_002_medium.mp4",
      },
      low: {
        path: "/qualities/low/segment_002_low.mp4",
      },
    },
  },
];

export default mockSegments;