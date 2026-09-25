import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'optivir-creatives';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// Initialize S3-compatible client targeting Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface PresignedUploadParams {
  orgId: string;
  creativeId: string;
  versionNumber: number;
  fileName: string;
  mimeType: string;
  assetType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_SLIDE' | 'THUMBNAIL' | 'DOCUMENT' | 'SOURCE_FILE' | 'COPY';
  slideOrder?: number;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  bucket: string;
}

export interface MultipartInitResult {
  uploadId: string;
  storageKey: string;
  bucket: string;
}

export interface MultipartPartUrl {
  partNumber: number;
  uploadUrl: string;
}

export class StorageService {
  /**
   * Generates a strict, server-controlled canonical storage key
   * Convention: creatives/{orgId}/{creativeId}/v{version}/{assetType}_{timestamp}_{sanitizedName}
   */
  public static generateCanonicalKey(params: PresignedUploadParams): string {
    const sanitizedName = params.fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
    const timestamp = Date.now();
    const typePrefix = params.assetType.toLowerCase();
    const slideSuffix = params.slideOrder !== undefined ? `_slide_${params.slideOrder}` : '';

    return `creatives/${params.orgId}/${params.creativeId}/v${params.versionNumber}/${typePrefix}${slideSuffix}_${timestamp}_${sanitizedName}`;
  }

