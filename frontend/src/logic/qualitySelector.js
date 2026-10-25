export function getNormalQuality(bandwidthMbps) {
  if (bandwidthMbps >= 5) {
    return "high";
  }

  if (bandwidthMbps >= 2) {
    return "medium";
  }

  return "low";
}

export function getSmartQuality(bandwidthMbps, contentType) {
  // Very weak network
  if (bandwidthMbps < 1) {
    if (contentType === "slide") {
      return "medium";
    }

    return "low";
  }

  // Weak network
  if (bandwidthMbps < 2) {
    if (contentType === "slide") {
      return "medium";
    }

    return "low";
  }

  // Moderate network
  if (bandwidthMbps < 5) {
    if (contentType === "slide") {
      return "high";
    }

    return "medium";
  }

  // Good network
  return "high";
}
