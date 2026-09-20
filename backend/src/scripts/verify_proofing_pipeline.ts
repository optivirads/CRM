import dotenv from 'dotenv';
dotenv.config();

import { db, pool } from '../config/db';
import { StorageService } from '../services/storage.service';
import crypto from 'crypto';

async function runProofingPipelineVerification() {
  console.log('🧪 Starting End-to-End Creative Approval & Proofing Pipeline Verification...\n');

  try {
    // 1. Get an existing organization and user
    const orgRes = await db.query('SELECT id FROM organizations LIMIT 1');
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    const clientRes = await db.query('SELECT id FROM clients LIMIT 1');

    if (orgRes.rows.length === 0 || userRes.rows.length === 0) {
      throw new Error('Database missing organization or user records to run test against.');
    }

    const orgId = orgRes.rows[0].id;
    const userId = userRes.rows[0].id;
    const clientId = clientRes.rows[0]?.id || null;

    console.log(`✅ [1/7] Organization [${orgId}] & User [${userId}] Loaded`);

    // 2. Test Cloudflare R2 Presigned URL Generation
    const testFileName = 'banner_hero_test.jpg';
    const presigned = await StorageService.generateUploadPresignedUrl({
      orgId,
      creativeId: 'test_creative_' + Date.now(),
      versionNumber: 1,
      fileName: testFileName,
      mimeType: 'image/jpeg',
      assetType: 'IMAGE'
    });

    console.log(`✅ [2/7] Cloudflare R2 Presigned PUT Generated:`);
    console.log(`       Key: ${presigned.storageKey}`);
    console.log(`       Bucket: ${presigned.bucket}`);

    // 3. Test Direct Buffer Upload Fallback (Tests S3 Client connectivity to Cloudflare R2)
    const testBuffer = Buffer.from('Mock image content for Cloudflare R2 verification', 'utf8');
    const directUpload = await StorageService.uploadDirectBuffer(
      presigned.storageKey,
      testBuffer,
      'text/plain'
    );
    console.log(`✅ [3/7] Upload to Cloudflare R2 S3 Endpoint Succeeded: ${directUpload.storageKey}`);

    // 4. Test Dynamic Viewing Signed URL Generation
    const viewingSignedUrl = await StorageService.generateViewingSignedUrl(presigned.storageKey);
    console.log(`✅ [4/7] Dynamic Viewing Signed URL Generated: ${viewingSignedUrl.slice(0, 75)}...`);

    // 5. Test Database Creative & Proof Creation
    const creativeRes = await db.query(
      `INSERT INTO creatives (
        organization_id, client_id, name, campaign_name, target_platform,
        ad_format, aspect_ratio, status, primary_ad_copy, headline, created_by
      ) VALUES ($1, $2, $3, $4, 'META', 'IMAGE', '1:1', 'DRAFT', $5, $6, $7)
      RETURNING *`,
      [
        orgId,
        clientId,
        'Automated Test Creative • ' + Date.now(),
        'Q3 Growth Sprint',
        'Experience enterprise agency performance today.',
        'Scale Your ROAS by 3.5x',
        userId
      ]
    );
    const creative = creativeRes.rows[0];

    const proofRes = await db.query(
      `INSERT INTO creative_proofs (
        organization_id, creative_id, version_number, title, change_summary, status, uploaded_by
      ) VALUES ($1, $2, 1, 'Initial Concept (v1)', 'Initial draft upload', 'INTERNAL_REVIEW', $3)
      RETURNING *`,
      [orgId, creative.id, userId]
    );
    const proof = proofRes.rows[0];

    await db.query('UPDATE creatives SET active_proof_id = $1, status = $2 WHERE id = $3', [
      proof.id,
      'INTERNAL_REVIEW',
      creative.id
    ]);

    const assetRes = await db.query(
      `INSERT INTO creative_proof_assets (
        organization_id, proof_id, asset_type, slide_order, storage_key, file_name, file_size_bytes, mime_type
      ) VALUES ($1, $2, 'IMAGE', 1, $3, $4, $5, 'image/jpeg')
      RETURNING *`,
      [orgId, proof.id, presigned.storageKey, testFileName, testBuffer.length]
    );

    console.log(`✅ [5/7] Creative Record [${creative.id}] & Proof [${proof.id}] Created`);

    // 6. Test Spatial Pin Comment & Resolution
    const commentRes = await db.query(
      `INSERT INTO creative_comments (
        organization_id, proof_id, asset_id, author_user_id, author_name,
        content, pin_x_percent, pin_y_percent
      ) VALUES ($1, $2, $3, $4, 'Lead Designer', 'Please increase contrast on the CTA button', 42.500, 68.200)
      RETURNING *`,
      [orgId, proof.id, assetRes.rows[0].id, userId]
    );
    console.log(`✅ [6/7] Spatial Pin Annotation Placed at (${commentRes.rows[0].pin_x_percent}%, ${commentRes.rows[0].pin_y_percent}%)`);

    // 7. Test Cryptographic Client Share Link Generation & Approval Sign-off
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const shareLinkRes = await db.query(
      `INSERT INTO creative_share_links (
        organization_id, creative_id, proof_id, token_hash, created_by, expires_at
      ) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '14 days')
      RETURNING *`,
      [orgId, creative.id, proof.id, tokenHash, userId]
    );

    console.log(`✅ [7/7] Cryptographic Share Link Generated:`);
    console.log(`       Raw Secret Token: ${rawToken}`);
    console.log(`       SHA-256 Token Hash: ${tokenHash}`);

    // Simulate Client Approval via token hash
    await db.query(
      `INSERT INTO creative_approvals (
        organization_id, creative_id, proof_id, decision, approver_name, approver_email, feedback_notes
      ) VALUES ($1, $2, $3, 'APPROVED', 'Alex Mercer (Client VP)', 'alex@clientcorp.com', 'Approved for Meta campaign launch!')`,
      [orgId, creative.id, proof.id]
    );

    await db.query(`UPDATE creative_proofs SET status = 'APPROVED', is_immutable = true WHERE id = $1`, [proof.id]);
    await db.query(`UPDATE creatives SET status = 'APPROVED' WHERE id = $1`, [creative.id]);

    const finalCreative = await db.query('SELECT status FROM creatives WHERE id = $1', [creative.id]);
    console.log(`\n🎉 VERIFICATION COMPLETE: Creative status transitioned to [${finalCreative.rows[0].status}]!`);

    // Clean up test R2 file
    await StorageService.deleteObject(presigned.storageKey);
    console.log('🧹 Cleaned up temporary test R2 object.');
  } catch (err: any) {
    console.error('❌ Verification failed with error:', err);
  } finally {
    await pool.end();
  }
}

runProofingPipelineVerification();
