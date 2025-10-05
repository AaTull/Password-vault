import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(str: string): Uint8Array {
  const clean = str.replace(/=+$/g, '').toUpperCase().replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

export function generateSecret(size = 20): string {
  const buf = crypto.randomBytes(size);
  return base32Encode(buf);
}

export function otpauthURL(secretBase32: string, accountName: string, issuer = 'PasswordVault'): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const issuerParam = encodeURIComponent(issuer);
  const secretParam = encodeURIComponent(secretBase32);
  return `otpauth://totp/${label}?secret=${secretParam}&issuer=${issuerParam}&algorithm=SHA1&digits=6&period=30`;
}

function hotp(secretBase32: string, counter: number, digits = 6): string {
  const key = Buffer.from(base32Decode(secretBase32));
  const buf = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter = counter >>> 8;
  }
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  const str = (code % 10 ** digits).toString().padStart(digits, '0');
  return str;
}

export function verifyTOTP(token: string, secretBase32: string, window = 1, period = 30): boolean {
  const timeStep = Math.floor(Date.now() / 1000 / period);
  for (let w = -window; w <= window; w++) {
    const expected = hotp(secretBase32, timeStep + w);
    if (timingSafeEqual(token, expected)) return true;
  }
  return false;
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

