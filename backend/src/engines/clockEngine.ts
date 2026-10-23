import { MonotonicTimeArtifact } from '@/types';

/**
 * Monotonic Time Invariance & Clock Integrity Engine
 * Prevents time-travel fraud where an inspector rolls back the phone clock
 * to backdate an inspection or skip mandatory concrete curing intervals.
 */

let initialPerformanceNow = 0;
let initialSystemDate = 0;
let monotonicSequenceCounter = 0;

if (typeof window !== 'undefined') {
  initialPerformanceNow = performance.now();
  initialSystemDate = Date.now();
  
  // Try retrieving cached hardware sequence
  try {
    const cached = localStorage.getItem('pmayg_monotonic_seq');
    if (cached) {
      monotonicSequenceCounter = parseInt(cached, 10) || 0;
    }
  } catch (e) {
    // ignore
  }
}

export function evaluateClockIntegrity(gpsTimestampEpoch?: number): MonotonicTimeArtifact {
  monotonicSequenceCounter++;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pmayg_monotonic_seq', monotonicSequenceCounter.toString());
    } catch (e) {
      // ignore
    }
  }

  const currentPerfNow = typeof window !== 'undefined' ? performance.now() : 0;
  const currentSystemDate = Date.now();
  const monotonicElapsedMs = Math.round(currentPerfNow - initialPerformanceNow);
  const expectedSystemDate = initialSystemDate + monotonicElapsedMs;

  // Drift between monotonic hardware counter and wall clock
  const internalDriftMs = Math.abs(currentSystemDate - expectedSystemDate);

  // If GPS timestamp epoch is available from satellite fix
  let gpsDriftSeconds = 0;
  let isClockTampered = false;

  if (gpsTimestampEpoch && gpsTimestampEpoch > 0) {
    gpsDriftSeconds = Math.round(Math.abs(currentSystemDate - gpsTimestampEpoch) / 1000);
    // If satellite time disagrees with phone clock by > 180 seconds, clock is tampered!
    if (gpsDriftSeconds > 180) {
      isClockTampered = true;
    }
  }

  // If internal wall clock jumped backwards while monotonic clock continued forward
  if (currentSystemDate < initialSystemDate && monotonicElapsedMs > 1000) {
    isClockTampered = true;
  }

  // Or if internal drift exceeds 10 minutes during a single session without page reload
  if (internalDriftMs > 10 * 60 * 1000) {
    isClockTampered = true;
  }

  return {
    monotonicElapsedMs,
    systemTimestamp: new Date(currentSystemDate).toISOString(),
    gpsEpochTimestamp: gpsTimestampEpoch ? new Date(gpsTimestampEpoch).toISOString() : undefined,
    driftSeconds: gpsDriftSeconds,
    isClockTampered,
    hardwareTickSequence: monotonicSequenceCounter
  };
}
