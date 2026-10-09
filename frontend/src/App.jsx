import { useEffect, useState } from "react";

import NetworkSimulator from "./components/NetworkSimulator";
import ModeToggle from "./components/ModeToggle";

import { getVideoMetadata } from "./api/videoApi";

import {
  getNormalQuality,
  getSmartQuality,
} from "./logic/qualitySelector";

function App() {
  const [bandwidth, setBandwidth] = useState(3);
  const [mode, setMode] = useState("normal");

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVideo() {
      try {
        const data = await getVideoMetadata("lecture_001");
        setVideo(data);
      } catch {
        setError("Unable to load video metadata.");
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, []);

  if (loading) {
    return <div className="app">Loading video metadata...</div>;
  }

  if (error || !video) {
    return (
      <div className="app">
        <h1>SplitLearn</h1>
        <p>{error || "Video metadata is unavailable."}</p>
      </div>
    );
  }

  const segments = video.segments;
  const currentSegment = segments[0];

  if (!currentSegment) {
    return <div className="app">No video segments found.</div>;
  }

  const contentType = currentSegment.content_type || "unknown";

  const selectedQuality =
    mode === "normal"
      ? getNormalQuality(bandwidth)
      : getSmartQuality(bandwidth, contentType);

  const selectedVideoPath =
    currentSegment.qualities?.[selectedQuality]?.path;

  const videoUrl = selectedVideoPath
    ? `http://localhost:5001${selectedVideoPath}`
    : null;

  return (
    <div className="app">
      <h1>SplitLearn</h1>
      <p>Adaptive Video Streaming</p>

      <ModeToggle mode={mode} setMode={setMode} />

      <NetworkSimulator
        bandwidth={bandwidth}
        setBandwidth={setBandwidth}
      />

      <div className="quality-display">
        <h2>Current Segment</h2>

        <p>
          Video: <strong>{video.videoName || "Lecture"}</strong>
        </p>

        <p>
          Metadata source: <strong>{video.source}</strong>
        </p>

        <p>
          Total segments: <strong>{segments.length}</strong>
        </p>

        <p>
          Content Type: <strong>{contentType}</strong>
        </p>

        <p>
          Bandwidth: <strong>{bandwidth} Mbps</strong>
        </p>

        <p>
          Mode: <strong>{mode.toUpperCase()}</strong>
        </p>

        <p>
          Selected Quality:{" "}
          <strong>{selectedQuality.toUpperCase()}</strong>
        </p>

        <p>
          Segment: <strong>{currentSegment.segment_id}</strong>
        </p>
      </div>

      {videoUrl ? (
        <div className="video-player">
          <video
            key={videoUrl}
            controls
            preload="metadata"
            width="720"
            style={{ maxWidth: "100%" }}
            src={videoUrl}
          >
            Your browser does not support HTML video.
          </video>
        </div>
      ) : (
        <p>No video file is available for the selected quality.</p>
      )}
    </div>
  );
}

export default App;