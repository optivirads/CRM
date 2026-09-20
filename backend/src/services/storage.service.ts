import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
    return { storageKey };
  }

  /**
   * Deletes an object from Cloudflare R2
   */
  public static async deleteObject(storageKey: string): Promise<void> {
    if (!storageKey || storageKey.startsWith('http')) return;

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
    });

    await r2Client.send(command);
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
}
