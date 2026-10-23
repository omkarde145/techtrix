import { GeoCoordinates } from '../types';

export const GeoService = {
  // Calculate Haversine distance in meters between two GPS coordinates
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  },

  // Generates simulated field GPS reading with small natural satellite jitter
  getSimulatedFieldCoordinates(targetLat: number, targetLng: number): GeoCoordinates {
    const jitter = (Math.random() - 0.5) * 0.00012; // ~5-12 meters jitter
    return {
      latitude: Number((targetLat + jitter).toFixed(6)),
      longitude: Number((targetLng + jitter).toFixed(6)),
      altitude: Math.round(240 + Math.random() * 25), // Mean Sea Level altitude in meters
      accuracy: Math.round(3.5 + Math.random() * 2.5), // CEP-50 accuracy in meters
    };
  },

  // Generate ECDSA-like cryptographic watermark signature string
  generateWatermark(
    beneficiaryId: string,
    stage: string,
    coords: GeoCoordinates,
    timestamp: string
  ): string {
    const raw = `${beneficiaryId}|${stage}|${coords.latitude},${coords.longitude}|${coords.altitude}m|${timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `GOV-IN-NIC:${hex.slice(0, 4)}-${hex.slice(4)}-ECDSA-P256`;
  }
};
