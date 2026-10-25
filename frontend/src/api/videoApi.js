const API_BASE_URL = "http://localhost:5001";

export async function getVideoMetadata(videoId) {
  const response = await fetch(
    `${API_BASE_URL}/api/videos/${encodeURIComponent(videoId)}`
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));

    throw new Error(
      result.message || "Failed to fetch video metadata"
    );
  }

  const data = await response.json();

  return {
    source: "backend",
    videoId: data.video_id,
    videoName: data.video_name,
    segments: data.segments || [],
  };
}
