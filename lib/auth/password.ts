import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Hand-rolled promisification: util.promisify() resolves to the 3-arg
// overload and loses the options parameter in its types.
function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

// scrypt via node:crypto — no native npm dependency to build in the Alpine
// image, and OWASP-endorsed at these parameters (N=2^15, r=8, p=1,
// 32-byte key). The parameters are stored with each hash, so they can be
// raised later without invalidating existing credentials.
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

const b64 = (buf: Buffer) => buf.toString("base64url");
const unb64 = (value: string) => Buffer.from(value, "base64url");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = (await scrypt(password, salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
    maxmem: 128 * N * R * 2,
  })) as Buffer;
  return `scrypt$${N}$${R}$${P}$${b64(salt)}$${b64(key)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nRaw, rRaw, pRaw, saltRaw, keyRaw] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  const salt = unb64(saltRaw);
  const expected = unb64(keyRaw);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  const actual = (await scrypt(password, salt, expected.length, {
    N: n,
    r,
    p,
    maxmem: 128 * n * r * 2,
  })) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Minimum bar for new passwords; enforced server-side wherever one is set. */
export function passwordPolicyError(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
}
