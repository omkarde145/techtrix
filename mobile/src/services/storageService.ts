import { InspectionPayload } from '../types';

const STORAGE_KEY = 'GRAMINVIKAS_INSPECTIONS_QUEUE';

// In-memory fallback if native AsyncStorage is initializing
let memoryStore: InspectionPayload[] = [];

export const StorageService = {
  async getInspections(): Promise<InspectionPayload[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
      }
      return memoryStore;
    } catch {
      return memoryStore;
    }
  },

  async saveInspection(payload: InspectionPayload): Promise<void> {
    try {
      const current = await this.getInspections();
      const updated = [payload, ...current];
      memoryStore = updated;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      memoryStore.unshift(payload);
    }
  },

  async markInspectionSynced(id: string): Promise<void> {
    try {
      const current = await this.getInspections();
      const updated = current.map(item => item.id === id ? { ...item, synced: true } : item);
      memoryStore = updated;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      memoryStore = memoryStore.map(item => item.id === id ? { ...item, synced: true } : item);
    }
  },

  async clearAll(): Promise<void> {
    memoryStore = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
};
