import crypto from 'crypto';

const CURRENT_ITERATIONS = 210000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, CURRENT_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return `${CURRENT_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  if (!combined) return false;
  const parts = combined.split(':');

  if (parts.length === 3) {
    // Modern format: iterations:salt:hash
    const [iterStr, salt, originalHash] = parts;
    const iterations = parseInt(iterStr, 10);
    if (isNaN(iterations) || iterations <= 0 || !salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const origBuf = Buffer.from(originalHash, 'hex');
    if (hashBuf.length !== origBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, origBuf);
  } else if (parts.length === 2) {
    // Legacy format backward compatibility: salt:hash (1,000 iterations)
    const [salt, originalHash] = parts;
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, KEY_LEN, DIGEST).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const origBuf = Buffer.from(originalHash, 'hex');
    if (hashBuf.length !== origBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, origBuf);
  }

  return false;
}

export function needsRehash(combined: string): boolean {
  if (!combined) return false;
  const parts = combined.split(':');
  if (parts.length === 2) return true; // Legacy 1000-round format
  if (parts.length === 3) {
    const iterations = parseInt(parts[0], 10);
    return isNaN(iterations) || iterations < CURRENT_ITERATIONS;
  }
  return false;
}

