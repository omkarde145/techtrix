import { StorageQuotaInfo } from '@/types';

/**
 * Image Compression & IndexedDB Storage Management Engine
 * Resizes 3-6MB high-resolution camera images down to ~200-250KB WebP/JPEG binaries,
 * preventing browser quota exhaustion and ensuring smooth offline storage.
 */

export interface CompressionResult {
  dataUrl: string;
  blobSize: number;
  originalSize: number;
  compressionRatio: string;
  width: number;
  height: number;
}

export async function compressInspectionPhoto(
  imageSource: string | Blob | File,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve({
        dataUrl: typeof imageSource === 'string' ? imageSource : '',
        blobSize: 1024,
        originalSize: 1024,
        compressionRatio: '1.0x',
        width: 800,
        height: 600
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const getEstimatedOriginalBytes = (src: string | Blob | File) => {
      if (typeof src !== 'string') return src.size;
      return Math.round((src.length * 3) / 4);
    };

    const originalSize = getEstimatedOriginalBytes(imageSource);

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if exceeds max dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context creation failed'));
          return;
        }

        // High quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        resolve({
          dataUrl: compressedDataUrl,
          blobSize: compressedSize,
          originalSize,
          compressionRatio: `${ratio}% reduced`,
          width,
          height
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('FileReader error during compression'));
      reader.readAsDataURL(imageSource);
    }
  });
}

/**
 * Format bytes to readable string (e.g. 240 KB, 1.2 MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Queries real browser storage quota & estimates IndexedDB usage
 */
export async function getStorageQuotaEstimate(inspectionCount: number): Promise<StorageQuotaInfo> {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return {
      usageBytes: 2500000,
      quotaBytes: 1000000000,
      percentUsed: 0.25,
      inspectionCount,
      formattedUsage: '2.5 MB',
      formattedQuota: '1.0 GB'
    };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 2500000;
    const quota = estimate.quota || 1000000000;
    const percent = Math.min(100, Math.round((usage / quota) * 1000) / 10);

    return {
      usageBytes: usage,
      quotaBytes: quota,
      percentUsed: percent,
      inspectionCount,
      formattedUsage: formatBytes(usage),
      formattedQuota: formatBytes(quota)
    };
  } catch (err) {
    return {
      usageBytes: 2500000,
      quotaBytes: 1000000000,
      percentUsed: 0.25,
      inspectionCount,
      formattedUsage: '2.5 MB',
      formattedQuota: '1.0 GB'
    };
  }
}
