import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 1000;
  const keylen = 64; // length of the derived key
  const digest = 'sha512'; // hash function to use

  const hashedPassword = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });

  return hashedPassword;
}