import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, StorageService } from './storage.service';
import { db } from '../config/db';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'optivir-creatives';

export interface WatermarkResult {
  filePath: string;
  mimeType: string;
  fileName: string;
  cleanup: () => void;
}

export class WatermarkService {
  /**
   * Downloads an asset directly from Cloudflare R2 to a temporary file
   */
  public static async downloadToTemp(storageKey: string, ext: string): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `r2_in_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      throw new Error(`Failed to retrieve asset body for key: ${storageKey}`);
    }

    const writeStream = fs.createWriteStream(tempFilePath);
    await new Promise<void>((resolve, reject) => {
      (response.Body as Readable).pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return tempFilePath;
  }

  /**
   * Applies a permanent, professional proof watermark to an image or video asset
   */
  public static async createWatermarkedAsset(params: {
    storageKey: string;
    fileName: string;
    assetType: 'IMAGE' | 'VIDEO';
    mimeType?: string;
  }): Promise<WatermarkResult> {
    const { storageKey, fileName, assetType, mimeType } = params;
    const isVideo = assetType === 'VIDEO' || (mimeType && mimeType.startsWith('video/'));

    const inputExt = path.extname(fileName) || (isVideo ? '.mp4' : '.jpg');
    const outputExt = isVideo ? '.mp4' : (inputExt.toLowerCase() === '.png' ? '.png' : '.jpg');
    const outputMime = isVideo ? 'video/mp4' : (outputExt === '.png' ? 'image/png' : 'image/jpeg');

    const tempInputPath = await this.downloadToTemp(storageKey, inputExt);
    const tempOutputPath = path.join(os.tmpdir(), `r2_wm_${Date.now()}_${Math.random().toString(36).slice(2)}${outputExt}`);

    // Watermark filter chains
    const videoFilters = [
      "drawtext=text='OPTIVIR PROOF • PREVIEW ONLY':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=h/16:fontcolor=white@0.65:box=1:boxcolor=black@0.45:boxborderw=12",
      "drawtext=text='CONFIDENTIAL PROOF • NOT FOR DISTRIBUTION':x=24:y=24:fontsize=h/28:fontcolor=white@0.7:shadowcolor=black@0.8:shadowx=2:shadowy=2",
      "drawtext=text='OPTIVIR CLIENT REVIEW':x=w-text_w-24:y=h-text_h-24:fontsize=h/28:fontcolor=white@0.7:shadowcolor=black@0.8:shadowx=2:shadowy=2"
    ];

    const imageFilters = [
      "drawtext=text='OPTIVIR PROOF • CONFIDENTIAL':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=h/14:fontcolor=white@0.7:box=1:boxcolor=black@0.45:boxborderw=14",
      "drawtext=text='CLIENT PREVIEW ONLY':x=(w-text_w)/2:y=(h-text_h)/2+h/12:fontsize=h/24:fontcolor=white@0.65:shadowcolor=black@0.8:shadowx=2:shadowy=2",
      "drawtext=text='DO NOT DISTRIBUTE':x=24:y=24:fontsize=h/26:fontcolor=white@0.7:shadowcolor=black@0.8:shadowx=2:shadowy=2"
    ];

    try {
      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg(tempInputPath);

        if (isVideo) {
          command = command
            .videoFilters(videoFilters)
            .outputOptions([
              '-c:v libx264',
              '-preset ultrafast',
              '-crf 24',
              '-c:a copy',
              '-movflags +faststart'
            ]);
        } else {
          command = command
            .videoFilters(imageFilters)
            .outputOptions(['-frames:v 1', '-q:v 2']);
        }

        command
          .output(tempOutputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
    } finally {
      // Clean up input temp file immediately
      try {
        if (fs.existsSync(tempInputPath)) {
          fs.unlinkSync(tempInputPath);
        }
      } catch (e) {
        console.warn('[WatermarkService] Failed to remove temp input file:', e);
      }
    }

    const safeBaseName = path.basename(fileName, path.extname(fileName));
    const outputFileName = `WATERMARKED_${safeBaseName}${outputExt}`;

    return {
      filePath: tempOutputPath,
      mimeType: outputMime,
      fileName: outputFileName,
      cleanup: () => {
        try {
          if (fs.existsSync(tempOutputPath)) {
            fs.unlinkSync(tempOutputPath);
          }
        } catch (e) {
          console.warn('[WatermarkService] Failed to remove temp output file:', e);
        }
      }
    };
  }

  /**
   * Ensures a permanent, server-side watermarked asset exists in Cloudflare R2.
   * Returns the storage key of the watermarked deliverable.
   * Clients and non-exempt users will receive this file directly, so clean videos are NEVER sent to their browsers.
   */
  public static async getOrGenerateWatermarkedKey(asset: {
    id: string;
    storage_key: string;
    preview_storage_key?: string | null;
    file_name: string;
    asset_type: 'IMAGE' | 'VIDEO' | string;
    mime_type?: string;
  }): Promise<string> {
    // If already generated and cached on R2, return key immediately
    if (asset.preview_storage_key) {
      return asset.preview_storage_key;
    }

    const rawKey = asset.storage_key;
    const keyDir = path.posix.dirname(rawKey);
    const keyBase = path.posix.basename(rawKey);
    const isVideo = asset.asset_type === 'VIDEO' || (asset.mime_type && asset.mime_type.startsWith('video/'));
    const ext = isVideo ? '.mp4' : (asset.mime_type?.includes('png') ? '.png' : '.jpg');
    const watermarkedKey = `${keyDir}/watermarked_${keyBase.replace(/\.[^/.]+$/, '')}${ext}`;

    try {
      console.log(`[WatermarkService] Burning watermark onto asset before frontend delivery (asset: ${asset.id})...`);
      const result = await this.createWatermarkedAsset({
        storageKey: asset.storage_key,
        fileName: asset.file_name,
        assetType: isVideo ? 'VIDEO' : 'IMAGE',
        mimeType: asset.mime_type
      });

      // Upload the watermarked deliverable to Cloudflare R2
      await StorageService.uploadLocalFile(result.filePath, watermarkedKey, result.mimeType);

      // Cache the key in PostgreSQL so it never has to be re-encoded
      await db.query(
        `UPDATE creative_proof_assets SET preview_storage_key = $1 WHERE id = $2`,
        [watermarkedKey, asset.id]
      );

      result.cleanup();
      console.log(`[WatermarkService] Successfully burned and uploaded watermarked deliverable: ${watermarkedKey}`);
      return watermarkedKey;
    } catch (err: any) {
      console.error(`[WatermarkService] Error pre-watermarking asset ${asset.id}:`, err);
      // Fallback to original storage key if transcoding fails so display does not break
      return asset.storage_key;
    }
  }
}
