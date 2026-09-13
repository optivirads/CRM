import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit IV recommended for GCM
const TAG_BYTES = 16;
const ENC_PREFIX = 'enc:';

function getEncryptionKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'FATAL: INTEGRATION_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate a 64-character hex string with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  // Accept either a 64-char hex string (32 bytes) or a raw 32-byte string
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  if (raw.length === 32) {
    return Buffer.from(raw, 'utf8');
  }
  throw new Error(
    'FATAL: INTEGRATION_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a string in the format: `enc:<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENC_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string previously encrypted with `encryptSecret`.
 * Returns the original plaintext.
 * Throws if the ciphertext is tampered (GCM auth tag mismatch).
 */
export function decryptSecret(ciphertext: string): string {
  if (!ciphertext.startsWith(ENC_PREFIX)) {
    throw new Error('Invalid encrypted secret format: missing enc: prefix');
  }

  const body = ciphertext.slice(ENC_PREFIX.length);
  const parts = body.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted secret format: expected enc:iv:tag:ciphertext');
  }

  const [ivHex, tagHex, encHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const encryptedData = Buffer.from(encHex, 'hex');

  if (iv.length !== IV_BYTES) throw new Error('Invalid IV length in encrypted secret');
  if (authTag.length !== TAG_BYTES) throw new Error('Invalid auth tag length in encrypted secret');

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Returns true if the string looks like it was encrypted by encryptSecret.
 */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}

/**
 * Encrypts all string values inside a config object (shallow).
 * Non-string values (numbers, booleans, arrays, objects) are left as-is.
 * Already-encrypted values are left as-is (idempotent).
 */
export function encryptConfigObject(config: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === 'string' && v.length > 0 && !isEncrypted(v)) {
      result[k] = encryptSecret(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

/**
 * Decrypts all string values inside a config object (shallow).
 * Non-encrypted string values are returned as-is.
 */
export function decryptConfigObject(config: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === 'string' && isEncrypted(v)) {
      try {
        result[k] = decryptSecret(v);
      } catch {
        // If decryption fails (wrong key, tampered), return a sentinel so the app can detect it
        result[k] = '[DECRYPTION_FAILED]';
      }
    } else {
      result[k] = v;
    }
  }
  return result;
}
