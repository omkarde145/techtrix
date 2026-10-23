import { GpsSpatialFilterArtifact } from '@/types';
import { calculateHaversineDistance } from './verificationEngine';

/**
 * Continuous Circular Error Probable (CEP-50) Spatial Averaging Filter
 * Overcomes GPS multipath reflections, tin roof bounce, and tree canopy signal jitter.
 */

export class GpsSpatialFilter {
  private samples: Array<{
    lat: number;
    lng: number;
    altitude?: number;
    accuracy: number;
    timestamp: number;
  }> = [];

  private targetSampleCount: number;

  constructor(targetSampleCount = 5) {
    this.targetSampleCount = targetSampleCount;
  }

  public reset() {
    this.samples = [];
  }

  public addSample(lat: number, lng: number, altitude?: number, accuracy = 5.0): GpsSpatialFilterArtifact {
    this.samples.push({
      lat,
      lng,
      altitude,
      accuracy,
      timestamp: Date.now()
    });

    if (this.samples.length > this.targetSampleCount) {
      this.samples.shift();
    }

    return this.calculateFilterState();
  }

  public calculateFilterState(): GpsSpatialFilterArtifact {
    const N = this.samples.length;
    if (N === 0) {
      return {
        sampleCount: 0,
        samples: [],
        centroid: { lat: 0, lng: 0 },
        stdDevMeters: 0,
        hdop: 1.0,
        cep50Meters: 0,
        isStabilized: false
      };
    }

    // Compute Centroid
    let sumLat = 0;
    let sumLng = 0;
    let sumAlt = 0;
    let hasAlt = false;

    for (const s of this.samples) {
      sumLat += s.lat;
      sumLng += s.lng;
      if (s.altitude !== undefined) {
        sumAlt += s.altitude;
        hasAlt = true;
      }
    }

    const centroidLat = sumLat / N;
    const centroidLng = sumLng / N;
    const centroidAlt = hasAlt ? Math.round((sumAlt / N) * 10) / 10 : undefined;

    // Calculate distance of each sample from centroid to compute standard deviation
    let sumSquaredDist = 0;
    const distances: number[] = [];

    for (const s of this.samples) {
      const d = calculateHaversineDistance(s.lat, s.lng, centroidLat, centroidLng);
      distances.push(d);
      sumSquaredDist += d * d;
    }

    const stdDevMeters = Math.round(Math.sqrt(sumSquaredDist / N) * 100) / 100;

    // CEP-50 is the median distance radius enclosing 50% of the fixes
    distances.sort((a, b) => a - b);
    const medianIdx = Math.floor(distances.length / 2);
    const cep50Meters = Math.round((distances[medianIdx] || 0) * 100) / 100;

    // Estimate Horizontal Dilution of Precision (HDOP) from accuracy and spread
    const avgAccuracy = this.samples.reduce((acc, curr) => acc + curr.accuracy, 0) / N;
    const hdop = Math.round((avgAccuracy / 3.0) * 10) / 10;

    // Stabilized when we have at least 4 samples and spatial standard deviation < 4.5m
    const isStabilized = N >= 4 && stdDevMeters < 4.5;

    return {
      sampleCount: N,
      samples: [...this.samples],
      centroid: {
        lat: centroidLat,
        lng: centroidLng,
        altitude: centroidAlt
      },
      stdDevMeters,
      hdop,
      cep50Meters,
      isStabilized
    };
  }
}
