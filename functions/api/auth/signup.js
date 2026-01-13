import {
  generateId,
  hashPassword,
  generateSessionToken,
  createToken,
  jsonResponse,
  errorResponse
} from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (existingUser) {
      return errorResponse('An account with this email already exists', 409);
    }

    // Create user
    const userId = generateId();
    const passwordHash = await hashPassword(password);

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)'
    ).bind(userId, email.toLowerCase(), passwordHash, name).run();

    // Create session
    const sessionId = generateId();
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, userId, sessionToken, expiresAt).run();

    // Create JWT token
    const jwtPayload = {
      sub: userId,
      email: email.toLowerCase(),
      name: name,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    const token = await createToken(jwtPayload, env.JWT_SECRET || 'dev-secret');

    // Create default board for new user
    const boardId = generateId();
    await env.DB.prepare(
      'INSERT INTO boards (id, user_id, name, icon, color) VALUES (?, ?, ?, ?, ?)'
    ).bind(boardId, userId, 'My First Board', '📋', 'sky').run();

    // Create default columns
    const columns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ];

    for (const col of columns) {
      await env.DB.prepare(
        'INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)'
      ).bind(generateId(), boardId, col.title, col.position).run();
    }

    return jsonResponse({
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name,
        avatar: null,
      },
      token: token,
      expiresAt: expiresAt,
    }, 201);

  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
