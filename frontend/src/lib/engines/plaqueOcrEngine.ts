/**
 * Beneficiary Co-Presence & Wall Plaque OCR Engine
 * 1. Simulates on-device detection of mandatory PMAY-G yellow wall-painted scheme plaque
 * 2. Cross-references detected PMAY ID and Beneficiary Name with registered record
 * 3. Simulates on-device face detection confirming the beneficiary is physically co-present
 */

import { Beneficiary, PlaqueOcrResult } from '@/types';

export function simulatePlaqueAndCoPresenceOcr(
  beneficiary: Beneficiary,
  imageSrc?: string
): PlaqueOcrResult {
  // If beneficiary has flags or extreme coordinates, simulate slight deviation
  const hasFlags = beneficiary.flags && beneficiary.flags.length > 0;
  
  const matchScore = hasFlags ? 78 : 96;
  const beneficiaryFaceDetected = true;
  const plaqueDetected = true;
  const coPresenceScore = 94;
  const verificationPassed = matchScore >= 80 && beneficiaryFaceDetected;

  return {
    plaqueDetected,
    extractedPmayId: beneficiary.pmayId,
    extractedName: beneficiary.name,
    matchScore,
    beneficiaryFaceDetected,
    coPresenceScore,
    verificationPassed,
    notes: verificationPassed
      ? `Plaque ID '${beneficiary.pmayId}' matches government record. Beneficiary face co-presence confirmed on site.`
      : `Warning: Slight OCR disparity on wall plaque. Requires manual JE review before final DBT sanction.`,
  };
}
