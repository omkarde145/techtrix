import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InspectionPayload } from '../types';
import { StorageService } from '../services/storageService';

interface SyncContextType {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingCount: number;
  inspections: InspectionPayload[];
  addInspection: (payload: InspectionPayload) => Promise<void>;
  syncAllPending: () => Promise<{ success: number; failed: number }>;
  refreshQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [inspections, setInspections] = useState<InspectionPayload[]>([]);

  const refreshQueue = async () => {
    const list = await StorageService.getInspections();
    setInspections(list);
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  const pendingCount = inspections.filter(item => !item.synced).length;

  const addInspection = async (payload: InspectionPayload) => {
    await StorageService.saveInspection(payload);
    await refreshQueue();
  };

  const syncAllPending = async (): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const item of inspections) {
      if (!item.synced) {
        try {
          // Attempt microservice push or local mock resolution
          await StorageService.markInspectionSynced(item.id);
          success++;
        } catch {
          failed++;
        }
      }
    }
    await refreshQueue();
    return { success, failed };
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        setIsOnline,
        pendingCount,
        inspections,
        addInspection,
        syncAllPending,
        refreshQueue,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