  /**
   * Generates a short-lived presigned PUT URL for single-part uploads (images, documents, banners, thumbnails)
   */
  public static async generateUploadPresignedUrl(
    params: PresignedUploadParams,
    expiresInSeconds = 900 // 15 minutes
  ): Promise<PresignedUploadResult> {
    const storageKey = this.generateCanonicalKey(params);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      ContentType: params.mimeType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });

    return {
      uploadUrl,
      storageKey,
      expiresInSeconds,
      bucket: R2_BUCKET_NAME,
    };
  }

  /**
   * Directly uploads a local file stream to Cloudflare R2
   */
  public static async uploadLocalFile(
    localFilePath: string,
    storageKey: string,
    mimeType = 'application/octet-stream'
  ): Promise<void> {
    const fileStream = fs.createReadStream(localFilePath);
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      Body: fileStream,
      ContentType: mimeType,
    });
    await r2Client.send(command);
  }

  /**
   * Generates a short-lived signed GET URL for private asset viewing and client portal proofs
   */
  public static async generateViewingSignedUrl(
    storageKey: string,
    expiresInSeconds = 3600 // 1 hour
  ): Promise<string> {
    if (!storageKey) return '';

    // If already an external absolute HTTP url, return as is
    if (storageKey.startsWith('http://') || storageKey.startsWith('https://')) {
      return storageKey;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
      });

      return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
    } catch (err: any) {
      console.warn(`[StorageService] Failed to sign viewing URL for key: ${storageKey}`, err.message);
      // Fallback to public dev URL if signed URL generation fails
      if (R2_PUBLIC_URL) {
        return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${storageKey}`;
      }
      return '';
    }
  }

  /**
   * Initiates a multi-part upload session for large video assets
   */
  public static async createMultipartUpload(
    params: PresignedUploadParams
  ): Promise<MultipartInitResult> {
    const storageKey = this.generateCanonicalKey(params);

    const command = new CreateMultipartUploadCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      ContentType: params.mimeType,
    });

    const response = await r2Client.send(command);

    if (!response.UploadId) {
      throw new Error('Failed to initiate multipart upload session on Cloudflare R2');
    }

    return {
      uploadId: response.UploadId,
      storageKey,
      bucket: R2_BUCKET_NAME,
    };
  }

  /**
   * Generates presigned URLs for individual parts of a multi-part upload session
   */
  public static async getMultipartPartUrls(
    storageKey: string,
    uploadId: string,
    partNumbers: number[],
    expiresInSeconds = 1800 // 30 minutes
  ): Promise<MultipartPartUrl[]> {
    const partUrls: MultipartPartUrl[] = [];

    for (const partNumber of partNumbers) {
      const command = new UploadPartCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
      partUrls.push({
        partNumber,
        uploadUrl,
      });
    }

    return partUrls;
  }

  /**
   * Finalizes and merges all parts into a completed R2 object
   */
  public static async completeMultipartUpload(
    storageKey: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[]
  ): Promise<{ storageKey: string; location?: string }> {
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts,
      },
    });

    const response = await r2Client.send(command);

    return {
      storageKey,
      location: response.Location,
    };
  }

  /**
   * Aborts an active multipart upload session and cleans up orphaned parts
   */
  public static async abortMultipartUpload(
    storageKey: string,
    uploadId: string
  ): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      UploadId: uploadId,
    });

    await r2Client.send(command);
  }

  /**
   * Direct backend upload buffer (Admin / internal fallback)
   */
  public static async uploadDirectBuffer(
    storageKey: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{ storageKey: string }> {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);
    StorageService.invalidateBucketCache();
    return { storageKey };
  }

  /**
   * Deletes an object from Cloudflare R2
   */
  public static async deleteObject(storageKey: string): Promise<void> {
    if (!storageKey || storageKey.startsWith('http')) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
      });

      await r2Client.send(command);
      StorageService.invalidateBucketCache();
    } catch (err: any) {
      console.warn(`[StorageService] Failed to delete object ${storageKey}:`, err.message);
    }
  }

  /**
   * Batch deletes multiple objects from Cloudflare R2
   */
  public static async deleteObjects(storageKeys: string[]): Promise<void> {
    if (!storageKeys || storageKeys.length === 0) return;
    await Promise.allSettled(
      storageKeys
        .filter(k => k && !k.startsWith('http'))
        .map(key => this.deleteObject(key))
    );
    StorageService.invalidateBucketCache();
  }

  /**
   * Checks if an object exists and returns its size & metadata
   */
  public static async headObject(storageKey: string): Promise<{ size: number; mimeType?: string } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
      });

      const res = await r2Client.send(command);
      return {
        size: res.ContentLength || 0,
        mimeType: res.ContentType,
      };
    } catch {
      return null;
    }
  }

  /**
   * Scans and aggregates real-time storage statistics directly from the Cloudflare R2 bucket.
   * Performs paginated ListObjectsV2 calls across the entire bucket (or optional prefix).
   */
  public static async getLiveBucketStorageStats(options?: {
    forceRefresh?: boolean;
    prefix?: string;
  }): Promise<LiveBucketStorageStats> {
    const now = Date.now();
    if (!options?.forceRefresh && bucketStatsCache && (now - bucketStatsCache.timestamp) < CACHE_TTL_MS) {
      return bucketStatsCache.data;
    }

    let continuationToken: string | undefined = undefined;
    let totalBytes = 0;
    let totalObjects = 0;
    let videoBytes = 0;
    let videoCount = 0;
    let imageBytes = 0;
    let imageCount = 0;
    let otherBytes = 0;
    let otherCount = 0;
    const allObjects: Array<{ key: string; size: number; lastModified?: Date }> = [];

    const videoExtRegex = /\.(mp4|mov|webm|avi|mkv|flv|wmv|m4v)($|\?)/i;
    const imageExtRegex = /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)($|\?)/i;

    try {
      do {
        const command: ListObjectsV2Command = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: options?.prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        });

        const response = await r2Client.send(command);
        const contents = response.Contents || [];

        for (const obj of contents) {
          if (!obj.Key) continue;
          const size = obj.Size || 0;
          totalBytes += size;
          totalObjects += 1;

          const keyLower = obj.Key.toLowerCase();
          const isVideo = videoExtRegex.test(obj.Key) || keyLower.includes('/video_') || keyLower.includes('video');
          const isImage = imageExtRegex.test(obj.Key) || keyLower.includes('/image_') || keyLower.includes('thumbnail') || keyLower.includes('slide');

          if (isVideo) {
            videoBytes += size;
            videoCount += 1;
          } else if (isImage) {
            imageBytes += size;
            imageCount += 1;
          } else {
            otherBytes += size;
            otherCount += 1;
          }

          allObjects.push({
            key: obj.Key,
            size,
            lastModified: obj.LastModified,
          });
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);
    } catch (err: any) {
      console.error('[StorageService] Error scanning live Cloudflare R2 bucket:', err.message);
      // If cached data is available, return it even if expired rather than failing completely
      if (bucketStatsCache) {
        return bucketStatsCache.data;
      }
      throw err;
    }

    allObjects.sort((a, b) => b.size - a.size);

    const stats: LiveBucketStorageStats = {
      bucket: R2_BUCKET_NAME,
      totalBytes,
      totalObjects,
      lastScannedAt: new Date().toISOString(),
      isLiveBucketScan: true,
      breakdown: {
        video: { bytes: videoBytes, count: videoCount },
        image: { bytes: imageBytes, count: imageCount },
        other: { bytes: otherBytes, count: otherCount },
      },
      objects: allObjects,
    };

    bucketStatsCache = { data: stats, timestamp: now };
    return stats;
  }

  /**
   * Invalidate in-memory bucket cache (called when objects are uploaded/deleted)
   */
  public static invalidateBucketCache(): void {
    bucketStatsCache = null;
  }
}

export interface LiveBucketStorageStats {
  bucket: string;
  totalBytes: number;
  totalObjects: number;
  lastScannedAt: string;
  isLiveBucketScan: boolean;
  breakdown: {
    video: { bytes: number; count: number };
    image: { bytes: number; count: number };
    other: { bytes: number; count: number };
  };
  objects: Array<{
    key: string;
    size: number;
    lastModified?: Date;
  }>;
}

let bucketStatsCache: { data: LiveBucketStorageStats; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60s cache for fast UI, bustable on demand
