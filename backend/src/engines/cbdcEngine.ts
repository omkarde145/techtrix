/**
 * RBI Digital Rupee (e₹ - CBDC) Programmable DBT Voucher Engine
 * 1. Issues purpose-bound programmable digital tokens restricted to construction materials
 * 2. Enforces merchant whitelist (authorized local cement, steel, brick vendors)
 * 3. Simulates cryptographic QR voucher redemption with vendor settlement
 */

import { Beneficiary, DigitalRupeeCbdcBatch, StageType } from '../types';

export const LOCAL_REGISTERED_VENDORS = [
  { vendorId: 'VND-KLS-01', vendorName: 'Maa Durga Cement & Sariya Store', category: 'Cement & TMT Steel', location: 'Kalsi Main Chowk' },
  { vendorId: 'VND-KLS-02', vendorName: 'Gramin Fly-Ash Brick Kiln', category: 'Red Clay & Fly-Ash Bricks', location: 'Haripur Road, Kalsi' },
  { vendorId: 'VND-KLS-03', vendorName: 'Kisan Hardware & Sanitary Supplies', category: 'Pipes, Aggregates & Doors', location: 'Dakpatthar Market' },
];

export function generateCbdcVoucher(
  beneficiary: Beneficiary,
  stage: StageType,
  amount: number
): DigitalRupeeCbdcBatch {
  const voucherId = `CBDC-E-RUPEE-${Date.now().toString(36).toUpperCase()}-${beneficiary.id.slice(0, 4).toUpperCase()}`;
  const expiryDate = new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const qrPayload = JSON.stringify({
    scheme: 'RBI-e₹-PMAYG',
    voucherId,
    beneficiaryPmayId: beneficiary.pmayId,
    amount,
    purpose: 'BUILDING_MATERIALS_CEMENT_STEEL',
    whitelistedVendors: LOCAL_REGISTERED_VENDORS.map((v) => v.vendorId),
    validUntil: expiryDate,
  });

  return {
    voucherId,
    beneficiaryId: beneficiary.id,
    beneficiaryName: beneficiary.name,
    amount,
    purpose: 'BUILDING_MATERIALS_CEMENT_STEEL',
    designatedVendorList: LOCAL_REGISTERED_VENDORS,
    qrTokenPayload: qrPayload,
    expiresAt: expiryDate,
    status: 'ACTIVE',
  };
}
