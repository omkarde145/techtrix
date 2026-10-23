import { Beneficiary, GeofenceResult, DuplicateRationResult, StageType } from '@/types';

/**
 * Calculates 2D Great-Circle surface distance in meters using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 2D distance in meters
}

/**
 * 3D Distance Formula integrating Elevation/Altitude Delta (Z-axis)
 * Prevents false-positive geofence collisions on terraced hillsides and plateau terrain.
 * D_3D = sqrt(D_2D^2 + delta_altitude^2)
 */
export function calculate3DDistance(
  lat1: number,
  lon1: number,
  alt1: number = 0,
  lat2: number,
  lon2: number,
  alt2: number = 0
): { total3DDistance: number; horizontal2DDistance: number; elevationDelta: number } {
  const horizontal2DDistance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  const elevationDelta = Math.abs((alt1 || 0) - (alt2 || 0));

  const total3DDistance = Math.sqrt(
    Math.pow(horizontal2DDistance, 2) + Math.pow(elevationDelta, 2)
  );

  return {
    total3DDistance: Math.round(total3DDistance * 10) / 10,
    horizontal2DDistance: Math.round(horizontal2DDistance * 10) / 10,
    elevationDelta: Math.round(elevationDelta * 10) / 10
  };
}

/**
 * Checks if a given coordinate conflicts with any existing sanctioned house,
 * equipped with 3D elevation awareness and Dense Basti Cadastral (Khasra/ULPIN) Partitioning.
 */
export function checkGeofenceCollision(
  lat: number,
  lng: number,
  alt: number = 320,
  beneficiaryId: string,
  beneficiaryList: Beneficiary[],
  currentKhasraNo?: string,
  thresholdMeters: number = 15
): GeofenceResult {
  for (const b of beneficiaryList) {
    if (b.id === beneficiaryId) continue;

    const { total3DDistance, horizontal2DDistance, elevationDelta } = calculate3DDistance(
      lat,
      lng,
      alt,
      b.latitude,
      b.longitude,
      b.altitude || 320
    );

    // If 3D distance is within threshold
    if (total3DDistance <= thresholdMeters) {
      // Check Cadastral Plot Partition (Dense Village Abadi resolution)
      const hasDistinctCadastralPlot =
        currentKhasraNo &&
        b.khasraNo &&
        currentKhasraNo.trim().toUpperCase() !== b.khasraNo.trim().toUpperCase();

      if (hasDistinctCadastralPlot) {
        // Soft warning for legitimate joint-family partition
        return {
          hasConflict: false,
          isDenseBastiPartition: true,
          collidingBeneficiary: b,
          distanceMeters: total3DDistance,
          horizontalDistance: horizontal2DDistance,
          elevationDeltaMeters: elevationDelta,
          warningMessage: `Dense Basti Proximity: Neighboring house at ${total3DDistance}m, but registered on distinct Cadastral Plot (${currentKhasraNo} vs ${b.khasraNo}). Independent dwelling verified.`
        };
      }

      // If on terraced hillside with vertical separation > 8m, not a collision!
      if (elevationDelta >= 8.0) {
        return {
          hasConflict: false,
          isDenseBastiPartition: true,
          collidingBeneficiary: b,
          distanceMeters: total3DDistance,
          horizontalDistance: horizontal2DDistance,
          elevationDeltaMeters: elevationDelta,
          warningMessage: `Terraced Hillside Plot: 2D distance is ${horizontal2DDistance}m, but separated by ${elevationDelta}m vertical elevation. Different hillside tier.`
        };
      }

      // Hard collision: Same plot, same elevation, no partition record
      return {
        hasConflict: true,
        collidingBeneficiary: b,
        distanceMeters: total3DDistance,
        horizontalDistance: horizontal2DDistance,
        elevationDeltaMeters: elevationDelta,
        warningMessage: `Severe Geofence Collision: Structure located within ${total3DDistance}m (Horiz: ${horizontal2DDistance}m, Elevation: ${elevationDelta}m) of ${b.name} (${b.pmayId}) with no cadastral partition.`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Checks if a ration card number has already been claimed by another household or member.
 */
export function checkDuplicateRationCard(
  rationCardNo: string,
  beneficiaryId: string,
  beneficiaryList: Beneficiary[]
): DuplicateRationResult {
  const cleanRation = rationCardNo.trim().toUpperCase();
  for (const b of beneficiaryList) {
    if (b.id === beneficiaryId) continue;
    if (b.rationCardNo.trim().toUpperCase() === cleanRation) {
      return {
        hasDuplicate: true,
        collidingBeneficiary: b,
        rationCardNo: cleanRation
      };
    }
  }

  return { hasDuplicate: false };
}

/**
 * Validates sequential stage progression:
 * Foundation -> Plinth -> Lintel -> Completion
 */
export const STAGE_ORDER: StageType[] = ['foundation', 'plinth', 'lintel', 'completion'];

export function validateSequentialStage(
  currentStage: StageType,
  targetStage: StageType,
  stageHistory: Beneficiary['stageHistory']
): { valid: boolean; reason?: string } {
  const targetIdx = STAGE_ORDER.indexOf(targetStage);

  if (targetIdx === 0) {
    return { valid: true };
  }

  const prevStage = STAGE_ORDER[targetIdx - 1];
  const prevStageData = stageHistory[prevStage];

  if (!prevStageData || prevStageData.status !== 'approved') {
    return {
      valid: false,
      reason: `Stage '${targetStage.toUpperCase()}' cannot be inspected until previous stage '${prevStage.toUpperCase()}' is formally APPROVED by the BDO.`
    };
  }

  return { valid: true };
}

/**
 * Validates EXIF metadata against current device GPS lock.
 */
export function validateInspectionIntegrity(
  deviceLat: number,
  deviceLng: number,
  photoExifLat?: number,
  photoExifLng?: number
): { valid: boolean; discrepancyMeters?: number; warning?: string } {
  if (photoExifLat === undefined || photoExifLng === undefined) {
    return { valid: true };
  }

  const discrepancy = calculateHaversineDistance(
    deviceLat,
    deviceLng,
    photoExifLat,
    photoExifLng
  );

  if (discrepancy > 200) {
    return {
      valid: false,
      discrepancyMeters: Math.round(discrepancy),
      warning: `EXIF GPS location differs by ${Math.round(discrepancy)}m from live device GPS. Possible gallery upload of unrelated site.`
    };
  }

  return { valid: true, discrepancyMeters: Math.round(discrepancy) };
}
