import { encryptSecret, decryptSecret } from '../utils/encrypt';

describe('AES-256-GCM Encryption Utility', () => {
  const originalEnvKey = process.env.INTEGRATION_ENCRYPTION_KEY;
  const testKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  beforeAll(() => {
    process.env.INTEGRATION_ENCRYPTION_KEY = testKey;
  });

  afterAll(() => {
    process.env.INTEGRATION_ENCRYPTION_KEY = originalEnvKey;
  });

  it('should encrypt and decrypt a plaintext string correctly', () => {
    const plaintext = 'sk_live_very_secret_api_key_12345!@#$';
    const encrypted = encryptSecret(plaintext);

    expect(encrypted).not.toEqual(plaintext);
    expect(encrypted.startsWith('enc:')).toBe(true);

    const parts = encrypted.split(':');
    expect(parts.length).toBe(4); // prefix, iv, tag, ciphertext

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for the same plaintext due to random IV', () => {
    const plaintext = 'same_secret_payload';
    const enc1 = encryptSecret(plaintext);
    const enc2 = encryptSecret(plaintext);

    expect(enc1).not.toEqual(enc2);
    expect(decryptSecret(enc1)).toBe(plaintext);
    expect(decryptSecret(enc2)).toBe(plaintext);
  });

  it('should encrypt and decrypt JSON serialized objects', () => {
    const config = {
      apiKey: 'api_123456',
      webhookSecret: 'whsec_987654',
      endpoint: 'https://api.example.com/v1',
    };
    const plaintext = JSON.stringify(config);
    const encrypted = encryptSecret(plaintext);
    const decrypted = decryptSecret(encrypted);

    expect(JSON.parse(decrypted)).toEqual(config);
  });

  it('should fail decryption if ciphertext has been tampered with', () => {
    const plaintext = 'tamper_proof_secret';
    const encrypted = encryptSecret(plaintext);
    const parts = encrypted.split(':');
    
    // Flip characters in the ciphertext part
    const tamperedCiphertext = parts[3].slice(0, -2) + '00';
    const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCiphertext}`;

    expect(() => decryptSecret(tampered)).toThrow();
  });

  it('should fail decryption if auth tag has been tampered with', () => {
    const plaintext = 'tamper_proof_tag_secret';
    const encrypted = encryptSecret(plaintext);
    const parts = encrypted.split(':');

    // Flip characters in the auth tag part
    const tamperedTag = (parts[2].startsWith('0') ? '1' : '0') + parts[2].slice(1);
    const tampered = `${parts[0]}:${parts[1]}:${tamperedTag}:${parts[3]}`;

    expect(() => decryptSecret(tampered)).toThrow();
  });

  it('should return raw value or throw for unencrypted strings when decrypting', () => {
    expect(() => decryptSecret('plain_non_encrypted_secret')).toThrow(/missing enc: prefix/);
  });
});
