import {
  generateId,
  verifyPassword,
  generateSessionToken,
  createToken,
  jsonResponse,
  errorResponse
} from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find user
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Clean up old sessions for this user (keep last 5)
    await env.DB.prepare(`
      DELETE FROM sessions
      WHERE user_id = ?
      AND id NOT IN (
        SELECT id FROM sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      )
    `).bind(user.id, user.id).run();

    // Create new session
    const sessionId = generateId();
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, user.id, sessionToken, expiresAt).run();

    // Create JWT token
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    const token = await createToken(jwtPayload, env.JWT_SECRET || 'dev-secret');

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token: token,
      expiresAt: expiresAt,
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Failed to login', 500);
  }
}
