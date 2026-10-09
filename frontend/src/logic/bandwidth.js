export function calculateBandwidth(bytesDownloaded, downloadTimeSeconds) {
  if (downloadTimeSeconds <= 0) {
    return 0;
  }

  const bits = bytesDownloaded * 8;

  const bandwidthMbps =
    bits / downloadTimeSeconds / 1_000_000;

  return bandwidthMbps;
}