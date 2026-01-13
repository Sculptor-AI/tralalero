// Utility functions for API handlers

// Generate a UUID v4
export function generateId() {
  return crypto.randomUUID();
}

// Hash password using Web Crypto API (PBKDF2)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Combine salt and hash for storage
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);

  return btoa(String.fromCharCode(...combined));
}

// Verify password against stored hash
export async function verifyPassword(password, storedHash) {
  try {
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const newHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const newHashArray = new Uint8Array(newHash);

    // Constant-time comparison
    if (originalHash.length !== newHashArray.length) return false;
    let result = 0;
    for (let i = 0; i < originalHash.length; i++) {
      result |= originalHash[i] ^ newHashArray[i];
    }
    return result === 0;
  } catch {
    return false;
  }
}

// Generate a secure session token
export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Create JWT-like token (simplified for Cloudflare Workers)
export async function createToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Verify JWT-like token
export async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(`${headerB64}.${payloadB64}`)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64));

    // Check expiration
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// Get user from authorization header
export async function getUserFromRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token, env.JWT_SECRET || 'dev-secret');

  if (!payload) return null;

  // Verify session exists in database
  const session = await env.DB.prepare(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")'
  ).bind(token).first();

  if (!session) return null;

  // Get user
  const user = await env.DB.prepare(
    'SELECT id, email, name, avatar, created_at FROM users WHERE id = ?'
  ).bind(session.user_id).first();

  return user;
}

// JSON response helper
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Error response helper
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
