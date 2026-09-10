export interface StorageEstimateData {
  usage: number;
  quota: number;
  formattedUsage: string;
  formattedQuota: string;
  percent: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0.0 MB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function getActualStorageEstimate(): Promise<StorageEstimateData> {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;

      const formattedUsage = formatBytes(usage);
      const formattedQuota = quota > 0 ? formatBytes(quota) : 'Actual Quota';
      const percent = quota > 0 ? Math.min(100, Math.round((usage / quota) * 100)) : 0;

      return {
        usage,
        quota,
        formattedUsage,
        formattedQuota,
        percent
      };
    } catch {
      // Fallback if browser estimate errors
    }
  }

  // Fallback to client localStorage metrics
  try {
    let totalBytes = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += (localStorage.getItem(key) || '').length * 2;
        }
      }
    }
    const quota = 10 * 1024 * 1024 * 1024; // 10 GB standard quota
    return {
      usage: totalBytes,
      quota,
      formattedUsage: formatBytes(totalBytes),
      formattedQuota: '10.0 GB',
      percent: Math.min(100, Math.round((totalBytes / quota) * 100))
    };
  } catch {
    return {
      usage: 0,
      quota: 10 * 1024 * 1024 * 1024,
      formattedUsage: '0.0 MB',
      formattedQuota: '10.0 GB',
      percent: 0
    };
  }
}
