import crypto from 'crypto';

// When the user submits the sign-up form
export const handleSignUp = async (username: string, password: string, email: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 1000;
  const keylen = 64; // length of the derived key
  const digest = 'sha512'; // hash function to use

  const hashedPassword = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });

  // Send the username, hashed password, iterations, salt, email, and profile picture to the FastAPI server
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({account_name: username, display_name: username, email, password_hash: hashedPassword, iterations, salt}),
  });

  // Handle the response from the server
  if (response.ok) {
    return { message: 'Sign-up was successful' };
  } else {
    const data = await response.json();
    return { message: data.message };
  }
};