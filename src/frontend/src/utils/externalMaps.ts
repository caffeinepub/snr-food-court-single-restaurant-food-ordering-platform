/**
 * Builds a URL to open coordinates in an external maps application
 * Uses Google Maps as the default provider
 */
export function buildExternalMapsUrl(latitude: number, longitude: number): string {
  // Google Maps URL format: https://www.google.com/maps?q=lat,lng
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Alternative: Build OpenStreetMap URL
 */
export function buildOpenStreetMapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
}
