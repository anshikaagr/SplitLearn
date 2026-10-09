import mockSegments from "../data/mockSegments";

const API_BASE_URL = "http://localhost:5001";

export async function getVideoMetadata(videoId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/videos/${videoId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video metadata");
    }

    const data = await response.json();

    return {
      source: "backend",
      segments: data.segments || data,
    };
  } catch (error) {
    console.warn(
      "Backend unavailable. Using mock segment data.",
      error
    );

    return {
      source: "mock",
      segments: mockSegments,
    };
  }
}