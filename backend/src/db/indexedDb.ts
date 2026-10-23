import Dexie, { Table } from 'dexie';
import { Beneficiary, InspectionRecord, SyncRecord, AuditLog } from '@/types';

export class PmayDatabase extends Dexie {
  beneficiaries!: Table<Beneficiary, string>;
  inspections!: Table<InspectionRecord, string>;
  syncQueue!: Table<SyncRecord, string>;
  auditLogs!: Table<AuditLog, string>;

  constructor() {
    super('PmayRuralHousingDB');
    this.version(1).stores({
      beneficiaries: 'id, pmayId, gramPanchayat, currentStage, overallStatus, rationCardNo',
      inspections: 'id, beneficiaryId, stage, status, syncStatus, timestamp',
      syncQueue: 'id, inspectionId, beneficiaryId, status, createdAt',
      auditLogs: 'id, timestamp, role, action, entityId'
    });
  }
}

// Client-safe singleton database instance
let dbInstance: PmayDatabase | null = null;

export function getDb(): PmayDatabase {
  if (typeof window === 'undefined') {
    // Return dummy/fallback during SSR
    return {} as PmayDatabase;
  }
  if (!dbInstance) {
    dbInstance = new PmayDatabase();
  }
  return dbInstance;
}

export const db = typeof window !== 'undefined' ? new PmayDatabase() : ({} as PmayDatabase);

/**
 * Requests an eviction-exempt storage lock from the mobile OS
 * so Android Chrome / iOS Safari will not purge un-synced inspection photos.
 */
export async function requestStoragePersistence(): Promise<{ persisted: boolean; reason: string }> {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return { persisted: false, reason: 'Storage persistence API not supported on this browser' };
  }
  try {
    const isAlreadyPersisted = await navigator.storage.persisted();
    if (isAlreadyPersisted) {
      return { persisted: true, reason: 'Eviction-proof lock already active' };
    }
    const granted = await navigator.storage.persist();
    return {
      persisted: granted,
      reason: granted 
        ? 'OS eviction lock granted successfully' 
        : 'OS denied persistent storage lock'
    };
  } catch (err: any) {
    return { persisted: false, reason: err.message || 'Error requesting storage lock' };
  }
}

